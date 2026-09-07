from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db import models
from app.core import security

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.Usuario:
    if not token:
        # Check if there is a default test user or raise 401
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu sesión venció. Volvé a entrar.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = security.decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu sesión venció. Volvé a entrar.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_email = payload["sub"]
    user = db.query(models.Usuario).filter(models.Usuario.email == user_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu sesión venció. Volvé a entrar.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user
