// frontend/src/components/PomodoroTimer.jsx
import React, { useState, useEffect, useRef } from 'react';
import './PomodoroTimer.css';

// Tiempos por defecto (según especificaciones, 25 minutos)
const WORK_TIME_SECONDS = 25 * 60; // 25 minutos
const SHORT_BREAK_SECONDS = 5 * 60;  // 5 minutos
const LONG_BREAK_SECONDS = 15 * 60; // 15 minutos

// Estados del temporizador
const MODES = {
    WORK: 'work',
    SHORT_BREAK: 'shortBreak',
    LONG_BREAK: 'longBreak',
};

function PomodoroTimer() {
    const [mode, setMode] = useState(MODES.WORK);
    const [secondsLeft, setSecondsLeft] = useState(WORK_TIME_SECONDS);
    const [isActive, setIsActive] = useState(false);
    const [cyclesCompleted, setCyclesCompleted] = useState(0); // Ciclos de trabajo completados
    
    // Referencia para mantener el ID del intervalo del temporizador
    const timerRef = useRef(null);

    // Función para obtener el tiempo objetivo del modo actual
    const getModeTime = (currentMode) => {
        switch (currentMode) {
            case MODES.SHORT_BREAK:
                return SHORT_BREAK_SECONDS;
            case MODES.LONG_BREAK:
                return LONG_BREAK_SECONDS;
            case MODES.WORK:
            default:
                return WORK_TIME_SECONDS;
        }
    };
    
    // Función para cambiar al siguiente modo automáticamente
    const switchMode = () => {
        let newMode;
        let newCycles = cyclesCompleted;
        
        if (mode === MODES.WORK) {
            newCycles += 1;
            // Después de 4 ciclos de trabajo, el siguiente es un descanso largo
            newMode = (newCycles % 4 === 0) ? MODES.LONG_BREAK : MODES.SHORT_BREAK;
            setCyclesCompleted(newCycles);
            alert(`¡Ciclo de Trabajo #${newCycles} completado! A tomar un descanso.`);
        } else {
            // Después de cualquier descanso, vuelve al trabajo
            newMode = MODES.WORK;
            alert(`¡Descanso terminado! Es hora de volver al trabajo.`);
        }
        
        // Resetear el estado y tiempo para el nuevo modo
        setMode(newMode);
        setSecondsLeft(getModeTime(newMode));
        setIsActive(true); // Inicia automáticamente el nuevo modo
    };

    // --- Lógica del Temporizador (useEffect) ---
    useEffect(() => {
        // Detiene y limpia cualquier intervalo anterior
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (isActive && secondsLeft > 0) {
            // Crea un nuevo intervalo
            timerRef.current = setInterval(() => {
                setSecondsLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (isActive && secondsLeft === 0) {
            // El tiempo terminó, suena una alarma (simulada)
            console.log("Tiempo terminado. Cambiando de modo.");
            
            // Llama a la función de cambio de modo
            switchMode();
        }

        // Función de limpieza que se ejecuta al desmontar o antes de re-ejecutar el useEffect
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isActive, secondsLeft, mode]); 
    // Dependencias: el efecto se ejecuta cuando cualquiera de estas cambie

    // --- Controladores de Botones ---

    const handleStartPause = () => {
        setIsActive(prev => !prev);
    };

    const handleReset = () => {
        // Pausa
        setIsActive(false);
        // Regresa el tiempo al valor inicial del modo actual
        setSecondsLeft(getModeTime(mode));
    };

    const handleSkip = (newMode) => {
        // Detiene el temporizador
        setIsActive(false);
        // Cambia el modo
        setMode(newMode);
        // Reinicia el tiempo para el nuevo modo
        setSecondsLeft(getModeTime(newMode));
    };
    
    // --- Formato de Visualización ---
    
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    const formattedTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Estilos dinámicos basados en el modo
    const timerClass = mode.split(/(?=[A-Z])/).join('-').toLowerCase(); // work-time, short-break, long-break
    const buttonText = isActive ? 'PAUSAR' : 'INICIAR';

    return (
        <div className="pomodoro-container">
            <div className="pomodoro-header">
                <button 
                    onClick={() => handleSkip(MODES.WORK)} 
                    className={`mode-button ${mode === MODES.WORK ? 'active' : ''}`}
                >
                    Foco
                </button>
                <button 
                    onClick={() => handleSkip(MODES.SHORT_BREAK)} 
                    className={`mode-button ${mode === MODES.SHORT_BREAK ? 'active' : ''}`}
                >
                    Descanso Corto
                </button>
                <button 
                    onClick={() => handleSkip(MODES.LONG_BREAK)} 
                    className={`mode-button ${mode === MODES.LONG_BREAK ? 'active' : ''}`}
                >
                    Descanso Largo
                </button>
            </div>

            <div className={`pomodoro-display ${timerClass}`}>
                <div className="timer-text">{formattedTime}</div>
            </div>
            
            <div className="pomodoro-controls">
                <button 
                    onClick={handleStartPause} 
                    className={`control-button btn-${isActive ? 'pause' : 'start'}`}
                >
                    {buttonText}
                </button>
                <button 
                    onClick={handleReset} 
                    className="control-button btn-reset"
                >
                    <span className="reset-icon">🔄</span> REINICIAR
                </button>
            </div>
            
            <div className="pomodoro-info">
                <p>Ciclos de Trabajo Completados: <span className="cycle-count">{cyclesCompleted}</span></p>
                <p>Modo Actual: <span className="current-mode">{mode.toUpperCase().replace('_', ' ')}</span></p>
            </div>
        </div>
    );
}

export default PomodoroTimer;
