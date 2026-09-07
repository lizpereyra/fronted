import datetime
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.db import models
from app.schemas import pedido as schemas


def crear_pedido(db: Session, usuario: models.Usuario, datos: schemas.PedidoCreate) -> models.Pedido:
    try:
        total_acumulado = 0.0
        items_db = []

        # Iterate over requested items and apply pessimistic lock with with_for_update()
        for item_in in datos.items:
            producto = (
                db.query(models.Producto)
                .filter(models.Producto.id == item_in.producto_id)
                .with_for_update()
                .first()
            )

            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Producto inexistente"
                )

            if producto.stock < item_in.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Sin stock de {producto.nombre}: quedan {producto.stock}"
                )

            # Deduct stock and calculate item total using DB price
            producto.stock -= item_in.cantidad
            subtotal = producto.precio_final * item_in.cantidad
            total_acumulado += subtotal

            # Prepare ItemPedido with frozen precio_unitario
            item_db = models.ItemPedido(
                producto_id=producto.id,
                cantidad=item_in.cantidad,
                precio_unitario=producto.precio_final
            )
            items_db.append(item_db)

        # Create main Pedido record
        nuevo_pedido = models.Pedido(
            usuario_id=usuario.id,
            total=round(total_acumulado, 2),
            estado="pendiente",
            fecha=datetime.datetime.utcnow(),
            creado_en=datetime.datetime.utcnow(),
            items=items_db
        )

        db.add(nuevo_pedido)
        db.commit()
        db.refresh(nuevo_pedido)
        return nuevo_pedido

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error transaccional al procesar el pedido: {str(e)}"
        )


def obtener_mis_pedidos(db: Session, usuario_id: int) -> list[models.Pedido]:
    return (
        db.query(models.Pedido)
        .filter(models.Pedido.usuario_id == usuario_id)
        .order_by(models.Pedido.creado_en.desc())
        .all()
    )


def obtener_pedido_por_id(db: Session, usuario: models.Usuario, pedido_id: int) -> models.Pedido:
    pedido = (
        db.query(models.Pedido)
        .filter(models.Pedido.id == pedido_id)
        .first()
    )

    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    # If non-admin user tries to access someone else's order, return 404 to avoid leaking existence
    if usuario.rol != "admin" and pedido.usuario_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado"
        )

    return pedido
