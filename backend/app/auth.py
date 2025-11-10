# backend/app/auth.py
from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re # Para validar email

# Creamos un "Blueprint" para organizar nuestras rutas de autenticación
auth_bp = Blueprint('auth', __name__)

def is_valid_email(email):
    """Función simple para validar el formato de email."""
    regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(regex, email)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Endpoint para registrar un nuevo usuario."""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"msg": "Faltan campos (usuario, email o contraseña)"}), 400
    
    if not is_valid_email(email):
        return jsonify({"msg": "Formato de correo electrónico inválido"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El correo electrónico ya está registrado"}), 409

    # Creamos el nuevo usuario
    new_user = User(username=username, email=email)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "Usuario registrado exitosamente"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Endpoint para iniciar sesión.""" 
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Faltan email o contraseña"}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        # Si las credenciales son válidas, creamos un token de acceso
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token, user={"id": user.id, "username": user.username}), 200
    else:
        return jsonify({"msg": "Credenciales inválidas"}), 401