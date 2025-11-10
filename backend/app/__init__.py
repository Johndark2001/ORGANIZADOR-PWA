# backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)
    
    # (Ajusta esto si tu puerto de Vite es diferente)
    cors.init_app(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    from app import models

    # Registra los Blueprints (módulos de rutas)
    from app.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    # --- AÑADIR ESTAS DOS LÍNEAS ---
    from app.routes import main_bp
    app.register_blueprint(main_bp, url_prefix='/api')
    # ---------------------------------

    return app