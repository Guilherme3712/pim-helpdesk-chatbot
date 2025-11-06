import { Link } from "react-router-dom";
import React from 'react';

const customStyles = {
    header: {
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,.04)',
    },
    card: {
        borderRadius: '0.75rem',
        boxShadow: '0 4px 12px rgba(0,0,0,.03)',
        border: '1px solid #e9ecef', // Borda leve para destacar
        minHeight: '200px',
    },
    btnPrimary: {
        backgroundColor: '#3f67f5', // Cor azul customizada
        borderColor: '#3f67f5',
    },
    footer: {
        backgroundColor: '#fff',
        borderTop: '1px solid #e9ecef',
    }
};


const MetricCard = ({ title, children, route }) => (
    <div className="col-lg-4 col-md-6 mb-4">
        <Link to={route || '#'} className="text-decoration-none">
            <div className="card h-100 p-3" style={{
                ...customStyles.card,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: route ? 'pointer' : 'default',
                ':hover': route ? {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
                } : {}
            }}>
                <div className="card-body">
                    <h5 className="card-title fw-bold text-dark mb-4">{title}</h5>
                    {/* Aqui entra o conteúdo do gráfico/métrica */}
                    {children}
                </div>
            </div>
        </Link>
    </div>
);

export default function Home() {

  // const handleRegister = () => {
  //       // Exemplo: Navegar para a página de cadastro
  //       // if (Link) { <Link to="/cadastro" /> }
  //       alert('Redirecionando para a página de Cadastro...');
  //   };


  return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f4f7fa' }}>
            
            {/* 1. HEADER / BARRA DE NAVEGAÇÃO SUPERIOR */}
            <header className="navbar navbar-expand-lg py-3" style={customStyles.header}>
                <div className="container-fluid mx-5">
                    
                    {/* Logo/Título */}
                    <a className="navbar-brand fw-bold d-flex align-items-center" href="#">
                         <span className='me-2' style={{ fontSize: '1.2rem', color: '#3f67f5' }}>
                            <i className="bi bi-headset"></i> {/* Icone de suporte, se estiver usando Bootstrap Icons */}
                        </span>
                        Suporte Técnico IA
                    </a>
                    
                    {/* Formulário de Login no Header */}
                    <form className="d-flex align-items-center">
                        <span className="me-2 text-muted fw-bold">Email</span>
                        <input 
                            type="text" 
                            className="form-control form-control-sm me-3" 
                            placeholder="" 
                            style={{ width: '120px' }}
                        />

                        <span className="me-2 text-muted fw-bold">Senha</span>
                        <input 
                            type="password" 
                            className="form-control form-control-sm me-3" 
                            placeholder="" 
                            style={{ width: '120px' }}
                        />
                        <Link 
                          className="btn btn-primary px-2 fw-bold" 
                          style={customStyles.btnPrimary}
                      >
                          Login
                      </Link>
                        
                    </form>
                </div>
            </header>

            {/* 2. CONTEÚDO PRINCIPAL (Main) */}
            <main className="container mt-5">
                
                {/* Informação e Botão de Cadastro */}
                <div className="row mb-5">
                    <div className="col-8">
                        <h1 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
                            Sistema Integrado de Gestão de Chamados
                        </h1>
                        <p className="lead text-muted mb-4">
                            O sistema de gestão de chamados e suporte técnico baseado em recursos.
                        </p>
                        
                      <Link 
                          to="/cadastro" // <--- Define a rota de destino
                          className="btn btn-primary btn-lg px-4 fw-bold" 
                          style={customStyles.btnPrimary}
                      >
                          Cadastre-se
                      </Link>
                    </div>
                     
                    
                </div>

                {/* Área dos Cards/Métricas */}
                <div className="row mt-4">
                    
                    {/* Card 1: Chamados Abertos */}
                    <MetricCard title="Chamados Abertos" route="/painel">
                        {/* Simulação de um gráfico de barras horizontal */}
                        <div className="d-flex flex-column justify-content-center align-items-start p-3" style={{ height: '100px' }}>
                            <div className="bg-primary mb-2" style={{ width: '80%', height: '8px', borderRadius: '4px' }}></div>
                            <div className="bg-info mb-2" style={{ width: '50%', height: '8px', borderRadius: '4px' }}></div>
                            <div className="bg-warning mb-2" style={{ width: '65%', height: '8px', borderRadius: '4px' }}></div>
                            <div className="bg-danger" style={{ width: '30%', height: '8px', borderRadius: '4px' }}></div>
                            {/* **Substitua por um componente de gráfico real (ex: <Bar data={...} />)** */}
                        </div>
                    </MetricCard>

                    {/* Card 2: Chamados Resolvidos */}
                    <MetricCard title="Chamados Resolvidos">
                         {/* Simulação de um gráfico de linha */}
                         <div className="d-flex justify-content-center align-items-center p-3" style={{ height: '100px' }}>
                             <svg width="100%" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">
                                 <path d="M 0 80 C 25 40, 50 60, 75 20, 100 50" stroke="#3f67f5" strokeWidth="2" fill="none"/>
                             </svg>
                             {/* **Substitua por um componente de gráfico real (ex: <Line data={...} />)** */}
                         </div>
                    </MetricCard>

                    {/* Card 3: Tempo Médio de Atendimento */}
                    <MetricCard title="Tempo Médio de Atendimento">
                        {/* Conteúdo simples de métrica */}
                        <div className="d-flex justify-content-center align-items-center h-100">
                            <h2 className="display-4 fw-bold text-dark">45 min</h2>
                        </div>
                    </MetricCard>

                </div>

            </main>

            {/* 3. FOOTER */}
            <footer className="py-3" style={customStyles.footer}>
                <div className="container  d-flex justify-content-between align-items-center small text-muted">
                    <p className="mb-0">©2025 TechSupport IA. Todos os direitos reservados.</p>
                    <div className="d-flex">
                        {/* Links de Redes Sociais - Usando Bootstrap Icons (bi) */}
                        <a href="#" className="text-decoration-none text-muted me-3"><i className="bi bi-facebook"></i></a>
                        <a href="#" className="text-decoration-none text-muted me-3"><i className="bi bi-twitter"></i></a>
                        <a href="#" className="text-decoration-none text-muted"><i className="bi bi-linkedin"></i></a>
                    </div>
                </div>
            </footer>
        </div>
    );
}