# 💬 Módulo de Chat y Mensajería (NexuHub)

Este directorio contiene los **subcomponentes modulares** que conforman el cliente de chat de tiempo real de **NexuHub** (`nexuhub.me`).

---

## 📐 Arquitectura de Componentes y Estilos CSS

```
chat/
├── ChatHome.jsx                   # 🌟 Coordinador del Estado General del Chat
├── Chat.css                       # 🎨 Estilos globales del layout contenedor (.chat-app-layout)
└── components/
    ├── README.md                  # 📖 Guía técnica de subcomponentes de chat
    ├── ChatSidebar.jsx            # 1. Lista de conversaciones, buscador y sugerencias
    ├── ChatSidebar.css            #    - Estilos y desdibujado glassmorphism del Sidebar
    ├── ActiveChatPanel.jsx        # 2. Ventana activa de conversación, feed e inputs
    ├── ActiveChatPanel.css        #    - Estilos de burbujas, buscador interno y toolbar
    ├── ContactDetailsPanel.jsx    # 3. Drawer lateral de perfil y archivos compartidos
    ├── ContactDetailsPanel.css    #    - Estilos de detalles y pestañas de archivos
    ├── ChatEmptyState.jsx         # 4. Estado inicial cuando no hay chat activo
    ├── ChatEmptyState.css         #    - Estilos de bienvenida e invitación a conectar
    ├── ConnectUserModal.jsx       # 5. Modal flotante para agregar nuevos contactos
    └── ConnectUserModal.css       #    - Estilos del buscador modal con unicidad Zod
```

---

## 🔍 Responsabilidades del Módulo

### 1. `ChatSidebar` (`ChatSidebar.jsx` + `ChatSidebar.css`)
* Renderiza el encabezado del usuario autenticado, selector de estado de presencia (En línea, Ausente, Ocupado) y barra de búsqueda.
* Lista interactiva de contactos con contadores de mensajes no leídos y timestamps.

### 2. `ActiveChatPanel` (`ActiveChatPanel.jsx` + `ActiveChatPanel.css`)
* Muestra el hilo de conversación del chat seleccionado.
* Incluye buscador interno de palabras dentro del chat activo con resaltado de texto.
* Soporte para enviar emojis, snippets de código y anexos.

### 3. `ContactDetailsPanel` (`ContactDetailsPanel.jsx` + `ContactDetailsPanel.css`)
* Drawer lateral que despliega la información del contacto activo.
* Permite explorar los archivos encriptados y enlaces compartidos en la conversación.

### 4. `ChatEmptyState` (`ChatEmptyState.jsx` + `ChatEmptyState.css`)
* Pantalla de bienvenida minimalista cuando el usuario ingresa al chat por primera vez.

### 5. `ConnectUserModal` (`ConnectUserModal.jsx` + `ConnectUserModal.css`)
* Modal interactivo para conectar con nuevos usuarios en la red mediante su `@alias` único.
