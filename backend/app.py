# backend/app.py
import os
from datetime import datetime
from flask import Flask, request, jsonify, session, g
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from functools import wraps
from sqlalchemy import func
import re 
from sqlalchemy.sql.expression import delete

# ----------------------------------------------------
# 1. Configuración de la aplicación Flask
# ----------------------------------------------------
app = Flask(__name__)

# Configuración de la base de datos (SQLite)
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, 'organizador.db')

# Mejor práctica: Usar un valor por defecto si la variable de entorno no está definida
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'una_clave_secreta_fuerte_para_sesion_y_cifrado')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configuración de sesión (cookies) para el frontend en desarrollo
app.config['SESSION_COOKIE_SECURE'] = False # Usar False en HTTP (local)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' 
app.config['PERMANENT_SESSION_LIFETIME'] = 60 * 60 * 24 * 7 

# ----------------------------------------------------
# 2. Inicialización de Extensiones
# ----------------------------------------------------
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
# Permitir CORS desde el frontend (http://localhost:5173 en desarrollo)
# Ya estaba bien, pero lo reafirmo: supports_credentials=True es clave.
CORS(app, supports_credentials=True, origins=["http://localhost:5173"]) 


# ----------------------------------------------------
# 3. Modelos de Base de Datos
# ----------------------------------------------------

