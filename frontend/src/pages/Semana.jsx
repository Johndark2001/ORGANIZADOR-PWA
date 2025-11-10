// frontend/src/pages/Semana.jsx
import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import './Semana.css';

// Función de utilidad: Comprueba si una fecha cae en la próxima semana (hoy + 6 días)
const isWithinNextWeek = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7); // Hoy + 7 días

    // Ignora la hora para la comparación de la fecha
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    nextWeek.setHours(0, 0, 0, 0);

    // Debe ser hoy o después, y antes de la fecha de la próxima semana
    return date >= today && date < nextWeek;
};

// Función de utilidad para obtener el nombre del día y formatear la fecha
const getDayLabel = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = dateToCheck.getTime() === today.getTime();
    const isTomorrow = dateToCheck.getTime() === tomorrow.getTime();

    if (isToday) return 'Hoy';
    if (isTomorrow) return 'Mañana';

    const dayName = dateToCheck.toLocaleDateString('es-ES', { weekday: 'long' });
    const formattedDate = dateToCheck.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${formattedDate}`;
};

function Semana() {
    const { tasks, loading, error, fetchTasks } = useTasks();

    // 1. Filtrar y agrupar tareas para la semana
    const weeklyTasks = useMemo(() => {
        // Objeto para almacenar tareas agrupadas por día (etiqueta de fecha)
        const grouped = {};
        
        // Filtrar tareas que vencen en la próxima semana (incluyendo hoy) y no están completadas
        tasks.filter(task => !task.completed && task.due_date && isWithinNextWeek(task.due_date))
            .forEach(task => {
                // Usar solo la parte de la fecha para la agrupación (YYYY-MM-DD)
                const dateKey = new Date(task.due_date).toISOString().split('T')[0];
                
                if (!grouped[dateKey]) {
                    grouped[dateKey] = {
                        label: getDayLabel(task.due_date),
                        tasks: []
                    };
                }
                grouped[dateKey].tasks.push(task);
            });
            
        // Convertir el objeto a un array de grupos y ordenar por fecha (clave)
        const sortedGroups = Object.keys(grouped)
            .sort() // Ordenar por YYYY-MM-DD
            .map(key => grouped[key]);

        return sortedGroups;
    }, [tasks]);


    if (loading) return <p className="loading-state">Cargando tu planificación semanal...</p>;
    if (error) return (
        <div className="error-state">
            <p className="form-error">❌ Error al cargar la semana: {error}.</p>
            <button className="btn-secondary" onClick={fetchTasks}>Reintentar Carga</button>
        </div>
    );
    
    return (
        <div className="semana-page">
            <h1 className="page-header">🗓️ Planificación Semanal</h1>
            <p className="summary-text">Tareas programadas para los próximos 7 días, organizadas por fecha de vencimiento.</p>
            
            <div className="weekly-task-groups">
                {weeklyTasks.length > 0 ? (
                    weeklyTasks.map(dayGroup => (
                        <div key={dayGroup.label} className="day-group">
                            <h2 className="day-group-header">{dayGroup.label} ({dayGroup.tasks.length})</h2>
                            <div className="day-task-list">
                                {dayGroup.tasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                                    .map(task => (
                                        <TaskItem 
                                            key={task.id} 
                                            task={task} 
                                        />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-tasks-message">
                        <span role="img" aria-label="sun">☀️</span> ¡Tu semana está libre! Añade algunas tareas con fecha de vencimiento.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Semana;