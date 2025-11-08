// src/components/Cadastro.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export default function Cadastro() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: null, type: null }); // type: 'success' | 'error'

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validar() {
    if (!form.nome.trim()) {
      setMsg({ text: "Preencha o nome completo.", type: "error" });
      return false;
    }
    if (!form.email.trim()) {
      setMsg({ text: "Preencha o email.", type: "error" });
      return false;
    }
    if (!form.senha || form.senha.length < 6) {
      setMsg({ text: "A senha deve ter pelo menos 6 caracteres.", type: "error" });
      return false;
    }
    if (form.senha !== form.confirmarSenha) {
      setMsg({ text: "As senhas não coincidem.", type: "error" });
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg({ text: null, type: null });
    if (!validar()) return;

    setLoading(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
      };

      const res = await fetch(`${API_BASE}/usuarios/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Status ${res.status}`);
      }

      // sucesso
      setMsg({ text: "Cadastro realizado com sucesso! Você será redirecionado.", type: "success" });
      localStorage.setItem("registeredEmail", payload.email);

      setTimeout(() => {
        navigate("/home");
      }, 900);
    } catch (err) {
      console.error("Erro no cadastro:", err);
      const message = err.message || "Erro ao cadastrar. Tente novamente.";
      setMsg({ text: message, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = {
    maxWidth: "560px",
    borderRadius: "1rem",
    boxShadow: "0 6px 24px rgba(12,34,80,0.06)",
    padding: "2.5rem",
    backgroundColor: "#fff",
  };
  
  const inputStyle = { borderRadius: ".6rem", height: "3rem" };

  return (
    <div className="vh-100 d-flex flex-column" style={{ backgroundColor: "#f4f7fa" }}>
      <header className="py-3" style={{ backgroundColor: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.02)" }}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: "1.25rem", color: "#3f67f5" }}>
              <i className="bi bi-headset"></i>
            </span>
            <strong>Suporte Técnico IA</strong>
          </div>

          <div>
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip id="tooltip-voltar">Voltar para a tela inicial</Tooltip>}
            >
              <Link to="/home" className="btn btn-outline-secondary btn-sm">
                Voltar
              </Link>
            </OverlayTrigger>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 d-flex justify-content-center align-items-center">
        <div style={cardStyle} className="w-100">
          <h3 className="mb-1 fw-bold">Criar conta</h3>
          <p className="text-muted mb-4">Preencha os dados abaixo para criar sua conta de suporte.</p>

          {msg.text && (
            <div className={`alert ${msg.type === "success" ? "alert-success" : "alert-danger"} py-2`} role="alert">
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small text-muted">Nome completo</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small text-muted">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                className="form-control"
                style={inputStyle}
                placeholder="seu@exemplo.com"
                required
              />
            </div>

            <div className="row gx-2">
              <div className="col-md-6 mb-3">
                <label className="form-label small text-muted">Senha</label>
                <div className="input-group">
                  <input
                    name="senha"
                    value={form.senha}
                    onChange={handleChange}
                    type={showSenha ? "text" : "password"}
                    className="form-control"
                    style={{ ...inputStyle, borderRight: "none" }}
                    placeholder="Crie uma senha"
                    required
                  />
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-senha">
                        {showSenha ? "Ocultar senha" : "Mostrar senha"}
                      </Tooltip>
                    }
                  >
                    <button
                      type="button"
                      className="btn btn-white border"
                      onClick={() => setShowSenha((s) => !s)}
                      style={{ borderRadius: "0 .6rem .6rem 0", height: "3rem" }}
                      aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                      <i className={`bi ${showSenha ? "bi-eye-fill" : "bi-eye-slash-fill"}`}></i>
                    </button>
                  </OverlayTrigger>
                </div>
                <small className="text-muted">Mínimo 6 caracteres.</small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label small text-muted">Confirmar senha</label>
                <div className="input-group">
                  <input
                    name="confirmarSenha"
                    value={form.confirmarSenha}
                    onChange={handleChange}
                    type={showConfirm ? "text" : "password"}
                    className="form-control"
                    style={{ ...inputStyle, borderRight: "none" }}
                    placeholder="Repita a senha"
                    required
                  />
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-confirm">
                        {showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"}
                      </Tooltip>
                    }
                  >
                    <button
                      type="button"
                      className="btn btn-white border"
                      onClick={() => setShowConfirm((s) => !s)}
                      style={{ borderRadius: "0 .6rem .6rem 0", height: "3rem" }}
                      aria-label={showConfirm ? "Ocultar confirmar senha" : "Mostrar confirmar senha"}
                    >
                      <i className={`bi ${showConfirm ? "bi-eye-fill" : "bi-eye-slash-fill"}`}></i>
                    </button>
                  </OverlayTrigger>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-between mt-4">
              <button
                type="submit"
                className="btn btn-primary px-4 py-2 fw-bold"
                style={{ backgroundColor: "#3f67f5", borderColor: "#3f67f5", borderRadius: ".6rem" }}
                disabled={loading}
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </button>

              <div className="text-end">
                <small className="text-muted">
                  Já tem conta?{" "}
                  <Link to="/home" className="fw-bold text-decoration-none" style={{ color: "#3f67f5" }}>
                    Entrar
                  </Link>
                </small>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-3" style={{ backgroundColor: "#fff", borderTop: "1px solid #e9ecef" }}>
        <div className="container text-center small text-muted">©2025 TechSupport IA.</div>
      </footer>
    </div>
  );
}
