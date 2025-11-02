import { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "ia", text: "Olá! 👋 Descreva seu problema para que eu possa ajudar." },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("Aberto"); // Status do chamado
  const chatEndRef = useRef(null);

  const statusColors = {
    Aberto: "bg-success",
    "Em andamento": "bg-warning text-dark",
    Resolvido: "bg-secondary text-white",
  };

  // Rola para o final ao adicionar nova mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: "usuario", text: input }]);
    setInput("");

    // Simulação de resposta do chatbot
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "ia", text: "Estou analisando sua solicitação..." },
      ]);

      // Se o status estiver aberto, muda para "Em andamento"
      if (status === "Aberto") setStatus("Em andamento");
    }, 800);
  };

  const handleCloseTicket = () => {
    setStatus("Resolvido");
    alert("Chamado encerrado!");
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "100vh", backgroundColor: "#e9ecef" }}
    >
      <div
        className="card shadow-sm w-100"
        style={{
          maxWidth: "600px",
          borderRadius: "15px",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Cabeçalho com status */}
        <div
          className={`card-header d-flex justify-content-between align-items-center ${statusColors[status]}`}
        >
          <div>
            <h5 className="mb-0">💬 Suporte Técnico IA</h5>
            <small>Status: {status}</small>
          </div>
          <button
            className="btn btn-light btn-sm text-danger fw-bold"
            onClick={handleCloseTicket}
          >
            Encerrar Chamado
          </button>
        </div>

        {/* Corpo do chat */}
        <div
          className="card-body flex-grow-1"
          style={{
            overflowY: "auto",
            backgroundColor: "#f1f3f5",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex mb-3 ${
                msg.sender === "usuario" ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className={`p-3 rounded shadow-sm`}
                style={{
                  maxWidth: "75%",
                  backgroundColor:
                    msg.sender === "usuario"
                      ? "#0d6efd"
                      : "#ffffff",
                  color: msg.sender === "usuario" ? "white" : "black",
                  border: msg.sender === "ia" ? "1px solid #dee2e6" : "none",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Campo de entrada */}
        <div className="card-footer bg-white d-flex">
          <input
            type="text"
            className="form-control me-2 rounded"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={status === "Resolvido"} // bloqueia input se resolvido
          />
          <button
            className="btn btn-primary rounded"
            onClick={handleSend}
            disabled={status === "Resolvido"}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