# Tabla de Asociación N:M para Tareas y Etiquetas
task_tags = db.Table('task_tags',
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False) 
    name = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = db.relationship('Task', backref='owner', lazy=True, cascade="all, delete-orphan")
    tags = db.relationship('Tag', backref='owner', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'user_id': self.user_id
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.String(50), default='pending') 
    # Añadiendo 'priority' para coincidir con el frontend
    priority = db.Column(db.String(50), default='normal') 
    eisenhower_quadrant = db.Column(db.String(50), default='ni_urgente_ni_importante') 
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=func.now())
    tags = db.relationship('Tag', secondary=task_tags, lazy='subquery',
                             backref=db.backref('tasks', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None, 
            'status': self.status,
            'priority': self.priority, # Añadido al diccionario
            'eisenhower_quadrant': self.eisenhower_quadrant,
            'completed': self.completed,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'tags': [tag.to_dict() for tag in self.tags]
        }


# ----------------------------------------------------
# 4. Funciones de Utilidad y Wrappers (ACTUALIZADO)
# ----------------------------------------------------

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': 'Acceso no autorizado. Por favor, inicia sesión.'}), 401
        
        # Opcional: Agregar el user_id a un objeto global 'g' para fácil acceso
        g.user_id = session['user_id']
        return f(*args, **kwargs)
    return decorated_function

def create_tables():
    with app.app_context():
        # db.drop_all() # Descomentar para reiniciar la base de datos
        db.create_all()
        print("Base de datos y tablas creadas (organizador.db).")
        
# --- FUNCION CORREGIDA PARA USAR IDs ---
def process_tag_ids_for_task(user_id, tag_ids):
    """Obtiene objetos Tag a partir de una lista de IDs de etiquetas."""
    if not tag_ids:
        return []
        
    tag_ids_int = [int(id) for id in tag_ids if id is not None]

    # Filtrar solo las etiquetas que pertenecen al usuario
    tags_list = Tag.query.filter(
        Tag.id.in_(tag_ids_int), 
        Tag.user_id == user_id
    ).all()
    
    return tags_list

# ----------------------------------------------------
# 5. Rutas de Autenticación (Sin cambios funcionales)
# ----------------------------------------------------

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Faltan campos (email o password).'}), 400
    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'message': 'Formato de email inválido.'}), 400

    with app.app_context():
        if User.query.filter_by(email=email).first():
            return jsonify({'message': 'El email ya está registrado.'}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        
        # Iniciar sesión automáticamente después del registro (opcional)
        session['user_id'] = new_user.id
        session.permanent = True 
        
        return jsonify({
            'message': 'Registro exitoso.',
            'user': new_user.to_dict()
        }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Faltan campos (email o password).'}), 400

    with app.app_context():
        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            session['user_id'] = user.id
            session.permanent = True 
            return jsonify({
                'message': 'Inicio de sesión exitoso.',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'message': 'Email o contraseña inválidos.'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Sesión cerrada exitosamente.'}), 200

@app.route('/api/check_auth', methods=['GET'])
@login_required
def check_auth():
    # Usamos g.user_id que fue establecido por login_required
    user_id = g.user_id 
    with app.app_context():
        user = User.query.get(user_id)
        if user:
            return jsonify({'is_authenticated': True, 'user': user.to_dict()}), 200
        # En teoría, este 404 nunca debería ocurrir si login_required pasó
        return jsonify({'is_authenticated': False, 'message': 'Usuario no encontrado.'}), 404


# ----------------------------------------------------
# 6. Rutas de Gestión de Tareas (ACTUALIZADO Y AÑADIDO)
# ----------------------------------------------------

@app.route('/api/tasks', methods=['GET', 'POST'])
@login_required 
def tasks():
    user_id = g.user_id # Usamos el user_id de g
    with app.app_context():
        # --- GET: Obtener todas las tareas del usuario ---
        if request.method == 'GET':
            # Incluir el campo 'priority' en el orden si existe en el modelo
            tasks_list = Task.query.filter_by(user_id=user_id).order_by(
                Task.completed.asc(), # Mover completadas al final
                Task.due_date.asc(), 
                Task.created_at.desc()
            ).all()
            return jsonify([task.to_dict() for task in tasks_list]), 200

        # --- POST: Crear una nueva tarea (ACTUALIZADO para usar tag_ids)---
        if request.method == 'POST':
            data = request.get_json()
            title = data.get('title')
            # Esperamos una lista de IDs de etiquetas
            tag_ids = data.get('tag_ids', []) 

            if not title:
                return jsonify({'message': 'El título de la tarea es obligatorio.'}), 400

            due_date_str = data.get('due_date')
            due_date = None
            if due_date_str:
                try:
                    # Permite formatos de fecha del frontend sin problemas de zona horaria
                    due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00').split('+')[0])
                except ValueError:
                    return jsonify({'message': 'Formato de fecha de vencimiento inválido.'}), 400
            
            new_task = Task(
                user_id=user_id,
                title=title,
                description=data.get('description'),
                due_date=due_date,
                status=data.get('status', 'pending'),
                priority=data.get('priority', 'normal'), # Añadido el campo priority
                eisenhower_quadrant=data.get('eisenhower_quadrant', 'ni_urgente_ni_importante'),
                completed=data.get('completed', False)
            )

            # Usar la función actualizada para asignar tags
            task_tags_list = process_tag_ids_for_task(user_id, tag_ids)
            new_task.tags = task_tags_list

            db.session.add(new_task)
            db.session.commit()

            return jsonify(new_task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
@login_required
def task_detail(task_id):
    user_id = g.user_id
    with app.app_context():
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'message': 'Tarea no encontrada o no pertenece al usuario.'}), 404

        # --- DELETE: Eliminar la tarea ---
        if request.method == 'DELETE':
            db.session.delete(task)
            db.session.commit()
            return '', 204 # Respuesta 204 No Content es estándar para DELETE exitoso

        # --- PUT: Actualizar la tarea (ACTUALIZADO para usar tag_ids y priority)---
        if request.method == 'PUT':
            data = request.get_json()

            task.title = data.get('title', task.title)
            task.description = data.get('description', task.description)
            task.status = data.get('status', task.status)
            task.priority = data.get('priority', task.priority) # Añadido
            task.eisenhower_quadrant = data.get('eisenhower_quadrant', task.eisenhower_quadrant)
            
            if 'completed' in data:
                task.completed = data['completed']
                
            if 'due_date' in data:
                due_date_str = data['due_date']
                if due_date_str is None or due_date_str == "":
                    task.due_date = None
                else:
                    try:
                        # Permite formatos de fecha del frontend
                        task.due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00').split('+')[0])
                    except ValueError:
                        return jsonify({'message': 'Formato de fecha de vencimiento inválido.'}), 400

            # Esperamos tag_ids, no tag_names
            tag_ids = data.get('tag_ids') 
            if tag_ids is not None: 
                task_tags_list = process_tag_ids_for_task(user_id, tag_ids)
                task.tags = task_tags_list 

            db.session.commit()
            return jsonify(task.to_dict()), 200

# --- NUEVA RUTA PARA TOGGLE (PATCH) ---
@app.route('/api/tasks/<int:task_id>/complete', methods=['PATCH'])
@login_required
def task_complete_toggle(task_id):
    user_id = g.user_id
    with app.app_context():
        task = Task.query.filter_by(id=task_id, user_id=user_id).first()

        if not task:
            return jsonify({'message': 'Tarea no encontrada o no pertenece al usuario.'}), 404
            
        data = request.get_json()
        if 'completed' not in data:
            return jsonify({'message': 'El campo "completed" es obligatorio.'}), 400

        task.completed = data['completed']
        db.session.commit()
        
        return jsonify(task.to_dict()), 200


# ----------------------------------------------------
# 7. Rutas de Etiquetas (Sin cambios funcionales)
# ----------------------------------------------------

@app.route('/api/tags', methods=['GET', 'POST'])
@login_required 
def tags():
    user_id = g.user_id
    with app.app_context():
        # --- GET: Obtener todas las etiquetas del usuario ---
        if request.method == 'GET':
            tags_list = Tag.query.filter_by(user_id=user_id).order_by(Tag.name.asc()).all()
            return jsonify([tag.to_dict() for tag in tags_list]), 200

        # --- POST: Crear una nueva etiqueta ---
        if request.method == 'POST':
            data = request.get_json()
            tag_name = data.get('name', '').strip()

            if not tag_name:
                return jsonify({'message': 'El nombre de la etiqueta es obligatorio.'}), 400
            
            # Verificar si ya existe para este usuario
            if Tag.query.filter_by(name=tag_name, user_id=user_id).first():
                return jsonify({'message': 'Esta etiqueta ya existe.'}), 409
            
            new_tag = Tag(name=tag_name, user_id=user_id)
            db.session.add(new_tag)
            db.session.commit()
            
            return jsonify(new_tag.to_dict()), 201

@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
@login_required
def tag_detail(tag_id):
    user_id = g.user_id
    with app.app_context():
        # Asegurarse de que la etiqueta existe y pertenece al usuario
        tag = Tag.query.filter_by(id=tag_id, user_id=user_id).first()

        if not tag:
            return jsonify({'message': 'Etiqueta no encontrada o no pertenece al usuario.'}), 404

        # --- DELETE: Eliminar la etiqueta ---
        if request.method == 'DELETE':
            db.session.delete(tag)
            db.session.commit()
            # Devolvemos 204 No Content
            return '', 204

# ----------------------------------------------------
# 8. Bloque de Ejecución Principal
# ----------------------------------------------------

if __name__ == '__main__':
    create_tables() 
    app.run(debug=True, port=5000)