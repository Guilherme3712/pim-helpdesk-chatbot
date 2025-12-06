from app.ai.rag.chatbot import ChatbotRAG

bot = ChatbotRAG()  # pega a API key do GROQ_API_KEY
resposta = bot.generate_response("Meu computador não imprime!")
print("Resposta do chatbot:")
print(resposta)
