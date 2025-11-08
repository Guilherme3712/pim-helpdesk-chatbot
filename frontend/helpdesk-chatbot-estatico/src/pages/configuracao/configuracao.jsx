// src/components/Configuracoes.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Toast, ToastContainer, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

// Sidebar item (mesmo estilo do Painel)
const SidebarItem = ({ title, route, isActive }) => (
  <a
    href={route}
    className={`d-block p-2 mb-2 text-decoration-none fw-bold ${isActive ? "text-primary bg-light rounded" : "text-muted"}`}
    style={{ transition: "color 0.15s ease-in-out, background-color 0.15s ease-in-out" }}
  >
    {title}
  </a>
);

export default function Configuracoes() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", variant: "danger" });

  // ler credenciais no mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedToken = localStorage.getItem("token");

    if (!storedUserId) {
      // se não logado, manda para home
      navigate("/home");
      return;
    }

    fetchUserProfile(Number(storedUserId), storedToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUserProfile(userId, token) {
    if (!userId) return;
    setLoadingUser(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/usuarios/${userId}`, { headers });

      if (res.status === 404) {
        setToast({ show: true, message: "Usuário não encontrado.", variant: "danger" });
        setUser({ id_usuario: userId, nome: null, email: localStorage.getItem("userEmail") || null, cargo: null });
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Status ${res.status}`);
      }

      const profile = await res.json();
      setUser({
        id_usuario: profile.id_usuario ?? profile.id,
        nome: profile.nome ?? profile.fullName ?? profile.name ?? null,
        email: profile.email ?? null,
        cargo: profile.cargo ?? profile.role ?? null,
      });
      // opcional: persistir nome
      if (profile.nome) localStorage.setItem("userName", profile.nome);
    } catch (err) {
      console.error("[Configuracoes] Erro ao buscar perfil:", err);
      setToast({ show: true, message: `Erro ao carregar perfil: ${err.message || err}`, variant: "danger" });
      setUser({
        id_usuario: userId,
        nome: localStorage.getItem("userName") || null,
        email: localStorage.getItem("userEmail") || null,
        cargo: null,
      });
    } finally {
      setLoadingUser(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    navigate("/home");
    // reload for clean state
    window.location.reload();
  }

  // Encerrar conta (UI only — ligue ao backend se tiver endpoint)
  async function handleCloseAccount() {
    if (!confirm("Deseja encerrar sua conta? Esta ação é irreversível.")) return;
    // Exemplo: chamar DELETE /usuarios/{id} se existir
    const uid = localStorage.getItem("userId");
    // eslint-disable-next-line no-unused-vars
    const token = localStorage.getItem("token");
    if (!uid) {
      setToast({ show: true, message: "Usuário não identificado.", variant: "danger" });
      return;
    }
    try {
      // Se você tiver endpoint, descomente e ajuste a URL
      /*
      const res = await fetch(`${API_BASE}/usuarios/${uid}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Status ${res.status}`);
      }
      */
      // por enquanto só simula sucesso:
      setToast({ show: true, message: "Conta encerrada (simulação). Saindo...", variant: "success" });
      setTimeout(() => {
        handleLogout();
      }, 1100);
    } catch (err) {
      console.error("Erro encerrar conta:", err);
      setToast({ show: true, message: `Erro ao encerrar conta: ${err.message || err}`, variant: "danger" });
    }
  }

  return (
  <div className="container-fluid" style={{ minHeight: "100vh", backgroundColor: "#f4f7fa" }}>
    <div className="row g-0 min-vh-100">
      {/* Sidebar (desktop only) */}
      <aside className="col-md-3 col-xl-2 d-none d-md-flex flex-column p-4 border-end bg-white"
             style={{ boxShadow: "2px 0 5px rgba(0,0,0,.02)" }}>
        <div className="d-flex align-items-center mb-4">
          <span className="me-2" style={{ fontSize: "1.5rem", color: "#3f67f5" }}>
            <i className="bi bi-person-circle"></i>
          </span>
          <div>
            <h5 className="fw-bold mb-0">Suporte AI</h5>
            <small className="text-muted">{user?.nome ?? localStorage.getItem("userName") ?? "Usuário"}</small>
          </div>
        </div>

        <nav className="flex-column">
          <SidebarItem title="Home" route="/home" isActive={false} />
          <SidebarItem title="Painel" route="/painel" isActive={false} />
          <SidebarItem title="Configurações" route="/configuracoes" isActive={true} />
          <hr className="my-3" />
          {/* espaço para outros controles */}
        </nav>
      </aside>

      {/* Main content */}
      <main className="col-12 col-md-9 col-xl-10 p-3 p-md-5">
        {/* Mobile top mini-bar (visible only on small screens) */}
        <div className="d-flex d-md-none justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: "1.4rem", color: "#3f67f5" }}>
              <i className="bi bi-person-circle"></i>
            </span>
            <div>
              <div className="fw-bold" style={{ fontSize: "0.95rem" }}>{user?.nome ?? localStorage.getItem("userName") ?? "Usuário"}</div>
              <small className="text-muted">{user?.email ?? localStorage.getItem("userEmail") ?? ""}</small>
            </div>
          </div>

          <div className="d-flex gap-2">
            <a href="/home" className="btn btn-sm btn-outline-secondary">Home</a>
            <a href="/painel" className="btn btn-sm btn-outline-secondary">Painel</a>
          </div>
        </div>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h4 className="mb-1">Configurações</h4>
            <p className="text-muted mb-0">Informações da conta</p>
          </div>

          <div className="text-end d-none d-md-block">
            <small className="text-muted">Logado como</small>
            <div className="fw-bold">{user?.nome ?? user?.email ?? localStorage.getItem("userEmail") ?? "-"}</div>
          </div>
        </div>

        {/* Grid responsivo: cada card ocupa col-12 em mobile e col-lg-6 em desktop */}
        <div className="row gx-3 align-items-stretch">
          {/* Account info card */}
          <div className="col-12 col-lg-6 d-flex">
            <div
              className="card p-3 mb-4 h-100 flex-grow-1"
              style={{
                borderRadius: ".75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,.03)"
              }}
            >
              <div className="card-body d-flex flex-column">
                <h6 className="fw-bold">Informações da Conta</h6>

                <div className="mb-3">
                  <label className="form-label small text-muted">Nome do usuário</label>
                  <div className="form-control-plaintext">
                    {loadingUser ? "Carregando..." : (user?.nome ?? "-")}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">E-mail</label>
                  <div className="form-control-plaintext">
                    {loadingUser ? "Carregando..." : (user?.email ?? "-")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activities / actions */}
          <div className="col-12 col-lg-6 d-flex">
            <div
              className="card p-3 mb-4 h-100 flex-grow-1"
              style={{
                borderRadius: ".75rem",
                boxShadow: "0 4px 12px rgba(0,0,0,.03)"
              }}
            >
              <div className="card-body d-flex flex-column">
                <div>
                  <h6 className="fw-bold">Atividades Recentes</h6>
                  <p className="text-muted small mb-2">
                    Histórico de interações com o suporte (visualização).
                  </p>
                  <div className="text-muted small">Nenhuma atividade encontrada.</div>
                </div>

                <hr />

                <div className="mt-auto d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => navigate("/painel")}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleCloseAccount}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>  

      </main>
    </div>

    {/* ToastContainer (top-right) */}
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1060 }}>
      <ToastContainer position="top-end" className="p-3">
        <Toast show={toast.show} onClose={() => setToast((t) => ({ ...t, show: false }))} bg={toast.variant === "success" ? "success" : "light"} delay={3500} autohide>
          <Toast.Header>
            <strong className="me-auto">{toast.variant === "success" ? "Sucesso" : "Aviso"}</strong>
          </Toast.Header>
          <Toast.Body className={toast.variant === "success" ? "text-white" : ""}>
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  </div>
);

}
