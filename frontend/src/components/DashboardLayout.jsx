// frontend/src/components/DashboardLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    FaUser, FaSignOutAlt, FaCalendarDay, FaCalendarWeek, 
    FaThList, FaClock, FaChartBar, FaCogs // Importaciones de iconos corregidas
} from 'react-icons/fa'; 
import './DashboardLayout.css'; 

// -----------------------------------------------------------
// Componente de Navegación Lateral (Sidebar)
// -----------------------------------------------------------
const Sidebar = ({ user, logout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm('¿Estás seguro de que deseas cerrar la sesión?')) {
            await logout();
            navigate('/login');
        }
    };

    const navItems = [
        { path: '/', label: 'Hoy', icon: FaCalendarDay },
        { path: '/semana', label: 'Semana', icon: FaCalendarWeek },
        { path: '/kanban', label: 'Kanban', icon: FaThList },
        { path: '/pomodoro', label: 'Pomodoro', icon: FaClock },
        { path: '/eisenhower', label: 'Eisenhower', icon: FaChartBar },
        { path: '/settings', label: 'Configuración', icon: FaCogs },
    ];

    return (
        <nav className="sidebar"> 
            <div className="sidebar-header">
                <h1 className="app-title">Organizador</h1>
            </div>

            {/* Bloque de Usuario actualizado con clases de CSS */}
            <div className="user-info"> 
                <div className="user-avatar">
                    <FaUser />
                </div>
                <div className="user-details">
                    <h4>{user?.email || 'Usuario'}</h4>
                    <p>Conectado</p> 
                </div>
            </div>

            <ul className="nav-links"> {/* Usamos nav-links para el contenedor de la lista */}
                {navItems.map((item) => (
                    <li key={item.path} className="nav-item">
                        <NavLink 
                            to={item.path} 
                            // Clase actualizada
                            className={({ isActive }) => isActive ? 'nav-link-item active' : 'nav-link-item'}
                            end={item.path === '/'} 
                        >
                            <item.icon />
                            <span>{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <FaSignOutAlt /> Salir
                </button>
            </div>
        </nav>
    );
};


// -----------------------------------------------------------
// Componente Principal de Layout
// -----------------------------------------------------------
function DashboardLayout() {
    const { user, logout } = useAuth();
    
    if (!user) {
        return null;
    }

    return (
        // Clase corregida para centrado
        <div className="dashboard-container"> 
            <Sidebar user={user} logout={logout} />
            
            <main className="dashboard-content"> {/* Clase corregida para centrado */}
                <Outlet /> 
            </main>
        </div>
    );
}

export default DashboardLayout;