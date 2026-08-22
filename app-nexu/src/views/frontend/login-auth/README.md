# Nexu — Módulo de Login & Autenticación (v1.0)

**Rama de Desarrollo:** `feature/rosy`  
**Responsable:** Rosy / Rosa  
**Ubicación:** `src/views/frontend/login-auth/`

---

## 1. Objetivo del Módulo

Desarrollar la interfaz visual interactiva y navegable (UI/UX Mock en React) para el inicio de sesión y la creación de cuenta simplificada del proyecto Nexu.

---

## 2. Requerimientos y Alcance Simplificado

El sistema está diseñado bajo una premisa de privacidad y rapidez (sin requerir números de teléfono ni correos electrónicos):

### A. Creación de Usuario (Registro)
- **Usuario Único:** Identificador único en la plataforma (sin espacios, minúsculas, mínimo 3 caracteres).
- **Contraseña:** Mínimo **8 caracteres** obligatorios.
- **Confirmación de Contraseña:** Validación de coincidencia en tiempo real.
- **Medidor de Seguridad:** Retroalimentación visual interactiva.

### B. Inicio de Sesión (Login)
- **Campos:** Usuario único y Contraseña (8+ caracteres).
- **Mostrar/Ocultar contraseña:** Toggle visual interactivo (👁️).
- **Recordar sesión:** Switch / checkbox de persistencia.
- **Acceso rápido Demo:** Botón para autocompletar credenciales de prueba (`@rosi_master` / `Nexu2026Pass!`).

### C. Recuperación de Acceso
- Formulario simulado ingresando únicamente el usuario único.

---

## 3. Identidad Visual y Estilo

- **Paleta de Colores:** 
  - Fondo: Obsidian Carbon (`#08090b` / `var(--bg-canvas)`)
  - Tarjetas: Superficie (`#101216` / `var(--bg-surface)`)
  - Acento: Acid Lime (`#d4ff00` / `var(--accent-acid)`)
  - Textos: Blanco suave (`#f4f5f7`) y Gris (`#7e8796`)
- **Iconografía:** Iconos vectoriales nativos SVG.
- **Tipografía:** `Plus Jakarta Sans` y `JetBrains Mono`.

---

## 4. Estructura de Archivos del Módulo

```text
src/views/frontend/login-auth/
├── Login.jsx       # Componente React (Login, Registro simplificado y Recuperación)
├── Login.css       # Estilos CSS dedicados con tema oscuro y animaciones
└── README.md       # Documentación oficial del módulo
```
