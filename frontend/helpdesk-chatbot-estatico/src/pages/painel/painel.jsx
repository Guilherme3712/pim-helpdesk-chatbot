import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// ------------------------------------------------
// Sidebar Item
// ------------------------------------------------
const SidebarItem = ({ title, route, isActive }) => (
  <a
    href={route}
    className={`d-block p-2 mb-2 text-decoration-none fw-bold ${
      isActive ? "text-primary bg-light rounded" : "text-muted"
    }`}
    style={{
      transition: "color 0.15s ease-in-out, background-color 0.15s ease-in-out",
    }}
  >
    {title}
  </a>
);

// -----------------------------
// Metric Card
// -----------------------------
const MetricCard = ({ title, children, onClick }) => (
  <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 mb-4 ">
    <div
      className={`card h-100 p-3 ${onClick ? "hoverable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={{
        borderRadius: "0.75rem",
        boxShadow: "0 4px 12px rgba(0,0,0,.03)",
        border: "1px solid #e9ecef",
        cursor: onClick ? "pointer" : "default",
        backgroundColor: "#fff",
        transition: "transform 0.16s ease, box-shadow 0.16s ease",
      }}
    >
      <div className="card-body p-2">
        <h6 className="card-title fw-bold text-dark mb-2">{title}</h6>
        {children}
      </div>
    </div>
  </div>
);

// ------------------------------------------------
// ChamadoModal
const ChamadoModal = ({ show, onClose, chamado }) => {
  const navigate = useNavigate();

  if (!chamado) return null;

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  const abrirChat = () => {
    onClose();
    navigate(`/chatbot?chamado=${chamado.id_chamado}`);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes do Chamado #{chamado.id_chamado}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="mb-1">{chamado.titulo}</h5>
        <p className="mb-1"><strong>Status:</strong> {chamado.status}</p>
        <p className="mb-1"><strong>Categoria:</strong> {chamado.categoria ?? "-"}</p>
        <p className="mb-1"><strong>Prioridade:</strong> {chamado.prioridade ?? "-"}</p>
        <p className="mb-1"><strong>Data de abertura:</strong> {formatDate(chamado.data_criacao)}</p>
        <p className="mb-3"><strong>Última atualização:</strong> {formatDate(chamado.data_atualizacao)}</p>

        <hr />
        <h6>Descrição</h6>
        <p>{chamado.descricao ?? "-"}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Fechar</Button>
        <Button variant="primary" onClick={abrirChat}>Abrir chat deste chamado</Button>
      </Modal.Footer>
    </Modal>
  );
};

// Helper para formatar duração (ms -> "Xh Ym" ou "Zmin")
function formatDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// ------------------------------------------------
// Componente Principal
// ------------------------------------------------
export default function Painel() {
  const navigate = useNavigate();

  const [modalShow, setModalShow] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [historico, setHistorico] = useState([]);

  const [chamados, setChamados] = useState([]);
  const [metricTotal, setMetricTotal] = useState(0);
  const [metricAndamento, setMetricAndamento] = useState(0);
  const [metricResolvidos, setMetricResolvidos] = useState(0);
  const [tempoMedioAtendimento, setTempoMedioAtendimento] = useState("—");

  // user profile
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // toast (erro/aviso)
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("danger"); // danger, warning, success, info

  // lê do localStorage no momento do mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");
    if (!storedUserId) {
      navigate("/home");
      return;
    }
    const uid = Number(storedUserId);
    fetchUserProfile(uid, storedToken);
    carregarChamados(uid, storedToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // função util para exibir toast (com timeout automático)
  function exibirToast(msg, variant = "danger", timeout = 5000) {
    setToastMsg(msg);
    setToastVariant(variant);
    setShowToast(true);
    if (timeout > 0) {
      setTimeout(() => setShowToast(false), timeout);
    }
  }

  // Busca perfil do usuário via endpoint /usuarios/{id}
  async function fetchUserProfile(userId, token) {
    if (!userId) return;
    setLoadingUser(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/usuarios/${userId}`, { headers });
      if (!res.ok) {
        console.warn("[Painel] não foi possível obter perfil:", res.status);
        exibirToast("Não foi possível carregar perfil do usuário.", "warning");
        setUser({
          id_usuario: userId,
          email: localStorage.getItem("userEmail") || null,
          nome: localStorage.getItem("userName") || null,
        });
        return;
      }
      const profile = await res.json();
      setUser({
        id_usuario: profile.id_usuario ?? profile.id ?? userId,
        nome: profile.nome ?? profile.fullName ?? profile.name ?? localStorage.getItem("userEmail"),
        email: profile.email ?? localStorage.getItem("userEmail"),
      });
      if (profile.nome) localStorage.setItem("userName", profile.nome);
    } catch (err) {
      console.error("[Painel] erro ao buscar perfil:", err);
      exibirToast("Erro ao buscar perfil do usuário.", "danger");
      setUser({
        id_usuario: userId,
        email: localStorage.getItem("userEmail") || null,
        nome: localStorage.getItem("userName") || null,
      });
    } finally {
      setLoadingUser(false);
    }
  }

  // carregar chamados do usuário e calcular métricas + tempo médio
  async function carregarChamados(userIdParam, tokenParam) {
    const uid = userIdParam ?? Number(localStorage.getItem("userId"));
    const token = tokenParam ?? localStorage.getItem("token");
    if (!uid) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/chamados/usuario/${uid}`, { headers });
      if (res.status === 404) {
        setChamados([]);
        setMetricTotal(0);
        setMetricAndamento(0);
        setMetricResolvidos(0);
        setTempoMedioAtendimento("—");
        return;
      }
      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }
      const data = await res.json();
      setChamados(data);

      // métricas: total (independente do status), andamento e fechados
      const total = data.length;
      const andamento = data.filter((c) => (c.status || "").toLowerCase() === "em_andamento").length;
      const fechados = data.filter((c) => (c.status || "").toLowerCase() === "fechado").length;

      setMetricTotal(total);
      setMetricAndamento(andamento);
      setMetricResolvidos(fechados);

      // calcula tempo médio:
      const temposField = (data.map((c) => c.tempo_medio_atendimento).filter(Boolean)) || [];
      if (temposField.length > 0) {
        const parsedMs = temposField
          .map((t) => {
            try {
              const parts = String(t).split(":").map(Number);
              if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
              if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 60000;
              return Number(t) * 1000;
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        if (parsedMs.length > 0) {
          const avg = parsedMs.reduce((a, b) => a + b, 0) / parsedMs.length;
          setTempoMedioAtendimento(formatDuration(avg));
        } else {
          setTempoMedioAtendimento("—");
        }
      } else {
        const diffs = (data
          .filter((c) => (c.status || "").toLowerCase() === "fechado" && c.data_criacao && c.data_atualizacao)
          .map((c) => {
            try {
              const d1 = new Date(c.data_criacao).getTime();
              const d2 = new Date(c.data_atualizacao).getTime();
              return d2 > d1 ? d2 - d1 : null;
            } catch {
              return null;
            }
          })
          .filter(Boolean)) || [];

        if (diffs.length > 0) {
          const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          setTempoMedioAtendimento(formatDuration(avg));
        } else {
          setTempoMedioAtendimento("—");
        }
      }
    } catch (err) {
      console.error("Erro carregar chamados:", err);
      exibirToast("Não foi possível carregar os chamados. Tente novamente mais tarde.", "danger");
      setChamados([]);
      setMetricTotal(0);
      setMetricAndamento(0);
      setMetricResolvidos(0);
      setTempoMedioAtendimento("—");
    }
  }

  async function abrirModal(chamado) {
    setChamadoSelecionado(chamado);
    setModalShow(true);
    setHistorico([]);

    try {
      const userId = localStorage.getItem("userId");
      const storedToken = localStorage.getItem("token");
      if (!userId) return;
      const res = await fetch(`${API_BASE}/historico/${userId}/${chamado.id_chamado}`, {
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : {},
      });
      if (!res.ok) {
        console.warn("Erro historico:", res.status);
        exibirToast("Não foi possível carregar o histórico do chamado.", "warning");
        setHistorico([]);
      } else {
        const data = await res.json();
        setHistorico(data.historico || []);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      exibirToast("Erro ao buscar histórico do chamado.", "danger");
      setHistorico([]);
    }
  }

  const formatDateShort = (iso) => {
    if (!iso) return "-";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return iso;
    }
  };

  // function handleLogout() {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("userId");
  //   localStorage.removeItem("userEmail");
  //   localStorage.removeItem("userName");
  //   navigate("/home");
  //   window.location.reload();
  // }

  // percentuais simples para barras
  const totalForPct = metricTotal || 1;
  const pctResolvidos = Math.round((metricResolvidos / totalForPct) * 100);
  const pctAndamento = Math.round((metricAndamento / totalForPct) * 100);

  return (
    <div className="container-fluid" style={{ minHeight: "100vh", backgroundColor: "#f4f7fa" }}>
      <div className="row g-0 min-vh-100">
        {/* SIDEBAR -> empilha no mobile (col-12) e fica como coluna no desktop (col-md-3) */}
        <aside className="col-md-3 col-xl-2 d-none d-md-flex flex-column p-4" style={{ backgroundColor: "#fff", boxShadow: "2px 0 5px rgba(0,0,0,.02)" }}>
          <div className="d-flex align-items-center mb-4">
            <span className="me-2" style={{ fontSize: "1.5rem", color: "#3f67f5" }}>
              <i className="bi bi-person-circle"></i>
            </span>
            <div>
              <h5 className="fw-bold mb-0">Suporte AI</h5>
              <small className="text-muted">{user?.nome ?? user?.email ?? (loadingUser ? "Carregando..." : "Usuário")}</small>
            </div>
          </div>

          <nav className="d-flex flex-column">
            <SidebarItem title="Home" route="/home" isActive={false} />
            <SidebarItem title="Painel" route="/painel" isActive={true} />
            <SidebarItem title="Configurações" route="/configuracoes" isActive={false} />
            <hr className="my-3" />
            {/* <button className="btn btn-link text-muted p-0" onClick={handleLogout}>Sair</button> */}
          </nav>
        </aside>

        {/* CONTEÚDO PRINCIPAL -> ocupa o restante (col-md-9) */}
        <main className="col-12 col-md-9 p-3 p-md-5">
          <div className="d-flex justify-content-end mb-4">
            <div className="text-end">
              <div className="small text-muted">Logado como</div>
              <div className="fw-bold">{user?.nome ?? user?.email ?? "-"}</div>
            </div>
          </div>

          {/* Métricas (grid responsivo para 4 cards menores) */}
          <div className="row gx-3">
            <MetricCard title="Chamados (Total)">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="fw-bold mb-0">{metricTotal}</h4>
                  <small className="text-muted">Total de chamados</small>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ height: 10, background: "#e9ecef", borderRadius: 8 }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.round((metricTotal / Math.max(1, metricTotal)) * 100))}%`,
                        height: "100%",
                        background: "#3f67f5",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>
              </div>
            </MetricCard>

            <MetricCard title="Chamados em Andamento">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="fw-bold mb-0">{metricAndamento}</h4>
                  <small className="text-muted">Em andamento</small>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ height: 10, background: "#e9ecef", borderRadius: 8 }}>
                    <div style={{ width: `${pctAndamento}%`, height: "100%", background: "#ffc107", borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            </MetricCard>

            <MetricCard title="Chamados Resolvidos">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h4 className="fw-bold mb-0">{metricResolvidos}</h4>
                  <small className="text-muted">Encerrados</small>
                </div>
                <div style={{ minWidth: 120 }}>
                  <div style={{ height: 10, background: "#e9ecef", borderRadius: 8 }}>
                    <div style={{ width: `${pctResolvidos}%`, height: "100%", background: "#28a745", borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            </MetricCard>

            <MetricCard title="Tempo médio de atendimento">
              <div className="d-flex justify-content-center align-items-center">
                <div>
                  <h4 className="fw-bold mb-0">{tempoMedioAtendimento}</h4>
                  <small className="text-muted">Média histórica</small>
                </div>
              </div>
            </MetricCard>
          </div>

          {/* --- tabela para desktop (md+) --- */}
          <div className="d-none d-md-block">
            <div className="card table-responsive" style={{ borderRadius: ".75rem", boxShadow: "0 4px 12px rgba(0,0,0,.03)" }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Chamados Recentes</h5>
                    <Button
                      size="sm"
                      className="btn-primary me-4 ms-4 px-5"
                      onClick={() => navigate("/chatbot")}
                      style={{ marginLeft: "4rem" }}
                    >
                      Novo Chamado
                    </Button>
                </div>
              </div>
              <table className="table table-borderless mb-0">
                <thead>
                  <tr className="text-muted small">
                    <th>Número</th>
                    <th>Assunto do Chamado</th>
                    <th>Status</th>
                    <th>Data de Abertura</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {chamados.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">Nenhum chamado encontrado.</td>
                    </tr>
                  ) : (
                    chamados.map((chamado) => (
                      <tr key={chamado.id_chamado}>
                        <td className="fw-bold">#{String(chamado.id_chamado).padStart(3, "0")}</td>
                        <td style={{ maxWidth: 320, wordBreak: "break-word" }}>{chamado.titulo}</td>
                        <td>
                          <span className={`fw-bold ${
                            chamado.status === "aberto" ? "text-success" :
                            (chamado.status === "em_andamento" ? "text-warning" : "text-muted")
                          }`}>
                            {chamado.status}
                          </span>
                        </td>
                        <td>{formatDateShort(chamado.data_criacao)}</td>
                        <td>
                          <button
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: "#4263f5", borderColor: "#4263f5" }}
                            onClick={() => abrirModal(chamado)}
                          >
                            Ver detalhes
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- cards empilhados para mobile (sm) --- */}
          <div className="d-block d-md-none">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Chamados Recentes</h5>
                    <Button
                      size="sm"
                      className="btn-primary me-2"
                      onClick={() => navigate("/chatbot")}
                      style={{ marginLeft: "4rem" }}
                    >
                      Novo Chamado
                    </Button>
                </div>
              </div>
            {chamados.length === 0 ? (
              <div className="text-center text-muted py-3">Nenhum chamado encontrado.</div>
            ) : (
              chamados.map((chamado) => (
                <div key={chamado.id_chamado} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="d-flex align-items-baseline gap-2">
                          <div className="fw-bold">#{String(chamado.id_chamado).padStart(3, "0")}</div>
                          <div className="ms-2 text-muted small">{formatDateShort(chamado.data_criacao)}</div>
                        </div>

                        <div className="fw-bold mt-2" style={{ wordBreak: "break-word" }}>{chamado.titulo}</div>

                        <div className="mt-2">
                          <span className={`fw-bold ${
                            chamado.status === "aberto" ? "text-success" :
                            (chamado.status === "em_andamento" ? "text-warning" : "text-muted")
                          }`}>
                            {chamado.status}
                          </span>
                        </div>
                      </div>

                      <div className="ms-3 d-flex align-items-start">
                        <button
                          className="btn btn-sm text-white"
                          style={{ backgroundColor: "#4263f5", borderColor: "#4263f5" }}
                          onClick={() => abrirModal(chamado)}
                        >
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>


        </main>
      </div>

      {/* ChamadoModal */}
      <ChamadoModal show={modalShow} onClose={() => setModalShow(false)} chamado={chamadoSelecionado} />

      {/* Toast container */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1060 }}>
        {showToast && (
          <div className={`toast align-items-center text-bg-${toastVariant} border-0 show`} role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body">
                {toastMsg}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" aria-label="Close" onClick={() => setShowToast(false)}></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
