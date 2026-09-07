from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.db import models
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioLogin, Token
from app.services import auth_service
from app.core import security

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def registrar(datos: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = auth_service.registrar_usuario(db, datos)
    access_token = security.create_access_token(data={"sub": usuario.email})
    return Token(access_token=access_token, token_type="bearer", usuario=UsuarioOut.model_validate(usuario))


@router.post("/login", response_model=Token)
def login(datos: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = auth_service.autenticar_usuario(db, datos.email, datos.password)
    access_token = security.create_access_token(data={"sub": usuario.email})
    return Token(access_token=access_token, token_type="bearer", usuario=UsuarioOut.model_validate(usuario))


@router.post("/token", response_model=Token)
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = auth_service.autenticar_usuario(db, form_data.username, form_data.password)
    access_token = security.create_access_token(data={"sub": usuario.email})
    return Token(access_token=access_token, token_type="bearer", usuario=UsuarioOut.model_validate(usuario))


@router.get("/me", response_model=UsuarioOut)
def obtener_perfil(current_user: models.Usuario = Depends(get_current_user)):
    return current_user
