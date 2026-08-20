from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from auth_utils import create_token, get_current_payload, require_roles

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Torque Élite API")
api_router = APIRouter(prefix="/api")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


# ---------------- Models ----------------
class LoginInput(BaseModel):
    email: str
    password: str


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = ""
    role: str = "employee"  # employee | client | admin
    service_areas: Optional[List[str]] = []


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    phone: Optional[str] = None
    service_areas: Optional[List[str]] = None


class Component(BaseModel):
    name: str = "Other"
    description: str = ""


class BookingCreate(BaseModel):
    # client account
    client_name: str
    client_email: str
    client_phone: str
    client_password: str
    # inspection
    service_type: str = "Inspection PEP / SAAQ / Pré-achat"
    vehicle_make: str
    vehicle_model: str
    vehicle_year: str
    vehicle_vin: Optional[str] = ""
    location_type: str = "RepairShop"
    location_address: str
    contact_name: Optional[str] = ""
    contact_phone: Optional[str] = ""
    components: List[Component] = []
    notes: Optional[str] = ""
    price: float = 149.0
    # fake payment
    card_name: Optional[str] = ""
    card_number: Optional[str] = ""


class AssignInput(BaseModel):
    employee_id: str


class StatusInput(BaseModel):
    status: str
    scheduled_at: Optional[str] = None


class PhotoInput(BaseModel):
    photos: List[str]  # base64 data urls


class ReportInput(BaseModel):
    notes: str = ""
    findings: Optional[List[dict]] = []


class QuoteCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    vehicle_type: str = ""
    service: str = ""
    details: Optional[str] = ""


# ---------------- Helpers ----------------
def user_public(u: dict, include_password=False):
    data = {
        "id": u["id"],
        "name": u.get("name", ""),
        "email": u.get("email", ""),
        "phone": u.get("phone", ""),
        "role": u.get("role", ""),
        "service_areas": u.get("service_areas", []),
        "created_at": u.get("created_at"),
    }
    if include_password:
        data["password"] = u.get("password", "")
    return data


async def get_user(user_id: str):
    return await db.users.find_one({"id": user_id})


# ---------------- Auth ----------------
@api_router.post("/auth/login")
async def login(body: LoginInput):
    user = await db.users.find_one({"email": body.email.lower().strip()})
    if not user or user.get("password") != body.password:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = create_token(user["id"], user["role"])
    return {"token": token, "user": user_public(user)}


@api_router.get("/auth/me")
async def me(payload: dict = Depends(get_current_payload)):
    user = await get_user(payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return user_public(user)


# ---------------- Users (admin) ----------------
@api_router.get("/users")
async def list_users(role: Optional[str] = None, _=Depends(require_roles("admin"))):
    q = {}
    if role:
        q["role"] = role
    users = await db.users.find(q).sort("created_at", -1).to_list(1000)
    return [user_public(u, include_password=True) for u in users]


@api_router.post("/users")
async def create_user(body: UserCreate, _=Depends(require_roles("admin"))):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Cet email existe déjà")
    user = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "email": email,
        "password": body.password,
        "phone": body.phone or "",
        "role": body.role,
        "service_areas": body.service_areas or [],
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    return user_public(user, include_password=True)


@api_router.put("/users/{user_id}")
async def update_user(user_id: str, body: UserUpdate, _=Depends(require_roles("admin"))):
    user = await get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if "email" in updates:
        updates["email"] = updates["email"].lower().strip()
    if updates:
        await db.users.update_one({"id": user_id}, {"$set": updates})
    user = await get_user(user_id)
    return user_public(user, include_password=True)


@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, _=Depends(require_roles("admin"))):
    user = await get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Impossible de supprimer un admin")
    await db.users.delete_one({"id": user_id})
    return {"ok": True}


# ---------------- Bookings / Inspections ----------------
def inspection_public(i: dict):
    i = dict(i)
    i.pop("_id", None)
    return i


