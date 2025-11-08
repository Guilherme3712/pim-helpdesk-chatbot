from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario_schema import UsuarioCreate, UsuarioLogin, UsuarioResponse
from app.services.usuario_service import cadastrar_usuario, login_usuario, obter_usuario_por_id

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.post("/cadastro", response_model=UsuarioResponse)
def cadastrar(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    return cadastrar_usuario(db, usuario)

@router.post("/login")
def login(usuario: UsuarioLogin, db: Session = Depends(get_db)):
    return login_usuario(db, usuario)

@router.get("/{usuario_id}", response_model=UsuarioResponse)
def obter_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = obter_usuario_por_id(db, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario
