import './App.css'
import Home from "./pages/home";
import Chamados from "./pages/chamados";
import { Routes, Route, Link } from "react-router-dom";

function App() {

  return (
    <>
      <div className="container mt-5 text-center">
          <nav className="navbar navbar-expand-lg navbar-light bg-light rounded mb-4 shadow-sm p-3">
            <div className="container-fluid justify-content-center">
              <Link to="/home" className="nav-link fw-semibold">
                Home
              </Link>
              <Link to="/chamados" className="nav-link fw-semibold ms-4">
                Chamados
              </Link>
            </div>
          </nav>

          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/chamados" element={<Chamados />} />
          </Routes>
        </div>
    </>
  )
}

export default App
