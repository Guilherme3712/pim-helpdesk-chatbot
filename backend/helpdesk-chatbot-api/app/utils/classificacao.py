def classificar_problema(texto: str):
    texto_lower = texto.lower()

    if any(p in texto_lower for p in ["wifi", "rede", "internet"]):
        return "rede", "média"
    elif any(p in texto_lower for p in ["computador", "monitor", "energia", "liga"]):
        return "hardware", "alta"
    elif any(p in texto_lower for p in ["sistema", "erro", "software", "bug"]):
        return "software", "média"
    else:
        return "outros", "baixa"
