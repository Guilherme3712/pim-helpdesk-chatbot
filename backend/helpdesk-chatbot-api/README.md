Instalar o pip e o python (ambas versões) e outras libs necessárias

pip install fastapi uvicorn

pip install groq

pip install sentence_transformers

pip install numpy

pip install requests

pip install sqlalchemy

pip install pymysql

pip install 'pydantic[email]'

pip install passlib

pip install jwt

pip install bcrypt

-----------------------------------------------------------------

Para rodar um teste de ex direto 

python -m app.ai.rag.chatbot  

-----------------------------------------------------------------

Atualizar embeddings

Após adicionar ou editar arquivos, recrie os embeddings:

python -m app.ai.rag.retriever

-----------------------------------------------------------------

Setar variável de ambiente com o token (por enquanto tem que fazer isso sempre que iniciar a API)

$env:GROQ_API_KEY="MEU_TOKEN"

Rode um echo para verificar se a chave foi setada

echo $env:GROQ_API_KEY

-----------------------------------------------------------------


Para rodar a api

python -m uvicorn app.main:app --reload

-----------------------------------------------------------------