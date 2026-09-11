# Nexu Profile & Settings - Especificacion Tecnica de Backend y Reglas de Negocio

## 1. Vision General del Modulo

El modulo `profile-settings` gestiona la identidad de usuario, preferencias de interfaz, configuracion de privacidad, politicas de notificaciones, seguridad de credenciales y la administracion de contactos bloqueados.

Este modulo se sincroniza directamente con el modulo de mensajeria (`chat`) y la capa de autenticacion (`login-auth`), asegurando persistencia consistente sin contradecir las reglas de identidad por alias de Nexu.

---

## 2. Modelos de Datos (Esquemas de Base de Datos)

### 2.1 Modelo: Perfil Extendido (`UserProfile`)

```typescript
interface UserProfile {
  userId: string;                         // Referencia al ID unico del usuario (User._id)
  displayName: string;                    // Nombre visible (maximo 50 caracteres)
  username: string;                       // Alias unico: /^[a-zA-Z0-9]{3,10}$/
  email: string;                          // Correo electronico institucional o de recuperacion
  bio: string;                            // Descripcion o estado personal (maximo 160 caracteres)
  gender: 'neutral' | 'female' | 'male';  // Identidad de genero (para sugerencia de avatar)
  avatarType: 'initials' | 'neutral' | 'female' | 'male' | 'shield'; // Tipo de icono vectorial
  presence: 'online' | 'away' | 'dnd' | 'offline'; // Estado de presencia declarado
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Modelo: Preferencias de Usuario (`UserPreferences`)

```typescript
interface UserPreferences {
  userId: string;
  theme: 'dark' | 'light';                // Modo Oscuro (Obsidian Carbon) o Claro
  notifications: {
    desktop: boolean;                     // Notificaciones emergentes del sistema operativo
    soundIncoming: boolean;               // Tono audible al recibir mensajes
    soundOutgoing: boolean;               // Confirmacion audible al enviar mensajes
    messagePreview: boolean;              // Vista previa de remitente y texto
    onlineAlerts: boolean;                // Alerta cuando un contacto se conecta
  };
  privacy: {
    readReceipts: boolean;                // Doble check de lectura
    lastSeen: boolean;                    // Visibilidad de ultima conexion
    typingIndicator: boolean;             // Indicador de "Escribiendo..."
    allowStrangers: boolean;              // Permitir solicitudes directas
  };
  updatedAt: Date;
}
```

### 2.3 Modelo: Contacto Bloqueado (`BlockedContact`)

```typescript
interface BlockedContact {
  _id: string;
  userId: string;                         // ID del usuario que ejecuta el bloqueo
  blockedUserId: string;                  // ID del usuario bloqueado
  blockedHandle: string;                  // @alias del usuario bloqueado
  reason?: string;                        // Motivo opcional (ej. "spam", "inapropiado")
  createdAt: Date;
}
```

---

## 3. Especificacion de Endpoints RESTful

### 3.1 Perfil e Identidad

| Metodo | Ruta | Descripcion | Autenticacion |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/profile` | Obtener datos de perfil del usuario autenticado | Bearer JWT |
| `PUT` | `/api/user/profile` | Actualizar nombre, alias, bio, genero y avatar | Bearer JWT |
| `PUT` | `/api/user/presence` | Actualizar estado de presencia manual | Bearer JWT |

#### Payload de actualizacion de perfil (`PUT /api/user/profile`):
```json
{
  "displayName": "Rosy Master",
  "username": "rosi_master",
  "gender": "female",
  "avatarType": "female",
  "email": "rosi_master@nexu.app",
  "bio": "Especialista Frontend · Desarrollo modular en React con enfoque en privacidad."
}
```

