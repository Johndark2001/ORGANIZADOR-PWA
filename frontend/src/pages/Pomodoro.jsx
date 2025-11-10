// frontend/src/pages/Pomodoro.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaPlay, FaPause, FaRedo, FaForward, FaRegCheckCircle } from 'react-icons/fa';
import './Pomodoro.css';

// Constantes de tiempo por defecto (minutos)
const DEFAULT_WORK_TIME = 25;
const DEFAULT_SHORT_BREAK = 5;
const DEFAULT_LONG_BREAK = 15;
const CYCLES_BEFORE_LONG_BREAK = 4; // Un descanso largo cada 4 ciclos de trabajo

// -----------------------------------------------------------
// Componente de Temporizador Pomodoro
// -----------------------------------------------------------

function Pomodoro() {
    // 1. Configuración de Tiempos (se podría obtener de un contexto de Settings)
    const settings = useMemo(() => ({
        work: parseInt(localStorage.getItem('pomodoroWork')) || DEFAULT_WORK_TIME,
        shortBreak: parseInt(localStorage.getItem('pomodoroShortBreak')) || DEFAULT_SHORT_BREAK,
        longBreak: parseInt(localStorage.getItem('pomodoroLongBreak')) || DEFAULT_LONG_BREAK,
    }), []);
    
    // 2. Estados Principales
    const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
    const [isActive, setIsActive] = useState(false);
    const [cycleCount, setCycleCount] = useState(0); // Número de ciclos de trabajo completados
    const [sessionHistory, setSessionHistory] = useState([]); // [ {type: 'work', duration: 25, end: Date} ]

    // 3. Obtener el tiempo inicial basado en el modo
    const initialTime = useMemo(() => {
        switch (mode) {
            case 'work': return settings.work * 60;
            case 'shortBreak': return settings.shortBreak * 60;
            case 'longBreak': return settings.longBreak * 60;
            default: return settings.work * 60;
        }
    }, [mode, settings]);

    // Tiempo restante en segundos
    const [timeRemaining, setTimeRemaining] = useState(initialTime);

    // Actualiza el tiempo restante cuando cambia el modo
    useEffect(() => {
        setTimeRemaining(initialTime);
    }, [initialTime]);
    
    // 4. Lógica del Intervalo del Temporizador
    useEffect(() => {
        let interval = null;

        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prevTime => prevTime - 1);
            }, 1000);
        } else if (isActive && timeRemaining === 0) {
            // Tiempo terminado, pasar al siguiente modo
            clearInterval(interval);
            handleTimeEnd();
        } else if (!isActive && timeRemaining !== initialTime) {
            // Pausado
            clearInterval(interval);
        }

        // Limpiar el intervalo al desmontar o al detener
        return () => clearInterval(interval);
    }, [isActive, timeRemaining, initialTime]);


    // 5. Manejadores de Control
    
    const startPause = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setMode('work');
        setTimeRemaining(settings.work * 60);
    };

    const handleTimeEnd = useCallback(() => {
        const newHistoryItem = {
            type: mode,
            duration: initialTime / 60,
            end: new Date().toISOString()
        };
        
        // Registrar el ciclo de trabajo completado (solo si es modo 'work')
        if (mode === 'work') {
            setCycleCount(prevCount => prevCount + 1);
            alert(`¡Ciclo de Foco completado! Tómate un descanso. Llevas ${cycleCount + 1} ciclos.`);
            // Agregar a la historia
            setSessionHistory(prevHistory => [...prevHistory, newHistoryItem]);
            
            // Decidir si es descanso corto o largo
            if ((cycleCount + 1) % CYCLES_BEFORE_LONG_BREAK === 0) {
                setMode('longBreak');
            } else {
                setMode('shortBreak');
            }
        } else {
            // Si termina un descanso, siempre vuelve al trabajo
            setMode('work');
        }
        
        // Notificación de navegador (requiere permisos)
        if (Notification.permission === "granted") {
            new Notification(`¡Tiempo terminado! Es hora de ${mode === 'work' ? 'descansar' : 'volver al foco'}.`);
        }
        
        // Sonido de alerta (requiere un audio element)
        // new Audio('/path/to/alert.mp3').play();
        
        setIsActive(false); // Esperar que el usuario inicie el siguiente ciclo
    }, [mode, cycleCount, initialTime]);

    const skipMode = () => {
        setIsActive(false);
        if (mode === 'work') {
            setMode('shortBreak');
        } else {
            setMode('work');
        }
    };
    
    // 6. Formateo y Visualización
    
    const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
    const seconds = String(timeRemaining % 60).padStart(2, '0');
    const displayTime = `${minutes}:${seconds}`;

    // Título de la página para modo concentración
    useEffect(() => {
        document.title = `${displayTime} - Pomodoro`;
    }, [displayTime]);


    const getModeLabel = () => {
        switch (mode) {
            case 'work': return '🕒 MODO FOCO';
            case 'shortBreak': return '☕ DESCANSO CORTO';
            case 'longBreak': return '🏖️ DESCANSO LARGO';
            default: return '';
        }
    };

    // Solicitar permiso de notificación al montar
    useEffect(() => {
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }, []);


    return (
        <div className={`pomodoro-page pomodoro-mode-${mode}`}>
            <h1 className="page-header">🍅 Temporizador Pomodoro</h1>
            <p className="productivity-stats">
                Ciclos de Foco completados: **{cycleCount}**
            </p>

            <div className="timer-container">
                <div className="timer-mode-selector">
                    <button 
                        className={mode === 'work' ? 'active' : ''} 
                        onClick={() => setMode('work')}
                    >Foco ({settings.work} min)</button>
                    <button 
                        className={mode === 'shortBreak' ? 'active' : ''} 
                        onClick={() => setMode('shortBreak')}
                    >Descanso Corto ({settings.shortBreak} min)</button>
                    <button 
                        className={mode === 'longBreak' ? 'active' : ''} 
                        onClick={() => setMode('longBreak')}
                    >Descanso Largo ({settings.longBreak} min)</button>
                </div>

                <div className="timer-display">
                    <span className="mode-label">{getModeLabel()}</span>
                    <div className="time">{displayTime}</div>
                </div>

                <div className="timer-controls">
                    <button onClick={startPause} className="btn-primary">
                        {isActive ? <><FaPause /> PAUSA</> : <><FaPlay /> INICIAR</>}
                    </button>
                    <button onClick={resetTimer} className="btn-secondary" title="Reiniciar a Foco">
                        <FaRedo /> Reiniciar
                    </button>
                    <button onClick={skipMode} className="btn-secondary" title="Saltar al siguiente modo">
                        <FaForward /> Saltar
                    </button>
                </div>
            </div>
            
            {/* Historial de Sesiones (simplificado) */}
            <div className="session-history">
                <h2>Historial de Sesiones ({sessionHistory.length})</h2>
                {sessionHistory.length === 0 ? (
                    <p>No hay ciclos completados aún.</p>
                ) : (
                    <div className="history-list">
                        {sessionHistory.slice(-5).map((session, index) => (
                            <div key={index} className={`history-item history-item-${session.type}`}>
                                <FaRegCheckCircle />
                                <span>{session.type === 'work' ? 'Foco' : 'Descanso'}</span>
                                <span>{session.duration} min</span>
                                <span className="timestamp">{new Date(session.end).toLocaleTimeString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Pomodoro;