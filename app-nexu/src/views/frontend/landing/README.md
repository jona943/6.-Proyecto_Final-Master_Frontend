# Nexu — Módulo de Landing Page (v1.0)

**Rama de Desarrollo:** `feature/jonathan`  
**Responsable:** Jonathan Medina  
**Ubicación:** `src/views/frontend/landing/`

---

## 1. Visión y Alcance del Proyecto (MVP Simplificado)

Nexu v1.0 se enfoca exclusivamente en la **esencia de la mensajería directa en tiempo real**, reduciendo la complejidad y eliminando funciones pesadas como grupos o canales para esta primera etapa:

1. **Creación de Usuario Rápida:**
   - Registro instantáneo con **alias personal** y contraseña.
   - Cero requerimiento de números telefónicos o datos invasivos.

2. **Inicio de Sesión y Acceso Seguro:**
   - Autenticación directa y fluida para volver a tus conversaciones.

3. **Mensajería Directa 1 a 1 en Tiempo Real:**
   - Comunicación instantánea entre dos usuarios con latencia mínima y entrega fluida.

---

## 2. Estructura de la Landing Page

### A. Hero Section (Pantalla de Primer Impacto)
- **Logotipo e Identidad:** Logo insignia de Nexu con presencia limpia y moderna.
- **Titular Directo:** *"Mensajería directa, libre y privada."*
- **Subtítulo:** *"Crea tu usuario, inicia sesión y chatea al instante en tiempo real sin números de teléfono."*
- **Llamados a la Acción (CTA):**
  - Botón primario: `Crear usuario`
  - Botón secundario: `Iniciar sesión`
- **Guía Intuitiva de Navegación:** Indicador animado que invita al usuario a explorar el resto de la página.

### B. Carrusel de Ventajas Esenciales (4 Pilares del MVP)
1. **Identidad por Alias:** Regístrate en segundos con un nombre de usuario único. Sin números de celular.
2. **Mensajería Directa en Tiempo Real:** Conversaciones 1 a 1 instantáneas mediante WebSockets.
3. **Acceso Seguro:** Inicia sesión de forma rápida y mantén tus conversaciones protegidas.
4. **Diseño Minimalista & Modo Oscuro:** Interfaz limpia, ligera y pensada para el confort visual continuo.

### C. Pie de Página Minimalista (Footer)
- Logotipo de Nexu v1.0.
- Enlaces de navegación esenciales y copyright oficial.

---

## 3. Identidad Visual

- **Paleta de Colores:** Obsidian Carbon (`#08090b`), Superficie (`#101216`), Acid Lime (`#d4ff00`), Textos claros (`#f4f5f7`).
- **Iconografía:** 100% Iconos Vectoriales SVG nativos, sin emojis para mantener una estética consistente y profesional.
- **Tipografía:** `Plus Jakarta Sans` y `JetBrains Mono`.

---

## 4. Estructura de Archivos del Módulo

```text
src/views/frontend/landing/
├── Landing.jsx      # Componente principal con Hero minimalista y Carrusel de ventajas
├── Landing.css      # Estilos CSS dedicados y responsivos
└── README.md        # Documento oficial de especificaciones del módulo
```
