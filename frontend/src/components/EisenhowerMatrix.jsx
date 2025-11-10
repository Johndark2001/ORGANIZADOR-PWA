// frontend/src/components/EisenhowerMatrix.jsx
import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem'; 
import './EisenhowerMatrix.css'; // Crearemos este CSS a continuación

// Componente para un Cuadrante de la Matriz (simulando la zona de 'drop')
const EisenhowerQuadrant = ({ quadrant, title, description, tasks, updateTaskQuadrant }) => {
    // FUNCIÓN DE SIMULACIÓN D&D
    const handleDropSimulation = (e) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
             updateTaskQuadrant(parseInt(taskId), quadrant);
        }
    };
    
    const handleDragOver = (e) => {
        e.preventDefault(); // Necesario para permitir que el evento onDrop se dispare
    };

    return (
        <div 
            className={`eisenhower-quadrant quadrant-${quadrant}`}
            onDragOver={handleDragOver}
            onDrop={handleDropSimulation}
        >
            <h3>{title}</h3>
            <p className="quadrant-description">{description}</p>
            <div className={`quadrant-body`}>
                {tasks.map(task => (
                    // El contenedor de la tarea es arrastrable
                    <div 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => {
                            e.dataTransfer.setData("taskId", task.id.toString());
                        }}
                        className="draggable-task"
                    >
                        <TaskItem task={task} isMatrix={true} /> 
                    </div>
                ))}
                {!tasks.length && (
                    <p className="empty-quadrant-message">Arrastra tareas aquí.</p>
                )}
            </div>
        </div>
    );
};


function EisenhowerMatrix() {
    const { tasks, loading, error, editTask } = useTasks();
    
    // Definición estática de los cuatro cuadrantes
    const quadrants = useMemo(() => ([
        { status: 'urgente_importante', title: '1. Urgente e Importante (HACER)', description: 'Crisis, problemas, proyectos con fecha límite.', color: 'var(--color-eisenhower-1)' },
        { status: 'importante_no_urgente', title: '2. Importante, No Urgente (PLANIFICAR)', description: 'Prevención, planificación, nuevas oportunidades.', color: 'var(--color-eisenhower-2)' },
        { status: 'urgente_no_importante', title: '3. Urgente, No Importante (DELEGAR)', description: 'Interrupciones, llamadas, algunas reuniones.', color: 'var(--color-eisenhower-3)' },
        { status: 'ni_urgente_ni_importante', title: '4. Ni Urgente ni Importante (ELIMINAR)', description: 'Pérdida de tiempo, trivialidades, ocio excesivo.', color: 'var(--color-eisenhower-4)' },
    ]), []);

    // Agrupa las tareas por cuadrante. Solo mostramos tareas NO completadas.
    const groupedTasks = useMemo(() => {
        const groups = quadrants.reduce((acc, q) => ({ ...acc, [q.status]: [] }), {});
        
        tasks.filter(t => !t.completed).forEach(task => {
            const quadrantKey = groups[task.eisenhower_quadrant] ? task.eisenhower_quadrant : 'ni_urgente_ni_importante';
            groups[quadrantKey].push(task);
        });
        
        return groups;
    }, [tasks, quadrants]);
    
    
    // Lógica para actualizar el cuadrante de la tarea en la API
    const updateTaskQuadrant = async (taskId, newQuadrant) => {
        await editTask(taskId, { eisenhower_quadrant: newQuadrant });
    };

    if (loading) return <p>Cargando Matriz Eisenhower...</p>;
    if (error) return <p className="form-error">Error al cargar tareas para la matriz.</p>;
    
    return (
        <div className="eisenhower-matrix-container">
            <p className="matrix-disclaimer">
                *Arrastra las tareas entre los cuadrantes para reasignar su prioridad.
                Solo se muestran tareas pendientes.
            </p>
            <div className="matrix-grid">
                {quadrants.map(quadrant => (
                    <EisenhowerQuadrant
                        key={quadrant.status}
                        quadrant={quadrant.status}
                        title={quadrant.title}
                        description={quadrant.description}
                        tasks={groupedTasks[quadrant.status] || []}
                        updateTaskQuadrant={updateTaskQuadrant}
                    />
                ))}
            </div>
        </div>
    );
}

export default EisenhowerMatrix;