@api_router.post("/bookings")
async def create_booking(body: BookingCreate):
    """Public: client books an inspection, creates/uses a client account, fake payment."""
    email = body.client_email.lower().strip()
    user = await db.users.find_one({"email": email})
    if user:
        if user["role"] != "client":
            raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
        if user.get("password") != body.client_password:
            raise HTTPException(status_code=401, detail="Mot de passe incorrect pour ce compte existant")
    else:
        user = {
            "id": str(uuid.uuid4()),
            "name": body.client_name,
            "email": email,
            "password": body.client_password,
            "phone": body.client_phone,
            "role": "client",
            "service_areas": [],
            "created_at": now_iso(),
        }
        await db.users.insert_one(user)

    inspection = {
        "id": str(uuid.uuid4()),
        "ref": "TE-" + str(uuid.uuid4())[:6].upper(),
        "service_type": body.service_type,
        "status": "paid",  # fake payment succeeds immediately -> awaiting assignment
        "client_id": user["id"],
        "client": {
            "name": body.client_name,
            "email": email,
            "phone": body.client_phone,
        },
        "vehicle": {
            "make": body.vehicle_make,
            "model": body.vehicle_model,
            "year": body.vehicle_year,
            "vin": body.vehicle_vin or "",
        },
        "location": {"type": body.location_type, "address": body.location_address},
        "contact": {"name": body.contact_name or body.client_name, "phone": body.contact_phone or body.client_phone},
        "components": [c.dict() for c in body.components],
        "notes": body.notes or "",
        "price": body.price,
        "payment": {"status": "paid", "method": "card (SIMULÉ)", "paid_at": now_iso()},
        "assigned_employee_id": None,
        "assigned_employee_name": None,
        "scheduled_at": None,
        "photos": [],
        "report": None,
        "created_at": now_iso(),
        "accepted_at": None,
    }
    await db.inspections.insert_one(inspection)
    token = create_token(user["id"], "client")
    return {"token": token, "user": user_public(user), "inspection": inspection_public(inspection)}


@api_router.get("/inspections")
async def list_inspections(payload: dict = Depends(get_current_payload)):
    role = payload["role"]
    uid = payload["sub"]
    if role == "admin":
        q = {}
    elif role == "employee":
        q = {"assigned_employee_id": uid}
    else:  # client
        q = {"client_id": uid}
    items = await db.inspections.find(q).sort("created_at", -1).to_list(1000)
    return [inspection_public(i) for i in items]


@api_router.get("/inspections/available")
async def available_inspections(_=Depends(require_roles("employee", "admin"))):
    items = await db.inspections.find(
        {"assigned_employee_id": None, "status": "paid"}
    ).sort("created_at", -1).to_list(1000)
    return [inspection_public(i) for i in items]


@api_router.get("/inspections/{inspection_id}")
async def get_inspection(inspection_id: str, payload: dict = Depends(get_current_payload)):
    i = await db.inspections.find_one({"id": inspection_id})
    if not i:
        raise HTTPException(status_code=404, detail="Inspection introuvable")
    role, uid = payload["role"], payload["sub"]
    if role == "client" and i.get("client_id") != uid:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    if role == "employee" and i.get("assigned_employee_id") not in (uid, None):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    return inspection_public(i)


@api_router.patch("/inspections/{inspection_id}/assign")
async def assign_inspection(inspection_id: str, body: AssignInput, _=Depends(require_roles("admin"))):
    emp = await get_user(body.employee_id)
    if not emp or emp["role"] != "employee":
        raise HTTPException(status_code=404, detail="Employé introuvable")
    i = await db.inspections.find_one({"id": inspection_id})
    if not i:
        raise HTTPException(status_code=404, detail="Inspection introuvable")
    await db.inspections.update_one(
        {"id": inspection_id},
        {"$set": {
            "assigned_employee_id": emp["id"],
            "assigned_employee_name": emp["name"],
            "status": "assigned",
            "accepted_at": now_iso(),
        }},
    )
    return inspection_public(await db.inspections.find_one({"id": inspection_id}))


