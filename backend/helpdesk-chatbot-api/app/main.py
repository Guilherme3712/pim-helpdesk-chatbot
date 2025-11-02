# app/main.py
from fastapi import FastAPI
from app.database import Base, engine
from app.controllers.chatbot_controller import router as chat_router
from app.controllers.chamados_controller import router as chamados_router
from app.controllers.usuario_controller import router as usuario_router

# Cria as tabelas automaticamente (apenas para desenvolvimento)
# Em produção, isso deve ser feito via migrations (ex: Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Helpdesk Chatbot API",
    version="1.0",
    description="API do Chatbot técnico com RAG + Groq + Sistema de Chamados",
)

# Rotas principais
app.include_router(chat_router, prefix="/api")         # Rota do chatbot (já existente)
app.include_router(chamados_router, prefix="/api")     # Nova rota de chamados
app.include_router(usuario_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "API do Chatbot RAG está rodando e o módulo de chamados foi integrado!"}
