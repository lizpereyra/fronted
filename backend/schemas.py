from pydantic import BaseModel

class ProductoBase(BaseModel):
    nombre: str
    precio_final: float
    cuotas_cantidad: int
    cuotas_valor: float
    garantia_meses: int
    stock: int

class ProductoCrear(ProductoBase):
    pass

class Producto(ProductoBase):
    id: int

    class Config:
        from_attributes = True

class CompraItem(BaseModel):
    producto_id: int
    cantidad: int

class Pedido(BaseModel):
    items: list[CompraItem]