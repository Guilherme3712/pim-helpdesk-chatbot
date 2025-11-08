from sqlalchemy import Column, Integer, String, Text, Enum, Boolean, Time, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
import enum

class CategoriaEnum(str, enum.Enum):
    hardware = "hardware"
    software = "software"
    rede = "rede"
    outros = "outros"

class PrioridadeEnum(str, enum.Enum):
    baixa = "baixa"
    media = "media"
    alta = "alta"

class StatusEnum(str, enum.Enum):
    aberto = "aberto"
    em_andamento = "em_andamento"
    fechado = "fechado"

class Chamado(Base):
    __tablename__ = "chamados"

    id_chamado = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False)
    titulo = Column(String(150), nullable=False)
    descricao = Column(Text)
    categoria = Column(Enum(CategoriaEnum), default=CategoriaEnum.outros)
    prioridade = Column(Enum(PrioridadeEnum), default=PrioridadeEnum.media)
    status = Column(Enum(StatusEnum), default=StatusEnum.em_andamento)
    classificado_por_ia = Column(Boolean, default=False)
    tempo_medio_atendimento = Column(Time)
    data_criacao = Column(DateTime, server_default=func.now())
    data_atualizacao = Column(DateTime, onupdate=func.now(), server_default=func.now())
