// frontend/src/components/TaskItem.jsx
import React from 'react';
import './TaskItem.css';
import { FaRegClock, FaTag, FaCheckCircle, FaCircle } from 'react-icons/fa';

/**
 * Componente que muestra una sola tarjeta de tarea.
 * @param {object} task - El objeto de tarea con propiedades como title, dueDate, category, isCompleted.
 */
const TaskItem = ({ task }) => {
    // Determinar la clase de la tarjeta basada en el estado de completado
    const cardClass = task.isCompleted ? 'task-item completed' : 'task-item pending';

    // Formatear la fecha
    const formattedDate = task.dueDate 
        ? new Date(task.dueDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) 
        : 'Sin fecha';

    return (
        <div className={cardClass}>
            <div className="task-header">
                {/* Checkbox/Icono de estado */}
                <div className="task-status-icon">
                    {task.isCompleted ? (
                        <FaCheckCircle className="completed-icon" />
                    ) : (
                        <FaCircle className="pending-icon" onClick={() => console.log('Marcar como completada')} />
                    )}
                </div>

                {/* Título de la tarea */}
                <h3 className="task-title">{task.title}</h3>
                
                {/* Botón de acciones (temporal, para el futuro) */}
                <button className="task-options-btn">...</button>
            </div>

            <div className="task-details">
                {/* Fecha de vencimiento */}
                <span className="task-detail-item">
                    <FaRegClock className="icon-clock" />
                    {formattedDate}
                </span>

                {/* Categoría (Asumimos una propiedad category) */}
                {task.category && (
                    <span className="task-detail-item">
                        <FaTag className="icon-tag" />
                        {task.category}
                    </span>
                )}
            </div>

            {/* Simulación de una barra de color basada en el estado o prioridad (puedes ajustarla después) */}
            <div className={`task-priority-indicator priority-${task.priority || 'low'}`}></div>
        </div>
    );
};

export default TaskItem;