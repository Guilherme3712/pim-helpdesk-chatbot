Instalar o pip e o python (ambas versões) e outras libs necessárias

pip install fastapi uvicorn

pip install groq

-----------------------------------------------------------------

Para rodar um teste de ex direto 

python -m app.ai.rag.chatbot  

-----------------------------------------------------------------

Atualizar embeddings

Após adicionar ou editar arquivos, recrie os embeddings:

python -m app.ai.rag.retriever

-----------------------------------------------------------------

Para rodar a api

python -m uvicorn app.main:app --reload

-----------------------------------------------------------------