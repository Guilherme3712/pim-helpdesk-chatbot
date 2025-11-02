from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.chamados_service import listar_chamados, encerrar_chamado, listar_chamados_por_usuario
from app.schemas.chamados_schema import ChamadoResponse

router = APIRouter(prefix="/chamados", tags=["Chamados"])

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