@api_router.patch("/inspections/{inspection_id}/status")
async def update_status(inspection_id: str, body: StatusInput, payload: dict = Depends(get_current_payload)):
    if payload["role"] not in ("admin", "employee"):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    i = await db.inspections.find_one({"id": inspection_id})
    if not i:
        raise HTTPException(status_code=404, detail="Inspection introuvable")
    updates = {"status": body.status}
    if body.scheduled_at is not None:
        updates["scheduled_at"] = body.scheduled_at
    await db.inspections.update_one({"id": inspection_id}, {"$set": updates})
    return inspection_public(await db.inspections.find_one({"id": inspection_id}))


@api_router.post("/inspections/{inspection_id}/photos")
async def add_photos(inspection_id: str, body: PhotoInput, payload: dict = Depends(get_current_payload)):
    if payload["role"] not in ("admin", "employee"):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    i = await db.inspections.find_one({"id": inspection_id})
    if not i:
        raise HTTPException(status_code=404, detail="Inspection introuvable")
    photos = i.get("photos", [])
    for p in body.photos:
        photos.append({"id": str(uuid.uuid4()), "data": p, "uploaded_at": now_iso()})
    await db.inspections.update_one({"id": inspection_id}, {"$set": {"photos": photos}})
    return inspection_public(await db.inspections.find_one({"id": inspection_id}))


@api_router.delete("/inspections/{inspection_id}/photos/{photo_id}")
async def delete_photo(inspection_id: str, photo_id: str, payload: dict = Depends(get_current_payload)):
    if payload["role"] not in ("admin", "employee"):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    i = await db.inspections.find_one({"id": inspection_id})
    if not i:
        raise HTTPException(status_code=404, detail="Inspection introuvable")
    photos = [p for p in i.get("photos", []) if p.get("id") != photo_id]
    await db.inspections.update_one({"id": inspection_id}, {"$set": {"photos": photos}})
    return inspection_public(await db.inspections.find_one({"id": inspection_id}))


@api_router.post("/inspections/{inspection_id}/report")
async def save_report(inspection_id: str, body: ReportInput, payload: dict = Depends(get_current_payload)):
    if payload["role"] not in ("admin", "employee"):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    i = await db.inspections.find_one({"id": inspection_id})
    if not i:
        raise HTTPException(status_code=404, detail="Inspection introuvable")
    report = {"notes": body.notes, "findings": body.findings or [], "updated_at": now_iso()}
    await db.inspections.update_one(
        {"id": inspection_id}, {"$set": {"report": report, "status": "completed"}}
    )
    return inspection_public(await db.inspections.find_one({"id": inspection_id}))


# ---------------- Quotes (landing form) ----------------
@api_router.post("/quotes")
async def create_quote(body: QuoteCreate):
    quote = body.dict()
    quote["id"] = str(uuid.uuid4())
    quote["created_at"] = now_iso()
    quote["status"] = "new"
    await db.quotes.insert_one(quote)
    q = dict(quote)
    q.pop("_id", None)
    return q


@api_router.get("/quotes")
async def list_quotes(_=Depends(require_roles("admin"))):
    items = await db.quotes.find().sort("created_at", -1).to_list(1000)
    for i in items:
        i.pop("_id", None)
    return items


# ---------------- Stats (admin) ----------------
@api_router.get("/stats")
async def stats(_=Depends(require_roles("admin"))):
    total = await db.inspections.count_documents({})
    unassigned = await db.inspections.count_documents({"assigned_employee_id": None})
    completed = await db.inspections.count_documents({"status": "completed"})
    employees = await db.users.count_documents({"role": "employee"})
    clients = await db.users.count_documents({"role": "client"})
    quotes = await db.quotes.count_documents({})
    return {
        "total_inspections": total,
        "unassigned": unassigned,
        "completed": completed,
        "employees": employees,
        "clients": clients,
        "quotes": quotes,
    }


@api_router.get("/")
async def root():
    return {"message": "Torque Élite API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def seed_admin():
    admin = await db.users.find_one({"role": "admin"})
    if not admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Patron Torque Élite",
            "email": "admin@torqueelite.com",
            "password": "admin123",
            "phone": "514 820 1136",
            "role": "admin",
            "service_areas": [],
            "created_at": now_iso(),
        })
        logger.info("Seeded admin account")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
