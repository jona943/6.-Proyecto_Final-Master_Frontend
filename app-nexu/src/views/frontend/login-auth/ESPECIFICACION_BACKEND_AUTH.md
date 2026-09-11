# Nexu Auth — Especificación Técnica de Backend y Arquitectura de Autenticación

## 1. Visión General del Módulo

El módulo de **Autenticación (login-auth)** de Nexu v1.0 gestiona el ciclo de vida de acceso, registro y seguridad de cuentas de usuario. Opera bajo el principio de **identidad soberana por alias único (3 a 10 caracteres)** y contraseña segura (8+ caracteres), sin requerir números telefónicos ni recolección de metadatos invasivos.

---

## 2. Capacidad Matemática del Espacio de Nombres

El alfabeto permitido contiene **62 símbolos alfanuméricos** por posición (26 letras minúsculas `a-z`, 26 letras mayúsculas `A-Z`, 10 números `0-9` y guión bajo `_`).

### Cálculo Combinatorio Acumulado (Longitudes de 3 a 10 caracteres):

| Longitud | Fórmula | Combinaciones Únicas |
| :--- | :--- | :--- |
| **3 caracteres** | 62^3 | 238,328 |
| **4 caracteres** | 62^4 | 14,776,336 |
| **5 caracteres** | 62^5 | 916,132,832 |
| **6 caracteres** | 62^6 | 56,800,235,584 |
| **7 caracteres** | 62^7 | 3,521,614,606,208 |
| **8 caracteres** | 62^8 | 218,340,105,584,896 |
| **9 caracteres** | 62^9 | 13,537,086,546,263,552 |
| **10 caracteres** | 62^10 | 839,299,365,868,340,224 |
| **Total (3 a 10)** | **Suma Acumulada** | **853,058,371,866,177,960** |

> Capacidad máxima total: **Más de 853 mil billones de combinaciones únicas**, garantizando escasez matemática y disponibilidad a perpetuidad sin sufijos obligatorios.

---

## 3. Esquemas de Base de Datos (Modelos de Entidad)

### 3.1 Modelo: Cuenta de Usuario (`UserAccount`)

