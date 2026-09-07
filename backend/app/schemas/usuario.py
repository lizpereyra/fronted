import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional


class UsuarioCreate(BaseModel):
    nombre: Optional[str] = None
    email: EmailStr
    password: str
    acepto_tratamiento: bool = False


class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str


class UsuarioOut(BaseModel):
    id: int
    nombre: Optional[str] = None
    email: str
    rol: str
    acepto_tratamiento: Optional[bool] = True
    fecha_consentimiento: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut
