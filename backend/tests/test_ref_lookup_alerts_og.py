# Tests: ref code, manual inspection, public lookup, ntfy alerts, OG image/meta, regression
import os
import re
import time
import uuid
import base64
import pytest
import requests
from pymongo import MongoClient

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN = {"email": "admin@torqueelite.com", "password": "admin123"}
REF_RE = re.compile(r"^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$")

mongo = MongoClient("mongodb://localhost:27017")["test_database"]
CREATED = {"inspections": [], "users": [], "album": []}


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    if CREATED["inspections"]:
        mongo.inspections.delete_many({"id": {"$in": CREATED["inspections"]}})
    if CREATED["users"]:
        mongo.users.delete_many({"id": {"$in": CREATED["users"]}})
    if CREATED["album"]:
        mongo.album.delete_many({"id": {"$in": CREATED["album"]}})


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
    assert r.status_code == 200
    return r.json()["token"]


def H(t):
    return {"Authorization": f"Bearer {t}"}


@pytest.fixture(scope="module")
def booking():
    email = f"test_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{BASE_URL}/api/bookings", json={
        "client_name": "TEST_Client", "client_email": email, "client_phone": "5145550000",
        "client_password": "pass123", "vehicle_make": "Honda", "vehicle_model": "Civic",
        "vehicle_year": "2018", "location_address": "123 rue Test", "price": 149,
    })
    assert r.status_code == 200, r.text
    d = r.json()
    CREATED["inspections"].append(d["inspection"]["id"])
    CREATED["users"].append(d["user"]["id"])
    return d


@pytest.fixture(scope="module")
def employee(admin_token):
    r = requests.post(f"{BASE_URL}/api/users", headers=H(admin_token), json={
        "name": "TEST_Emp", "email": f"test_emp_{uuid.uuid4().hex[:8]}@example.com",
        "password": "emp123", "role": "employee"})
    assert r.status_code == 200
    CREATED["users"].append(r.json()["id"])
    return r.json()


# --- Booking ref + ntfy alert
class TestBookingRefAlert:
    def test_booking_ref(self, booking):
        assert REF_RE.match(booking["inspection"]["ref"])

    def test_alert_logged(self, booking):
        ref = booking["inspection"]["ref"]
        doc = None
        for _ in range(15):
            doc = mongo.alert_log.find_one({"message": {"$regex": ref}})
            if doc:
                break
            time.sleep(1)
        assert doc, "No alert_log entry"
        assert doc["message"].startswith("Vous recevez une nouvelle inspection")
        assert doc["result"]["success"] is True, doc["result"]


# --- Manual inspection
class TestManual:
    payload = {"client_name": "TEST_Manual", "client_email": "Manual@Ex.com", "client_phone": "514",
               "vehicle_make": "Ford", "vehicle_model": "F150", "price": 99}

    def test_no_auth(self):
        r = requests.post(f"{BASE_URL}/api/inspections/manual", json=self.payload)
        assert r.status_code in (401, 403)

    def test_client_forbidden(self, booking):
        r = requests.post(f"{BASE_URL}/api/inspections/manual", headers=H(booking["token"]), json=self.payload)
        assert r.status_code == 403

    def test_employee_forbidden(self, employee):
        t = requests.post(f"{BASE_URL}/api/auth/login", json={"email": employee["email"], "password": "emp123"}).json()["token"]
        r = requests.post(f"{BASE_URL}/api/inspections/manual", headers=H(t), json=self.payload)
        assert r.status_code == 403

    def test_missing_required(self, admin_token):
        r = requests.post(f"{BASE_URL}/api/inspections/manual", headers=H(admin_token), json={"client_name": "x"})
        assert r.status_code == 422

    def test_create_unassigned(self, admin_token):
        r = requests.post(f"{BASE_URL}/api/inspections/manual", headers=H(admin_token), json=self.payload)
        assert r.status_code == 200, r.text
        d = r.json()
        CREATED["inspections"].append(d["id"])
        assert "_id" not in d
        assert REF_RE.match(d["ref"]) and d["manual"] is True and d["status"] == "paid"
        assert d["client"]["email"] == "manual@ex.com"
        g = requests.get(f"{BASE_URL}/api/inspections/{d['id']}", headers=H(admin_token))
        assert g.status_code == 200 and g.json()["ref"] == d["ref"]

    def test_create_assigned(self, admin_token, employee):
        r = requests.post(f"{BASE_URL}/api/inspections/manual", headers=H(admin_token),
                          json={**self.payload, "employee_id": employee["id"]})
        assert r.status_code == 200
        d = r.json()
        CREATED["inspections"].append(d["id"])
        assert d["status"] == "assigned" and d["assigned_employee_id"] == employee["id"]
        assert d["assigned_employee_name"] == "TEST_Emp"

    def test_bad_employee(self, admin_token):
        r = requests.post(f"{BASE_URL}/api/inspections/manual", headers=H(admin_token),
                          json={**self.payload, "employee_id": "nope"})
        assert r.status_code == 404


