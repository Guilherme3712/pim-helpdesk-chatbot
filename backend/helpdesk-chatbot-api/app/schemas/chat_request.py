from pydantic import BaseModel

class ChatRequest(BaseModel):
    id_usuario: int
    mensagem: str
