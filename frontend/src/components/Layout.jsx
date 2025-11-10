// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css'; // Crearemos este archivo de estilos a continuación

function Layout() {
  return (
    <div className="app-layout">
      {/* 1. Barra Lateral (Fija) */}
      <Sidebar />
      
      {/* 2. Contenido Principal (Se desplaza) */}
      <main className="main-content">
        <div className="main-content-inner">
          {/* Outlet renderiza el componente de la ruta anidada (Hoy, Kanban, etc.) */}
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}

export default Layout;