// frontend/src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserPlus } from 'react-icons/fa';
import './AuthPage.css';
import BubblesBackground from '../components/BubblesBackground'; // Importación de burbujas

function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    
    const { register, isAuthenticated, error: authError } = useAuth();
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

        if (password !== confirmPassword) {
            setLocalError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setLocalError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            await register(email, password);
        } catch (err) {
            console.error("Fallo de registro", err);
        }
    };

    return (
        <div className="auth-container">
            <BubblesBackground /> {/* Se añade el fondo de burbujas */}
            <div className="auth-form-box">
                <h1 className="auth-header">Regístrate</h1>
                <p className="auth-subtitle">Crea tu cuenta para empezar a organizar tus tareas.</p>

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
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repite la contraseña"
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary auth-submit-btn">
                        <FaUserPlus /> Crear Cuenta
                    </button>
                </form>

                <p className="auth-footer">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;