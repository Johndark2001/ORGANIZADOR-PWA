// frontend/src/components/KanbanBoard.jsx
import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import TaskItem from './TaskItem'; 
import './KanbanBoard.css';

// Componente para una columna Kanban (simulando la zona de 'drop')
const KanbanColumn = ({ status, title, tasks, updateTaskStatus }) => {
    // FUNCIÓN DE SIMULACIÓN D&D
    const handleDropSimulation = (e) => {
        e.preventDefault();
        // Obtiene el ID de la tarea arrastrada, que se guardó en onDragStart
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
             updateTaskStatus(parseInt(taskId), status);
        }
    };
    
    const handleDragOver = (e) => {
        e.preventDefault(); // Necesario para permitir que el evento onDrop se dispare
    };

    return (
        <div 
            className={`kanban-column status-${status}`}
            onDragOver={handleDragOver}
            onDrop={handleDropSimulation}
        >
            <h3>{title} ({tasks.length})</h3>
            <div className={`column-body status-${status}`}>
                {tasks.map(task => (
                    // El contenedor de la tarea es arrastrable
                    <div 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => {
                            // Guarda el ID de la tarea para pasarlo en el drop
                            e.dataTransfer.setData("taskId", task.id.toString());
                        }}
                    >
                        {/* Reutilizamos TaskItem, indicando que es para Kanban */}
                        <TaskItem task={task} isKanban={true} /> 
                    </div>
                ))}
                {!tasks.length && (
                    <p className="empty-column-message">Arrastra tareas aquí o crea una nueva.</p>
                )}
            </div>
        </div>
    );
};


function KanbanBoard() {
    const { tasks, loading, error, editTask } = useTasks();
    
    // Definición estática de las columnas
    const columns = useMemo(() => ([
        { status: 'pending', title: '🔴 Pendiente' },
        { status: 'in_progress', title: '🟡 En Progreso' },
        { status: 'done', title: '🟢 Completada' },
    ]), []);

    // Agrupa las tareas por estado (incluyendo las completadas en 'done')
    const groupedTasks = useMemo(() => {
        const groups = columns.reduce((acc, col) => ({ ...acc, [col.status]: [] }), {});
        
        tasks.forEach(task => {
            // Si la tarea está marcada como completada, se fuerza a la columna 'done'
            const statusKey = task.completed ? 'done' : (groups[task.status] ? task.status : 'pending');
            groups[statusKey].push(task);
        });
        
        return groups;
    }, [tasks, columns]);
    
    
    // Lógica para actualizar el estado de la tarea en la API
    const updateTaskStatus = async (taskId, newStatus) => {
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;
        
        let updateData = { status: newStatus };

        // Si se mueve a 'done', también marca el checkbox 'completed'
        if (newStatus === 'done') {
            updateData.completed = true;
        } 
        // Si se mueve fuera de 'done' y estaba marcada, la desmarca
        else if (taskToUpdate.completed) {
            updateData.completed = false;
        }

        await editTask(taskId, updateData);
    };

    if (loading) return <p>Cargando tablero Kanban...</p>;
    if (error) return <p className="form-error">Error al cargar tareas para el tablero.</p>;
    
    return (
        <div className="kanban-board-container">
            <p className="kanban-disclaimer">
                *Nota: Este tablero simula la funcionalidad de **arrastrar y soltar** (Drag and Drop). 
                En una app real de React, se usaría una librería (ej. `dnd-kit`). 
                **Arrastra una tarea a una columna** para simular el cambio de estado.
            </p>
            <div className="kanban-grid">
                {columns.map(column => (
                    <KanbanColumn
                        key={column.status}
                        status={column.status}
                        title={column.title}
                        tasks={groupedTasks[column.status] || []}
                        updateTaskStatus={updateTaskStatus}
                    />
                ))}
            </div>
        </div>
    );
}

export default KanbanBoard;