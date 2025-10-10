# app/ai/rag/knowledge_loader.py
import os
from typing import List, Dict

class KnowledgeLoader:
    """
    Classe responsável por carregar documentos da pasta knowledge_base
    e retornar como lista de dicionários {"name": str, "content": str}.
    """

    def __init__(self, base_path: str = "knowledge_base"):
        # Caminho absoluto da pasta knowledge_base
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.base_path = os.path.join(script_dir, base_path)

        if not os.path.exists(self.base_path):
            raise FileNotFoundError(f"[KnowledgeLoader] Diretório não encontrado: {self.base_path}")

    def load_documents(self, extensions: List[str] = None) -> List[Dict[str, str]]:
        """
        Carrega todos os arquivos com as extensões especificadas (padrão: .txt)
        e retorna uma lista de dicionários com nome e conteúdo.
        """
        extensions = extensions or [".txt"]
        documents: List[Dict[str, str]] = []

        for filename in os.listdir(self.base_path):
            if any(filename.lower().endswith(ext) for ext in extensions):
                file_path = os.path.join(self.base_path, filename)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                        documents.append({"name": filename, "content": content})
                except Exception as e:
                    print(f"[KnowledgeLoader] Erro ao ler '{filename}': {e}")

        print(f"[KnowledgeLoader] {len(documents)} documentos carregados da pasta '{self.base_path}'")
        return documents
