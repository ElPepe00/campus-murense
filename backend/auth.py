# backend/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_db
import models, security

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> models.Usuari:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credencials no vàlides o token caducat",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.Usuari).filter(models.Usuari.email == email).first()
    if user is None or not user.actiu:
        raise credentials_exception
    return user

def require_admin(current_user: models.Usuari = Depends(get_current_user)) -> models.Usuari:
    """Verifica que l'usuari tingui permisos d'administrador complets."""
    if current_user.rol != models.RolUsuariEnum.ADMIN and getattr(current_user.rol, 'value', str(current_user.rol)) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tens permisos d'administrador suficients"
        )
    return current_user