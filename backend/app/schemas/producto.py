from pydantic import BaseModel, ConfigDict
from typing import List


class ProductoCreate(BaseModel):
    nombre: str
    precio_final: float
    cuotas_cantidad: int
    cuotas_valor: float
    garantia_meses: int
    stock: int


class ProductoOut(ProductoCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CompraItem(BaseModel):
    producto_id: int
    cantidad: int


class PedidoCompra(BaseModel):
    items: List[CompraItem]
