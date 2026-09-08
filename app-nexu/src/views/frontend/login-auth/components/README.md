#  Módulo de Autenticación (NexuHub - Auth)

Este directorio contiene los subcomponentes y hooks que componen el flujo de autenticación, creación de usuario y recuperación de acceso de **NexuHub** (`nexuhub.me`).

---

##  Arquitectura Modular y Custom Hooks

```
login-auth/
├── Login.jsx                        #  Componente coordinador visual principal
├── Login.css                        #  Estilos globales del módulo de autenticación
├── hooks/
│   └── useAuthForm.js               #  Custom Hook: Lógica de formularios, Zod y API
├── components/
│   ├── README.md                    #  Guía de componentes de autenticación
│   ├── LoginForm.jsx                #  Subcomponente Formulario de Inicio de Sesión
│   ├── RegisterForm.jsx             #  Subcomponente Formulario de Registro / Reclamo de Alias
│   └── ForgotPasswordForm.jsx       # ️ Subcomponente Formulario de Recuperación de Acceso
```

---

##  Responsabilidades del Módulo

### 1. `useAuthForm.js` (Custom Hook)
* Encapsula los estados reactivos de los inputs de Login, Registro y Recuperación.
* Integra validaciones de esquemas con **Zod** (`registerSchema`).
* Procesa sanitización instantánea de alias únicos.
* Maneja la comunicación asíncrona con el backend REST (`authService`) y estados de carga/alerta.

### 2. `LoginForm.jsx`
* Formulario de acceso por alias `@usuario` y contraseña.
* Incluye botón para cargar usuario de demostración rápida (*Demo User*).

### 3. `RegisterForm.jsx`
* Formulario de alta de usuario con indicador en vivo de fortaleza de contraseña.
* Validación previa de disponibilidad de alias.

### 4. `ForgotPasswordForm.jsx`
* Formulario para solicitar instrucciones de recuperación de acceso mediante alias soberano.
