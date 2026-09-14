from sqlalchemy.orm import Session
from app.db import models
from app.schemas import producto as schemas


def crear_producto(db: Session, producto: schemas.ProductoCreate):
    datos = producto.model_dump()
    if (not datos.get("cuotas_valor") or datos.get("cuotas_valor") == 0) and datos.get("precio_final"):
        cant = datos.get("cuotas_cantidad") or 3
        datos["cuotas_valor"] = round(datos["precio_final"] / cant, 2)
    nuevo = models.Producto(**datos)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


def listar_productos(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    nombre: str | None = None,
    precio_max: float | None = None,
):
    query = db.query(models.Producto)

    if nombre:
        query = query.filter(models.Producto.nombre.ilike(f"%{nombre}%"))
    if precio_max is not None:
        query = query.filter(models.Producto.precio_final <= precio_max)

    return query.offset(skip).limit(limit).all()


def actualizar_producto(db: Session, producto_id: int, producto_in: schemas.ProductoUpdate):
    db_prod = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_prod:
        return None

    update_data = producto_in.model_dump(exclude_unset=True)
    if "precio_final" in update_data and "cuotas_valor" not in update_data:
        cant = update_data.get("cuotas_cantidad", db_prod.cuotas_cantidad) or 3
        update_data["cuotas_valor"] = round(update_data["precio_final"] / cant, 2)

    for key, value in update_data.items():
        setattr(db_prod, key, value)

    db.commit()
    db.refresh(db_prod)
    return db_prod


def eliminar_producto(db: Session, producto_id: int):
    db_prod = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not db_prod:
        return False
    db.delete(db_prod)
    db.commit()
    return True
