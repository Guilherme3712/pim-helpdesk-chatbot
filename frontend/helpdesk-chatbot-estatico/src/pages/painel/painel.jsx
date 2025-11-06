// src/components/Painel.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";
const DEFAULT_USER_ID = Number(import.meta.env.VITE_USER_ID || 1);

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

// ------------------------------------------------
// Metric Card
// ------------------------------------------------
const MetricCard = ({ title, value }) => (
  <div className="col-lg-3 col-md-6 mb-4">
    <div
      className="card border-0 p-3 h-100 d-flex flex-column justify-content-center"
      style={{
        borderRadius: "0.75rem",
        boxShadow: "0 4px 12px rgba(0,0,0,.03)",
        backgroundColor: "#fff",
      }}
    >
      <div className="card-body p-2 text-center">
        <p className="text-muted mb-1 small">{title}</p>
        <h4 className="card-title fw-bold text-dark" style={{ fontSize: "1.8rem" }}>
          {value}
        </h4>
      </div>
    </div>
  </div>
);

// ------------------------------------------------
// ChamadoModal (atualizado para usar os campos reais)
// Recebe chamado e historico (array)
const ChamadoModal = ({ show, onClose, chamado, historico, carregandoHistorico }) => {
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
    // fechar modal antes de navegar
    onClose();
    // navegar para chat com query param -> Chatbot irá ler ?chamado={id}
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

        <hr />

        <h6>Histórico de Interações</h6>
        {carregandoHistorico ? (
          <div className="text-center text-muted">Carregando histórico...</div>
        ) : (
          <>
            {historico && historico.length > 0 ? (
              <ul className="list-group">
                {historico.map((inter) => (
                  <li key={inter.id_interacao} className="list-group-item">
                    <strong className="text-capitalize">{inter.remetente}:</strong> {inter.mensagem} <br />
                    <small className="text-muted">{inter.data_hora}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted">Nenhuma interação registrada.</div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Fechar</Button>
        <Button variant="primary" onClick={abrirChat}>
          Abrir chat deste chamado
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ------------------------------------------------
// Componente Principal
// ------------------------------------------------
export default function Painel() {
  const navigate = useNavigate();

  const [modalShow, setModalShow] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const [chamados, setChamados] = useState([]);
  const [metricAbertos, setMetricAbertos] = useState(0);
  const [metricAndamento, setMetricAndamento] = useState(0);
  const [metricResolvidos, setMetricResolvidos] = useState(0);

  const userId = DEFAULT_USER_ID;

  useEffect(() => {
    carregarChamados();
  }, []);

  async function carregarChamados() {
    try {
      const res = await fetch(`${API_BASE}/chamados/usuario/${userId}`);
      if (res.status === 404) {
        setChamados([]);
        setMetricAbertos(0);
        setMetricAndamento(0);
        setMetricResolvidos(0);
        return;
      }
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data = await res.json();
      setChamados(data);

      // calcular métricas
      const abertos = data.filter((c) => c.status && c.status.toLowerCase() === "aberto").length;
      const andando = data.filter((c) => c.status && c.status.toLowerCase() === "em_andamento").length;
      const resolvidos = data.filter((c) => c.status && c.status.toLowerCase() === "fechado").length;

      setMetricAbertos(abertos);
      setMetricAndamento(andando);
      setMetricResolvidos(resolvidos);
    } catch (err) {
      console.error("Erro carregar chamados:", err);
      // fallback: lista vazia
      setChamados([]);
    }
  }

  async function abrirModal(chamado) {
    setChamadoSelecionado(chamado);
    setModalShow(true);
    setHistorico([]);
    setCarregandoHistorico(true);

    try {
      // endpoint historico: /api/historico/{id_usuario}/{id_chamado}
      const res = await fetch(`${API_BASE}/historico/${userId}/${chamado.id_chamado}`);
      if (!res.ok) {
        const txt = await res.text();
        console.warn("Erro historico:", res.status, txt);
        setHistorico([]);
      } else {
        const data = await res.json();
        setHistorico(data.historico || []);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      setHistorico([]);
    } finally {
      setCarregandoHistorico(false);
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

  return (
    <div className="d-flex" style={{ minHeight: "100vh", backgroundColor: "#f4f7fa" }}>
      {/* Sidebar */}
      <div className="d-flex flex-column p-4 border-end" style={{ width: "250px", backgroundColor: "#fff", boxShadow: "2px 0 5px rgba(0,0,0,.02)" }}>
        <div className="d-flex align-items-center mb-5">
          <span className="me-2" style={{ fontSize: "1.5rem", color: "#3f67f5" }}>
            <i className="bi bi-person-circle"></i>
          </span>
          <h5 className="fw-bold mb-0">Suporte AI</h5>
        </div>
        <nav className="flex-column">
          <SidebarItem title="Home" route="/home" isActive={false} />
          <SidebarItem title="Painel" route="/painel" isActive={true} />
          <SidebarItem title="Configurações" route="/configuracoes" isActive={false} />
          <hr className="my-3" />
          <SidebarItem title="Sair" route="/logout" isActive={false} />
        </nav>
      </div>

      {/* Conteúdo */}
      <div className="flex-grow-1 p-5">
        <div className="text-end mb-4">
          <i className="bi bi-person-circle text-primary" style={{ fontSize: "2rem", cursor: "pointer" }}></i>
        </div>

        <div className="row">
          <MetricCard title="Chamados Abertos" value={metricAbertos} />
          <MetricCard title="Chamados em Andamento" value={metricAndamento} />
          <MetricCard title="Chamados Resolvidos" value={metricResolvidos} />
          <MetricCard title="Tempo médio de atendimento" value="2h30m" />
        </div>

        <div className="card mt-4 border-0 p-4" style={{ borderRadius: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,.03)" }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Chamados Recentes</h5>
              <Button
                size="sm"
                className="btn-primary"
                onClick={() => {
                  // novo chamado: navega para chat sem id (backend criará novo)
                  navigate("/chatbot");
                }}
              >
                Novo Chamado
              </Button>
            </div>

            <div className="table-responsive">
              <table className="table table-borderless">
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
                        <td>{chamado.titulo}</td>
                        <td>
                          <span className={`fw-bold ${chamado.status === "aberto" ? "text-success" : (chamado.status === "em_andamento" ? "text-warning" : "text-muted")}`}>
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
        </div>
      </div>

      {/* ChamadoModal existente */}
      <ChamadoModal
        show={modalShow}
        onClose={() => setModalShow(false)}
        chamado={chamadoSelecionado}
        historico={historico}
        carregandoHistorico={carregandoHistorico}
      />
    </div>
  );
}
