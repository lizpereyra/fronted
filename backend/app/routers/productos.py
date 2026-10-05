import os
import secrets
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, require_admin
from app.db import models
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut, PedidoCompra
from app.services import productos as productos_service

router = APIRouter(prefix="/productos", tags=["Productos"])


def parece_imagen(contenido: bytes) -> bool:
    """
    Verifica la firma de bytes (Magic Bytes) del archivo para asegurar
    que se trate de una imagen real (JPEG, PNG, GIF, WEBP) y no un archivo trampa.
    """
    if not contenido or len(contenido) < 12:
        return False
    # JPEG: \xff\xd8\xff
    if contenido.startswith(b'\xff\xd8\xff'):
        return True
    # PNG: \x89PNG\r\n\x1a\n or \x89PNG
    if contenido.startswith(b'\x89PNG\r\n\x1a\n') or contenido.startswith(b'\x89PNG'):
        return True
    # GIF: GIF87a or GIF89a
    if contenido.startswith(b'GIF87a') or contenido.startswith(b'GIF89a'):
        return True
    # WEBP: RIFF....WEBP
    if contenido.startswith(b'RIFF') and contenido[8:12] == b'WEBP':
        return True
    return False


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


@router.post("/", response_model=ProductoOut, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto: ProductoCreate,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_admin),
):
    return productos_service.crear_producto(db, producto)


@router.put("/{id}", response_model=ProductoOut)
def actualizar_producto(
    id: int,
    producto: ProductoUpdate,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_admin),
):
    prod_actualizado = productos_service.actualizar_producto(db, id, producto)
    if not prod_actualizado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {id} no encontrado",
        )
    return prod_actualizado


@router.delete("/{id}")
def eliminar_producto(
    id: int,
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_admin),
):
    exito = productos_service.eliminar_producto(db, id)
    if not exito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {id} no encontrado",
        )
    return {"status": "ok", "message": f"Producto con ID {id} eliminado correctamente"}


@router.post("/{id}/imagen")
async def subir_imagen_producto(
    id: int,
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_admin),
):
    db_prod = db.query(models.Producto).filter(models.Producto.id == id).first()
    if not db_prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con ID {id} no encontrado",
        )

    # 1. Lectura del contenido
    contenido = await archivo.read()

    # 2. Validación de tamaño (Máximo 2 MB = 2 * 1024 * 1024 bytes)
    if len(contenido) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="La imagen no puede pasar de 2 MB",
        )

    # 3. Validación por firma de bytes (Magic Bytes con parece_imagen)
    if not parece_imagen(contenido):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="El archivo no es una imagen permitida o es un archivo trampa",
        )

    # 4. Determinar extensión segura
    ext = ".jpg"
    if contenido.startswith(b'\x89PNG'):
        ext = ".png"
    elif contenido.startswith(b'GIF'):
        ext = ".gif"
    elif contenido.startswith(b'RIFF') and contenido[8:12] == b'WEBP':
        ext = ".webp"
    elif archivo.filename and "." in archivo.filename:
        orig_ext = os.path.splitext(archivo.filename)[1].lower()
        if orig_ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            ext = orig_ext

    # 5. Generar nombre único seguro con secrets.token_hex()
    nombre_seguro = f"{secrets.token_hex(16)}{ext}"
    directorio_destino = os.path.join("uploads", "productos")
    os.makedirs(directorio_destino, exist_ok=True)
    filepath = os.path.join(directorio_destino, nombre_seguro)

    with open(filepath, "wb") as f:
        f.write(contenido)

    # 6. Guardar la URL relativa servida por FastAPI
    rel_url = f"/static/productos/{nombre_seguro}"
    db_prod.imagen = rel_url
    db.commit()
    db.refresh(db_prod)

    return {
        "status": "ok",
        "imagen_url": rel_url,
        "producto_id": db_prod.id,
        "mensaje": "Imagen subida y verificada con éxito"
    }


import datetime
from app.dependencies import oauth2_scheme
from app.core import security

@router.post("/comprar")
def comprar_productos(
    pedido: PedidoCompra,
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme)
):
    try:
        user_id = None
        if token:
            payload = security.decode_access_token(token)
            if payload and "sub" in payload:
                user = db.query(models.Usuario).filter(models.Usuario.email == payload["sub"]).first()
                if user:
                    user_id = user.id

        total_acumulado = 0.0
        db_items = []
        items_db = []
        for item in pedido.items:
            db_prod = (
                db.query(models.Producto)
                .filter(models.Producto.id == item.producto_id)
                .with_for_update()
                .first()
            )
            if not db_prod:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {item.producto_id} no encontrado",
                )
            if db_prod.stock < item.cantidad:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Stock insuficiente para {db_prod.nombre}. Solicitado:"
                        f" {item.cantidad}, Disponible: {db_prod.stock}"
                    ),
                )
            subtotal = db_prod.precio_final * item.cantidad
            total_acumulado += subtotal
            db_items.append((db_prod, item.cantidad))
            items_db.append(models.ItemPedido(
                producto_id=db_prod.id,
                cantidad=item.cantidad,
                precio_unitario=db_prod.precio_final
            ))

        for db_prod, cantidad in db_items:
            db_prod.stock -= cantidad

        nuevo_pedido = models.Pedido(
            usuario_id=user_id,
            total=round(total_acumulado, 2),
            estado="pendiente",
            fecha=datetime.datetime.utcnow(),
            creado_en=datetime.datetime.utcnow(),
            items=items_db
        )
        db.add(nuevo_pedido)
        db.commit()
        db.refresh(nuevo_pedido)
        return {"status": "ok", "message": "Compra realizada con éxito", "pedido_id": nuevo_pedido.id}

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error transaccional en compra: {str(e)}"
        )

