from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.chatbot_service import processar_interacao, obter_historico_chamado

router = APIRouter(tags=["ChatBot"])

# 🔹 Request model
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


# from fastapi import APIRouter, HTTPException, Depends
# from pydantic import BaseModel
# from sqlalchemy.orm import Session
# from app.database import get_db
# from app.ai.rag.chatbot import ChatbotRAG
# from app.repositories.chamados_repository import criar_chamado, fechar_chamado_aberto
# from app.utils.classificacao import classificar_problema
# from app.utils.detectar_intencao import detectar_intencao
# import os

# router = APIRouter(tags=["ChatBot"])

# # 🔹 Inicializa o chatbot apenas uma vez
# api_key = os.getenv("GROQ_API_KEY")
# if not api_key:
#     raise ValueError("[chat_routes] GROQ_API_KEY não definida no ambiente.")

# chatbot = ChatbotRAG(api_key=api_key)

# # 🔹 Request model
# class ChatRequest(BaseModel):
#     id_usuario: int
#     message: str

# # 🔹 Endpoint principal do chatbot
# @router.post("/chat")
# def chat(request: ChatRequest, db: Session = Depends(get_db)):
#     """
#     Endpoint de interação com o chatbot.
#     - Cria chamado automaticamente ao descrever problema.
#     - Fecha chamado quando solicitado pelo usuário.
#     """
#     try:
#         user_message = request.message.strip()
#         if not user_message:
#             raise HTTPException(status_code=400, detail="A mensagem não pode ser vazia.")

#         # Detecta intenção do usuário
#         intencao = detectar_intencao(user_message)

#         # 🟢 Se for intenção de FECHAR chamado
#         if intencao == "fechar_chamado":
#             chamado_fechado = fechar_chamado_aberto(db, request.id_usuario)
#             if chamado_fechado:
#                 return {
#                     "response": f"✅ O chamado #{chamado_fechado['id_chamado']} foi encerrado com sucesso.",
#                     "chamado": chamado_fechado
#                 }
#             else:
#                 return {
#                     "response": "⚠️ Você não possui nenhum chamado aberto no momento.",
#                     "chamado": None
#                 }

#         # 🔵 Caso contrário, é uma nova dúvida → criar chamado
#         resposta_ia = chatbot.generate_response(user_message)
#         categoria, prioridade = classificar_problema(user_message)

#         chamado = criar_chamado(
#             db,
#             id_usuario=request.id_usuario,
#             titulo=user_message[:100],
#             descricao=user_message,
#             categoria=categoria,
#             prioridade=prioridade,
#             classificado_por_ia=True
#         )

#         return {
#             "response": resposta_ia,
#             "chamado": chamado
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erro no chatbot: {e}")
