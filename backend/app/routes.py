# backend/app/routes.py
from flask import Blueprint, request, jsonify
from app import db
from app.models import Task, Tag, PomodoroSession
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

# Nuevo Blueprint para las rutas principales (tareas, etiquetas, etc.)
main_bp = Blueprint('main', __name__)

# --- RUTAS DE TAREAS (Tasks) --- [cite: 11, 63]

@main_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    """Crea una nueva tarea."""
    user_id = get_jwt_identity() # Obtiene el ID del usuario desde el token JWT
    data = request.get_json()

    if not data.get('title'):
        return jsonify({"msg": "El título es requerido"}), 400

    new_task = Task(
        title=data['title'],
        description=data.get('description'),
        due_date=datetime.fromisoformat(data['due_date']) if data.get('due_date') else None,
        eisenhower_quadrant=data.get('eisenhower_quadrant', 'ni_urgente_ni_importante'),
        status=data.get('status', 'pending'),
        user_id=user_id
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(new_task.to_dict()), 201

@main_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    """Obtiene todas las tareas del usuario logueado."""
    user_id = get_jwt_identity()
    # Filtra tareas solo del usuario autenticado [cite: 14]
    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.created_at.desc()).all()
    return jsonify([task.to_dict() for task in tasks]), 200

@main_bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Actualiza una tarea existente (editar, marcar completada, cambiar estado)."""
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)

    # Verifica que la tarea pertenezca al usuario [cite: 59]
    if task.user_id != user_id:
        return jsonify({"msg": "No autorizado"}), 403

    data = request.get_json()
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.completed = data.get('completed', task.completed)
    task.status = data.get('status', task.status)
    task.eisenhower_quadrant = data.get('eisenhower_quadrant', task.eisenhower_quadrant)
    
    if data.get('due_date'):
        task.due_date = datetime.fromisoformat(data['due_date'])
    
    # Manejo de asignación de etiquetas [cite: 33]
    if 'tags_ids' in data:
        task.tags.clear()
        for tag_id in data['tags_ids']:
            tag = Tag.query.filter_by(id=tag_id, user_id=user_id).first()
            if tag:
                task.tags.append(tag)
    
    db.session.commit()
    return jsonify(task.to_dict()), 200

@main_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Elimina una tarea."""
    user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)

    if task.user_id != user_id:
        return jsonify({"msg": "No autorizado"}), 403
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({"msg": "Tarea eliminada"}), 200

# --- RUTAS DE ETIQUETAS (Tags) --- [cite: 31, 63]

@main_bp.route('/tags', methods=['POST'])
@jwt_required()
def create_tag():
    """Crea una nueva etiqueta."""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({"msg": "El nombre es requerido"}), 400
    
    # Verifica si la etiqueta ya existe para este usuario
    existing_tag = Tag.query.filter_by(name=data['name'], user_id=user_id).first()
    if existing_tag:
        return jsonify({"msg": "La etiqueta ya existe"}), 409
    
    new_tag = Tag(name=data['name'], user_id=user_id)
    db.session.add(new_tag)
    db.session.commit()
    return jsonify(new_tag.to_dict()), 201

@main_bp.route('/tags', methods=['GET'])
@jwt_required()
def get_tags():
    """Obtiene todas las etiquetas del usuario."""
    user_id = get_jwt_identity()
    tags = Tag.query.filter_by(user_id=user_id).all()
    return jsonify([tag.to_dict() for tag in tags]), 200

@main_bp.route('/tags/<int:tag_id>', methods=['DELETE'])
@jwt_required()
def delete_tag(tag_id):
    """Elimina una etiqueta."""
    user_id = get_jwt_identity()
    tag = Tag.query.get_or_404(tag_id)
    if tag.user_id != user_id:
        return jsonify({"msg": "No autorizado"}), 403
    
    db.session.delete(tag)
    db.session.commit()
    return jsonify({"msg": "Etiqueta eliminada"}), 200

# --- RUTAS DE MÉTRICAS (Pomodoro) --- [cite: 26, 53]

@main_bp.route('/pomodoro-sessions', methods=['POST'])
@jwt_required()
def log_pomodoro_session():
    """Registra un ciclo Pomodoro completado."""
    user_id = get_jwt_identity()
    data = request.get_json()
    duration = data.get('duration', 25) # Default 25 min [cite: 23]
    
    session = PomodoroSession(user_id=user_id, duration=duration)
    db.session.add(session)
    db.session.commit()
    return jsonify({"msg": "Sesión Pomodoro registrada"}), 201