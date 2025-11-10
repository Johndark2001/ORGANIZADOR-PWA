// frontend/src/pages/Kanban.jsx
import React, { useMemo, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from '../components/TaskItem';
import './Kanban.css'; // Estilos específicos

// -----------------------------------------------------------
// Componente de Columna Kanban
// -----------------------------------------------------------

const KanbanColumn = ({ status, title, tasks, updateTask }) => {
    
    // Función para manejar el cambio de estado (simulando Drag and Drop)
    const handleMoveTask = useCallback(async (taskId, newStatus) => {
        try {
            await updateTask(taskId, { status: newStatus, completed: newStatus === 'completed' });
        } catch (error) {
            alert(`Error al mover la tarea: ${error.message}`);
        }
    }, [updateTask]);
    
    // Función para renderizar botones de movimiento
    const renderMoveButtons = (task) => {
        switch (status) {
            case 'pending':
                return (
                    <button 
                        onClick={() => handleMoveTask(task.id, 'in_progress')}
                        className="btn-kanban-move"
                    >
                        Iniciar
                    </button>
                );
            case 'in_progress':
                return (
                    <>
                        <button 
                            onClick={() => handleMoveTask(task.id, 'pending')}
                            className="btn-kanban-move btn-undo-kanban"
                        >
                            Pausar
                        </button>
                        <button 
                            onClick={() => handleMoveTask(task.id, 'completed')}
                            className="btn-kanban-move btn-complete-kanban"
                        >
                            Finalizar
                        </button>
                    </>
                );
            case 'completed':
                return (
                    <button 
                        onClick={() => handleMoveTask(task.id, 'pending')}
                        className="btn-kanban-move btn-undo-kanban"
                    >
                        Reabrir
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`kanban-column column-${status}`}>
            <h2 className="kanban-title">{title} ({tasks.length})</h2>
            <div className="kanban-task-list">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className="kanban-task-wrapper">
                            <TaskItem task={task} />
                            <div className="task-move-actions">
                                {renderMoveButtons(task)}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-tasks">Añade tareas a esta columna.</p>
                )}
            </div>
        </div>
    );
};


// -----------------------------------------------------------
// Componente de Página Kanban
// -----------------------------------------------------------

function Kanban() {
    const { tasks, loading, error, updateTask } = useTasks();

    const columnDefinitions = useMemo(() => ([
        { status: 'pending', title: '🔴 Pendiente' },
        { status: 'in_progress', title: '🟡 En Progreso' },
        { status: 'completed', title: '🟢 Completada' },
    ]), []);

    // Agrupar tareas por estado (status)
    const groupedTasks = useMemo(() => {
        const groups = { pending: [], in_progress: [], completed: [] };
        
        // El estado 'completed' aquí incluye solo las tareas con status='completed'
        // que son las que queremos en esta columna, independientemente de la flag 'completed'
        tasks.forEach(task => {
            if (groups[task.status]) {
                 // Las tareas se ordenan por due_date (o created_at si no hay due_date)
                 groups[task.status].push(task);
            }
        });
        
        return groups;
    }, [tasks]);
    
    // Lógica de ordenación para cada grupo (opcional, pero mejora la UX)
    Object.keys(groupedTasks).forEach(status => {
        groupedTasks[status].sort((a, b) => {
            const dateA = a.due_date ? new Date(a.due_date).getTime() : new Date(a.created_at).getTime();
            const dateB = b.due_date ? new Date(b.due_date).getTime() : new Date(b.created_at).getTime();
            return dateA - dateB;
        });
    });


    if (loading) return <p className="loading-state">Cargando el tablero Kanban...</p>;
    if (error) return <p className="form-error">❌ Error al cargar las tareas: {error}.</p>;

    return (
        <div className="kanban-page">
            <h1 className="page-header">📊 Tablero Kanban</h1>
            <p style={{ marginBottom: '30px', color: '#6c757d' }}>
                Arrastra y suelta (o usa los botones) para cambiar el estado de tus tareas.
            </p>

            <div className="kanban-board">
                {columnDefinitions.map(col => (
                    <KanbanColumn
                        key={col.status}
                        status={col.status}
                        title={col.title}
                        tasks={groupedTasks[col.status] || []}
                        updateTask={updateTask} // Pasa la función de actualización
                    />
                ))}
            </div>
        </div>
    );
}

export default Kanban;