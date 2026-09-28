# backend/security.py
import os
import logging
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# SECRET_KEY — obligatòria. En local o demo, s'usa un valor per defecte.
# En Render, configura-la com a variable d'entorn per a màxima seguretat.
# ---------------------------------------------------------------------------
SECRET_KEY: str = os.getenv(
    "SECRET_KEY",
    "campus_murense_demo_fallback_secret_key_not_for_production_please_override",
)

if SECRET_KEY == "campus_murense_demo_fallback_secret_key_not_for_production_please_override":
    log.warning(
        "[SEGURETAT] S'està usant la SECRET_KEY per defecte. "
        "Defineix la variable d'entorn SECRET_KEY en producció."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hores

# bcrypt per fer hash de contrasenyes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contrasenya en text pla coincideix amb el hash bcrypt."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as exc:
        log.error(f"Error verificant contrasenya: {exc}")
        return False


def get_password_hash(password: str) -> str:
    """Genera un hash bcrypt per a la contrasenya donada."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token JWT amb les dades proporcionades i un temps d'expiració."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    try:
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    except Exception as exc:
        log.error(f"Error creant token JWT: {exc}")
        raise