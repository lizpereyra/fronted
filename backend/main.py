import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Base, engine, get_db, SessionLocal
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import models
import schemas
from services import productos as productos_service
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_populate_db():
  db = SessionLocal()
  try:
    bakery_names = {
        "Tiramisú",
        "Brownie",
        "Chocotorta",
        "Turrón de Quaker",
        "Budín de pan",
        "Flan",
        "Cookie",
    }
    existing_products = db.query(models.Producto).all()
    existing_names = {p.nombre for p in existing_products}

    if (
        not existing_products
        or not existing_names.issubset(bakery_names)
        or len(existing_products) != len(bakery_names)
    ):
      print("Seeding database with bakery products...")
      db.query(models.Producto).delete()

      bakery_products = [
          models.Producto(
              nombre="Tiramisú",
              precio_final=4500.0,
              cuotas_cantidad=3,
              cuotas_valor=1500.0,
              garantia_meses=0,
              stock=10,
          ),
          models.Producto(
              nombre="Brownie",
              precio_final=3000.0,
              cuotas_cantidad=3,
              cuotas_valor=1000.0,
              garantia_meses=0,
              stock=10,
          ),
          models.Producto(
              nombre="Chocotorta",
              precio_final=4000.0,
              cuotas_cantidad=3,
              cuotas_valor=1333.33,
              garantia_meses=0,
              stock=10,
          ),
          models.Producto(
              nombre="Turrón de Quaker",
              precio_final=4500.0,
              cuotas_cantidad=3,
              cuotas_valor=1500.0,
              garantia_meses=0,
              stock=10,
          ),
          models.Producto(
              nombre="Budín de pan",
              precio_final=2500.0,
              cuotas_cantidad=3,
              cuotas_valor=833.33,
              garantia_meses=0,
              stock=10,
          ),
          models.Producto(
              nombre="Flan",
              precio_final=3000.0,
              cuotas_cantidad=3,
              cuotas_valor=1000.0,
              garantia_meses=0,
              stock=10,
          ),
          models.Producto(
              nombre="Cookie",
              precio_final=2000.0,
              cuotas_cantidad=3,
              cuotas_valor=666.67,
              garantia_meses=0,
              stock=10,
          ),
      ]
      db.add_all(bakery_products)
      db.commit()
      print("Database seeded successfully!")
  except Exception as e:
    print(f"Error seeding database: {e}")
    db.rollback()
  finally:
    db.close()


@app.get("/productos", response_model=list[schemas.ProductoOut])
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


@app.post("/productos", response_model=schemas.ProductoOut)
def crear_producto(
    producto: schemas.ProductoCreate, db: Session = Depends(get_db)
):
  return productos_service.crear_producto(db, producto)


@app.post("/productos/comprar")
def comprar_productos(pedido: schemas.Pedido, db: Session = Depends(get_db)):
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


if __name__ == "__main__":
  import uvicorn
  print("Iniciando Uvicorn en el puerto 8000...")
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)