#### Respuesta esperada (`200 OK`):
```json
{
  "success": true,
  "message": "Perfil actualizado correctamente.",
  "data": {
    "displayName": "Rosy Master",
    "username": "rosi_master",
    "gender": "female",
    "avatarType": "female",
    "email": "rosi_master@nexu.app",
    "bio": "Especialista Frontend · Desarrollo modular en React con enfoque en privacidad.",
    "updatedAt": "2026-08-22T21:10:00.000Z"
  }
}
```

---

### 3.2 Preferencias y Privacidad

| Metodo | Ruta | Descripcion | Autenticacion |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/preferences` | Obtener preferencias de tema y privacidad | Bearer JWT |
| `PUT` | `/api/user/preferences` | Actualizar preferencias generales y switches | Bearer JWT |

#### Payload de actualizacion de preferencias (`PUT /api/user/preferences`):
```json
{
  "theme": "dark",
  "notifications": {
    "desktop": true,
    "soundIncoming": true,
    "soundOutgoing": true,
    "messagePreview": true,
    "onlineAlerts": false
  },
  "privacy": {
    "readReceipts": true,
    "lastSeen": true,
    "typingIndicator": true,
    "allowStrangers": false
  }
}
```

---

### 3.3 Seguridad y Cambio de Contrasena

| Metodo | Ruta | Descripcion | Autenticacion |
| :--- | :--- | :--- | :--- |
| `PUT` | `/api/user/password` | Cambiar contrasena verificando clave actual | Bearer JWT |

#### Payload de cambio de contrasena (`PUT /api/user/password`):
```json
{
  "currentPassword": "Nexu2026Pass!",
  "newPassword": "NuevaPassword2026Secure!"
}
```

#### Reglas de validacion de contrasena en Backend:
1. Comparacion de `currentPassword` contra el hash almacenado utilizando `bcrypt.compare()`.
2. `newPassword` debe tener un minimo de 8 caracteres.
3. Se genera un nuevo salt (`rounds >= 10`) y se almacena el nuevo hash.
4. Si las credenciales no coinciden, se retorna `400 Bad Request` con mensaje descriptivo: *"La contrasena actual es incorrecta."*

---

### 3.4 Administracion de Contactos Bloqueados

| Metodo | Ruta | Descripcion | Autenticacion |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/blocked` | Listar contactos bloqueados por el usuario | Bearer JWT |
| `POST` | `/api/user/blocked` | Bloquear a un usuario por ID o @alias | Bearer JWT |
| `DELETE` | `/api/user/blocked/:id` | Desbloquear a un usuario | Bearer JWT |

#### Respuesta esperada de listado (`GET /api/user/blocked`):
```json
{
  "success": true,
  "data": [
    {
      "_id": "blk_901283",
      "blockedUserId": "usr_crypto_bot",
      "blockedHandle": "@crypto_bot",
      "avatarType": "neutral",
      "createdAt": "2026-02-14T10:30:00.000Z"
    }
  ]
}
```

---

## 4. Reglas de Negocio y Seguridad

1. **Unicidad de Alias e Inmutabilidad Controlada:**
   * Si el usuario modifica su `username`, el backend debe comprobar la disponibilidad en la tabla `User`.
   * Si el alias ya esta en uso por otra cuenta, retorna `409 Conflict`.
   * El alias debe validar estrictamente la expresion regular `/^[a-zA-Z0-9]{3,10}$/`.
2. **Efecto Inmediato del Bloqueo:**
   * Al agregar un registro en `BlockedContact`, el backend debe cancelar cualquier solicitud de conexion pendiente entre ambos usuarios y suspender la emision de eventos WebSocket en tiempo real hacia el usuario bloqueado.
3. **Privacidad de Doble Check:**
   * Si `privacy.readReceipts === false`, el backend omite emitir el evento `chat:read_receipt` hacia el emisor cuando el receptor lee los mensajes.
4. **Persistencia de Sesiones Multi-Dispositivo:**
   * Las sesiones revocadas desde `/api/auth/sessions/:sessionId` invalidan inmediatamente el token JWT correspondiente mediante lista de revocacion en Redis / Base de Datos.
