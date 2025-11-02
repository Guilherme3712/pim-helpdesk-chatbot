import { Link } from "react-router-dom";
import React, { useState } from 'react';


export default function Cadastro() {

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        accessKey: '',
        password: '',
        confirmPassword: ''
    });

    // Função para lidar com a mudança nos inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Função para lidar com o envio do formulário
    const handleSubmit = (e) => {
        e.preventDefault();
        // Lógica de validação e envio
        if (formData.password !== formData.confirmPassword) {
            alert("As senhas não coincidem!");
            return;
        }
        console.log("Dados de Registro:", formData);
        alert("Registro Efetuado! (Verifique o console para os dados)");
        // Você pode adicionar a chamada à API aqui
    };

    // Estilo personalizado para simular o layout minimalista e as bordas arredondadas do card
    const cardStyle = {
        maxWidth: '500px',
        borderRadius: '1.5rem', // Mais arredondado que o padrão do Bootstrap
        boxShadow: '0 4px 20px rgba(0,0,0,.05)',
        padding: '3rem'
    };

    const inputStyle = {
        borderRadius: '.5rem', // Bordas arredondadas nos inputs
        height: '3.2rem' // Altura ligeiramente maior para inputs
    };
    
    // Para simular o ícone de olho no campo Confirm Password (usaremos o Bootstrap Icons)
    // Se você não tiver o Bootstrap Icons, pode usar um SVG ou uma imagem.
    // Presumindo que o Bootstrap Icons (bi) está disponível
    const PasswordInputGroup = ({ name, value, onChange, placeholder, hasIcon = false }) => (
        <div className="input-group mb-3">
            <input
                type={name.includes('password') ? 'password' : 'text'}
                className="form-control"
                style={inputStyle}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
            />
            {hasIcon && (
                <span className="input-group-text bg-white border-0" style={{ position: 'absolute', right: '0', zIndex: 10, height: '3.2rem' }}>
                     {/* Este ícone é apenas para simular o visual. O ícone de olho do Bootstrap Icons é 'bi-eye' */}
                    <i className="bi bi-eye-slash-fill text-muted"></i> 
                </span>
            )}
        </div>

)

  return (
    <div className="vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f7fa' }}>
            
            {/* 1. Navbar Simples/Header */}
            

            {/* 2. Container Central com o Formulário */}
            <main className="flex-grow-1 d-flex justify-content-center align-items-center">
                <div className="bg-white shadow-sm" style={cardStyle}>
                    <form onSubmit={handleSubmit}>
                        
                        {/* Full Name / E-mail */}
                        <div className="mb-4">
                            <label htmlFor="email" className="form-label text-muted fw-bold">Nome Completo</label>
                            <input
                                type="text"
                                className="form-control"
                                style={inputStyle}
                                name="fullName"
                                placeholder="Nome" // O layout da imagem parece ter o placeholder trocado com o label
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* E-mail (O campo 'Full Name' e o texto 'E-mail' na imagem estão um pouco confusos, vou seguir a ordem e dar ao segundo campo o nome 'email') */}
                        <div className="mb-4">
                            <label htmlFor="emailInput" className="form-label text-muted fw-bold">E-mail</label>
                            <input
                                type="email"
                                className="form-control"
                                style={inputStyle}
                                name="email"
                                placeholder="E-mail"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        
                        

                        {/* Password */}
                        <div className="mb-4">
                            <label htmlFor="password" className="form-label text-muted fw-bold">Senha</label>
                            <input
                                type="password"
                                className="form-control"
                                style={inputStyle}
                                name="password"
                                placeholder="Senha"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        {/* Confirm Password com ícone */}
                        <div className="mb-5">
                            <label htmlFor="confirmPassword" className="form-label text-muted fw-bold">Confirmar Senha</label>
                            <div className="input-group">
                                <input
                                    type="password"
                                    className="form-control border-end-0" // Removendo a borda direita para o ícone
                                    style={{ ...inputStyle, borderRight: 'none' }}
                                    name="confirmPassword"
                                    placeholder="Confirmar senha"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                {/* Ícone de Olho */}
                                <span 
                                    className="input-group-text bg-white" 
                                    style={{ 
                                        borderRadius: '.5rem', 
                                        borderLeft: 'none', 
                                        height: '3.2rem',
                                        cursor: 'pointer' // Adiciona cursor para indicar que pode ser clicável
                                    }}
                                >
                                    {/* Exemplo de ícone do Bootstrap Icons */}
                                    <i className="bi bi-eye-slash-fill text-muted"></i> 
                                </span>
                            </div>
                        </div>


                        {/* Botão Register */}
                        <div className="d-grid justify-content-center text-center">
                            <button 
                                type="submit" 
                                className="btn btn-primary btn-lg fw-bold" 
                                style={{ backgroundColor: '#4263f5', borderColor: '#4263f5', borderRadius: '0.5rem', padding: '0.75rem 1.5rem' }}
                            >
                                Cadastrar
                            </button>

                           <Link 
    to="/home" // Rota de destino
    className="text-primary text-decoration-none fw-bold" // Estilo de link primário (azul) e negrito
    style={{ 
        fontSize: '1.2rem', // Ajuste opcional no tamanho da fonte
        // Removido todos os estilos de 'button' (backgroundColor, padding, borderRadius)
    }}
>
    Voltar
</Link>

                        </div>
                    </form>
                </div>
            </main>
            
            {/* O rodapé não está visível na imagem, mas um footer simples pode ser adicionado se necessário */}
        </div>
  );
}
