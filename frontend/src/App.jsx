// frontend/src/App.jsx
import React from 'react';
// IMPORTANTE: Se eliminó BrowserRouter, solo necesitamos Routes, Route y Navigate
import { Routes, Route, Navigate } from 'react-router-dom'; 

// CONTEXTOS
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';

// VISTAS Y LAYOUT
import DashboardLayout from './components/DashboardLayout';
import Hoy from './pages/Hoy';  // <-- ASEGURA QUE ESTA LÍNEA EXISTA Y ESTÉ CORRECTA
import Semana from './pages/Semana';
import Kanban from './pages/Kanban';
import Pomodoro from './pages/Pomodoro';
import Eisenhower from './pages/Eisenhower';
import SettingsPage from './pages/Settings'; 
import LoginPage from './pages/Login'; 
import RegisterPage from './pages/Register';
import './App.css'; 


// -----------------------------------------------------------
// 1. Componente de Ruta Privada (Middleware de autenticación)
// -----------------------------------------------------------
const PrivateRoute = ({ element: Element, ...rest }) => {
    const { isAuthenticated, loading } = useAuth();

    // Mostrar un estado de carga mientras verifica la sesión
    if (loading) {
        return <div className="loading-app-state">Cargando autenticación...</div>;
    }

    // Si no está autenticado, redirigir a Login
    return isAuthenticated ? <Element {...rest} /> : <Navigate to="/login" />;
};


// -----------------------------------------------------------
// 2. Componente de Definición de Rutas
// -----------------------------------------------------------
const AppRoutes = () => {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* RUTAS PRIVADAS (Envueltas por DashboardLayout y PrivateRoute) */}
            <Route element={<PrivateRoute element={DashboardLayout} />}>
                <Route path="/" element={<Hoy />} /> {/* Ruta principal */}
                <Route path="/semana" element={<Semana />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/pomodoro" element={<Pomodoro />} />
                <Route path="/eisenhower" element={<Eisenhower />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Route>
            
            {/* Ruta Catch-all (404) */}
            <Route path="*" element={<h1>404: Página no encontrada</h1>} />
        </Routes>
    );
};


// -----------------------------------------------------------
// 3. Componente Principal (SIN ROUTER)
// -----------------------------------------------------------
function App() {
    return (
        // Contextos envuelven las rutas. El Router (BrowserRouter) está en main.jsx.
        <AuthProvider>
            <TaskProvider> 
                <AppRoutes />
            </TaskProvider>
        </AuthProvider>
    );
}

// -----------------------------------------------------------
// 4. EXPORTACIÓN POR DEFECTO
// -----------------------------------------------------------
export default App;