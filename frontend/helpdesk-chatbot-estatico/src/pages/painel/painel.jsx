import { Link } from "react-router-dom";
import React, { useState } from 'react';
import { Modal, Button } from "react-bootstrap";

// ------------------------------------------------
// Sidebar Item
// ------------------------------------------------
const SidebarItem = ({ title, route, isActive }) => (
    <a 
        href={route} 
        className={`d-block p-2 mb-2 text-decoration-none fw-bold ${
            isActive 
                ? 'text-primary bg-light rounded'
                : 'text-muted'
        }`}
        style={{ transition: 'color 0.15s ease-in-out, background-color 0.15s ease-in-out' }}
    >
        {title}
    </a>
);

// ------------------------------------------------
// Metric Card
// ------------------------------------------------
const MetricCard = ({ title, value }) => (
    <div className="col-lg-3 col-md-6 mb-4"> 
        <div 
            className="card border-0 p-3 h-100 d-flex flex-column justify-content-center"
            style={{ 
                borderRadius: '0.75rem', 
                boxShadow: '0 4px 12px rgba(0,0,0,.03)',
                backgroundColor: '#fff' 
            }}
        >
            <div className="card-body p-2 text-center">
                <p className="text-muted mb-1 small">{title}</p>
                <h4 className="card-title fw-bold text-dark" style={{ fontSize: '1.8rem' }}>{value}</h4>
            </div>
        </div>
    </div>
);

// ------------------------------------------------
// ChamadoModal (o modal que já tínhamos criado antes)
// ------------------------------------------------
const ChamadoModal = ({ show, onClose, chamado }) => {
    if (!chamado) return null;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalhes do Chamado</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>{chamado.assunto}</h5>
                <p><strong>Status:</strong> {chamado.status}</p>
                <p><strong>Data de abertura:</strong> {chamado.data}</p>

                {chamado.interacoes && chamado.interacoes.length > 0 && (
                    <>
                        <hr />
                        <h6>Interações da IA</h6>
                        <ul className="list-group">
                            {chamado.interacoes.map(inter => (
                                <li key={inter.id_interacao} className="list-group-item">
                                    <strong>{inter.remetente}:</strong> {inter.mensagem} <br />
                                    <small className="text-muted">{inter.data_hora}</small>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Fechar</Button>
            </Modal.Footer>
        </Modal>
    );
};

// ------------------------------------------------
// Componente Principal
// ------------------------------------------------
export default function Painel() {
  const [modalShow, setModalShow] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);

  const chamadosRecentes = [
        { 
            id: '#001', 
            assunto: 'Problema de Conexão', 
            status: 'Aberto', 
            data: '01/11/2023', 
            statusClass: 'text-success',
            interacoes: [
                { id_interacao: 1, remetente: 'ia', mensagem: 'Verifique o cabo de rede', data_hora: '01/11/2023 10:00' },
                { id_interacao: 2, remetente: 'usuario', mensagem: 'Já verifiquei, continua sem conexão', data_hora: '01/11/2023 10:05' },
            ]
        },
        { id: '#002', assunto: 'Erro de Sistema', status: 'Em Andamento', data: '30/10/2023', statusClass: 'text-warning', interacoes: [] },
        { id: '#003', assunto: 'Atualização de Software', status: 'Fechado', data: '28/10/2023', statusClass: 'text-muted', interacoes: [] },
    ];

  const abrirModal = (chamado) => {
    setChamadoSelecionado(chamado);
    setModalShow(true);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f7fa' }}>
      {/* Sidebar */}
      <div className="d-flex flex-column p-4 border-end" style={{ width: '250px', backgroundColor: '#fff', boxShadow: '2px 0 5px rgba(0,0,0,.02)' }}>
          <div className="d-flex align-items-center mb-5">
              <span className='me-2' style={{ fontSize: '1.5rem', color: '#3f67f5' }}>
                  <i className="bi bi-person-circle"></i>
              </span>
              <h5 className="fw-bold mb-0">Suporte AI</h5>
          </div>
          <nav className="flex-column">
              <SidebarItem title="Home" route="/home" isActive={false} />
              <SidebarItem title="Painel" route="/painel" isActive={true} />
              <SidebarItem title="Configurações" route="/configuracoes" isActive={false} />
              <hr className="my-3"/>
              <SidebarItem title="Sair" route="/logout" isActive={false} />
          </nav>
      </div>

      {/* Conteúdo */}
      <div className="flex-grow-1 p-5">
          <div className="text-end mb-4">
              <i className="bi bi-person-circle text-primary" style={{ fontSize: '2rem', cursor: 'pointer' }}></i>
          </div>

          <div className="row">
              <MetricCard title="Chamados Abertos" value="5" />
              <MetricCard title="Chamados em Andamento" value="3" />
              <MetricCard title="Chamados Resolvidos" value="12" />
              <MetricCard title="Tempo médio de atendimento" value="2h30m" />
          </div>

          <div className="card mt-4 border-0 p-4" style={{ borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,.03)' }}>
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
                                          onClick={() => abrirModal(chamado)}
                                      >
                                          Ver detalhes
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>

                    {/* Botão Novo Chamado */}
                <Link to="/chatbot" className="btn btn-primary">
                    Novo Chamado
                </Link>
              </div>
          </div>
      </div>

      {/* ChamadoModal existente */}
      <ChamadoModal 
          show={modalShow} 
          onClose={() => setModalShow(false)} 
          chamado={chamadoSelecionado} 
      />
    </div>
  );
}
