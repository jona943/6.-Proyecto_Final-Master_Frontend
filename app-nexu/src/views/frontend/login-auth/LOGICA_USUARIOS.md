# Especificación de Reglas de Negocio: Identidad por Alias · Nexu Auth

Este documento define la lógica de registro e inicio de sesión simplificada para el módulo `login-auth`. El sistema opera bajo un modelo de identidad por alias único sin requerir contraseñas, correos electrónicos ni números telefónicos.

---

## 1. Reglas de Validación del Alias (Username)

* **Longitud permitida:** Mínimo 3 caracteres, máximo 10 caracteres.
* **Caracteres válidos:** 
  * Letras mayúsculas (`A-Z`)
  * Letras minúsculas (`a-z`)
  * Números (`0-9`)
* **Caracteres prohibidos:** Espacios, símbolos (`@`, `#`, `$`, `.`, `_`, `-`, etc.) y acentos.
* **Expresión Regular:** `/^[a-zA-Z0-9]{3,10}$/`
* **Unicidad:** Cada alias debe ser único en el sistema.

---

## 2. Capacidad Matemática del Espacio de Nombres

El alfabeto disponible contiene 62 símbolos posibles por posición (26 letras minúsculas + 26 letras mayúsculas + 10 números).

### Cálculo Combinatorio Acumulado (Longitudes de 3 a 10 caracteres):

| Longitud | Fórmula | Combinaciones Únicas |
| :--- | :--- | :--- |
| 3 caracteres | 62^3 | 238,328 |
| 4 caracteres | 62^4 | 14,776,336 |
| 5 caracteres | 62^5 | 916,132,832 |
| 6 caracteres | 62^6 | 56,800,235,584 |
| 7 caracteres | 62^7 | 3,521,614,606,208 |
| 8 caracteres | 62^8 | 218,340,105,584,896 |
| 9 caracteres | 62^9 | 13,537,086,546,263,552 |
| 10 caracteres | 62^10 | 839,299,365,868,340,224 |
| **Total (3 a 10)** | **Suma** | **853,058,371,866,177,960** |

Capacidad máxima total: **853,058,371,866,177,960** identificadores únicos (más de 853 mil billones de combinaciones).

---

## 3. Comportamiento de los Formularios

### Formulario de Registro (Crear Alias)
1. El usuario introduce su alias deseado.
2. Se ejecuta validación en tiempo real (longitud, caracteres permitidos y disponibilidad).
3. Al enviar, el alias queda registrado y se inicia la sesión de forma inmediata.

### Formulario de Inicio de Sesión (Entrar con Alias)
1. El usuario introduce su alias previamente registrado.
2. Se valida el formato alfanumérico.
3. Al enviar, se accede directamente al panel de mensajería cargando las conversaciones asociadas al alias.

---

## 4. Lineamientos de UX e Interfaz Responsiva
* Entrada con prefijo `@` integrado visualmente para reforzar el concepto de alias.
* Contador interactivo de caracteres en el extremo derecho del input (`X/10`).
* Indicadores visuales de estado: verde para formato válido, rojo/ámbar para caracteres no permitidos o longitud insuficiente.
* Adaptabilidad total mediante unidades relativas (`clamp()`, `rem`, flexbox) garantizando legibilidad en móviles (320px+), tablets y pantallas de escritorio.
