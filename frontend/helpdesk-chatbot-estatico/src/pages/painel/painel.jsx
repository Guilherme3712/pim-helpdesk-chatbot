import { Link } from "react-router-dom";
import React from 'react';

const SidebarItem = ({ title, route, isActive }) => (
    // Se estivesse usando react-router-dom, seria <Link to={route}>...</Link>
    <a 
        href={route} 
        className={`d-block p-2 mb-2 text-decoration-none fw-bold ${
            isActive 
                ? 'text-primary bg-light rounded' // Estilo de item ativo (azul, fundo claro)
                : 'text-muted' // Estilo de item inativo
        }`}
        style={{ transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out' }}
    >
        {title}
    </a>
);

// ------------------------------------------------
// Componente Reutilizável: Card de Métrica
// ------------------------------------------------
const MetricCard = ({ title, value }) => (
    // Coluna recebe mb-4
    <div className="col-lg-3 col-md-6 mb-4"> 
        <div 
            className="card border-0 p-3 h-100 d-flex flex-column justify-content-center" // Adicione 'h-100' e 'd-flex'
            style={{ 
                borderRadius: '0.75rem', 
                boxShadow: '0 4px 12px rgba(0,0,0,.03)',
                // Remova minHeight, o h-100 deve ser suficiente se o pai estiver correto
                backgroundColor: '#fff' 
            }}
        >
            <div className="card-body p-2 text-center"> {/* Centralize o conteúdo */}
                <p className="text-muted mb-1 small">{title}</p>
                <h4 className="card-title fw-bold text-dark" style={{ fontSize: '1.8rem' }}>{value}</h4>
            </div>
        </div>
    </div>
);

export default function Painel() {

  const chamadosRecentes = [
        { id: '#001', assunto: 'Problema de Conexão', status: 'Aberto', data: '01/11/2023', statusClass: 'text-success' },
        { id: '#002', assunto: 'Erro de Sistema', status: 'Em Andamento', data: '30/10/2023', statusClass: 'text-warning' },
        { id: '#003', assunto: 'Atualização de Software', status: 'Fechado', data: '28/10/2023', statusClass: 'text-muted' },
    ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f7fa' }}>
            
            {/* 1. SIDEBAR (Menu Lateral) */}
            <div 
                className="d-flex flex-column p-4 border-end" 
                style={{ 
                    width: '250px', // Largura fixa para o sidebar
                    backgroundColor: '#fff',
                    boxShadow: '2px 0 5px rgba(0,0,0,.02)'
                }}
            >
                {/* Título do Sidebar */}
                <div className="d-flex align-items-center mb-5">
                    <span className='me-2' style={{ fontSize: '1.5rem', color: '#3f67f5' }}>
                        <i className="bi bi-person-circle"></i> {/* Ícone de usuário */}
                    </span>
                    <h5 className="fw-bold mb-0">Suporte AI</h5>
                </div>

                {/* Itens de Navegação */}
                <nav className="flex-column">
                    <SidebarItem title="Painel" route="/painel" isActive={true} />
                    <SidebarItem title="Abrir Chamado" route="/abrir-chamado" isActive={false} />
                    <SidebarItem title="Meus Chamados" route="/meus-chamados" isActive={false} />
                    <SidebarItem title="Configurações" route="/configuracoes" isActive={false} />
                    <hr className="my-3"/>
                    <SidebarItem title="Sair" route="/logout" isActive={false} />
                </nav>
            </div>

            {/* 2. CONTEÚDO PRINCIPAL (Main Content) */}
            <div className="flex-grow-1 p-5">
                
                {/* Canto superior direito com o ícone de perfil/usuário */}
                <div className="text-end mb-4">
                    <i 
                        className="bi bi-person-circle text-primary" 
                        style={{ fontSize: '2rem', cursor: 'pointer' }}
                    ></i>
                </div>


                {/* Linha de Métricas (Cards) */}
                  <div className="row"> {/* Esta é a linha onde os cards estão */}
                      <MetricCard title="Chamados Abertos" value="5" />
                      <MetricCard title="Chamados em Andamento" value="3" />
                      <MetricCard title="Chamados Resolvidos" value="12" />
                      <MetricCard title="Tempo médio de atendimento" value="2h30m" />
                    </div>

                {/* Tabela de Chamados Recentes */}
                <div 
                    className="card mt-4 border-0 p-4" 
                    style={{ 
                        borderRadius: '0.75rem', 
                        boxShadow: '0 4px 12px rgba(0,0,0,.03)'
                    }}
                >
                    <div className="card-body">
                        <h5 className="fw-bold mb-4">Chamados Recentes</h5>
                        <table className="table table-borderless">
                            <thead>
                                <tr className='text-muted small'>
                                    <th>Número</th>
                                    <th>Assunto do Chamado</th>
                                    <th>Status</th>
                                    <th>Data de Abertura</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chamadosRecentes.map(chamado => (
                                    <tr key={chamado.id}>
                                        <td className="fw-bold">{chamado.id}</td>
                                        <td>{chamado.assunto}</td>
                                        <td>
                                            <span className={`fw-bold ${chamado.statusClass}`}>
                                                {chamado.status}
                                            </span>
                                        </td>
                                        <td>{chamado.data}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm text-white" 
                                                style={{ backgroundColor: '#4263f5', borderColor: '#4263f5' }}
                                                onClick={() => alert(`Ver detalhes do ${chamado.id}`)}
                                            >
                                                Ver detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
  );
}
