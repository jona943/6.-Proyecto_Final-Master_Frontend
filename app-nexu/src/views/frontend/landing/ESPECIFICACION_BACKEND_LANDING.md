# Nexu Landing — Especificación Técnica de Backend y Arquitectura de Datos

## 1. Visión General del Módulo

La **Landing Page** de Nexu actúa como el portal de entrada y conversión de la plataforma. A diferencia de las plataformas convencionales, implementa un **verificador reactivo de disponibilidad de alias en tiempo real** (Widget Hero), explica el **Manifiesto de 3 Leyes Fundacionales** y expone el principio de **Escasez Matemática del Namespace (3 a 10 caracteres)**.

Para respaldar esta experiencia en producción, el backend debe proporcionar endpoints públicos ligeros, protegidos contra abuso y con latencias de respuesta ultrarrápidas (< 40 ms).

---

## 2. Esquemas de Base de Datos (Modelos de Entidad)

### 2.1 Índice de Unicidad y Namespace (`User.username`)
El modelo principal de usuario debe garantizar la unicidad matemática estricta a nivel de base de datos (índice único insensible a mayúsculas/minúsculas).

```typescript
interface UserNamespace {
  username: string;               // 3 a 10 caracteres: ^[a-zA-Z0-9_]{3,10}$
  usernameNormalized: string;     // En minúsculas para comparaciones indexadas O(1)
  isReserved: boolean;            // Indica si fue sellado por el protocolo
  reservedAt: Date;               // Marca de tiempo de reclamo
  status: 'active' | 'suspended';
}
```

### 2.2 Lista de Nombres Reservados del Sistema (`ReservedKeywords`)
Identificadores que no pueden ser reclamados por usuarios públicos para prevenir suplantación de identidad del sistema.

```typescript
const SYSTEM_RESERVED_ALIASES = [
  'admin', 'administrator', 'root', 'nexu', 'support', 
  'system', 'official', 'security', 'bot', 'assistant',
  'moderator', 'dev', 'api', 'help', 'billing'
];
```

---

## 3. Especificación de Endpoints RESTful Públicos

### 3.1 Verificación de Disponibilidad de Alias en Vivo

Permite al widget interactivo del Hero verificar si un `@alias` está disponible mientras el usuario escribe.

| Método | Ruta | Descripción | Autenticación | Rate Limit |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/public/check-alias` | Consulta si un identificador está libre para registro | Pública (Sin Auth) | 30 req/min por IP |

#### Query Parameters:
* `alias` (string, requerido): Identificador de 3 a 10 caracteres alfanuméricos.

#### Ejemplo de Solicitud:
```http
GET /api/public/check-alias?alias=rosi_master HTTP/1.1
Host: api.nexu.app
```

#### Respuestas Esperadas:

**1. Alias Disponible (`200 OK`):**
```json
{
  "success": true,
  "available": true,
  "alias": "rosi_master",
  "formatted": "@rosi_master",
  "message": "El identificador está libre para ser reclamado."
}
```

**2. Alias Ocupado / Reclamado (`200 OK`):**
```json
{
  "success": true,
  "available": false,
  "alias": "adminuser",
  "formatted": "@adminUser",
  "message": "Este identificador ya ha sido sellado por otro usuario."
}
```

**3. Alias Inválido / Reservado por Sistema (`400 Bad Request`):**
```json
{
  "success": false,
  "available": false,
  "error": "INVALID_ALIAS_FORMAT",
  "message": "El alias debe tener entre 3 y 10 caracteres alfanuméricos y no ser palabra reservada."
}
```

---

### 3.2 Métricas de Red y Escasez Matemática (Público)

Alimenta la sección de Escasez Matemática con datos reales del estado de la red.

| Método | Ruta | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/public/network-stats` | Retorna métricas agregadas del protocolo | Pública (Caché CDN 60s) |

#### Respuesta esperada (`200 OK`):
```json
{
  "success": true,
  "data": {
    "protocolVersion": "v1.0.0",
    "totalRegisteredAliases": 14208,
    "phoneNumbersRequired": 0,
    "activeEndToEndNodes": 2340,
    "encryptionStandard": "Curve25519 · AES-256-GCM"
  }
}
```

---

### 3.3 Verificación de Salud del Protocolo (Health Check)

| Método | Ruta | Descripción | Autenticación |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Estado del servidor y latencia de conexión | Pública |

#### Respuesta esperada (`200 OK`):
```json
{
  "status": "healthy",
  "uptime": 864200,
  "timestamp": "2026-08-23T16:15:00.000Z",
  "version": "1.0.0"
}
```

---

## 4. Reglas de Negocio, Validación y Seguridad en Backend

1. **Sanitización Estricta de Entrada:**
   * El backend debe ejecutar la misma expresión regular que el cliente: `/^[a-zA-Z0-9_]{3,10}$/`.
   * Cualquier petición con caracteres especiales (`<`, `>`, `;`, espacios, emojis o símbolos SQL/NoSQL) debe ser rechazada inmediatamente en la capa de middleware antes de consultar la base de datos.
2. **Protección contra Enumeración Masiva (*Rate Limiting*):**
   * El endpoint `/api/public/check-alias` debe estar protegido mediante Redis / Token Bucket limitando a máximo 30 consultas por minuto por dirección IP para evitar escaneos automatizados de nombres de usuario.
3. **Persistencia del Flujo de Reclamo (Landing → Registro):**
   * El frontend transmite el alias verificado mediante `sessionStorage` (`nexu_prefilled_alias`) para prellenar el campo en el formulario de registro (`/api/auth/register`).
4. **Insensibilidad a Mayúsculas/Minúsculas (*Case-Insensitive*):**
   * `@AdminUser` y `@adminuser` corresponden exactamente al mismo identificador único en base de datos.
