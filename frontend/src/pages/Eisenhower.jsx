// frontend/src/pages/Eisenhower.jsx
import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import './Eisenhower.css';

// -----------------------------------------------------------
// Componente de Cuadrante Eisenhower
// -----------------------------------------------------------

const Quadrant = ({ quadrantKey, title, tasks, color }) => {
    return (
        <div className={`eisenhower-quadrant quadrant-${quadrantKey}`} style={{ backgroundColor: color }}>
            <h2 className="quadrant-title">{title} ({tasks.length})</h2>
            <div className="quadrant-task-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            // Ocultamos la barra de color izquierda ya que el fondo ya es de color
                            isEisenhowerView={true} 
                        />
                    ))
                ) : (
                    <p className="no-tasks">¡Vacío! Buen trabajo o no hay tareas en este cuadrante.</p>
                )}
            </div>
        </div>
    );
};


// -----------------------------------------------------------
// Componente de Página Eisenhower
// -----------------------------------------------------------

function Eisenhower() {
    const { tasks, loading, error } = useTasks();

    const quadrants = useMemo(() => ([
        { 
            key: 'urgente_importante', 
            title: 'HACER - Urgente e Importante', 
            description: 'Crisis, problemas inminentes, proyectos con fecha de vencimiento.',
            color: 'var(--color-eisenhower-rojo)' // Rojo
        },
        { 
            key: 'importante_no_urgente', 
            title: 'PROGRAMAR - Importante, No Urgente', 
            description: 'Prevención, planificación, construcción de relaciones, nuevas oportunidades.',
            color: 'var(--color-eisenhower-amarillo)' // Amarillo
        },
        { 
            key: 'urgente_no_importante', 
            title: 'DELEGAR - Urgente, No Importante', 
            description: 'Interrupciones, algunas reuniones, algunas actividades populares.',
            color: 'var(--color-eisenhower-azul)' // Azul
        },
        { 
            key: 'ni_urgente_ni_importante', 
            title: 'ELIMINAR - Ni Urgente ni Importante', 
            description: 'Trivialidades, algunas llamadas, pérdida de tiempo y ocio excesivo.',
            color: 'var(--color-eisenhower-verde)' // Verde
        },
    ]), []);

    // Agrupar tareas por cuadrante
    const groupedTasks = useMemo(() => {
        const groups = quadrants.reduce((acc, q) => ({ ...acc, [q.key]: [] }), {});

        // Filtrar solo tareas pendientes (no completadas)
        tasks.filter(t => !t.completed).forEach(task => {
            const key = task.eisenhower_quadrant || 'ni_urgente_ni_importante';
            if (groups[key]) {
                 groups[key].push(task);
            }
        });
        
        // Ordenar las tareas dentro de cada cuadrante por fecha de vencimiento
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
                const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
                return dateA - dateB;
            });
        });

        return groups;
    }, [tasks, quadrants]);


    if (loading) return <p className="loading-state">Cargando la matriz Eisenhower...</p>;
    if (error) return <p className="form-error">❌ Error al cargar las tareas: {error}.</p>;

    return (
        <div className="eisenhower-page">
            <h1 className="page-header">⚔️ Matriz Eisenhower</h1>
            <p className="eisenhower-description">
                Organiza tus tareas según su **Urgencia** e **Importancia** para maximizar la productividad.
            </p>
            
            <div className="eisenhower-grid">
                {quadrants.map(q => (
                    <Quadrant
                        key={q.key}
                        quadrantKey={q.key}
                        title={q.title}
                        tasks={groupedTasks[q.key] || []}
                        color={q.color}
                    />
                ))}
            </div>
            
            <div className="legend">
                {/* Se puede añadir una leyenda más detallada aquí si es necesario */}
            </div>
        </div>
    );
}

export default Eisenhower;