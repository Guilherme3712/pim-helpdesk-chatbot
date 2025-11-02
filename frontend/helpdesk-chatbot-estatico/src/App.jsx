import './App.css'
import Home from "./pages/home/home";
import Chamados from "./pages/chamados/chamados";
import Painel from "./pages/painel/painel";
import Cadastro from "./pages/cadastro/cadastro";
import { Routes, Route, Link } from "react-router-dom";

function App() {

  return (
    <>
      {/* <div className="container mt-5 text-center">
          <nav className="navbar navbar-expand-lg navbar-light bg-light rounded mb-4 shadow-sm p-3">
            <div className="container-fluid justify-content-center">
              <Link to="/home" className="nav-link fw-semibold">
                Home
              </Link>
              <Link to="/chamados" className="nav-link fw-semibold ms-4">
                Chamados
              </Link>
              <Link to="/painel" className="nav-link fw-semibold ms-4">
              Painel
              </Link>
              <Link to="/cadastro" className="nav-link fw-semibold ms-4">
              Cadastro
              </Link>
            </div>
          </nav> */}

          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/chamados" element={<Chamados />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="/cadastro" element={<Cadastro />} />
          </Routes>
        {/* </div> */}
    </>
  )
}

export default App
