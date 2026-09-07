from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.db import models
from app.schemas.pedido import PedidoCreate, PedidoOut
from app.services import pedido_service

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


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
    return pedido_service.obtener_mis_pedidos(db, usuario_id=current_user.id)


@router.get("/{pedido_id}", response_model=PedidoOut)
def obtener_pedido_por_id(
    pedido_id: int,
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return pedido_service.obtener_pedido_por_id(db, usuario=current_user, pedido_id=pedido_id)
