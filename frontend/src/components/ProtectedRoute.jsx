// frontend/src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode'; // Necesitamos esto para validar el token

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  
  // 1. Verificar si existe el token
  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    // 2. Decodificar y verificar la expiración del token
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Tiempo actual en segundos
    
    // Si el token ha expirado
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } catch (error) {
    // Si el token es inválido o corrupto
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si el token es válido y no ha expirado, renderiza los hijos (la vista solicitada)
  return children;
};

export default ProtectedRoute;