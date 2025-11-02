from app.repositories.chamados_repository import criar_chamado, fechar_chamado_aberto
from app.repositories.interacoes_repository import salvar_interacao
from app.utils.classificacao import classificar_problema
from app.utils.detectar_intencao import detectar_intencao
from app.models.interacoes_model import RemetenteEnum
from app.ai.rag.chatbot import ChatbotRAG
from app.repositories.interacoes_repository import listar_interacoes_por_chamado

# Criar instância global do chatbot
chatbot = ChatbotRAG()

def processar_interacao(db, request):
    """
    Processa a mensagem do usuário, detecta intenção, conversa com a IA e interage com chamados.
    request: {
        id_usuario: int,
        mensagem: str,
        id_chamado: Optional[int]  # se None, cria um novo chamado
    }
    """
    user_message = request.mensagem.strip()
    if not user_message:
        raise ValueError("Mensagem não pode ser vazia.")

    intencao = detectar_intencao(user_message)

    # 1️⃣ Fechar chamado
    if intencao == "fechar_chamado":
        chamado_fechado = fechar_chamado_aberto(db, request.id_usuario)
        if chamado_fechado:
            salvar_interacao(
                db, request.id_usuario, chamado_fechado["id_chamado"], RemetenteEnum.usuario, user_message
            )
            salvar_interacao(
                db, request.id_usuario, chamado_fechado["id_chamado"], RemetenteEnum.ia, "✅ Chamado encerrado."
            )
            return {
                "mensagem_ia": f"✅ O chamado #{chamado_fechado['id_chamado']} foi encerrado com sucesso.",
                "chamado": chamado_fechado
            }
        else:
            return {
                "mensagem_ia": "⚠️ Não há nenhum chamado aberto para encerrar.",
                "chamado": None
            }

    # 2️⃣ Criar novo chamado se não houver id_chamado
    if not getattr(request, "id_chamado", None):
        categoria, prioridade = classificar_problema(user_message)
        chamado = criar_chamado(
            db,
            id_usuario=request.id_usuario,
            titulo=user_message[:100],
            descricao=user_message,
            categoria=categoria,
            prioridade=prioridade,
            classificado_por_ia=True
        )
        id_chamado = chamado["id_chamado"]
    else:
        id_chamado = request.id_chamado
        chamado = {"id_chamado": id_chamado}  # apenas referência

    # 3️⃣ Gerar resposta IA usando a instância global do Chatbot
    resposta_ia = chatbot.generate_response(user_message)

    # 4️⃣ Salvar interações (com id_usuario incluído)
    salvar_interacao(db, request.id_usuario, id_chamado, RemetenteEnum.usuario, user_message)
    salvar_interacao(db, request.id_usuario, id_chamado, RemetenteEnum.ia, resposta_ia)

    return {
        "mensagem_ia": resposta_ia,
        "chamado": chamado
    }

def obter_historico_chamado(db, id_usuario: int, id_chamado: int):
    interacoes = listar_interacoes_por_chamado(db, id_usuario, id_chamado)
    if interacoes is None:
        return {
            "erro": True,
            "mensagem": "Chamado não encontrado ou não pertence ao usuário."
        }

    historico = [
        {
            "id_interacao": i.id_interacao,
            "remetente": i.remetente.value,
            "mensagem": i.mensagem,
            "data_hora": i.data_hora.strftime("%Y-%m-%d %H:%M:%S")
        }
        for i in interacoes
    ]

    return {
        "erro": False,
        "id_chamado": id_chamado,
        "historico": historico
    }