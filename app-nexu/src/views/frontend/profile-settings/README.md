# Nexu — Módulo de Perfil & Configuración (v1.0)

**Rama de Desarrollo:** `feature/victor`  
**Responsable:** Víctor  
**Ubicación:** `src/views/frontend/profile-settings/`

---

## 1. Objetivo del Módulo

Desarrollar la interfaz visual y la experiencia de usuario (UI/UX Mock) para la gestión del perfil personal, el estado de presencia y las preferencias generales de la aplicación.

---

## 2. Requerimientos y Alcance

### A. Vista / Modal de Perfil de Usuario
- **Avatar:** Foto de perfil con selector de avatares predeterminados o carga simulada de imagen.
- **Identidad:** Edición de alias (`@usuario`), nombre visible y biografía / estado personalizado.
- **Estado de Presencia:** Selector interactivo de estado (*En línea*, *Ausente*, *Ocupado / No molestar*, *Desconectado*).

### B. Panel de Ajustes & Preferencias
- **Selector de Tema:** Interruptor para alternar entre **Modo Oscuro** (Dark) y **Modo Claro** (Light).
- **Notificaciones y Sonidos:** Opciones para habilitar/deshabilitar alertas de mensajes nuevos.
- **Privacidad y Seguridad:** Configuración de confirmaciones de lectura (`✓✓`) y gestión de usuarios bloqueados.

### C. Drawer / Tarjeta de Información de Contacto
- Componente para consultar los datos del perfil de la persona con la que se esté chateando (nombre, alias, estado actual y acciones rápidas como "Iniciar chat" o "Bloquear").

---

## 3. Entorno de Desarrollo y Pruebas

Para visualizar y trabajar en tu módulo de forma aislada e independiente:
1. Asegúrate de estar en tu rama: `git switch feature/victor`
2. Levanta el servidor local: `npm run dev` (dentro de `app-nexu`)
3. Abre el módulo directamente en: `http://localhost:5173/?view=profile` o desde el **Developer Hub** principal.
