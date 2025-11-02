from sqlalchemy.orm import Session
from app.models.usuario_model import Usuario

def get_usuario_by_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()

def create_usuario(db: Session, nome: str, email: str, senha_hash: str):
    novo_usuario = Usuario(nome=nome, email=email, senha=senha_hash)
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario
