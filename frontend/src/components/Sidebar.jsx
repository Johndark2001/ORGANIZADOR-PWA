// frontend/src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { logoutUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Crearemos este archivo de estilos a continuación

const navItems = [
  { name: 'Hoy', path: '/hoy', icon: '📅' },
  { name: 'Esta Semana', path: '/semana', icon: '🗓️' },
  { name: 'Tablero Kanban', path: '/kanban', icon: '📋' },
  { name: 'Matriz Eisenhower', path: '/eisenhower', icon: '🔥' },
  { name: 'Pomodoro', path: '/pomodoro', icon: '⏱️' },
];

function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const username = user ? user.username : 'Usuario';

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>PWA Tasks</h1>
        <div className="user-profile">
            <span className="user-icon">👤</span>
            <span className="username-text">{username}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
                isActive ? 'nav-item active' : 'nav-item'
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-item">
            <span className="nav-icon">⚙️</span> Configuración
        </NavLink>
        <button onClick={handleLogout} className="logout-button">
          <span className="nav-icon">🚪</span> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Sidebar;