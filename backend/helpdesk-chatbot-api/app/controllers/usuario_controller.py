from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.usuario_schema import UsuarioCreate, UsuarioLogin, UsuarioResponse
from app.services.usuario_service import cadastrar_usuario, login_usuario

router = APIRouter(prefix="/usuarios", tags=["Usuários"])

@router.post("/cadastro", response_model=UsuarioResponse)
def cadastrar(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    return cadastrar_usuario(db, usuario)

@router.post("/login")
def login(usuario: UsuarioLogin, db: Session = Depends(get_db)):
    return login_usuario(db, usuario)
