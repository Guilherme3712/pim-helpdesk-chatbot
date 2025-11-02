from pydantic import BaseModel, EmailStr
from datetime import datetime

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioLogin(BaseModel):
    email: EmailStr
    senha: str

class UsuarioResponse(UsuarioBase):
    id_usuario: int
    data_criacao: datetime

    class Config:
        orm_mode = True
