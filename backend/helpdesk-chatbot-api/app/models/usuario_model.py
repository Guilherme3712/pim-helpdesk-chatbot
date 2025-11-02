from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)
