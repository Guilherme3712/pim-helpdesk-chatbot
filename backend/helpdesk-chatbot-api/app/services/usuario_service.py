from sqlalchemy.orm import Session
from app.repositories.usuario_repository import get_usuario_by_email, create_usuario
from app.schemas.usuario_schema import UsuarioCreate, UsuarioLogin
from app.models.usuario_model import Usuario
from fastapi import HTTPException, status
from passlib.context import CryptContext
import jwt
import datetime
import os
from datetime import datetime, timedelta

# Configurações de segurança
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SECRET_KEY = "minha_chave_supersecreta"
ALGORITHM = "HS256"

def hash_senha(senha: str):
    # Trunca a senha se tiver mais de 72 bytes (limite do bcrypt)
    senha_truncada = senha.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.hash(senha_truncada)


def verificar_senha(senha: str, senha_hash: str):
    senha_truncada = senha.encode("utf-8")[:72].decode("utf-8", errors="ignore")
    return pwd_context.verify(senha_truncada, senha_hash)


def gerar_token(user_id: int, email: str):
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def cadastrar_usuario(db: Session, usuario_data: UsuarioCreate):
    print("Senha recebida:", usuario_data.senha)
    print("Tamanho:", len(usuario_data.senha))

    if get_usuario_by_email(db, usuario_data.email):
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    senha_hash = hash_senha(usuario_data.senha)
    novo_usuario = create_usuario(db, usuario_data.nome, usuario_data.email, senha_hash)
    return novo_usuario

def login_usuario(db: Session, usuario_data: UsuarioLogin):
    usuario = get_usuario_by_email(db, usuario_data.email)
    if not usuario or not verificar_senha(usuario_data.senha, usuario.senha):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas")

    token = gerar_token(usuario.id_usuario, usuario.email)
    return {"access_token": token, "token_type": "bearer"}


def obter_usuario_por_id(db: Session, usuario_id: int):
    return db.query(Usuario).filter(Usuario.id_usuario == usuario_id).first()