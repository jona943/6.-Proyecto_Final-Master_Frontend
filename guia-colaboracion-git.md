# Guía de Colaboración y Arquitectura Fullstack — Proyecto Nexu (v1.0)

Esta guía contiene la arquitectura del repositorio, los comandos básicos y las buenas prácticas que utilizaremos el equipo (**Jonathan**, **Rosy**, **EmaRama** y **Víctor**) para trabajar de forma ordenada, evitar colisiones de código y cumplir con los entregables del campus.

---

## 1. Estructura General del Repositorio

El proyecto se organiza bajo una estructura Fullstack desacoplada:

```text
6.-Proyecto_Final-Master_Frontend/
├── app-nexu/              # FRONTEND (React + Vite + Design Tokens)
│   ├── src/
│   │   ├── services/      # Servicios de datos, api.js y storageService
│   │   ├── context/       # AuthContext y ChatContext (Estado global)
│   │   ├── utils/         # Validadores y formateadores puros
│   │   └── views/frontend/# Módulos visuales (landing, login-auth, chat, profile-settings)
│   └── package.json
│
├── backend/               # BACKEND (Node.js + Express API REST)
│   ├── routes/            # Rutas modulares asignadas por integrante
│   │   ├── public.routes.js   # Health check (/api/health) y alias (Jonathan)
│   │   ├── auth.routes.js     # Login y Registro (/api/auth) (Rosy)
│   │   ├── chat.routes.js     # Mensajería y Chats (/api/chats) (EmaRama)
│   │   └── user.routes.js     # Perfil y Ajustes (/api/user) (Víctor)
│   ├── server.js          # Servidor Express principal con CORS
│   ├── package.json       # Dependencias del servidor
│   └── README.md          # Especificación de ejecución
│
└── README.md
```

---

## 2. Asignación de Roles y Ramas

| Integrante | Rama | Frontend Asignado | Backend Asignado |
| :--- | :--- | :--- | :--- |
| **Jonathan** *(Líder)* | `feature/jonathan` | `src/views/frontend/landing/` | `backend/server.js` & `public.routes.js` |
| **Rosy** | `feature/rosy` | `src/views/frontend/login-auth/` | `backend/routes/auth.routes.js` |
| **EmaRama** | `feature/EmaRama` | `src/views/frontend/chat/` | `backend/routes/chat.routes.js` |
| **Víctor** | `feature/victor` | `src/views/frontend/profile-settings/` | `backend/routes/user.routes.js` |

---

## 3. Cómo Ejecutar el Proyecto en Local

Para probar la comunicación Front ↔ Back, se levantan ambos entornos en dos terminales separadas:

### Terminal 1: Servidor Backend (Node.js / Express)
```bash
cd backend
npm install   # (Solo la primera vez)
npm start     # Ejecuta en http://localhost:5000
```
> *Endpoint de prueba de vida:* `http://localhost:5000/api/health`

### Terminal 2: Aplicación Frontend (React / Vite)
```bash
cd app-nexu
npm install   # (Solo la primera vez)
npm run dev   # Ejecuta en http://localhost:5173
```

---

## 4. Flujo de Trabajo en Git

1. **Actualizar `main` antes de empezar:**
   ```bash
   git switch main
   git pull origin main
   ```
2. **Cambiar a tu rama y sincronizar:**
   ```bash
   git switch feature/tu-nombre
   git merge main
   ```
3. **Desarrollar y guardar cambios:**
   ```bash
   git status
   git add .
   git commit -m "feat(modulo): descripcion clara de los cambios"
   git push origin feature/tu-nombre
   ```
4. **Integrar avances a `main`:**
   ```bash
   git switch main
   git pull origin main
   git merge feature/tu-nombre
   git push origin main
   git switch feature/tu-nombre
   ```

---

## 5. Resumen de Comandos Útiles

| Qué quiero hacer | Comando |
| :--- | :--- |
| Ver estado de archivos modificados | `git status` |
| Ver todas las ramas | `git branch` |
| Cambiarme de rama | `git switch <nombre-rama>` |
| Descargar lo último de GitHub | `git pull origin <rama>` |
| Subir mis cambios a GitHub | `git push origin <rama>` |
| Deshacer cambios en un archivo | `git restore <archivo>` |

---

**Nexu · Mensajería Privada y Soberana**
