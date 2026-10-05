import secrets
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from typing import List

from app.dependencies import get_db, get_current_user
from app.db import models

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


@router.get("/me/datos")
def obtener_mis_datos(
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pedidos = (
        db.query(models.Pedido)
        .filter(models.Pedido.usuario_id == current_user.id)
        .order_by(models.Pedido.creado_en.desc())
        .all()
    )

    pedidos_json = []
    revocaciones_json = []

    for p in pedidos:
        p_dict = {
            "id": p.id,
            "total": p.total,
            "estado": p.estado,
            "creado_en": p.creado_en.isoformat() if p.creado_en else None,
            "items_count": len(p.items)
        }
        pedidos_json.append(p_dict)
        if (p.estado or "").lower() in ["revocado", "cancelado"]:
            revocaciones_json.append({
                "pedido_id": p.id,
                "codigo": f"REV-{p.id}-CONFIRMED",
                "fecha": p.creado_en.isoformat() if p.creado_en else None
            })

    return {
        "usuario": {
            "id": current_user.id,
            "nombre": current_user.nombre,
            "email": current_user.email,
            "rol": current_user.rol,
            "creado_en": current_user.fecha_consentimiento.isoformat() if current_user.fecha_consentimiento else None
        },
        "consentimiento": {
            "estado": "Aceptado" if current_user.acepto_tratamiento else "Revocado",
            "fecha": current_user.fecha_consentimiento.isoformat() if current_user.fecha_consentimiento else None
        },
        "pedidos": pedidos_json,
        "revocaciones": revocaciones_json
    }


@router.get("/me/exportar")
def exportar_mis_datos(
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    datos = obtener_mis_datos(current_user=current_user, db=db)
    import json
    contenido = json.dumps(datos, indent=2, ensure_ascii=False)
    return Response(
        content=contenido,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=mis-datos.json"}
    )


@router.delete("/me")
def eliminar_mi_cuenta(
    current_user: models.Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Regla Ley 25.326 / DSI2: Anonimizar datos identificativos pero conservar registros de pedidos
    token_suffix = secrets.token_hex(4)
    current_user.nombre = "Usuario Anonimizado"
    current_user.email = f"anonimo_{current_user.id}_{token_suffix}@anonimizado.local"
    current_user.hashed_password = f"ANONYMIZED_{secrets.token_hex(16)}"
    current_user.acepto_tratamiento = False

    db.commit()

    return {
        "status": "ok",
        "mensaje": "Cuenta anonimizada y dada de baja exitosamente. Tus pedidos históricos han sido disociados y preservados para registro contable."
    }
