from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.chamados_service import listar_chamados, encerrar_chamado, listar_chamados_por_usuario
from app.schemas.chamados_schema import ChamadoResponse
from app.models.chamados_model import Chamado, StatusEnum  
from pydantic import BaseModel

router = APIRouter(prefix="/chamados", tags=["Chamados"])

# Schema para entrada
class StatusUpdate(BaseModel):
    status: str


@router.get("/all", summary="Listar todos os chamados")
def listar_todos_chamados(db: Session = Depends(get_db)):
    """Endpoint para listar todos os chamados cadastrados."""
    return listar_chamados(db)

@router.get("/usuario/{id_usuario}", response_model=list[ChamadoResponse])
def get_chamados_por_usuario(id_usuario: int, db: Session = Depends(get_db)):
    chamados = listar_chamados_por_usuario(db, id_usuario)
    if not chamados:
        raise HTTPException(status_code=404, detail="Nenhum chamado encontrado para este usuário.")
    return chamados

@router.put("/{id_chamado}/fechar/usuario/{id_usuario}")
def fechar_chamado(id_chamado: int, id_usuario: int, db: Session = Depends(get_db)):
    resultado = encerrar_chamado(db, id_chamado, id_usuario)
    if not resultado["sucesso"]:
        raise HTTPException(status_code=404, detail=resultado["mensagem"])
    return resultado

@router.patch("/{chamado_id}/status")
def atualizar_status_chamado(chamado_id: int, data: StatusUpdate, db: Session = Depends(get_db)):
    # Valida status
    status_permitidos = [s.value for s in StatusEnum]
    if data.status not in status_permitidos:
        raise HTTPException(status_code=400, detail=f"Status inválido. Permitidos: {status_permitidos}")

    # Busca o chamado no banco
    chamado = db.query(Chamado).filter(Chamado.id_chamado == chamado_id).first()
    if not chamado:
        raise HTTPException(status_code=404, detail="Chamado não encontrado")

    # Atualiza o status
    chamado.status = data.status
    db.commit()
    db.refresh(chamado)

    return {
        "message": f"Status do chamado #{chamado_id} atualizado para '{data.status}' com sucesso.",
        "chamado": {
            "id_chamado": chamado.id_chamado,
            "status": chamado.status,
            "data_atualizacao": chamado.data_atualizacao,
        },
    }