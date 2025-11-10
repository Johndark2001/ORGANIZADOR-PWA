// frontend/src/components/AddTaskModal.jsx
import React, { useState } from 'react';
import './AddTaskModal.css';
import { IoCloseOutline } from 'react-icons/io5';

/**
 * Modal para añadir una nueva tarea.
 * @param {boolean} isOpen - Controla si el modal es visible.
 * @param {function} onClose - Función para cerrar el modal.
 */
const AddTaskModal = ({ isOpen, onClose }) => {
    // Estado inicial del formulario
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        category: 'Personal',
        priority: 'medium', // Por defecto a prioridad media
    });

    // Maneja los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Maneja el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // 🚨 TO DO: Integrar con TaskContext para llamar a addTask(formData)
        console.log("Nueva tarea enviada:", formData);
        
        // Simular el cierre y reseteo del formulario
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            category: 'Personal',
            priority: 'medium',
        });
        onClose(); 
    };

    // Si el modal no está abierto, no renderizar nada
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                {/* Encabezado del Modal */}
                <div className="modal-header">
                    <h2>Añadir Nueva Tarea</h2>
                    <button className="close-btn" onClick={onClose}>
                        <IoCloseOutline size={28} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="task-form">
                    
                    {/* Título de la tarea */}
                    <div className="form-group">
                        <label htmlFor="title">Título de la Tarea</label>
                        <input
                            id="title"
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Terminar informe mensual"
                        />
                    </div>

                    {/* Descripción */}
                    <div className="form-group">
                        <label htmlFor="description">Descripción (Opcional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Detalles sobre la tarea..."
                        />
                    </div>

                    {/* Fecha y Categoría (en una fila) */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dueDate">Fecha de Vencimiento</label>
                            <input
                                id="dueDate"
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Categoría</label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Personal">Personal</option>
                                <option value="Trabajo">Trabajo</option>
                                <option value="Estudios">Estudios</option>
                                <option value="Salud">Salud</option>
                                {/* Puedes añadir más categorías aquí */}
                            </select>
                        </div>
                    </div>

                    {/* Prioridad */}
                    <div className="form-group">
                        <label htmlFor="priority">Prioridad</label>
                        <div className="priority-options">
                            <label className={`priority-label ${formData.priority === 'high' ? 'selected-high' : ''}`}>
                                <input type="radio" name="priority" value="high" checked={formData.priority === 'high'} onChange={handleChange} />
                                Alta
                            </label>
                            <label className={`priority-label ${formData.priority === 'medium' ? 'selected-medium' : ''}`}>
                                <input type="radio" name="priority" value="medium" checked={formData.priority === 'medium'} onChange={handleChange} />
                                Media
                            </label>
                            <label className={`priority-label ${formData.priority === 'low' ? 'selected-low' : ''}`}>
                                <input type="radio" name="priority" value="low" checked={formData.priority === 'low'} onChange={handleChange} />
                                Baja
                            </label>
                        </div>
                    </div>

                    {/* Botón de Guardar */}
                    <button type="submit" className="save-task-btn btn-primary">
                        Guardar Tarea
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddTaskModal;