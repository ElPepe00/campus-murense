# backend/routers/auth_router.py
import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/auth", tags=["Autenticació"])

# Protecció anti-força bruta en memòria amb control de mida màxima (evita OOM)
_failed_logins: dict[str, list[float]] = defaultdict(list)
MAX_FAILED_PER_ACCOUNT = 5
MAX_FAILED_PER_IP = 20
LOCKOUT_WINDOW_SECONDS = 300  # 5 minuts
MAX_TRACKED_KEYS = 2000


def _prune_failed_logins(now: float):
    """Evita fuites de memòria eliminant entrades antigues del diccionari."""
    expired_keys = [
        k for k, timestamps in _failed_logins.items()
        if not any(now - t < LOCKOUT_WINDOW_SECONDS for t in timestamps)
    ]
    for k in expired_keys:
        _failed_logins.pop(k, None)
    # Si encara supera el límit per un atac massiu, retallam
    if len(_failed_logins) > MAX_TRACKED_KEYS:
        excess = len(_failed_logins) - MAX_TRACKED_KEYS
        for k in list(_failed_logins.keys())[:excess]:
            _failed_logins.pop(k, None)


@router.post("/login", response_model=schemas.Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    account_key = f"acc:{client_ip}:{form_data.username.lower().strip()}"
    ip_key = f"ip:{client_ip}"
    now = time.time()

    # Neteja preventiva
    if len(_failed_logins) > 100:
        _prune_failed_logins(now)

    # Filtrar intents vigents
    _failed_logins[account_key] = [t for t in _failed_logins[account_key] if now - t < LOCKOUT_WINDOW_SECONDS]
    _failed_logins[ip_key] = [t for t in _failed_logins[ip_key] if now - t < LOCKOUT_WINDOW_SECONDS]

    # Comprovació de bloqueig per compte o per IP
    if len(_failed_logins[account_key]) >= MAX_FAILED_PER_ACCOUNT or len(_failed_logins[ip_key]) >= MAX_FAILED_PER_IP:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Massa intents d'inici de sessió fallits. Per seguretat, torna a intentar-ho d'aquí a 5 minuts."
        )

    usuari = db.query(models.Usuari).filter(models.Usuari.email == form_data.username.lower().strip()).first()
    
    if not usuari or not security.verify_password(form_data.password, usuari.password_hash):
        _failed_logins[account_key].append(now)
        _failed_logins[ip_key].append(now)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correu electrònic o contrasenya incorrectes"
        )
    
    if not usuari.actiu:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuari desactivat. Contacta amb la directiva.")

    # Èxit: netejar el comptador d'intents d'aquest compte
    _failed_logins.pop(account_key, None)

    access_token = security.create_access_token(
        data={"sub": usuari.email, "rol": usuari.rol.value if hasattr(usuari.rol, "value") else str(usuari.rol)}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UsuariResponse)
def get_perfil(current_user: models.Usuari = Depends(get_current_user)):
    return current_user


@router.post("/users", response_model=schemas.UsuariResponse)
def crear_usuari_staff(
    dades: schemas.UsuariCreate,
    db: Session = Depends(get_db),
    admin: models.Usuari = Depends(require_admin)
):
    if len(dades.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contrasenya ha de tenir com a mínim 8 caràcters"
        )

    email_clean = dades.email.lower().strip()
    existent = db.query(models.Usuari).filter(models.Usuari.email == email_clean).first()
    if existent:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Aquest correu ja està registrat")

    nou_usuari = models.Usuari(
        nom_complet=dades.nom_complet.strip(),
        email=email_clean,
        password_hash=security.get_password_hash(dades.password),
        rol=dades.rol
    )
    db.add(nou_usuari)
    db.commit()
    db.refresh(nou_usuari)
    return nou_usuari