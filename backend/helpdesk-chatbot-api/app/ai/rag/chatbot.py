# app/ai/rag/chatbot.py
import os
import requests
from typing import List
from .retriever import Retriever
from .knowledge_loader import KnowledgeLoader

class ChatbotRAG:
    """
    Chatbot baseado em RAG (Retriever-Augmented Generation)
    Integra base de conhecimento local + API Groq.
    """
    def __init__(self, api_key: str = None, knowledge_path: str = "knowledge_base"):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("[ChatbotRAG] A chave de API da Groq não foi definida.")

        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

        # 1️⃣ Carrega documentos da knowledge base
        loader = KnowledgeLoader(knowledge_path)
        docs = loader.load_documents()
        self.retriever = Retriever()
        for doc in docs:
            self.retriever.add_document(doc["content"], save=False)

        print(f"[ChatbotRAG] {len(self.retriever.documents)} documentos carregados na knowledge base.")

        # Histórico de chat
        self.history: List[dict] = []

    def generate_response(self, user_input: str, top_k_docs: int = 3) -> str:
        # 2️⃣ Busca contexto relevante
        context = self.retriever.search(user_input, top_k=top_k_docs)

        # 3️⃣ Monta prompt
        prompt = (
            f"Você é um assistente técnico. Use apenas as informações do contexto abaixo.\n\n"
            f"Contexto:\n{context}\n\n"
            f"Pergunta: {user_input}\nResposta:"
        )

        payload = {
            "model": "groq/compound-mini",  # usar o modelo correto
            "messages": [
                {"role": "system", "content": "Você é um assistente técnico especializado."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 300,
            "temperature": 0.3
        }


        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            answer = data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            answer = f"[ChatbotRAG] Erro ao gerar resposta: {e}"

        # 4️⃣ Atualiza histórico
        self.history.append({"user": user_input, "assistant": answer})

        return answer
