// frontend/src/components/BubblesBackground.jsx
import React from 'react';

const BubblesBackground = () => {
    // Generamos un número fijo de burbujas
    const numberOfBubbles = 15; 
    const bubbles = Array.from({ length: numberOfBubbles }).map((_, index) => {
        // Posiciones y tamaños aleatorios para variedad
        // 🔑 CLAVE PARA TAMAÑO: Hacemos las burbujas más grandes (ej. 50px a 150px)
        const size = Math.random() * 100 + 50; // Tamaño entre 50px y 150px
        const left = Math.random() * 100; // Posición horizontal aleatoria
        const delay = Math.random() * 10; // Retraso de animación aleatorio
        const duration = Math.random() * 10 + 10; // Duración de animación entre 10s y 20s

        return (
            <div 
                key={index} 
                className="bubble"
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`
                }}
            ></div>
        );
    });

    return (
        <div className="bubbles">
            {bubbles}
        </div>
    );
};

export default BubblesBackground;