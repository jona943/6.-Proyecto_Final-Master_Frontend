# 🗺️ Hoja de Ruta y Requerimientos del Proyecto: App de Mensajería

## 🎯 Objetivo General
Desarrollar una aplicación de mensajería en tiempo real estructurada en fases progresivas, comenzando con una interfaz de usuario (UI/UX) sólida con datos simulados (mock data) antes de conectar la lógica del servidor, la base de datos y la seguridad.

---
Para 
## 📱 FASE 1: Frontend & Experiencia de Usuario (UI/UX Mock)
**Objetivo:** Crear toda la interfaz visual interactiva y navegable utilizando mock data (datos estáticos/locales en JS), validando la experiencia de usuario antes de integrar lógica backend.

### 1.1 Vistas y Componentes Principales
- **Pantalla de Autenticación:**
  - Login / Registro / Recuperación de contraseña (Simulado).
  - Validaciones visuales de formulario (campos requeridos, formato de correo).
- **Barra Lateral (Sidebar / Panel Principal):**
  - Perfil del usuario activo (avatar, nombre, estado).
  - Buscador de chats y contactos en tiempo real sobre la lista local.
  - Lista de conversaciones activas: avatar, nombre, último mensaje, hora/fecha, contador de mensajes no leídos e indicador de estado (*En línea / Desconectado*).
  - Filtros rápidos (Todos, No leídos, Grupos).
- **Ventana de Conversación Activa:**
  - **Cabecera del chat:** Nombre del contacto/grupo, estado actual (*En línea*, *Escribiendo...*), avatar y menú de opciones del chat.
  - **Área de mensajes:**
    - Burbujas diferenciadas para mensajes enviados (derecha) y recibidos (izquierda).
    - Indicador de estado del mensaje: Enviado (`✓`), Entregado (`✓✓`), Leído (`✓✓` azul).
    - Marcas de tiempo (*timestamps*) formateadas por fecha/hora.
    - Separadores de fecha ("Hoy", "Ayer", etc.).
    - Scroll automático al fondo al recibir o enviar un nuevo mensaje.
  - **Barra de entrada de mensajes (Input Footer):**
    - Campo de texto responsivo / expandible.
    - Selector de Emojis.
    - Botón para adjuntar archivos o imágenes.
    - Botón de enviar (o acción con tecla *Enter*).
- **Perfil de Usuario & Configuración (Ajustes):**
  - **Modal / Vista de Perfil:**
    - Visualización y edición de avatar (selector de avatares / carga simulada).
    - Edición de alias, nombre visible y biografía / estado personalizado.
    - Selector de estado de presencia (*En línea*, *Ausente*, *No molestar*, *Desconectado*).
  - **Panel de Ajustes & Preferencias:**
    - Selector de tema visual: **Modo Oscuro / Modo Claro** (Toggle).
    - Preferencias de notificaciones y alertas sonoras.
    - Ajustes de privacidad y seguridad (gestión de usuarios bloqueados, cambio de contraseña).
  - **Drawer de Información del Contacto:**
    - Panel lateral para consultar detalles del usuario o contacto con el que se está conversando.

### 1.2 Datos Simulados (Mock Data)
- Archivos de datos locales (`mockUsers.js`, `mockChats.js`, `mockMessages.js`) para simular:
  - Lista de usuarios con diferentes estados (*online*, *offline*, *ausente*).
  - Historial de conversaciones individuales y grupales.
  - Simulación de respuesta automática (ej. bot con respuesta tras 2 segundos para probar recepción de mensajes y auto-scroll).

### 1.3 Personalización y UX Moderno
- Soporte para **Modo Claro (Light)** y **Modo Oscuro (Dark Mode)**.
- Diseño 100% responsivo (Desktop, Tablet y Móvil).
- Transiciones y micro-animaciones fluidas (hover, cambio de chat, envío de mensaje).

---

## ⚡ FASE 2: Backend y Comunicación en Tiempo Real
**Objetivo:** Crear el servidor HTTP y la capa de WebSockets para procesar y distribuir mensajes instantáneamente entre los clientes.

### 2.1 API REST (Endpoints Iniciales)
- `POST /api/auth/register` - Registro de usuario.
- `POST /api/auth/login` - Autenticación.
- `GET /api/users` - Lista de contactos.
- `GET /api/chats` - Lista de chats del usuario.
- `GET /api/chats/:id/messages` - Obtener historial de mensajes.

### 2.2 Servidor de WebSockets (Socket.IO / Native WS)
- **Eventos de Conexión y Presencia:**
  - `connection` / `disconnect` - Gestión de conexiones activas.
  - `user_online` / `user_offline` - Notificación de estado de presencia en tiempo real.
- **Eventos de Mensajería:**
  - `join_room` - Suscripción a un chat/sala específica.
  - `send_message` - Envío del mensaje cliente -> servidor.
  - `receive_message` - Retransmisión del mensaje servidor -> destinatario(s).
  - `typing_start` / `typing_stop` - Eventos de "Escribiendo...".
  - `message_read` - Confirmación de lectura en tiempo real.

---

## 💾 FASE 3: Base de Datos y Persistencia
**Objetivo:** Garantizar que la información de usuarios, chats y mensajes perdure al reiniciar el servidor.

### 3.1 Estructura del Esquema de Datos
- **Users:** `id`, `username`, `email`, `password_hash`, `avatar_url`, `status`, `created_at`.
- **Chats/Rooms:** `id`, `name` (para grupos), `is_group`, `created_at`.
- **ChatParticipants:** `chat_id`, `user_id`, `joined_at`, `role` (*admin* / *member*).
- **Messages:** `id`, `chat_id`, `sender_id`, `content`, `type` (*text*, *image*, *file*), `file_url`, `created_at`.
- **MessageStatus / ReadReceipts:** `message_id`, `user_id`, `is_read`, `read_at`.

### 3.2 Estrategias de Rendimiento
- Paginación de mensajes basada en cursor (*Cursor-based pagination*) para cargar mensajes antiguos al hacer scroll hacia arriba.
- Índices en base de datos (`chat_id`, `created_at`, `sender_id`) para consultas optimizadas.

---

## 🛡️ FASE 4: Rutas Protegidas y Seguridad (Hardening)
**Objetivo:** Blindar la aplicación para restringir accesos no autorizados y proteger los datos del usuario.

### 4.1 Autenticación y Autorización
- Tokens de sesión **JWT (JSON Web Tokens)** o Cookies **HTTP-Only**.
- **Frontend (Guards):** Protección de rutas privadas (redirección a `/login` si no hay sesión activa).
- **Backend (Middleware):** Validación de token en endpoints HTTP protegidos.
- **WebSocket Handshake Auth:** Verificación obligatoria de token al iniciar el handshake de Socket.IO.

### 4.2 Seguridad y Buenas Prácticas
- Sanitización de entradas de texto contra **XSS** y **SQL/NoSQL Injection**.
- Encriptación de contraseñas con **bcrypt** o **argon2**.
- **Rate Limiting** para mitigar spam y ataques de denegación de servicio (DDoS).
- Uso de variables de entorno (`.env`) para claves secretas y parámetros del sistema.
