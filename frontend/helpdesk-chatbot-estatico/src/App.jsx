import './App.css'
import Home from "./pages/home/home";
import Painel from "./pages/painel/painel";
import Cadastro from "./pages/cadastro/cadastro";
import Chatbot from './pages/chatbot/chatbot';
import Configuracoes from './pages/configuracao/configuracao';
import { Routes, Route } from "react-router-dom";

function App() {

  return (
    <>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/painel" element={<Painel />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Routes>
    </>
  )
}

export default App
