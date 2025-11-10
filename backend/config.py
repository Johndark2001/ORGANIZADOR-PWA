# backend/config.py (Archivo que SÍ se sube a GitHub)
import os

# Determina la carpeta base del proyecto
basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    """Configuraciones base de Flask."""
    # Clave secreta para proteger sesiones y cookies
    # Ahora la clave está hardcodeada para simplificar la entrega.
    SECRET_KEY = os.environ.get('SECRET_KEY') or '@4S9x%L6pT2#Zf8W7VqY'
    
    # Configuración de la Base de Datos
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Configuración de JWT (JSON Web Tokens)
    # Coloca una clave diferente para JWT, también hardcodeada.
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'h$B7n!E3kR5&Qj1G9uPz'