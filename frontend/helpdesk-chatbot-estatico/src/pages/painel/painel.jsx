import { Link } from "react-router-dom";

export default function Painel() {
  return (
    <div className="p-4">
      <h1 className="display-5 fw-bold mb-3">Painel</h1>
      <p className="lead mb-4">Esta é a primeira página introdutória do app.</p>

      <Link to="/chamados" className="btn btn-primary btn-lg">
        Ir para Introdução 2 →
      </Link>
    </div>
  );
}
