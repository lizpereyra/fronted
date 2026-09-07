import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.db.database import Base, engine, SessionLocal
from app.db import models
from app.core import security
from app.routers import auth, productos, pedidos

Base.metadata.create_all(bind=engine)

tags_metadata = [
    {"name": "Productos", "description": "Catálogo de dulces y pastelería"},
    {"name": "Pedidos", "description": "Checkout transaccional e historial de compras"},
    {"name": "Autenticación", "description": "Registro e inicio de sesión de usuarios (Ley 25.326)"},
]

app = FastAPI(title=settings.PROJECT_NAME, openapi_tags=tags_metadata)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(pedidos.router)


@app.on_event("startup")
def startup_populate_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS hashed_password VARCHAR;"))
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS acepto_tratamiento BOOLEAN DEFAULT TRUE;"))
            conn.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_consentimiento TIMESTAMP;"))
            conn.execute(text("ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
            conn.commit()
    except Exception as e:
        print(f"Migration check info: {e}")

    db = SessionLocal()
    try:
        user_count = db.query(models.Usuario).count()
        if user_count == 0:
            print("Seeding demo user account...")
            demo_user = models.Usuario(
                nombre="Cliente Dulce Vicio",
                email="cliente@dulcevicio.com",
                hashed_password=security.get_password_hash("dulce123"),
                rol="customer",
                acepto_tratamiento=True
            )
            db.add(demo_user)
            db.commit()

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
                    id=1,
                    nombre="Tiramisú",
                    precio_final=4500.0,
                    cuotas_cantidad=3,
                    cuotas_valor=1500.0,
                    garantia_meses=0,
                    stock=10,
                ),
                models.Producto(
                    id=2,
                    nombre="Brownie",
                    precio_final=3000.0,
                    cuotas_cantidad=3,
                    cuotas_valor=1000.0,
                    garantia_meses=0,
                    stock=10,
                ),
                models.Producto(
                    id=3,
                    nombre="Chocotorta",
                    precio_final=4000.0,
                    cuotas_cantidad=3,
                    cuotas_valor=1333.33,
                    garantia_meses=0,
                    stock=10,
                ),
                models.Producto(
                    id=4,
                    nombre="Turrón de Quaker",
                    precio_final=4500.0,
                    cuotas_cantidad=3,
                    cuotas_valor=1500.0,
                    garantia_meses=0,
                    stock=10,
                ),
                models.Producto(
                    id=5,
                    nombre="Budín de pan",
                    precio_final=2500.0,
                    cuotas_cantidad=3,
                    cuotas_valor=833.33,
                    garantia_meses=0,
                    stock=10,
                ),
                models.Producto(
                    id=6,
                    nombre="Flan",
                    precio_final=3000.0,
                    cuotas_cantidad=3,
                    cuotas_valor=1000.0,
                    garantia_meses=0,
                    stock=10,
                ),
                models.Producto(
                    id=7,
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


if __name__ == "__main__":
    import uvicorn
    print(f"Iniciando {settings.PROJECT_NAME} en Uvicorn (puerto 8000)...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
