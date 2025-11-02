def detectar_intencao(mensagem: str) -> str:
    """
    Detecta se a mensagem é uma tentativa de encerrar chamado ou abrir novo.
    """
    texto = mensagem.lower()

    # palavras-chave simples, pode evoluir para NLP depois
    if any(p in texto for p in ["fechar chamado", "encerrar chamado", "finalizar chamado", "pode encerrar", "encerrar o meu chamado"]):
        return "fechar_chamado"
    
    return "novo_chamado"
