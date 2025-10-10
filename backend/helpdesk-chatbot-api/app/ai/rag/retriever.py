import os
import numpy as np
from typing import List
from sentence_transformers import SentenceTransformer, util

class Retriever:
    def __init__(self, knowledge_path: str = "knowledge_base", collection_name: str = "local_docs"):
        self.knowledge_path = knowledge_path
        self.collection_name = collection_name

        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

        self.documents: List[str] = []
        self.doc_embeddings: List[np.ndarray] = []

        # Arquivos de cache
        self.docs_file = os.path.join(self.knowledge_path, "documents.npy")
        self.emb_file = os.path.join(self.knowledge_path, "doc_embeddings.npy")

        self._load_documents()

    def _load_documents(self):
        """Carrega documentos e embeddings da pasta, ou gera se não existirem."""
        os.makedirs(self.knowledge_path, exist_ok=True)

        # Carregar cache se existir
        if os.path.exists(self.docs_file) and os.path.exists(self.emb_file):
            try:
                self.documents = list(np.load(self.docs_file, allow_pickle=True))
                emb_np = np.load(self.emb_file, allow_pickle=True)
                self.doc_embeddings = [np.array(e) for e in emb_np]
                return
            except Exception as e:
                print(f"[Retriever] Falha ao carregar cache: {e}. Regenerando embeddings...")

        # Gerar embeddings de arquivos txt
        txt_files = [f for f in os.listdir(self.knowledge_path) if f.endswith(".txt")]
        for filename in txt_files:
            path = os.path.join(self.knowledge_path, filename)
            with open(path, "r", encoding="utf-8") as f:
                text = f.read().strip()
                self.documents.append(text)
                embedding = self.embedding_model.encode(text, convert_to_tensor=False)
                self.doc_embeddings.append(embedding)

        # Salvar cache
        self._save_cache()

    def _save_cache(self):
        """Salva documentos e embeddings em cache para acelerar carregamentos futuros."""
        np.save(self.docs_file, np.array(self.documents, dtype=object), allow_pickle=True)
        np.save(self.emb_file, np.array(self.doc_embeddings, dtype=object), allow_pickle=True)

    def add_document(self, text: str, save: bool = True):
        """Adiciona um documento novo dinamicamente."""
        self.documents.append(text)
        embedding = self.embedding_model.encode(text, convert_to_tensor=False)
        self.doc_embeddings.append(embedding)
        if save:
            self._save_cache()

    def retrieve(self, query: str, top_k: int = 3) -> List[str]:
        """Retorna os top_k documentos mais relevantes para a query."""
        if not self.documents:
            return []

        query_embedding = self.embedding_model.encode(query, convert_to_tensor=False)
        # Vetorizado usando util.cos_sim do sentence-transformers
        doc_emb_matrix = np.stack(self.doc_embeddings)
        scores = util.cos_sim(query_embedding, doc_emb_matrix)[0].cpu().numpy()
        top_idx = scores.argsort()[::-1][:min(top_k, len(scores))]
        return [self.documents[i] for i in top_idx]

    def search(self, query: str, top_k: int = 3) -> str:
        """Retorna os top_k documentos mais relevantes concatenados em string."""
        docs = self.retrieve(query, top_k)
        return "\n".join(docs)
