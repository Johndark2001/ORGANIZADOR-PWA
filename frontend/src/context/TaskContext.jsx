// frontend/src/context/TaskContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../api/config'; // Usaremos esta URL base

const TaskContext = createContext();

// Hook de acceso directo a los datos
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
    const [tasks, setTasks] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // -------------------------------------------------------------------
    // 1. Fetch de Datos (Tareas y Etiquetas)
    // -------------------------------------------------------------------

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401) throw new Error("No autenticado. Inicia sesión.");
                throw new Error("Error al cargar tareas.");
            }
            const data = await response.json();
            setTasks(data);
        } catch (err) {
            setError(err.message);
            console.error("Error al cargar tareas:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTags = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tags`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401) return; // No es crítico si no hay sesión
                throw new Error("Error al cargar etiquetas.");
            }
            const data = await response.json();
            setTags(data);
        } catch (err) {
            console.error("Error al cargar etiquetas:", err);
        }
    }, []);

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchTasks();
        fetchTags();
    }, [fetchTasks, fetchTags]);


    // -------------------------------------------------------------------
    // 2. Funciones CRUD
    // -------------------------------------------------------------------

    // --- A. Crear Tarea (POST) ---
    const createTask = async (taskData) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Error al crear la tarea.");

            const newTask = await response.json();
            setTasks(prevTasks => [...prevTasks, newTask]);
            // Re-fetch de etiquetas por si se creó una nueva
            fetchTags(); 
            return newTask;
        } catch (err) {
            setError(err.message);
            console.error("Error en createTask:", err);
            throw err;
        }
    };

    // --- B. Actualizar Tarea (PUT) ---
    const updateTask = async (taskId, updateData) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Error al actualizar la tarea.");

            const updatedTask = await response.json();
            
            // Reemplazar la tarea actualizada en el estado global
            setTasks(prevTasks => 
                prevTasks.map(task => (task.id === taskId ? updatedTask : task))
            );
            // Re-fetch de etiquetas si se modificaron
            fetchTags(); 
            return updatedTask;
        } catch (err) {
            setError(err.message);
            console.error("Error en updateTask:", err);
            throw err;
        }
    };

    // --- C. Eliminar Tarea (DELETE) ---
    const deleteTask = async (taskId) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Error al eliminar la tarea.");

            // Filtrar la tarea eliminada del estado global
            setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));

            // No es necesario refetch de etiquetas aquí, pues la relación se limpia en el backend
        } catch (err) {
            setError(err.message);
            console.error("Error en deleteTask:", err);
            throw err;
        }
    };
    
    // --- D. Gestión de Etiquetas (POST y DELETE solo por conveniencia) ---
    // (Generalmente, las etiquetas se gestionan al actualizar una tarea, pero estas son para el Settings)
    const deleteTag = async (tagId) => {
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tags/${tagId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Error al eliminar la etiqueta.");

            // Quitar la etiqueta del estado global y de las tareas que la contenían
            setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
            setTasks(prevTasks => prevTasks.map(task => ({
                ...task,
                tags: task.tags.filter(tag => tag.id !== tagId)
            })));

        } catch (err) {
            setError(err.message);
            console.error("Error en deleteTag:", err);
            throw err;
        }
    };


    const contextValue = {
        tasks,
        tags,
        loading,
        error,
        fetchTasks,
        fetchTags,
        createTask,
        updateTask,
        deleteTask,
        deleteTag,
    };

    return (
        <TaskContext.Provider value={contextValue}>
            {children}
        </TaskContext.Provider>
    );
};