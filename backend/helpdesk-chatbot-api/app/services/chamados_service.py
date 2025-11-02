from sqlalchemy.orm import Session
from app.repositories.chamados_repository import listar_chamados as repo_listar_chamados, fechar_chamado
from app.models.chamados_model import Chamado

def listar_chamados(db: Session):
    """Aplica lógica de negócio (se necessário) e retorna os chamados."""
    chamados = repo_listar_chamados(db)
    return chamados

def listar_chamados_por_usuario(db: Session, id_usuario: int):
    """
    Retorna todos os chamados de um usuário específico,
    ordenados pela data de criação (mais recentes primeiro).
    """
    return (
        db.query(Chamado)
        .filter(Chamado.id_usuario == id_usuario)
        .order_by(Chamado.data_criacao.desc())
        .all()
    )

def encerrar_chamado(db, id_chamado: int, id_usuario: int):
    chamado = fechar_chamado(db, id_chamado, id_usuario)
    if not chamado:
        return {
            "sucesso": False,
            "mensagem": "Chamado não encontrado, pertence a outro usuário ou já está fechado."
        }

    return {
        "sucesso": True,
        "mensagem": f"✅ Chamado #{id_chamado} foi fechado com sucesso.",
        "chamado": {
            "id_chamado": chamado.id_chamado,
            "status": chamado.status,
            "data_atualizacao": chamado.data_atualizacao
        }
    }