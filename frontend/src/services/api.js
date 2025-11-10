// frontend/src/services/api.js
import axios from 'axios';

// Creamos una instancia de Axios con la URL base de nuestra API
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // Esta es la URL de tu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// === Interceptor de Petición ===
// Usamos un interceptor para añadir automáticamente el token JWT
// a CADA petición que hagamos a la API (excepto login y register).
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Servicios de Autenticación ---

export const registerUser = (userData) => {
  // userData será { username, email, password }
  return apiClient.post('/register', userData);
};

export const loginUser = async (credentials) => {
  // credentials será { email, password }
  const response = await apiClient.post('/login', credentials);
  
  // Si el login es exitoso, guardamos el token
  if (response.data.access_token) {
    localStorage.setItem('accessToken', response.data.access_token);
    // (Opcional: guardar info del usuario)
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// frontend/src/services/api.js

// ... (código existente de apiClient, interceptor, registerUser, loginUser, logoutUser)

// --- Servicios de Tareas (Tasks) ---

export const getTasks = () => {
  return apiClient.get('/tasks');
};

export const createTask = (taskData) => {
  return apiClient.post('/tasks', taskData);
};

export const updateTask = (taskId, taskData) => {
  return apiClient.put(`/tasks/${taskId}`, taskData);
};

export const deleteTask = (taskId) => {
  return apiClient.delete(`/tasks/${taskId}`);
};

// --- Servicios de Etiquetas (Tags) ---

export const getTags = () => {
  return apiClient.get('/tags');
};

export const createTag = (tagName) => {
  return apiClient.post('/tags', { name: tagName });
};

export const deleteTag = (tagId) => {
  return apiClient.delete(`/tags/${tagId}`);
};

// --- (Aquí añadiremos las funciones para TAREAS, ETIQUETAS, etc.) ---
// export const getTasks = () => apiClient.get('/tasks');
// export const createTask = (taskData) => apiClient.post('/tasks', taskData);
// ...etc.

export default apiClient;