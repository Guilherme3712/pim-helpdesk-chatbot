import { Link } from "react-router-dom";

export default function Chamados() {
  return (
    <div className="p-4">
      <h1 className="display-5 fw-bold mb-3">Segunda Introdução</h1>
      <p className="lead mb-4">Agora você está na segunda página!</p>

      <Link to="/home" className="btn btn-success btn-lg">
        ← Voltar para Introdução 1
      </Link>
    </div>
  );
}
