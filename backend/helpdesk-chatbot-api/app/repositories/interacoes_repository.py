from sqlalchemy.orm import Session
from app.models.interacoes_model import InteracaoIA, RemetenteEnum

def salvar_interacao(db: Session, id_usuario: int, id_chamado: int, remetente: RemetenteEnum, mensagem: str):
    interacao = InteracaoIA(
        id_usuario=id_usuario,
        id_chamado=id_chamado,
        remetente=remetente,
        mensagem=mensagem
    )
    db.add(interacao)
    db.commit()
    db.refresh(interacao)
    return interacao

def listar_interacoes_por_chamado(db: Session, id_usuario: int, id_chamado: int):
    return (
        db.query(InteracaoIA)
        .filter(
            InteracaoIA.id_usuario == id_usuario,
            InteracaoIA.id_chamado == id_chamado
        )
        .order_by(InteracaoIA.data_hora.asc())
        .all()
    )

