# Nexu — Servidor Backend API (v1.0)

Este directorio contiene el servidor **Node.js + Express** para la plataforma de mensajería privada **Nexu**.

---

## 1. Estructura del Directorio

```text
backend/
├── routes/
│   ├── public.routes.js     # Health check (/api/health) y verificación de alias
│   ├── auth.routes.js       # Autenticación, login y registro (/api/auth)
│   ├── chat.routes.js       # Mensajería y conversaciones (/api/chats)
│   └── user.routes.js       # Perfil y ajustes (/api/user)
├── controllers/             # Controladores de lógica de negocio (Siguiente fase)
├── models/                  # Esquemas y modelos de datos (Siguiente fase)
├── .env.example             # Plantilla de variables de entorno
├── package.json             # Dependencias del servidor (Express, CORS, Dotenv)
├── server.js                # Punto de entrada del servidor Express
└── README.md                # Documentación del módulo
```

---

## 2. Instalación y Ejecución Local

### Paso 1: Instalar dependencias
Desde la carpeta raíz del repositorio:
```bash
cd backend
npm install
```

### Paso 2: Iniciar en modo desarrollo
```bash
npm run dev
# O en modo estándar:
npm start
```

El servidor estará escuchando en `http://localhost:5000`.

---

## 3. Endpoints Disponibles (Validación Parte 3)

| Método | Ruta | Descripción | Módulo Responsable |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | **Prueba de salud y conexión Front ↔ Back** | Jonathan (Líder) |
| `GET` | `/api/public/check-alias?alias=xxx` | Verificación de disponibilidad de alias | Jonathan (Landing) |
| `GET` | `/api/public/network-stats` | Métricas públicas de la red | Jonathan (Landing) |
| `POST` | `/api/auth/login` | Inicio de sesión con alias y contraseña | Rosy (Auth) |
| `POST` | `/api/auth/register` | Registro de nueva identidad | Rosy (Auth) |
| `GET` | `/api/chats` | Listar conversaciones activas | EmaRama (Chat) |
| `POST` | `/api/chats/message` | Enviar mensaje en una conversación | EmaRama (Chat) |
| `GET` | `/api/user/profile` | Obtener perfil de usuario activo | Víctor (Perfil) |
| `PUT` | `/api/user/profile` | Actualizar datos del perfil | Víctor (Perfil) |
