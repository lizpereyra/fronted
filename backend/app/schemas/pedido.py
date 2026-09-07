import datetime
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional
from app.schemas.producto import ProductoOut


class ItemIn(BaseModel):
    producto_id: int
    cantidad: int = Field(gt=0)


class PedidoCreate(BaseModel):
    items: List[ItemIn] = Field(min_length=1)


class ItemOut(BaseModel):
    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    producto: Optional[ProductoOut] = None

    model_config = ConfigDict(from_attributes=True)


class PedidoOut(BaseModel):
    id: int
    usuario_id: Optional[int] = None
    total: float
    estado: str
    creado_en: datetime.datetime
    items: List[ItemOut]

    model_config = ConfigDict(from_attributes=True)
