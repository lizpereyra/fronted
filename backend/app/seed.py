import os
import sys

# Agregar la raíz del backend al PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db import models
from app.core import security
from app.core.config import settings

def run_seed():
    db_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)
    admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin@dulcevicio.com")
    admin_password = os.getenv("SEED_ADMIN_PASSWORD", "admin123")

    print("[SEED] Iniciando proceso de Seed en la base de datos...")
    print(f"[SEED] Admin Email objetivo: {admin_email}")

    engine = create_engine(db_url)
    models.Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # 1. Cargar Usuario Administrador Idempotente
        admin_user = db.query(models.Usuario).filter(models.Usuario.email == admin_email).first()
        if not admin_user:
            print("[SEED] Creando cuenta de usuario Admin de producción...")
            admin_user = models.Usuario(
                nombre="Administrador Dulce Vicio",
                email=admin_email,
                hashed_password=security.get_password_hash(admin_password),
                rol="admin",
                acepto_tratamiento=True
            )
            db.add(admin_user)
            db.commit()
            print("[SEED] Usuario Admin creado con éxito.")
        else:
            print("[SEED] El usuario Admin ya existe en la base de datos.")

        # 2. Cargar Catálogo Oficial de Productos Idempotente
        productos_iniciales = [
            {
                "id": 1,
                "nombre": "Tiramisú",
                "descripcion": "Delicioso postre italiano tradicional con café y mascarpone",
                "precio_final": 4500.0,
                "cuotas_cantidad": 3,
                "cuotas_valor": 1500.0,
                "garantia_meses": 0,
                "stock": 10,
                "imagen": "/demo/tiramisu.jpg"
            },
            {
                "id": 2,
                "nombre": "Brownie",
                "descripcion": "Brownie húmedo de chocolate supremo con nueces",
                "precio_final": 3000.0,
                "cuotas_cantidad": 3,
                "cuotas_valor": 1000.0,
                "garantia_meses": 0,
                "stock": 10,
                "imagen": "/demo/brownie.jpg"
            },
            {
                "id": 3,
                "nombre": "Chocotorta",
                "descripcion": "Clásica chocotorta argentina con dulce de leche y queso crema",
                "precio_final": 4000.0,
                "cuotas_cantidad": 3,
                "cuotas_valor": 1333.33,
                "garantia_meses": 0,
                "stock": 10,
                "imagen": "/demo/chocotorta.jpg"
            },
            {
                "id": 4,
                "nombre": "Turrón de Quaker",
                "descripcion": "Crujiente turrón artesanal de avena quaker y cacao",
                "precio_final": 4500.0,
                "cuotas_cantidad": 3,
                "cuotas_valor": 1500.0,
                "garantia_meses": 0,
                "stock": 10,
                "imagen": "/demo/turron_de_quaker.jpg"
            },
            {
                "id": 5,
                "nombre": "Budín de pan",
                "descripcion": "Tradicional budín de pan casero suave y aromático",
                "precio_final": 2500.0,
                "cuotas_cantidad": 3,
                "cuotas_valor": 833.33,
                "garantia_meses": 0,
                "stock": 10,
                "imagen": "/demo/budin_de_pan.jpg"
            },
            {
                "id": 6,
                "nombre": "Flan",
                "descripcion": "Flan casero esponjoso bañado en caramelo dorado",
                "precio_final": 3000.0,
                "cuotas_cantidad": 3,
                "cuotas_valor": 1000.0,
                "garantia_meses": 0,
                "stock": 10,
                "imagen": "/demo/flan.png"
            },
            {
                "id": 7,
                "nombre": "Cookie",
                "descripcion": "Galleta gigante horneada con chips de chocolate",
                "precio_final": 2000.0,
                "cuotas_cantidad": 3,
                "cuotas_valor": 666.67,
                "garantia_meses": 0,
                "stock": 10,
                "imagen": "/demo/cookie.png"
            }
        ]

        for p_data in productos_iniciales:
            prod = db.query(models.Producto).filter(models.Producto.nombre == p_data["nombre"]).first()
            if not prod:
                print(f"[SEED] Creando producto: {p_data['nombre']}")
                nuevo_prod = models.Producto(**p_data)
                db.add(nuevo_prod)
            else:
                prod.imagen = p_data["imagen"]
                prod.descripcion = prod.descripcion or p_data["descripcion"]

        db.commit()
        print("[SEED] Proceso de Seed ejecutado y completado exitosamente.")

    except Exception as e:
        db.rollback()
        print(f"[SEED] Error durante la ejecución del Seed: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
