import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user, require_admin
from app.db import models
from app.schemas.pedido import PedidoCreate, PedidoOut
from app.services import pedido_service

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


@router.get("/", response_model=List[PedidoOut])
def listar_todos_los_pedidos(
    db: Session = Depends(get_db),
    admin: models.Usuario = Depends(require_admin)
):
    return db.query(models.Pedido).order_by(models.Pedido.creado_en.desc()).all()


@router.post("/", response_model=PedidoOut, status_code=status.HTTP_201_CREATED)
def crear_nuevo_pedido(
    datos: PedidoCreate,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return pedido_service.crear_pedido(db, usuario=current_user, datos=datos)


@router.get("/mios", response_model=List[PedidoOut])
def listar_mis_pedidos(
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return pedido_service.obtener_mis_pedidos(db, usuario=current_user)



@router.post("/{pedido_id}/revocacion", status_code=status.HTTP_200_OK)
def revocar_pedido_publico(
    pedido_id: int,
    db: Session = Depends(get_db)
):
    """
    Endpoint PÚBLICO de Arrepentimiento / Revocación conforme Disp. 954/2025.
    Ejecuta el proceso SIN exigir token de autenticación ni sesión iniciada.
    """
    pedido = db.query(models.Pedido).filter(models.Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido con ID #{pedido_id} no encontrado"
        )

    if (pedido.estado or "").lower() in ["revocado", "cancelado"]:
        codigo_existente = f"REV-{pedido.id}-PREVIOUSLY-REVOKED"
        return {
            "status": "ok",
            "codigo": codigo_existente,
            "mensaje": f"El pedido #{pedido_id} ya se encontraba revocado previamente."
        }

    # Actualizar estado de pedido a revocado
    pedido.estado = "revocado"

    # Devolver stock de los productos asociados al pedido
    for item in pedido.items:
        prod = db.query(models.Producto).filter(models.Producto.id == item.producto_id).first()
        if prod:
            prod.stock += item.cantidad

    codigo = f"REV-{pedido.id}-{secrets.token_hex(4).upper()}"
    db.commit()

    return {
        "status": "ok",
        "codigo": codigo,
        "mensaje": f"Solicitud de revocación del pedido #{pedido_id} procesada exitosamente."
    }


@router.get("/{pedido_id}", response_model=PedidoOut)
def obtener_pedido_por_id(
    pedido_id: int,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return pedido_service.obtener_pedido_por_id(db, usuario=current_user, pedido_id=pedido_id)

