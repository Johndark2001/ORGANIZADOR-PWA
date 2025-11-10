// frontend/src/components/TaskForm.jsx
import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { FaSave, FaPlus, FaTag, FaCalendarAlt, FaStar } from 'react-icons/fa';
import './TaskForm.css';

const TaskForm = ({ taskToEdit, onClose }) => {
    const { addTask, updateTask, tags, fetchTags } = useTasks();

    const isEditing = !!taskToEdit;
    
    // Estados del formulario
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [description, setDescription] = useState(taskToEdit?.description || '');
    const [dueDate, setDueDate] = useState(taskToEdit?.due_date ? new Date(taskToEdit.due_date).toISOString().split('T')[0] : '');
    const [priority, setPriority] = useState(taskToEdit?.priority || 'normal');
    const [selectedTags, setSelectedTags] = useState(taskToEdit?.tags.map(t => t.id) || []);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Cargar etiquetas al iniciar si aún no están cargadas
    useEffect(() => {
        if (tags.length === 0) {
            fetchTags();
        }
    }, [tags.length, fetchTags]);

    // Función de manejo de etiquetas
    const handleTagChange = (tagId) => {
        const id = parseInt(tagId);
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter(t => t !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!title.trim()) {
            setError('El título de la tarea es obligatorio.');
            return;
        }

        setLoading(true);
        try {
            const taskData = {
                title: title.trim(),
                description: description.trim(),
                due_date: dueDate || null,
                priority: priority,
                tag_ids: selectedTags, 
            };

            if (isEditing) {
                // Editar tarea
                await updateTask(taskToEdit.id, taskData);
            } else {
                // Crear tarea
                await addTask(taskData);
            }
            
            setLoading(false);
            onClose(); // Cerrar modal al completar
            
        } catch (err) {
            setError(`Error al ${isEditing ? 'actualizar' : 'crear'} la tarea.`);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <h2>{isEditing ? 'Editar Tarea' : 'Crear Nueva Tarea'}</h2>
            
            {error && <p className="form-error">{error}</p>}
            
            <div className="form-group">
                <label htmlFor="title">Título</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Escribe el título de la tarea"
                    maxLength="100"
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="description">Descripción (Opcional)</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles y notas adicionales"
                />
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="dueDate"><FaCalendarAlt /> Fecha Límite</label>
                    <input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="priority"><FaStar /> Prioridad</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="baja">Baja</option>
                        <option value="normal">Normal</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                    </select>
                </div>
            </div>

            <div className="form-group tag-selection">
                <label><FaTag /> Etiquetas</label>
                <div className="tag-checkboxes">
                    {tags.length > 0 ? (
                        tags.map(tag => (
                            <div key={tag.id} className="tag-option">
                                <input
                                    type="checkbox"
                                    id={`tag-${tag.id}`}
                                    value={tag.id}
                                    checked={selectedTags.includes(tag.id)}
                                    onChange={(e) => handleTagChange(e.target.value)}
                                />
                                <label htmlFor={`tag-${tag.id}`}>{tag.name}</label>
                            </div>
                        ))
                    ) : (
                        <p className="no-tags-message">No hay etiquetas disponibles. Ve a Configuración para crear una.</p>
                    )}
                </div>
            </div>

            <button type="submit" className="btn-primary task-submit-btn" disabled={loading}>
                {loading ? 'Guardando...' : (
                    isEditing ? <><FaSave /> Guardar Cambios</> : <><FaPlus /> Crear Tarea</>
                )}
            </button>
        </form>
    );
};

export default TaskForm;