```typescript
interface UserAccount {
  _id: string;                    // UUID v4 o ObjectId
  username: string;               // Alias exacto (3-10 car alfanuméricos)
  usernameNormalized: string;     // En minúsculas con índice único estricto (Unique Index)
  passwordHash: string;           // Hash seguro generado con Argon2id o Bcrypt (cost: 12)
  displayName: string;            // Nombre público visible
  email?: string;                 // Correo vinculado opcional (para recuperación)
  avatarType: 'initials' | 'female' | 'male' | 'neutral' | 'shield';
  gender: 'neutral' | 'female' | 'male';
  role: string;                   // ej. "Usuario Nexu", "Administrador Nexu"
  status: 'active' | 'suspended';
  failedLoginAttempts: number;    // Contador para bloqueo por fuerza bruta
  lockUntil?: Date;               // Bloqueo temporal tras 5 intentos fallidos
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Modelo: Token de Sesión (`AuthSessionToken`)

```typescript
interface AuthSessionToken {
  _id: string;
  userId: string;                 // Referencia al UserAccount
  tokenHash: string;              // Hash SHA-256 del JWT o Refresh Token emitido
  deviceName: string;             // ej. "HP EliteBook 840 G5"
  browser: string;                // ej. "Chrome 122"
  ipAddress: string;
  expiresAt: Date;                // Expiración del token (ej. 7 días si rememberMe=true)
  isValid: boolean;
  createdAt: Date;
}
```

---

## 4. Especificación de Endpoints RESTful

### 4.1 Inicio de Sesión (`POST /api/auth/login`)

Autentica las credenciales del usuario y emite un token JWT de acceso.

* **Ruta:** `/api/auth/login`
* **Método:** `POST`
* **Autenticación:** Pública (Rate Limited: 5 intentos/minuto por IP)

#### Payload de Entrada (Request Body):
```json
{
  "username": "adminUser",
  "password": "12345678",
  "rememberMe": true
}
```

#### Respuesta Exitosa (`200 OK`):
```json
{
  "success": true,
  "message": "Autenticación exitosa.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_948201",
      "username": "adminUser",
      "displayName": "Administrador Nexu",
      "role": "System Admin",
      "avatarType": "male",
      "gender": "male"
    }
  }
}
```

#### Respuestas de Error:
* `400 Bad Request`: Campos faltantes o formato de alias inválido (`< 3` o `> 10` caracteres).
* `401 Unauthorized`: Usuario o contraseña incorrectos.
* `429 Too Many Requests`: Cuenta bloqueada temporalmente por exceso de intentos fallidos.

---

### 4.2 Registro de Nuevo Usuario (`POST /api/auth/register`)

Crea un nuevo usuario único con validación de alias y hash de contraseña.

* **Ruta:** `/api/auth/register`
* **Método:** `POST`
* **Autenticación:** Pública (Rate Limited: 10 registros/hora por IP)

#### Payload de Entrada (Request Body):
```json
{
  "username": "mi_nuevo_alias",
  "password": "MiPasswordSeguro2026!"
}
```

#### Respuesta Exitosa (`201 Created`):
```json
{
  "success": true,
  "message": "Usuario creado exitosamente.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_839201",
      "username": "mi_nuevo_alias",
      "displayName": "@mi_nuevo_alias",
      "avatarType": "neutral"
    }
  }
}
```

#### Respuestas de Error:
* `409 Conflict`: El `@alias` ya se encuentra registrado o sellado por otro usuario.
* `400 Bad Request`: La contraseña no cumple con los 8 caracteres mínimos o el alias contiene caracteres no permitidos.

---

### 4.3 Recuperación de Acceso (`POST /api/auth/forgot-password`)

* **Ruta:** `/api/auth/forgot-password`
* **Método:** `POST`

#### Payload de Entrada (Request Body):
```json
{
  "username": "rosi_master"
}
```

#### Respuesta Exitosa (`200 OK`):
```json
{
  "success": true,
  "message": "Si la cuenta existe, se han generado las instrucciones de recuperación."
}
```

---

### 4.4 Cierre de Sesión (`POST /api/auth/logout`)

Invalida el token JWT activo y revoca la sesión en el servidor.

* **Ruta:** `/api/auth/logout`
* **Método:** `POST`
* **Autenticación:** Bearer JWT Token

#### Respuesta Exitosa (`200 OK`):
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente."
}
```

---

### 4.5 Obtener Perfil del Usuario Activo (`GET /api/auth/me`)

* **Ruta:** `/api/auth/me`
* **Método:** `GET`
* **Autenticación:** Bearer JWT Token

#### Respuesta Exitosa (`200 OK`):
```json
{
  "success": true,
  "data": {
    "id": "usr_948201",
    "username": "adminUser",
    "displayName": "Administrador Nexu",
    "email": "admin@nexu.app",
    "role": "System Admin",
    "avatarType": "male",
    "gender": "male"
  }
}
```

---

## 5. Arquitectura de Seguridad y Criptografía

1. **Hash de Contraseñas:**
   * Las contraseñas en texto plano **nunca** se almacenan. Se procesan con `Argon2id` o `Bcrypt` con un factor de trabajo (*salt rounds*) de 12.
2. **Estructura del Token JWT:**
   * Algoritmo: `HMAC-SHA256` (`HS256`) o `Ed25519`.
   * Payload firmado: `{ sub: userId, username, iat, exp }`.
   * Tiempo de vida (*TTL*): 24 horas por defecto (7 días con `rememberMe: true`).
3. **Protección contra Fuerza Bruta (*Brute Force*):**
   * Tras 5 intentos fallidos consecutivos en un lapso de 15 minutos, la cuenta entra en estado de bloqueo temporal (`lockUntil`) por 15 minutos.
4. **Sanitización de Alias en Backend:**
   * Se remueven prefijos `@` y se valida estrictamente contra la expresión regular `/^[a-zA-Z0-9_]{3,10}$/`.
