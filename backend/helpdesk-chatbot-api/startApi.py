import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",   # permite acesso de outros dispositivos na rede
        port=8000,
        reload=True       # recarrega automaticamente ao salvar
    )
