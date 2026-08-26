# Nexu — Módulo de Chat & Mensajería (v1.0)

**Rama de Desarrollo:** `feature/EmaRama`  
**Responsable:** EmaRama  
**Ubicación:** `src/views/frontend/chat/`  

---

## 1. Objetivo del Módulo

Desarrollar la interfaz de usuario interactiva y navegable (UI/UX Mock) para la experiencia central de mensajería directa en tiempo real de Nexu v1.0, utilizando **100% iconos vectoriales SVG nativos, sin emojis** y con una estética profesional *Obsidian Carbon* y *Acid Lime*.

---

## 2. Requerimientos y Funcionalidades Implementadas

### A. Barra Lateral (Sidebar de Conversaciones)
- **Perfil de Usuario & Selector Rápido de Presencia:**
  - Avatar monograma interactivo que despliega un menú flotante con 3 estados:
    - 🟢 **En línea:** Disponible y activo para recibir mensajes.
    - 🟡 **Ausente:** Inactivo temporalmente o en descanso.
    - 🔴 **No molestar:** Silenciar alertas y avisos.
  - Feedback visual inmediato con notificación toast y punto de presencia con resplandor (*glow*).
- **Buscador de Contactos:** Filtro reactivo para buscar contactos por nombre o por handle en toda la bandeja.
- **Filtros Rápidos:** Pestañas para conmutar entre *Todos*, *No leídos* y *En línea*.
- **Lista de Conversaciones:** Monogramas vectorizados, badges numéricos de mensajes no leídos, hora de entrega y preview del último mensaje con prefijo `"Tú:"`.

### B. Ventana Principal de Conversación Activa
- **Cabecera Dinámica:** Avatar, nombre del contacto seleccionado, indicador de presencia y estado dinámico animado (*"Generando respuesta en tiempo real..."*).
- **Buscador en Conversación Activa (In-Chat Search):**
  - Botón **"Buscar"** en la cabecera del chat con atajo `Escape` para cerrar.
  - Barra desplegable con contador dinámico de coincidencias (*"X coincidencias"*).
  - Resaltado visual en tiempo real de las palabras y frases coincidentes dentro de las burbujas de mensaje (`<mark>` con resplandor Acid Lime).
  - Banner informativo cuando no se encuentran coincidencias.
- **Feed de Mensajes con Burbujas:**
  - Burbujas alineadas a la izquierda (contacto) y a la derecha (usuario activo).
  - Indicadores de entrega: Enviado (`✓`), Entregado (`✓✓`) y Leído (`✓✓` resaltado con Acid Lime).
  - Divisores de fecha / sesión.
  - Auto-scroll suave (*smooth scroll*) al recibir o enviar nuevos mensajes.
  - **Acciones en Hover:** Botón para copiar el texto del mensaje al portapapeles con notificación toast no intrusiva.
- **Barra de Entrada (Input Footer):**
  - **Barra de Herramientas SVG:** Botones vectoriales para adjuntar imagen, adjuntar archivo e insertar fragmentos de código rápido.
  - Campo de texto responsivo con soporte para envío con tecla `Enter` y botón de envío vectorizado.

### C. Panel Lateral Derecho (Drawer de Detalles del Contacto)
- Botón **"Detalles"** en la cabecera del chat para abrir/cerrar el panel de información del usuario.
- **Pestaña 1: Perfil & Cuenta:**
  - Muestra el perfil ampliado: Monograma, nombre, handle, rol, correo electrónico y biografía.
  - Indicador de seguridad y cifrado.
  - Botones de acción para **Vaciar Mensajes** y **Eliminar Contacto**.
- **Pestaña 2: Archivos & Enlaces Compartidos:**
  - Sección de **Documentos y Archivos** con iconos vectoriales de PDF, código e imágenes, pesos de archivo y fechas.
  - Sección de **Enlaces Compartidos** con enlaces directos al repositorio GitHub y documentación.
  - Indicador de almacenamiento seguro punto a punto.

### D. Simulación Reactiva (Mock Data & Bot)
- Auto-respuesta simulada con animación de 3 puntos (*typing indicator*) y despacho reactivo de mensajes.

---

## 3. Identidad Visual y Estándares

- **Paleta de Colores:** Obsidian Carbon (`#08090b`), Superficie (`#101216`), Acid Lime (`#d4ff00`), Textos claros (`#f4f5f7`).
- **Iconografía:** 100% Iconos Vectoriales SVG nativos, sin emojis para mantener una estética consistente y profesional.
- **Tipografía:** `Plus Jakarta Sans` y `JetBrains Mono`.

---

## 4. Estructura de Archivos del Módulo

```text
src/views/frontend/chat/
├── ChatHome.jsx                          # Componente coordinador del chat
├── Chat.css                              # Estilos completos Obsidian Carbon & Acid Lime
├── mockData.js                           # Base de datos simulada (usuarios, contactos, mensajes)
├── README.md                             # Documentación de especificaciones y alcance
└── components/
    ├── ActiveChatPanel.jsx               # Panel de conversación activa con buscador interno
    ├── ChatEmptyState.jsx                # Estado vacío cuando no hay chat seleccionado
    ├── ChatSidebar.jsx                   # Barra lateral de contactos y selector de presencia
    ├── ConnectUserModal.jsx              # Modal para conectar con nuevo usuario por alias
    └── ContactDetailsPanel.jsx           # Panel lateral con tabs de perfil, archivos y enlaces
```

---

## 5. Visualización Local y Pruebas

1. Cambiar a la rama: `git switch feature/EmaRama`
2. Iniciar el entorno: `npm run dev` (dentro de la carpeta `app-nexu`)
3. Probar la vista en: `http://localhost:5173/?view=chat` o en el flujo completo de la app.
