from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db
from app.db import models
from app.schemas.producto import ProductoCreate, ProductoOut, PedidoCompra
from app.services import productos as productos_service

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=List[ProductoOut])
def listar_productos(
    skip: int = 0,
    limit: int = 10,
    nombre: str | None = None,
    precio_max: float | None = None,
    db: Session = Depends(get_db),
):
    return productos_service.listar_productos(
        db, skip=skip, limit=limit, nombre=nombre, precio_max=precio_max
    )


@router.post("/", response_model=ProductoOut)
def crear_producto(
    producto: ProductoCreate, db: Session = Depends(get_db)
):
    return productos_service.crear_producto(db, producto)


@router.post("/comprar")
def comprar_productos(pedido: PedidoCompra, db: Session = Depends(get_db)):
    db_items = []
    for item in pedido.items:
        db_prod = (
            db.query(models.Producto)
            .filter(models.Producto.id == item.producto_id)
            .first()
        )
        if not db_prod:
            raise HTTPException(
                status_code=404,
                detail=f"Producto con ID {item.producto_id} no encontrado",
            )
        if db_prod.stock < item.cantidad:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Stock insuficiente para {db_prod.nombre}. Solicitado:"
                    f" {item.cantidad}, Disponible: {db_prod.stock}"
                ),
            )
        db_items.append((db_prod, item.cantidad))

    for db_prod, cantidad in db_items:
        db_prod.stock -= cantidad

    db.commit()
    return {"status": "ok", "message": "Compra realizada con éxito"}
