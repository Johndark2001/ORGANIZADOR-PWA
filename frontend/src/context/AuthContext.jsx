// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../api/config'; // Importa la URL base definida

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Hook Personalizado para acceder al contexto
export const useAuth = () => useContext(AuthContext);

// 3. Proveedor del Contexto (Lógica principal)
export const AuthProvider = ({ children }) => {
    
    // Estados de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Inicialmente TRUE para chequear sesión
    const [error, setError] = useState(null);

    // -------------------------------------------------------------------
    // A. Verificación de Sesión Persistente (al cargar la app)
    // -------------------------------------------------------------------
    
    // Esta función verifica si hay una cookie de sesión activa en el backend.
    const checkAuth = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/check_auth`, {
                method: 'GET',
                // CRUCIAL: Necesario para enviar y recibir cookies con credenciales
                credentials: 'include', 
            });

            if (response.ok) {
                const data = await response.json();
                setIsAuthenticated(true);
                setUser(data.user); // El backend debe devolver la info básica del usuario
                return true;
            } else {
                // Si el backend devuelve 401/403 (no autenticado)
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }
        } catch (err) {
            // Error de red, servidor caído, etc.
            console.error("Error al verificar la autenticación:", err);
            setIsAuthenticated(false);
            setUser(null);
            return false;
        } finally {
            // Este es el paso CRÍTICO que desbloquea el renderizado en App.jsx
            setLoading(false); 
        }
    }, []);

    // Ejecutar la verificación al montar el componente
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    

    // -------------------------------------------------------------------
    // B. Funciones CRUD de Autenticación
    // -------------------------------------------------------------------
    
    const login = async (email, password) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error de inicio de sesión.');
            }

            const data = await response.json();
            setIsAuthenticated(true);
            setUser(data.user);
            return data.user;
            
        } catch (err) {
            setError(err.message);
            console.error("Error en login:", err);
            throw err;
        }
    };
    
    const register = async (email, password) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error de registro.');
            }

            // Una vez registrado, iniciamos sesión automáticamente (o forzamos login)
            const data = await response.json();
            setIsAuthenticated(true);
            setUser(data.user); 
            return data.user;
            
        } catch (err) {
            setError(err.message);
            console.error("Error en register:", err);
            throw err;
        }
    };

    const logout = async () => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            
            if (!response.ok) {
                throw new Error('Error al cerrar sesión en el servidor.');
            }

            // Limpiar estado local
            setIsAuthenticated(false);
            setUser(null);
            // location.reload(); // Recargar la página para limpiar todo el estado
            
        } catch (err) {
            // Incluso si el logout falla en la red, forzamos el estado local a salir.
            setIsAuthenticated(false);
            setUser(null);
            setError(err.message);
            console.error("Error en logout:", err);
        }
    };


    const contextValue = {
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};