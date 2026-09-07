import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db import models
from app.schemas import usuario as schemas
from app.core import security


def registrar_usuario(db: Session, datos: schemas.UsuarioCreate) -> models.Usuario:
    # Ley 25.326 mandatory validation:aceptamiento del tratamiento de datos personales
    if not datos.acepto_tratamiento:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes aceptar el tratamiento de datos personales conforme a la Ley 25.326 para crear una cuenta."
        )

    existente = db.query(models.Usuario).filter(models.Usuario.email == datos.email).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado"
        )
    
    nuevo = models.Usuario(
        nombre=datos.nombre or datos.email.split("@")[0].capitalize(),
        email=datos.email,
        hashed_password=security.get_password_hash(datos.password),
        rol="customer",
        acepto_tratamiento=True,
        fecha_consentimiento=datetime.datetime.utcnow()
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def autenticar_usuario(db: Session, email: str, password: str) -> models.Usuario:
    usuario = db.query(models.Usuario).filter(models.Usuario.email == email).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    if not security.verify_password(password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    return usuario
