// src/components/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
const DEFAULT_USER_ID = Number(import.meta.env.VITE_USER_ID || 1);

export default function Chatbot({ initialUserId = null }) {
  const [searchParams] = useSearchParams();
  const chamadoQuery = searchParams.get("chamado");

  // Resolve userId: prop -> localStorage -> fallback
  const resolvedUserId = (() => {
    if (initialUserId) return initialUserId;
    const stored = localStorage.getItem("userId");
    if (stored && !Number.isNaN(Number(stored))) return Number(stored);
    return DEFAULT_USER_ID;
  })();

  const [messages, setMessages] = useState([
    { sender: "ia", text: "Olá! 👋 Descreva seu problema para que eu possa ajudar." },
  ]);
  const [input, setInput] = useState("");
  const [chamadoId, setChamadoId] = useState(chamadoQuery ? Number(chamadoQuery) : null);
  const [statusChamado, setStatusChamado] = useState(chamadoQuery ? "Carregando..." : "Nenhum chamado");
  const [loading, setLoading] = useState(false);
  const userId = resolvedUserId;
  const scrollRef = useRef(null);

  // helper: mapeia status do backend pra rótulo amigável
  const mapStatusLabel = (s) => {
    if (!s) return "Nenhum chamado";
    if (typeof s !== "string") return String(s);
    const val = s.toLowerCase();
    if (val === "aberto") return "Em aberto";
    if (val === "em_andamento" || val === "em-andamento") return "Em andamento";
    if (val === "fechado") return "Fechado";
    return val;
  };

  // auto-scroll quando mensagens alteram
  useEffect(() => {
    if (scrollRef.current) {
      // slight delay to allow DOM update
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 30);
    }
  }, [messages]);

  // carregar histórico se veio com ?chamado=123
  useEffect(() => {
    if (chamadoId) {
      carregarHistorico(chamadoId);
    } else {
      // se não tem chamado e veio query em branco, garante estado inicial
      setStatusChamado("Nenhum chamado");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamadoId]);

  // busca histórico e verifica status atual do chamado
  async function carregarHistorico(idChamado) {
    setLoading(true);
    try {
      // 1) histórico
      const resHist = await fetch(`${API_BASE}/historico/${userId}/${idChamado}`);
      if (!resHist.ok) throw new Error(`Erro ao carregar histórico (${resHist.status})`);
      const dataHist = await resHist.json();
      const historicoMsgs = (dataHist.historico || []).map((h) => ({
        sender: h.remetente === "usuario" ? "usuario" : "ia",
        text: h.mensagem,
      }));

      // 2) pega status do próprio chamado (buscando a lista do usuário)
      let statusLabel = "Em aberto";
      try {
        // só consulta se userId for válido
        if (userId) {
          const resChamados = await fetch(`${API_BASE}/chamados/usuario/${userId}`);
          if (resChamados.ok) {
            const dataChamados = await resChamados.json();
            const found = dataChamados.find((c) => c.id_chamado === idChamado);
            if (found) {
              statusLabel = mapStatusLabel(found.status);
              // garante id coerente vindo do servidor
              setChamadoId(found.id_chamado);
            } else {
              // não pertence ao usuário ou foi removido
              statusLabel = "Nenhum chamado";
            }
          } else {
            console.warn("Falha ao buscar chamados do usuário (verificação de status).");
          }
        }
      } catch (errCham) {
        console.warn("Erro ao verificar status do chamado:", errCham);
      }

      // aplica histórico e status
      setMessages(historicoMsgs.length ? historicoMsgs : [{ sender: "ia", text: "Iniciando atendimento..." }]);
      setStatusChamado(statusLabel);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setMessages((m) => [...m, { sender: "ia", text: `Erro ao carregar histórico: ${err.message}` }]);
      setStatusChamado("Nenhum chamado");
    } finally {
      setLoading(false);
    }
  }

  // envia mensagem (cria chamado se não existir ainda)
  async function handleSend() {
    const text = input.trim();
    if (!text) return;

    if (statusChamado === "Fechado") {
      setMessages((m) => [...m, { sender: "ia", text: "⚠️ Este chamado está encerrado. Abra um novo chamado para continuar." }]);
      return;
    }

    // adiciona UX imediato
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

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt}`);
      }

      const data = await res.json();

      // se backend criou/retornou o chamado, atualiza id e status
      if (data.chamado && data.chamado.id_chamado) {
        setChamadoId(data.chamado.id_chamado);
        setStatusChamado(mapStatusLabel(data.chamado.status ?? "aberto"));
      }

      // append resposta IA
      const resposta = data.mensagem_ia || "Resposta vazia do servidor.";
      setMessages((m) => [...m, { sender: "ia", text: resposta }]);
    } catch (err) {
      console.error("Erro no send:", err);
      setMessages((m) => [...m, { sender: "ia", text: `Erro ao enviar/receber: ${err.message || err}` }]);
    } finally {
      setLoading(false);
    }
  }

  // fechar chamado via botão (manual)
  async function handleCloseTicket() {
    if (!chamadoId) return alert("Nenhum chamado aberto para encerrar.");
    if (!confirm("Deseja realmente encerrar este chamado?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chamados/${chamadoId}/fechar/usuario/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt}`);
      }

      const data = await res.json();
      setStatusChamado("Fechado");
      setMessages((m) => [...m, { sender: "ia", text: data.mensagem || "Chamado encerrado com sucesso." }]);
    } catch (err) {
      console.error("Erro fechar chamado:", err);
      setMessages((m) => [...m, { sender: "ia", text: `Erro ao encerrar: ${err.message || err}` }]);
    } finally {
      setLoading(false);
    }
  }

  const isClosed = statusChamado === "Fechado";
  const headerBgClass = isClosed ? "bg-secondary" : "bg-primary";

 return (
  <div
    className="d-flex justify-content-center align-items-center px-3"
    style={{ minHeight: "100vh", backgroundColor: "#f4f7fa" }}
  >
    <div
      className="card shadow border-0 w-100"
      style={{ maxWidth: "760px", borderRadius: "12px" }}
    >
      {/* Header */}
      <div
        className={`${headerBgClass} text-white card-header d-flex flex-wrap justify-content-between align-items-center`}
      >
        <div className="mb-2 mb-md-0">
          <h5 className="mb-0">💬 Chatbot de Suporte</h5>
          <small style={{ opacity: 0.9 }}>
            Status: <strong>{statusChamado}</strong>
            {chamadoId ? (
              <span className="ms-2"># {chamadoId}</span>
            ) : (
              !chamadoId &&
              statusChamado !== "Fechado" && (
                <span className="ms-2 text-warning">
                  (novo chamado será criado ao enviar)
                </span>
              )
            )}
          </small>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-voltar">Voltar para o painel</Tooltip>}
          >
            <Link
              to="/painel"
              className="btn btn-light btn-sm text-primary fw-bold"
              aria-label="Voltar ao painel"
            >
              <i className="bi bi-arrow-left-circle me-1"></i> Voltar
            </Link>
          </OverlayTrigger>

          {!isClosed && (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="tooltip-encerrar">
                  {!chamadoId
                    ? "Nenhum chamado para encerrar"
                    : "Encerrar este chamado"}
                </Tooltip>
              }
            >
              <span>
                <button
                  className="btn btn-light btn-sm text-danger fw-bold"
                  onClick={handleCloseTicket}
                  disabled={!chamadoId || loading}
                  aria-label="Encerrar chamado"
                >
                  <i className="bi bi-x-circle me-1"></i> Encerrar
                </button>
              </span>
            </OverlayTrigger>
          )}
        </div>
      </div>

      {/* Corpo do chat */}
      <div
        className="card-body"
        ref={scrollRef}
        style={{
          height: "65vh",
          overflowY: "auto",
          backgroundColor: "#f8f9fa",
          padding: "1.25rem",
        }}
        aria-live="polite"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`d-flex mb-3 ${
              msg.sender === "usuario"
                ? "justify-content-end"
                : "justify-content-start"
            }`}
          >
            <div
              className={`p-2 rounded-3 ${
                msg.sender === "usuario"
                  ? "bg-primary text-white"
                  : "bg-white border"
              }`}
              style={{
                maxWidth: "80%",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-center text-muted small">Processando...</div>
        )}
      </div>

      {/* Rodapé do chat */}
      <div className="card-footer bg-white d-flex flex-column flex-md-row gap-2 p-3 border-top">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip-input">
              Digite sua mensagem e pressione Enter
            </Tooltip>
          }
        >
          <input
            type="text"
            className="form-control flex-fill"
            placeholder={
              isClosed
                ? "Chamado encerrado — volte para o painel."
                : "Digite sua mensagem..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isClosed || loading}
            aria-label="Mensagem"
          />
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip-enviar">
              Enviar mensagem (ou pressione Enter)
            </Tooltip>
          }
        >
          <span>
            <button
              className="btn btn-primary w-100 w-md-auto"
              onClick={handleSend}
              disabled={isClosed || loading}
              aria-label="Enviar mensagem"
            >
              Enviar
            </button>
          </span>
        </OverlayTrigger>
      </div>
    </div>
  </div>
);

}
