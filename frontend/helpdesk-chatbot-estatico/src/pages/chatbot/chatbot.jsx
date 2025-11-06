import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
const DEFAULT_USER_ID = Number(import.meta.env.VITE_USER_ID || 1);

export default function Chatbot({ initialUserId = DEFAULT_USER_ID }) {
  const [searchParams] = useSearchParams();
  const chamadoQuery = searchParams.get("chamado");

  const [messages, setMessages] = useState([
    { sender: "ia", text: "Olá! 👋 Descreva seu problema para que eu possa ajudar." },
  ]);
  const [input, setInput] = useState("");
  const [chamadoId, setChamadoId] = useState(chamadoQuery ? Number(chamadoQuery) : null);
  const [statusChamado, setStatusChamado] = useState(chamadoQuery ? "Em aberto" : "Nenhum chamado");
  const [loading, setLoading] = useState(false);
  const [userId] = useState(initialUserId);
  const scrollRef = useRef(null);

  // Carrega histórico se veio com ?chamado=123
  useEffect(() => {
    if (chamadoId) {
      carregarHistorico(chamadoId);
    }
  }, [chamadoId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function carregarHistorico(idChamado) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/historico/${userId}/${idChamado}`);
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();

      const historicoMsgs = data.historico.map((h) => ({
        sender: h.remetente === "usuario" ? "usuario" : "ia",
        text: h.mensagem,
      }));

      setMessages(historicoMsgs.length ? historicoMsgs : [{ sender: "ia", text: "Iniciando atendimento..." }]);
      setStatusChamado("Em aberto");
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setMessages((m) => [...m, { sender: "ia", text: `Erro ao carregar histórico: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    setMessages((m) => [...m, { sender: "usuario", text }]);
    setInput("");
    setLoading(true);

    try {
      const payload = { id_usuario: userId, mensagem: text };
      if (chamadoId) payload.id_chamado = chamadoId;

      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data = await res.json();

      if (data.chamado?.id_chamado) {
        setChamadoId(data.chamado.id_chamado);
        setStatusChamado("Em aberto");
      }

      const resposta = data.mensagem_ia || "Resposta vazia do servidor.";
      setMessages((m) => [...m, { sender: "ia", text: resposta }]);
    } catch (err) {
      console.error("Erro no send:", err);
      setMessages((m) => [...m, { sender: "ia", text: `Erro ao enviar: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCloseTicket() {
    if (!chamadoId) return alert("Nenhum chamado aberto para encerrar.");
    if (!confirm("Deseja realmente encerrar este chamado?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chamados/${chamadoId}/fechar/usuario/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const data = await res.json();
      setStatusChamado("Fechado");
      setMessages((m) => [...m, { sender: "ia", text: data.mensagem || "Chamado encerrado com sucesso." }]);
    } catch (err) {
      console.error("Erro fechar chamado:", err);
      setMessages((m) => [...m, { sender: "ia", text: `Erro ao encerrar: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: "#f4f7fa" }}>
      <div className="card shadow border-0" style={{ width: "760px", borderRadius: "12px" }}>
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">💬 Chatbot de Suporte</h5>
            <small style={{ opacity: 0.9 }}>
              Status: <strong>{statusChamado}</strong>
              {chamadoId ? <span className="ms-3"># {chamadoId}</span> : null}
            </small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to="/painel" className="btn btn-light btn-sm text-primary fw-bold">
              <i className="bi bi-arrow-left-circle me-1"></i> Voltar
            </Link>
            <button
              className="btn btn-light btn-sm text-danger fw-bold"
              onClick={handleCloseTicket}
              disabled={!chamadoId || statusChamado === "Fechado" || loading}
            >
              <i className="bi bi-x-circle me-1"></i> Encerrar
            </button>
          </div>
        </div>

        <div
          className="card-body"
          ref={scrollRef}
          style={{
            height: "500px",
            overflowY: "auto",
            backgroundColor: "#f8f9fa",
            padding: "1.25rem",
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`d-flex mb-3 ${
                msg.sender === "usuario" ? "justify-content-end" : "justify-content-start"
              }`}
            >
              <div
                className={`p-2 rounded-3 ${
                  msg.sender === "usuario" ? "bg-primary text-white" : "bg-white border"
                }`}
                style={{
                  maxWidth: "75%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && <div className="text-center text-muted small">Processando...</div>}
        </div>

        <div className="card-footer bg-white d-flex gap-2 p-3 border-top">
          <input
            type="text"
            className="form-control"
            placeholder={
              statusChamado === "Fechado"
                ? "Chamado fechado — abra um novo para continuar."
                : "Digite sua mensagem..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={statusChamado === "Fechado" || loading}
          />
          <button
            className="btn btn-primary px-4"
            onClick={handleSend}
            disabled={statusChamado === "Fechado" || loading}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
