# app/main.py
from fastapi import FastAPI
from app.controllers.chatbot_controller import router as chat_router

app = FastAPI(title="Helpdesk Chatbot API", version="1.0")

# Rotas
app.include_router(chat_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "API do Chatbot RAG está rodando!"}
