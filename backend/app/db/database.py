import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

try:
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"connect_timeout": 3} if "postgresql" in DATABASE_URL else {}
    )
    with engine.connect() as conn:
        pass
    print("Conexión exitosa a la base de datos PostgreSQL.")
except Exception as e:
    print(f"No se pudo conectar a PostgreSQL ({e}). Usando base de datos SQLite de respaldo...")
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_URL = "sqlite:///" + os.path.join(BASE_DIR, "ecommerce.db")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