# --- Public lookup
class TestLookup:
    def test_lookup_case_insensitive(self, booking):
        ref = booking["inspection"]["ref"]
        for code in (ref, ref.lower(), f" {ref.lower()} "):
            r = requests.get(f"{BASE_URL}/api/lookup/{code}")
            assert r.status_code == 200, code
            d = r.json()
            assert d["ref"] == ref
            assert d["status"] == "paid"
            assert d["vehicle"]["make"] == "Honda"
            assert d["client"] == {"name": "TEST_Client"}
            for k in ("client_id", "price", "location", "contact", "payment", "_id", "id"):
                assert k not in d, k

    def test_lookup_unknown(self):
        r = requests.get(f"{BASE_URL}/api/lookup/ZZZZZ")
        assert r.status_code == 404
        assert r.json()["detail"] == "Code de référence introuvable"


# --- Alerts admin endpoints
class TestAlerts:
    def test_config_auth(self, booking):
        assert requests.get(f"{BASE_URL}/api/alerts/config").status_code in (401, 403)
        assert requests.get(f"{BASE_URL}/api/alerts/config", headers=H(booking["token"])).status_code == 403
        assert requests.post(f"{BASE_URL}/api/alerts/test").status_code in (401, 403)

    def test_config(self, admin_token):
        r = requests.get(f"{BASE_URL}/api/alerts/config", headers=H(admin_token))
        assert r.status_code == 200
        d = r.json()
        assert d["topic"] and d["url"] == f"https://ntfy.sh/{d['topic']}"

    def test_send(self, admin_token):
        before = mongo.alert_log.count_documents({})
        r = requests.post(f"{BASE_URL}/api/alerts/test", headers=H(admin_token))
        assert r.status_code == 200 and r.json()["ok"] is True
        last = mongo.alert_log.find_one(sort=[("created_at", -1)])
        assert mongo.alert_log.count_documents({}) == before + 1
        assert last["result"]["success"] is True


# --- OG image + meta tags
class TestOG:
    def test_og_image(self, admin_token):
        album = requests.get(f"{BASE_URL}/api/album").json()
        r = requests.get(f"{BASE_URL}/api/og-image", allow_redirects=False)
        if not album:
            assert r.status_code == 307 and "unsplash" in r.headers["location"]
        else:
            assert r.status_code == 200 and r.headers["content-type"].startswith("image/")

    def test_og_image_with_album(self, admin_token):
        png = base64.b64encode(b"\x89PNG\r\n\x1a\nTESTDATA").decode()
        r = requests.post(f"{BASE_URL}/api/album", headers=H(admin_token), json={"image": f"data:image/png;base64,{png}"})
        assert r.status_code == 200
        CREATED["album"].append(r.json()["id"])
        g = requests.get(f"{BASE_URL}/api/og-image", allow_redirects=False)
        assert g.status_code == 200
        assert g.headers["content-type"] == "image/png"
        assert g.content == b"\x89PNG\r\n\x1a\nTESTDATA"
        requests.delete(f"{BASE_URL}/api/album/{r.json()['id']}", headers=H(admin_token))

    def test_index_meta(self):
        html = requests.get(f"{BASE_URL}/").text
        assert 'og:title" content="Torque Inspection Mobile' in html
        m = re.search(r'property="og:image" content="([^"]+)"', html)
        assert m and m.group(1).startswith("https://") and m.group(1).endswith("/api/og-image")


# --- Regression
class TestRegression:
    def test_inspections_list(self, admin_token, booking):
        r = requests.get(f"{BASE_URL}/api/inspections", headers=H(admin_token))
        assert r.status_code == 200
        assert any(i["id"] == booking["inspection"]["id"] for i in r.json())

    def test_detailed_report_shows_in_lookup(self, admin_token, booking):
        iid = booking["inspection"]["id"]
        r = requests.post(f"{BASE_URL}/api/inspections/{iid}/inspection-report", headers=H(admin_token),
                          json={"report": {"grade": "A"}, "complete": True})
        assert r.status_code == 200 and r.json()["status"] == "completed"
        lk = requests.get(f"{BASE_URL}/api/lookup/{booking['inspection']['ref']}").json()
        assert lk["status"] == "completed" and lk["detailed_report"]["grade"] == "A"
