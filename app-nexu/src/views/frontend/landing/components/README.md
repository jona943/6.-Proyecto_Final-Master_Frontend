# 🧩 Componentes de la Landing Page (NexuHub)

Este directorio contiene la suite de **subcomponentes modulares** que conforman la vista principal de la Landing Page de **NexuHub** (`nexuhub.me`).

---

## 📐 Arquitectura y Modularización CSS

Cada subcomponente cuenta con su propio archivo CSS dedicado para garantizar la **encapsulacion, mantenibilidad y reusabilidad**:

```
components/
├── README.md                      # 📖 Guía de componentes y estructura
├── LandingNavbar.jsx              # 0. Navbar superior flotante de cristal
├── LandingNavbar.css              #    - Estilos y responsivo del Navbar
├── HeroSection.jsx                # 1. Sección Hero cinematográfica y buscador de alias
├── HeroSection.css                #    - Estilos, luces glow y animaciones del Hero
├── ManifestoCarouselSection.jsx   # 2. Sección El Manifiesto (Carrusel de 3 Leyes)
├── ManifestoCarouselSection.css   #    - Estilos, tarjetas, tabs y animación elástica
├── ScarcityCtaSection.jsx         # 3. Sección Escasez Matemática y CTA final
├── ScarcityCtaSection.css         #    - Estilos, métricas y micro-footer integrado
├── LandingFooter.jsx              # 4. Pie de página independiente (opcional)
└── LandingFooter.css              #    - Estilos del pie de página standalone
```

---

## 🔍 Mapa de Subcomponentes y Responsabilidades

### 0. `LandingNavbar` (`LandingNavbar.jsx` + `LandingNavbar.css`)
* **Propósito:** Navegación flotante persistente con efecto de cristal (`backdrop-filter: blur`).
* **Elementos clave:** Logo `N`, marca **NexuHub**, badge `nexuhub.me` y accesos directos a Iniciar Sesión / Reclamar Alias.

### 1. `HeroSection` (`HeroSection.jsx` + `HeroSection.css`)
* **Propósito:** Primera impresión visual de pantalla completa (`100dvh`).
* **Elementos clave:**
  - Badge `NEXUHUB.ME · PROTOCOLO DIRECTO`.
  - Formulario reactivo para verificar disponibilidad de alias en vivo (`nexuhub.me/@tu_alias`).
  - Indicador animado de scroll (*Mouse Wheel*).

### 2. `ManifestoCarouselSection` (`ManifestoCarouselSection.jsx` + `ManifestoCarouselSection.css`)
* **Propósito:** Presentación de las **3 Leyes Inquebrantables de NexuHub**.
* **Elementos clave:**
  - Tabs interactivos y soporte táctil para deslizamiento (*swipe*).
  - Transición elástica de tarjetas (`cardSlideFade`) e imágenes conceptuales.

### 3. `ScarcityCtaSection` (`ScarcityCtaSection.jsx` + `ScarcityCtaSection.css`)
* **Propósito:** Llamado final a la acción basado en la escasez del namespace alfanumérico.
* **Elementos clave:**
  - Métricas públicas de red (3-10 caracteres, 0 teléfonos, 100% propiedad).
  - Micro-footer integrado con enlaces a Términos y Privacidad.

### 4. `LandingFooter` (`LandingFooter.jsx` + `LandingFooter.css`)
* **Propósito:** Pie de página standalone utilizado cuando la vista se despliega sin la barra de micro-footer de Escasez.

---

## 🛠️ Convenciones de Desarrollo
1. **Modificación de Estilos:** Si requieres ajustar el diseño de una sección específica, edita directamente su archivo `.css` hermano (ej. `HeroSection.css`).
2. **Animaciones:** Las animaciones globales de pulso ambiental (`ambientGlowPulse`) se definen y reutilizan en los componentes que lo requieren.
3. **Build:** Vite empaqueta automáticamente todos los archivos CSS importados en un único bundle optimizado durante la compilación de producción.
