import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

JWT_SECRET = os.environ.get("JWT_SECRET", "torque-elite-secret-key-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXP_HOURS = 24 * 7

security = HTTPBearer(auto_error=False)


def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token invalide")


async def get_current_payload(
    creds: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentification requise"
        )
    return decode_token(creds.credentials)


def require_roles(*roles):
    async def checker(payload: dict = Depends(get_current_payload)) -> dict:
        if payload.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
        return payload

    return checker
