from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChamadoResponse(BaseModel):
    id_chamado: int
    id_usuario: int
    titulo: str
    descricao: Optional[str]
    categoria: Optional[str]
    prioridade: Optional[str]
    status: str
    data_criacao: datetime
    data_atualizacao: datetime

    class Config:
        orm_mode = True
