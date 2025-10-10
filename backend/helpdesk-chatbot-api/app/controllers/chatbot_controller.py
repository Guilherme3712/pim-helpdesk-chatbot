# app/routes/chat_routes.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ai.rag.chatbot import ChatbotRAG
import os

router = APIRouter()

# 🔹 Inicializa o chatbot apenas uma vez
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("[chat_routes] GROQ_API_KEY não definida no ambiente.")

chatbot = ChatbotRAG(api_key=api_key)

# 🔹 Request model
class ChatRequest(BaseModel):
    message: str

# 🔹 Endpoint de chat
@router.post("/chat")
def chat(request: ChatRequest):
    try:
        user_message = request.message.strip()
        if not user_message:
            raise HTTPException(status_code=400, detail="A mensagem não pode ser vazia.")
        
        response = chatbot.generate_response(user_message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no chatbot: {e}")
