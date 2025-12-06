from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.chatbot_service import processar_interacao, obter_historico_chamado

router = APIRouter(tags=["ChatBot"])

# Request model
class ChatRequest(BaseModel):
    id_usuario: int
    mensagem: str
    id_chamado: int | None = None  # opcional

@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        resultado = processar_interacao(db, request)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no chatbot: {e}")
    
    
@router.get("/historico/{id_usuario}/{id_chamado}")
def get_historico(id_usuario: int, id_chamado: int, db: Session = Depends(get_db)):
    resultado = obter_historico_chamado(db, id_usuario, id_chamado)
    if resultado["erro"]:
        raise HTTPException(status_code=404, detail=resultado["mensagem"])
    return resultado
