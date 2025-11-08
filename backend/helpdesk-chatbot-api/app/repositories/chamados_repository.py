from sqlalchemy.orm import Session
from app.models.chamados_model import Chamado
from sqlalchemy import and_

def listar_chamados(db: Session):
    """Retorna todos os chamados do banco."""
    return db.query(Chamado).all()



def criar_chamado(db, id_usuario, titulo, descricao, categoria, prioridade, classificado_por_ia):
    novo_chamado = Chamado(
        id_usuario=id_usuario,
        titulo=titulo,
        descricao=descricao,
        categoria=categoria,
        prioridade=prioridade,
        classificado_por_ia=classificado_por_ia
    )
    db.add(novo_chamado)
    db.commit()
    db.refresh(novo_chamado)
    return {
        "id_chamado": novo_chamado.id_chamado,
        "status": novo_chamado.status,
        "categoria": novo_chamado.categoria,
        "prioridade": novo_chamado.prioridade
    }

def fechar_chamado_aberto(db, id_usuario):
    chamado = db.query(Chamado).filter(
        and_(
            Chamado.id_usuario == id_usuario,
            Chamado.status == "aberto"
        )
    ).order_by(Chamado.id_chamado.desc()).first()

    if not chamado:
        return None

    chamado.status = "fechado"
    db.commit()
    db.refresh(chamado)

    return {
        "id_chamado": chamado.id_chamado,
        "status": chamado.status
    }

def fechar_chamado(db: Session, id_chamado: int, id_usuario: int):
    chamado = (
        db.query(Chamado)
        .filter_by(id_chamado=id_chamado, id_usuario=id_usuario, status="em_andamento")
        .first()
    )
    if not chamado:
        return None

    chamado.status = "fechado"
    db.commit()
    db.refresh(chamado)
    return chamado