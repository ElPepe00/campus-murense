# backend/routers/auth_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, security
from auth import get_current_user, require_admin

router = APIRouter(prefix="/api/auth", tags=["Autenticació"])

@router.post("/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    usuari = db.query(models.Usuari).filter(models.Usuari.email == form_data.username).first()
    
    if not usuari or not security.verify_password(form_data.password, usuari.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correu electrònic o contrasenya incorrectes"
        )
    
    if not usuari.actiu:
        raise HTTPException(status_code=400, detail="Usuari desactivat")

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
    existent = db.query(models.Usuari).filter(models.Usuari.email == dades.email).first()
    if existent:
        raise HTTPException(status_code=400, detail="Aquest correu ja està registrat")

    nou_usuari = models.Usuari(
        nom_complet=dades.nom_complet,
        email=dades.email,
        password_hash=security.get_password_hash(dades.password),
        rol=dades.rol
    )
    db.add(nou_usuari)
    db.commit()
    db.refresh(nou_usuari)
    return nou_usuari