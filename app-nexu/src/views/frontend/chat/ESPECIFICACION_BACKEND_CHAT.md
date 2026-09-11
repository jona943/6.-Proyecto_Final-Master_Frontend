# Nexu Chat - Especificacion Tecnica de Backend y Arquitectura de Datos

## 1. Vision General del Modulo

El modulo de mensajeria de Nexu v1.0 esta disenado bajo el principio de **privacidad estricta y conexion punto a punto (1 a 1)**. No existe un directorio publico de usuarios ni canales masivos; toda comunicacion requiere una solicitud de conexion previa aceptada por ambas partes o un enlace directo de invitacion.

---

## 2. Esquemas de Base de Datos (Modelos de Entidad)

### 2.1 Modelo: Usuario (`User`)
Almacena la identidad y credenciales basicas del usuario en el sistema.

```typescript
interface User {
  _id: string;                    // Identificador unico (ObjectId / UUID)
  username: string;               // Alias unico de 3 a 10 caracteres alfanumericos [a-zA-Z0-9]
  passwordHash: string;           // Hash bcrypt / argon2 de la contrasena
  displayName: string;            // Nombre publico visible
  avatarInitials: string;         // Iniciales automaticas de 2 letras
  customAvatarUrl?: string;       // URL de avatar personalizado (opcional)
  status: 'online' | 'away' | 'offline'; // Estado de presencia en tiempo real
  statusText: string;             // Mensaje de estado
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Modelo: Solicitud de Conexion (`ConnectionRequest`)
Gestiona el ciclo de vida de invitacion y aceptacion entre dos identidades.

```typescript
interface ConnectionRequest {
  _id: string;
  senderId: string;               // ID del usuario emisor (referencia a User)
  senderHandle: string;           // @alias del emisor
  receiverId: string;             // ID del usuario receptor (referencia a User)
  receiverHandle: string;         // @alias del receptor
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}
```

### 2.3 Modelo: Conversacion Directa (`Conversation`)
Representa el canal privado 1 a 1 establecido tras la aceptacion mutua.

```typescript
interface Conversation {
  _id: string;
  participants: [string, string]; // IDs de los dos participantes unicos
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
  };
  unreadCounts: {
    [userId: string]: number;     // Contador de no leidos por participante
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 Modelo: Mensaje (`Message`)
Registro inmutable de un mensaje individual dentro de una conversacion.

```typescript
interface Message {
  _id: string;
  conversationId: string;         // ID de la conversacion (referencia a Conversation)
  senderId: string;               // ID del emisor
  receiverId: string;             // ID del receptor
  text: string;                   // Contenido en texto plano o payload cifrado
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
}
```

### 2.5 Modelo: Sesion de Dispositivo (`DeviceSession`)
Auditoria y registro de accesos de clientes por dispositivo (sin duplicacion por equipo).

```typescript
interface DeviceSession {
  _id: string;
  userId: string;                 // ID del usuario propietario de la sesion
  deviceName: string;             // ej. "Linux (Ubuntu / Desktop)", "Windows PC", "Apple iPhone"
  browser: string;                // ej. "Google Chrome", "Mozilla Firefox", "Apple Safari"
  platform: 'Desktop' | 'Mobile' | 'Tablet';
  ipAddress: string;              // IP de origen del cliente
  firstLoginDate: Date;           // Fecha del primer registro de este dispositivo
  lastLoginDate: Date;            // Fecha y hora del inicio de sesion mas reciente
  lastActive: Date;               // Ultimo latido de actividad (heartbeat)
  isActive: boolean;              // Indica si el token JWT de sesion sigue vigente
}
```

---

## 3. Especificacion de Endpoints RESTful

### 3.1 Conexiones y Solicitudes

| Metodo | Ruta | Descripcion | Autenticacion |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/connections/request` | Enviar solicitud de conexion a un @alias exacto | Bearer JWT |
| `GET` | `/api/connections/pending` | Listar solicitudes entrantes pendientes | Bearer JWT |
| `PUT` | `/api/connections/:requestId/accept` | Aceptar solicitud y generar conversacion 1 a 1 | Bearer JWT |
| `PUT` | `/api/connections/:requestId/reject` | Rechazar y descartar solicitud | Bearer JWT |
| `GET` | `/api/connections/search?alias=xxx` | Buscar usuario por alias exacto | Bearer JWT |

#### Payload de envio de solicitud (`POST /api/connections/request`):
```json
{
  "targetUsername": "rosi_master"
}
```

#### Respuesta esperada (`201 Created`):
```json
{
  "success": true,
  "message": "Solicitud de conexion enviada correctamente.",
  "data": {
    "requestId": "req_839210",
    "targetHandle": "@rosi_master",
    "status": "pending",
    "createdAt": "2026-08-22T20:20:00.000Z"
  }
}
```

---

### 3.2 Mensajeria y Conversaciones

| Metodo | Ruta | Descripcion | Autenticacion |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/conversations` | Listar conversaciones activas del usuario | Bearer JWT |
| `GET` | `/api/conversations/:id/messages` | Obtener historial paginado de mensajes | Bearer JWT |
| `POST` | `/api/conversations/:id/messages` | Enviar mensaje en una conversacion | Bearer JWT |
| `DELETE` | `/api/conversations/:id` | Eliminar conversacion y contacto | Bearer JWT |
| `PUT` | `/api/conversations/:id/read` | Marcar mensajes como leidos | Bearer JWT |

---

### 3.3 Auditoria de Dispositivos y Sesiones

| Metodo | Ruta | Descripcion | Autenticacion |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/sessions` | Listar dispositivos y sesiones activas del usuario | Bearer JWT |
| `DELETE` | `/api/auth/sessions/:sessionId` | Revocar y cerrar sesion en un dispositivo remoto | Bearer JWT |

---

## 4. Arquitectura de Eventos en Tiempo Real (WebSockets / Socket.io)

Para garantizar latencias inferiores a 50 ms y confirmaciones de entrega inmediatas, el backend implementara un servidor de WebSockets coordinado por eventos:

```
[ Cliente React ] <=========== (WebSocket Bidireccional) ===========> [ Servidor Node/Express ]
      |                                                                        |
      |-- 1. socket.emit('join_user_room', { userId })                        |
      |-- 2. socket.emit('send_direct_message', { convId, text }) ----------->| (Valida permisos y persiste)
      |<-- 3. socket.on('receive_message', messagePayload) <------------------| (Entrega al receptor)
      |<-- 4. socket.on('message_status_updated', { msgId, status: 'read' }) -| (Confirmacion de lectura)
      |<-- 5. socket.on('incoming_connection_request', requestPayload) <------| (Notificacion de invitacion)
      |<-- 6. socket.on('user_presence_changed', { userId, status }) <--------| (En linea / Ausente)
```

### Eventos Estandarizados:
* `user:presence`: Emite cambios de estado (`online`, `away`, `offline`) al cambiar foco de ventana o perder conexion.
* `connection:request_received`: Notifica al receptor en tiempo real la llegada de una solicitud de amistad/chat.
* `connection:accepted`: Notifica al emisor original que su solicitud fue aceptada, creando la conversacion en vivo.
* `chat:message`: Envio y distribucion instantanea de mensajes entre ambos pares.
* `chat:read_receipt`: Notificacion de lectura con doble check verde lima (`status: 'read'`).

---

## 5. Reglas de Negocio y Seguridad

1. **Aislamiento de Privacidad:**
   * Un usuario no puede enviar mensajes a otro a menos que exista un registro de `ConnectionRequest` con `status === 'accepted'`.
   * Los intentos de enviar mensajes sin conexion previa deben ser rechazados con error `403 Forbidden`.
2. **Prevencion de Auto-Conexiones:**
   * El sistema valida en backend que `senderId !== receiverId`.
3. **Control de Duplicacion de Dispositivos:**
   * La clave compuesta `(userId, deviceName, browser)` determina la unicidad del equipo. Al iniciar sesion, el backend ejecuta un `upsert` actualizando `lastLoginDate` y `lastActive` en lugar de generar un nuevo registro.
4. **Proteccion contra Spam:**
   * Limite de tasa (*Rate Limiting*): Maximo 5 solicitudes de conexion por minuto por usuario.
