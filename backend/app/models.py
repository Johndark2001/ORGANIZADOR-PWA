# backend/app/models.py
from app import db, bcrypt
from datetime import datetime

# --- AÑADIR ESTO ---
# Tabla de asociación para la relación Muchos-a-Muchos entre Tareas y Etiquetas
task_tags = db.Table('task_tags',
    db.Column('task_id', db.Integer, db.ForeignKey('task.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)
# --------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # --- MODIFICAR ESTO ---
    # Relaciones: Un usuario tiene muchas tareas, etiquetas y sesiones
    tasks = db.relationship('Task', backref='author', lazy=True, cascade="all, delete-orphan")
    tags = db.relationship('Tag', backref='owner', lazy=True, cascade="all, delete-orphan")
    pomodoro_sessions = db.relationship('PomodoroSession', backref='user', lazy=True, cascade="all, delete-orphan")
    # -----------------------

    def set_password(self, password):
        """Crea un hash de la contraseña."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Verifica el hash de la contraseña."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.email}>'

# --- AÑADIR TODO ESTO ---

class Task(db.Model):
    """Modelo de Tareas"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Para Kanban: 'pending', 'in_progress', 'done' [cite: 20]
    status = db.Column(db.String(20), default='pending', nullable=False) 
    
    # Para Matriz Eisenhower: 'urgent_important', 'important_not_urgent', etc. [cite: 30]
    eisenhower_quadrant = db.Column(db.String(30), nullable=True, default='ni_urgente_ni_importante') 
    
    # Foreign Key al Usuario
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relación Muchos-a-Muchos con Etiquetas [cite: 33]
    tags = db.relationship('Tag', secondary=task_tags, lazy='subquery',
                           backref=db.backref('tasks', lazy=True))

    def to_dict(self):
        """Convierte el objeto Tarea en un diccionario para la API."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed": self.completed,
            "status": self.status,
            "eisenhower_quadrant": self.eisenhower_quadrant,
            "user_id": self.user_id,
            "tags": [tag.to_dict() for tag in self.tags]
        }

    def __repr__(self):
        return f'<Task {self.title}>'

class Tag(db.Model):
    """Modelo de Etiquetas"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    
    # Foreign Key al Usuario (para que cada usuario tenga sus propias etiquetas) [cite: 32]
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        """Convierte el objeto Etiqueta en un diccionario."""
        return {
            "id": self.id,
            "name": self.name
        }
    
    def __repr__(self):
        return f'<Tag {self.name}>'

class PomodoroSession(db.Model):
    """Modelo para registrar ciclos Pomodoro completados (Métricas) [cite: 26, 53]"""
    id = db.Column(db.Integer, primary_key=True)
    date_completed = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.Integer, default=25) # Duración en minutos
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<PomodoroSession {self.date_completed}>'