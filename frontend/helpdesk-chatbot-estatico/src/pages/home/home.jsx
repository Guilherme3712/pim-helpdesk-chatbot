// src/components/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const customStyles = {
  header: { backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,.04)" },
  card: { borderRadius: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,.03)", border: "1px solid #e9ecef", minHeight: "200px" },
  btnPrimary: { backgroundColor: "#3f67f5", borderColor: "#3f67f5" },
  footer: { backgroundColor: "#fff", borderTop: "1px solid #e9ecef" },
};

const MetricCard = ({ title, children, onClick }) => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={`card h-100 p-3 ${onClick ? "hoverable" : ""}`}
      style={{
        ...customStyles.card,
        transition: "transform 0.12s, box-shadow 0.12s",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div className="card-body">
        <h5 className="card-title fw-bold text-dark mb-4">{title}</h5>
        {children}
      </div>
    </div>
  </div>
);

function formatDuration(ms) {
  if (!ms || ms <= 0) return "—";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function Home() {
  const navigate = useNavigate();

  // login form inputs
  const [emailInput, setEmailInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // auth state (persistido em localStorage)
  // eslint-disable-next-line no-unused-vars
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [loggedEmail, setLoggedEmail] = useState(null);

  // metrics
  const [totalChamados, setTotalChamados] = useState(0);
  const [resolvidosChamados, setResolvidosChamados] = useState(0);
  const [tempoMedioAtendimento, setTempoMedioAtendimento] = useState("—");
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Toast (alerta não bloqueante)
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVariant, setToastVariant] = useState("danger"); // danger, warning, success, info

  // on mount -> read persisted auth and fetch profile/metrics
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    const mail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");
    if (uid) {
      setUserId(Number(uid));
      setLoggedEmail(mail || null);
      setIsAuthenticated(true);
      // fetch profile to ensure data is current
      fetchUserProfile(Number(uid), token);
      carregarMetrics(Number(uid), token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when userId changes, reload metrics/profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (userId) {
      fetchUserProfile(userId, token);
      carregarMetrics(userId, token);
    } else {
      setTotalChamados(0);
      setResolvidosChamados(0);
      setTempoMedioAtendimento("—");
      setLoggedEmail(null);
      setIsAuthenticated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  function isLogged() {
    return Boolean(localStorage.getItem("userId"));
  }

  // util toast
  function exibirToast(msg, variant = "danger", timeout = 5000) {
    setToastMsg(msg);
    setToastVariant(variant);
    setShowToast(true);
    if (timeout > 0) {
      setTimeout(() => setShowToast(false), timeout);
    }
  }

  // ----- NEW: fetch profile by /usuarios/{id} -----
  async function fetchUserProfile(uid, token = localStorage.getItem("token")) {
    if (!uid) return;
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/usuarios/${uid}`, { headers });
      if (!res.ok) {
        console.warn("Não foi possível carregar perfil:", res.status);
        exibirToast("Não foi possível carregar perfil do usuário.", "warning");
        return;
      }
      const profile = await res.json();
      const email = profile.email || profile.usuario?.email || (profile.id_usuario ? localStorage.getItem("userEmail") : null);
      if (email) {
        localStorage.setItem("userEmail", email);
        setLoggedEmail(email);
      }
      const returnedId = profile.id_usuario || profile.id || null;
      if (returnedId && (!localStorage.getItem("userId") || Number(localStorage.getItem("userId")) !== Number(returnedId))) {
        localStorage.setItem("userId", returnedId);
        setUserId(Number(returnedId));
      }
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Erro fetchUserProfile:", err);
      exibirToast("Erro ao carregar perfil do usuário.", "danger");
    }
  }

  // carregar métricas e calcular tempo médio
  async function carregarMetrics(uidParam, tokenParam = localStorage.getItem("token")) {
    const uid = uidParam ?? Number(localStorage.getItem("userId"));
    const token = tokenParam;
    if (!uid) {
      setTotalChamados(0);
      setResolvidosChamados(0);
      setTempoMedioAtendimento("—");
      return;
    }

    setLoadingMetrics(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/chamados/usuario/${uid}`, { headers });
      if (res.status === 404) {
        setTotalChamados(0);
        setResolvidosChamados(0);
        setTempoMedioAtendimento("—");
        return;
      }
      if (!res.ok) {
        throw new Error(`Erro ${res.status}`);
      }
      const data = await res.json();

      setTotalChamados(data.length);
      const fechados = data.filter((c) => (c.status || "").toLowerCase() === "fechado").length;
      setResolvidosChamados(fechados);

      // calcula tempo médio: prefere tempo_medio_atendimento; se não houver, calcula média de diffs dos fechados
      const tempos = data.map((c) => c.tempo_medio_atendimento).filter(Boolean);
      if (tempos.length > 0) {
        const parsed = tempos
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
        if (parsed.length > 0) {
          const avg = parsed.reduce((a, b) => a + b, 0) / parsed.length;
          setTempoMedioAtendimento(formatDuration(avg));
        } else setTempoMedioAtendimento("—");
      } else {
        // fallback: média diffs em ms entre data_criacao e data_atualizacao dos fechados
        const diffs = data
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
          .filter(Boolean);

        if (diffs.length > 0) {
          const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          setTempoMedioAtendimento(formatDuration(avg));
        } else {
          setTempoMedioAtendimento("—");
        }
      }
    } catch (err) {
      console.error("Erro carregar métricas:", err);
      exibirToast("Erro ao carregar métricas. Tente novamente.", "danger");
      setTotalChamados(0);
      setResolvidosChamados(0);
      setTempoMedioAtendimento("—");
    } finally {
      setLoadingMetrics(false);
    }
  }

  // substituir a implementação existente de handleLogin por esta
  async function handleLogin(e) {
    e?.preventDefault();
    if (!emailInput || !senhaInput) {
      exibirToast("Preencha email e senha.", "warning");
      return;
    }
    setLoadingLogin(true);
    try {
      const res = await fetch(`${API_BASE}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, senha: senhaInput }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }

      const data = await res.json();
      console.log("[login] response:", data);

      // heurística para token + user id
      const token = data.access_token || data.token || data.jwt || null;
      let uid = data.user?.id || data.user?.id_usuario || data.id_usuario || data.id || null;
      if (!uid && data.usuario) uid = data.usuario.id_usuario || data.usuario.id;

      // persist token immediately (so subsequent calls can use it)
      if (token) {
        localStorage.setItem("token", token);
      }

      // If we already have uid from response -> good, persist & load profile/metrics
      if (uid) {
        console.info("[login] userId from response:", uid);
        localStorage.setItem("userId", uid);
        localStorage.setItem("userEmail", emailInput);
        setUserId(Number(uid));
        setLoggedEmail(emailInput);
        await fetchUserProfile(Number(uid), token);
        await carregarMetrics(Number(uid), token);
        setIsAuthenticated(true);
        exibirToast("Login realizado.", "success");
        return;
      }

      // If no uid but we have a token, try decode JWT payload (browser-side)
      if (token) {
        try {
          const parts = token.split(".");
          if (parts.length === 3) {
            const payload = JSON.parse(decodeURIComponent(escape(window.atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))));
            console.log("[login] decoded token payload:", payload);
            const possible = payload.sub || payload.user_id || payload.id_usuario || payload.id || payload.userId || null;
            if (possible) {
              uid = possible;
              console.info("[login] userId extracted from token payload:", uid);
              localStorage.setItem("userId", uid);
              localStorage.setItem("userEmail", emailInput);
              setUserId(Number(uid));
              setLoggedEmail(emailInput);
              await fetchUserProfile(Number(uid), token);
              await carregarMetrics(Number(uid), token);
              setIsAuthenticated(true);
              exibirToast("Login realizado.", "success");
              return;
            }
          } else {
            console.warn("[login] token not JWT-like; cannot decode in browser.");
          }
        } catch (errDecode) {
          console.warn("[login] failed to decode token payload:", errDecode);
        }
      }

      // Fallback: token present but we couldn't retrieve uid — persist token + email and mark authenticated (dev mode)
      if (token) {
        console.warn("[login] token present but userId not found in response nor token payload.");
        localStorage.setItem("userEmail", emailInput);
        setLoggedEmail(emailInput);
        setIsAuthenticated(true);
        exibirToast("Login parcial (token recebido).", "info");
        return;
      }

      // Final fallback: neither token nor uid returned — store email only
      localStorage.setItem("userEmail", emailInput);
      setLoggedEmail(emailInput);
      setIsAuthenticated(true);
      exibirToast("Login efetuado (sem token).", "info");
      console.warn("[login] login succeeded but no token/user id returned by backend.");
    } catch (err) {
      console.error("Erro no login:", err);
      exibirToast("Falha no login: " + (err.message || err), "danger");
      setIsAuthenticated(false);
    } finally {
      setLoadingLogin(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    setUserId(null);
    setLoggedEmail(null);
    setIsAuthenticated(false);
    setTotalChamados(0);
    setResolvidosChamados(0);
    setTempoMedioAtendimento("—");
    exibirToast("Você saiu da conta.", "info");
  }

  function goToPainel() {
    if (!isLogged()) {
      exibirToast("Você precisa fazer login para acessar o painel.", "warning");
      return;
    }
    navigate("/painel");
  }

  function goToChatNovo() {
    if (!isLogged()) {
      exibirToast("Faça login para abrir um novo chamado.", "warning");
      return;
    }
    navigate("/chatbot");
  }

  const total = totalChamados || 1;
  const pctResolvidos = Math.round((resolvidosChamados / total) * 100);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh", backgroundColor: "#f4f7fa" }}>
      <header className="navbar navbar-expand-lg py-3" style={customStyles.header}>
        <div className="container-fluid mx-5 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <a className="navbar-brand fw-bold d-flex align-items-center me-4" href="#">
              <span className="me-2" style={{ fontSize: "1.2rem", color: "#3f67f5" }}>
                <i className="bi bi-headset"></i>
              </span>
              Suporte Técnico IA
            </a>

            {isLogged() && (
              <div className="d-none d-md-flex align-items-center gap-4">
                <div className="small text-muted">Usuário: <strong className="text-dark ms-1">{localStorage.getItem("userEmail")}</strong></div>
                <div className="small text-muted">Total: <strong className="text-dark ms-1">{loadingMetrics ? "..." : totalChamados}</strong></div>
                <div className="small text-muted">Resolvidos: <strong className="text-dark ms-1">{loadingMetrics ? "..." : resolvidosChamados}</strong></div>
              </div>
            )}
          </div>

          {!isLogged() ? (
            <form className="d-flex align-items-center" onSubmit={handleLogin}>
              <input className="form-control form-control-sm me-2" style={{ width: "180px" }} placeholder="Email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} type="email" />
              <input className="form-control form-control-sm me-2" style={{ width: "140px" }} placeholder="Senha" value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)} type="password" />
              <button className="btn btn-primary btn-sm px-3" style={customStyles.btnPrimary} type="submit" disabled={loadingLogin}>
                {loadingLogin ? "Entrando..." : "Login"}
              </button>
            </form>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">Olá, <strong className="text-dark">{localStorage.getItem("userEmail")}</strong></span>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Sair</button>
            </div>
          )}
        </div>
      </header>

      <main className="container mt-5 flex-grow-1" >
        <div className="row mb-5">
          <div className="col-8">
            <h1 className="fw-bold mb-3" style={{ fontSize: "2.5rem" }}>Sistema Integrado de Gestão de Chamados</h1>
            <p className="lead text-muted mb-4">O sistema de gestão de chamados e suporte técnico baseado em recursos.</p>

            <div className="d-flex gap-2">
              {!isLogged() && (
                <Link to="/cadastro" className="btn btn-outline-primary btn-lg px-4 fw-bold" style={{ color: "#3f67f5" }}>
                  Cadastre-se
                </Link>
              )}
              
              {isLogged() && (
              <button className="btn btn-primary btn-lg px-4 fw-bold" style={customStyles.btnPrimary} onClick={goToPainel}>
                Ir para o Painel
              </button>
                     )}
              {isLogged() && (
                <button className="btn btn-outline-secondary btn-lg px-4 fw-bold" onClick={goToChatNovo}>
                  Abrir novo chamado
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <MetricCard title="Chamados (Total)" onClick={goToPainel}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h2 className="fw-bold">{loadingMetrics ? "..." : totalChamados}</h2>
                <small className="text-muted">Quantidade total de chamados</small>
              </div>
              <div style={{ minWidth: 100 }}>
                <div style={{ height: 10, background: "#e9ecef", borderRadius: 8 }}>
                  <div style={{ width: `${Math.min(100, Math.round((totalChamados / Math.max(1, totalChamados)) * 100))}%`, height: "100%", background: "#3f67f5", borderRadius: 8 }} />
                </div>
              </div>
            </div>
          </MetricCard>

          <MetricCard title="Chamados Resolvidos" onClick={goToPainel}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h2 className="fw-bold">{loadingMetrics ? "..." : resolvidosChamados}</h2>
                <small className="text-muted">Quantidade de chamados com status encerrado</small>
              </div>
              <div style={{ minWidth: 100 }}>
                <div style={{ height: 10, background: "#e9ecef", borderRadius: 8 }}>
                  <div style={{ width: `${Math.max(0, pctResolvidos)}%`, height: "100%", background: "#28a745", borderRadius: 8 }} />
                </div>
              </div>
            </div>
          </MetricCard>

          <MetricCard title="Tempo Médio de Atendimento">
            <div className="d-flex justify-content-center align-items-center h-100">
              <h2 className="display-5 fw-bold text-dark">{loadingMetrics ? "..." : tempoMedioAtendimento}</h2>
              <div className="ms-3 text-muted small"> (média histórica)</div>
            </div>
          </MetricCard>
        </div>
      </main>

      <footer className="py-3" style={customStyles.footer}> 
        <div className="container d-flex justify-content-center align-items-center small text-muted">
          <p className="mb-0">©2025 TechSupport IA. Todos os direitos reservados.</p>
          <div className="d-flex">
            <a href="#" className="text-decoration-none text-muted me-3"><i className="bi bi-facebook"></i></a>
            <a href="#" className="text-decoration-none text-muted me-3"><i className="bi bi-twitter"></i></a>
            <a href="#" className="text-decoration-none text-muted"><i className="bi bi-linkedin"></i></a>
          </div>
        </div>
      </footer>

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

