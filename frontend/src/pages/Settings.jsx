// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { FaUser, FaTag, FaClock, FaSignOutAlt, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import './Settings.css';

// -----------------------------------------------------------
// Componente de Gestión de Etiquetas
// -----------------------------------------------------------

const TagManager = () => {
    const { tags, deleteTag, fetchTags } = useTasks();
    const [newTagName, setNewTagName] = useState('');
    const [tagError, setTagError] = useState('');

    // Función para crear una nueva etiqueta (usando la API de Tareas)
    const handleCreateTag = async (e) => {
        e.preventDefault();
        setTagError('');
        const trimmedName = newTagName.trim();

        if (!trimmedName) {
            setTagError('El nombre de la etiqueta no puede estar vacío.');
            return;
        }

        // Ya que la API de tags solo permite GET y POST en /api/tags, 
        // llamamos a la API directamente (o idealmente añadimos la función POST al useTasks)
        try {
            const response = await fetch('http://localhost:5000/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: trimmedName }),
                credentials: 'include',
            });

            if (response.status === 409) {
                setTagError('Esta etiqueta ya existe.');
                return;
            }
            if (!response.ok) {
                throw new Error("Error al crear la etiqueta.");
            }

            // Actualizar el estado global de etiquetas
            await fetchTags(); 
            setNewTagName('');
            alert(`Etiqueta "${trimmedName}" creada con éxito.`);
            
        } catch (error) {
            setTagError(error.message);
            console.error("Error al crear la etiqueta:", error);
        }
    };

    const handleDeleteTag = async (tagId, tagName) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar la etiqueta "${tagName}"? Se eliminará de todas las tareas.`)) {
            try {
                await deleteTag(tagId);
                alert(`Etiqueta "${tagName}" eliminada con éxito.`);
            } catch (error) {
                setTagError(`Error al eliminar: ${error.message}`);
            }
        }
    };

    return (
        <div className="settings-section tag-manager">
            <h3><FaTag /> Gestión de Etiquetas</h3>
            <p>Aquí puedes crear y eliminar tus etiquetas personalizadas. Las etiquetas eliminadas se borrarán de todas tus tareas.</p>

            <form onSubmit={handleCreateTag} className="tag-creation-form">
                <input
                    type="text"
                    placeholder="Nombre de la nueva etiqueta"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                />
                <button type="submit" className="btn-primary">
                    <FaPlus /> Crear
                </button>
            </form>
            {tagError && <p className="error-message">{tagError}</p>}

            <div className="tag-list">
                <h4>Etiquetas Actuales ({tags.length})</h4>
                {tags.length === 0 ? (
                    <p className="no-tags-msg">No tienes etiquetas creadas aún.</p>
                ) : (
                    tags.map(tag => (
                        <div key={tag.id} className="tag-item">
                            <span className="tag-name"><FaCheckCircle className="check-icon" /> {tag.name}</span>
                            <button 
                                onClick={() => handleDeleteTag(tag.id, tag.name)}
                                className="btn-delete-tag"
                                title={`Eliminar ${tag.name}`}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// -----------------------------------------------------------
// Componente de Configuración de Pomodoro
// -----------------------------------------------------------

const PomodoroSettings = () => {
    const [workTime, setWorkTime] = useState(localStorage.getItem('pomodoroWork') || 25);
    const [shortBreak, setShortBreak] = useState(localStorage.getItem('pomodoroShortBreak') || 5);
    const [longBreak, setLongBreak] = useState(localStorage.getItem('pomodoroLongBreak') || 15);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('pomodoroWork', workTime);
        localStorage.setItem('pomodoroShortBreak', shortBreak);
        localStorage.setItem('pomodoroLongBreak', longBreak);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="settings-section pomodoro-settings">
            <h3><FaClock /> Preferencias de Pomodoro</h3>
            <p>Define la duración de tus ciclos de productividad (en minutos).</p>
            
            <div className="setting-control">
                <label>Duración del Foco (min)</label>
                <input 
                    type="number" 
                    min="5" 
                    value={workTime} 
                    onChange={(e) => setWorkTime(e.target.value)} 
                />
            </div>
            <div className="setting-control">
                <label>Descanso Corto (min)</label>
                <input 
                    type="number" 
                    min="1" 
                    value={shortBreak} 
                    onChange={(e) => setShortBreak(e.target.value)} 
                />
            </div>
            <div className="setting-control">
                <label>Descanso Largo (min)</label>
                <input 
                    type="number" 
                    min="5" 
                    value={longBreak} 
                    onChange={(e) => setLongBreak(e.target.value)} 
                />
            </div>

            <button onClick={handleSave} className={`btn-primary save-btn ${isSaved ? 'saved' : ''}`}>
                {isSaved ? <><FaCheckCircle /> Guardado</> : 'Guardar Preferencias'}
            </button>
        </div>
    );
};


// -----------------------------------------------------------
// Componente Principal Settings
// -----------------------------------------------------------

function SettingsPage() {
    const { user, logout } = useAuth();

    return (
        <div className="settings-page">
            <h1 className="page-header">⚙️ Configuración</h1>

            {/* 1. Información del Usuario */}
            <div className="settings-section user-info-section">
                <h3><FaUser /> Información de Cuenta</h3>
                {user ? (
                    <div className="user-details">
                        <p><strong>Correo Electrónico:</strong> {user.email}</p>
                        <p><strong>Miembro desde:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                        {/* Funcionalidad de cambio de nombre/contraseña iría aquí */}
                        <button onClick={logout} className="btn-secondary logout-btn">
                            <FaSignOutAlt /> Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    <p>Cargando información del usuario...</p>
                )}
            </div>
            
            <PomodoroSettings />
            
            <TagManager />
            
            {/* 4. Otras configuraciones (Tema, Notificaciones, etc.) irían aquí */}
            <div className="settings-section other-settings">
                <h3>🛠️ Otras Opciones</h3>
                <p><strong>Tema:</strong> (Funcionalidad pendiente - Claro / Oscuro)</p>
                <p><strong>Sincronización Offline:</strong> (Activa por defecto en PWA)</p>
            </div>

        </div>
    );
}

export default SettingsPage;