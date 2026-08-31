import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import models
import schemas
from sqlalchemy.orm import Session


def crear_producto(db: Session, producto: schemas.ProductoCreate):
  nuevo = models.Producto(**producto.model_dump())
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
  if precio_max:
    query = query.filter(models.Producto.precio_final <= precio_max)

  return query.offset(skip).limit(limit).all()