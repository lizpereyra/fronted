from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:28606547@localhost/ecommerce_db")

# Fallback mechanism: try connecting to PostgreSQL; if it fails, fallback to SQLite
try:
    # Set a short timeout for PostgreSQL connection attempt
    engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 3} if "postgresql" in DATABASE_URL else {})
    # Test if connection can be established
    with engine.connect() as conn:
        pass
    print("Conexión exitosa a PostgreSQL.")
except Exception as e:
    print(f"No se pudo conectar a PostgreSQL: {e}")
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_URL = "sqlite:///" + os.path.join(BASE_DIR, "ecommerce.db")
    print(f"Usando base de datos SQLite de respaldo: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()