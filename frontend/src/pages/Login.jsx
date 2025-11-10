// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignInAlt } from 'react-icons/fa';
import './AuthPage.css';
import BubblesBackground from '../components/BubblesBackground'; // Importación de burbujas

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    
    const { login, isAuthenticated, error: authError } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (authError) {
            setLocalError(authError);
        }
    }, [authError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        if (!email || !password) {
            setLocalError('Por favor, ingresa correo y contraseña.');
            return;
        }

        try {
            await login(email, password);
        } catch (err) {
            console.error("Fallo de autenticación", err);
        }
    };

    return (
        <div className="auth-container">
            <BubblesBackground /> {/* Se añade el fondo de burbujas */}
            <div className="auth-form-box">
                <h1 className="auth-header">Iniciar Sesión</h1>
                <p className="auth-subtitle">Ingresa para acceder a tu Organizador.</p>

                {localError && <p className="error-message">{localError}</p>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary auth-submit-btn">
                        <FaSignInAlt /> Entrar
                    </button>
                </form>

                <p className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;