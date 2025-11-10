// frontend/src/components/Modal.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';
import './Modal.css';

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    // Detener la propagación del evento para que hacer clic en el contenido no cierre el modal
    const handleContentClick = (e) => {
        e.stopPropagation();
    };

    return (
        // onClick en el overlay para cerrar el modal
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={handleContentClick}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button onClick={onClose} className="close-button">
                        <FaTimes />
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;