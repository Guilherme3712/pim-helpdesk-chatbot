from sqlalchemy import Column, Integer, Text, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from app.database import Base

class RemetenteEnum(PyEnum):
    usuario = "usuario"
    ia = "ia"

class InteracaoIA(Base):
    __tablename__ = "interacoes_ia"

    id_interacao = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    id_chamado = Column(Integer, ForeignKey("chamados.id_chamado", ondelete="CASCADE"), nullable=False)
    remetente = Column(Enum(RemetenteEnum), nullable=False)
    mensagem = Column(Text, nullable=False)
    data_hora = Column(DateTime, server_default=func.now())
