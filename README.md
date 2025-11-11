# PASOS PARA EJECUTAR EL CODIGO CORRECTAMENTE, SEGUIR LA GUIA A CONTINUACIÓN



# 🚀 **Clonación del repositorio**


## Para descargar el proyecto en tu equipo, ejecuta:

- git clone https://github.com/Johndark2001/ORGANIZADOR-PWA.git

- cd ORGANIZADOR-PWA
___
___

## 1. ⚙️ Instalación del Backend (Flask)

### Abre una terminal y navega al directorio del backend:

- cd backend
___
___

## 2. Crea y activa un entorno virtual (recomendado):

### En Windows:

- python -m venv venv
- venv\Scripts\activate



### En macOS/Linux:

- python3 -m venv venv
- source venv/bin/activate
___
___

## 3. Instala las dependencias necesarias:


- pip install -r requirements.txt


## 4. Ejecuta el servidor backend:

- python app.py
___
___

⚠️ El servidor Flask iniciará normalmente en http://127.0.0.1:5000
(puedes modificar el puerto en app.py si lo deseas).
___
___

## 💻 Instalación del Frontend (React + Vite)

### 1. Abre otra terminal (dejando el backend corriendo) y navega al frontend:

- cd frontend


### 2. Instala las dependencias del proyecto:

- npm install


### 3. Ejecuta el entorno de desarrollo:

- npm run dev
___
___
## 🔗 Por defecto, la aplicación React se ejecutará en http://localhost:5173 (o un puerto disponible).


## NOTA: Para que el codigo corra correctamente, primero en una consola ejecutar el backend y luego en otra consola el frontend en ese orden, luego abrir el link que te aparece en el frontend: http://localhost:5173
___
___


# 🔧 Ejecución conjunta

# Para que la aplicación funcione correctamente:

## - Inicia primero el backend con python app.py.

## - Luego, en otra terminal, inicia el frontend con npm run dev.

## - El frontend se comunicará con el backend mediante las rutas definidas en Flask.
