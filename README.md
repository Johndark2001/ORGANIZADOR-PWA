🚀 Clonación del repositorio


Para descargar el proyecto en tu equipo, ejecuta:
***
git clone https://github.com/Johndark2001/ORGANIZADOR-PWA.git
cd ORGANIZADOR-PWA
***

⚙️ Instalación del Backend (Flask)

Abre una terminal y navega al directorio del backend:


cd backend



Crea y activa un entorno virtual (recomendado):

En Windows:


python -m venv venv
venv\Scripts\activate



En macOS/Linux:


python3 -m venv venv
source venv/bin/activate



Instala las dependencias necesarias:


pip install -r requirements.txt


Ejecuta el servidor backend:

python app.py



⚠️ El servidor Flask iniciará normalmente en http://127.0.0.1:5000
(puedes modificar el puerto en app.py si lo deseas).



💻 Instalación del Frontend (React + Vite)

Abre otra terminal (dejando el backend corriendo) y navega al frontend:

cd frontend


Instala las dependencias del proyecto:

npm install


Ejecuta el entorno de desarrollo:

npm run dev


🔗 Por defecto, la aplicación React se ejecutará en http://localhost:5173 (o un puerto disponible).
