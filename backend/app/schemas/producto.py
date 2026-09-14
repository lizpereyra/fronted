from pydantic import BaseModel, ConfigDict
from typing import List, Optional


class ProductoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_final: float
    cuotas_cantidad: int = 3
    cuotas_valor: float = 0.0
    garantia_meses: int = 0
    stock: int
    imagen: Optional[str] = None


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_final: Optional[float] = None
    cuotas_cantidad: Optional[int] = None
    cuotas_valor: Optional[float] = None
    garantia_meses: Optional[int] = None
    stock: Optional[int] = None
    imagen: Optional[str] = None


class ProductoOut(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    precio_final: float
    cuotas_cantidad: int
    cuotas_valor: float
    garantia_meses: int
    stock: int
    imagen: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CompraItem(BaseModel):
    producto_id: int
    cantidad: int


class PedidoCompra(BaseModel):
    items: List[CompraItem]
