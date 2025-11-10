// frontend/src/pages/Hoy.jsx - MODIFICACIÓN
import React, { useState } from 'react'; // 👈 Importamos useState
import TaskItem from '../components/TaskItem'; 
import AddTaskModal from '../components/AddTaskModal'; // 👈 Importamos el Modal
import { IoAddCircle, IoFunnelOutline } from 'react-icons/io5'; 
import './Hoy.css'; 

/**
 * Componente de la página "Hoy".
 * Muestra las tareas programadas para el día actual.
 */
const Hoy = () => {
    // 🔑 CLAVE: Estado para controlar la visibilidad del modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sampleTasks = [
        // ... (Tus datos de tareas simulados permanecen igual) ...
        { 
            id: 1, 
            title: "Finalizar el diseño de la página Kanban", 
            dueDate: new Date(), 
            category: "Trabajo", 
            isCompleted: false, 
            priority: "high" 
        },
        { 
            id: 2, 
            title: "Revisar y responder los correos del proyecto X", 
            dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Mañana
            category: "Comunicaciones", 
            isCompleted: false, 
            priority: "medium" 
        },
        { 
            id: 3, 
            title: "Comprar ingredientes para la cena", 
            dueDate: new Date(), 
            category: "Personal", 
            isCompleted: true, 
            priority: "low" 
        },
        { 
            id: 4, 
            title: "Ejercicio de 30 minutos (running)", 
            dueDate: new Date(), 
            category: "Salud", 
            isCompleted: false, 
            priority: "medium" 
        },
    ];

    const today = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    return (
        <div className="hoy-container">
            {/* Encabezado de la página */}
            <header className="hoy-header">
                <div>
                    <h1 className="main-title">Hoy</h1>
                    <p className="subtitle">{today}</p>
                </div>
                <div className="action-buttons">
                    <button className="filter-btn" title="Filtrar tareas">
                        <IoFunnelOutline />
                    </button>
                    {/* 🔑 CLAVE: Abrir el modal al hacer clic */}
                    <button 
                        className="add-task-btn btn-primary" 
                        title="Añadir nueva tarea"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <IoAddCircle className="add-icon" />
                        Añadir Tarea
                    </button>
                </div>
            </header>

            {/* Contenido principal con la lista de tareas */}
            <div className="task-list-section">
                
                {/* ... (Secciones de tareas pendientes y completadas) ... */}
                <section className="pending-tasks">
                    <h2 className="section-title">Tareas Pendientes ({sampleTasks.filter(t => !t.isCompleted).length})</h2>
                    <div className="tasks-grid">
                        {sampleTasks
                            .filter(t => !t.isCompleted)
                            .map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                    </div>
                </section>

                <section className="completed-tasks">
                    <h2 className="section-title completed-title">Completadas ({sampleTasks.filter(t => t.isCompleted).length})</h2>
                    <div className="tasks-grid">
                        {sampleTasks
                            .filter(t => t.isCompleted)
                            .map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))}
                    </div>
                </section>

            </div>

            {/* 🔑 CLAVE: Renderizado del Modal */}
            <AddTaskModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};

export default Hoy;