# ️ Componentes de Perfil y Configuración (Profile & Settings)

Este directorio contiene los subcomponentes y sus respectivas hojas de estilo CSS modularizadas para el módulo de **Perfil y Ajustes** de NexuHub.

---

##  Arquitectura y Modularización CSS

El módulo ha sido desacoplado de un único archivo monolítico a estilos individuales y específicos por subcomponente:

```text
components/
├── README.md                      # Guía de componentes y arquitectura
├── ProfileHeaderCard.jsx          # Cabecera con metadatos del módulo y badge de usuario
├── ProfileHeaderCard.css          # Estilos del header y chip de usuario
├── SettingsNavTabs.jsx            # Barra de pestañas de navegación horizontal
├── SettingsNavTabs.css            # Estilos de los botones de pestañas y estado activo
├── GeneralProfileTab.jsx          # Pestaña 1: Avatar, género, presencia, nombre y bio
├── GeneralProfileTab.css          # Estilos del hero de perfil, grids de selección y formulario
├── PreferencesTab.jsx             # Pestaña 2: Apariencia/Tema y toggles de notificación
├── PreferencesTab.css             # Estilos de tarjetas de preview de tema y switches
├── PrivacySecurityTab.jsx         # Pestaña 3: Toggles de privacidad, contraseña y sesiones
├── PrivacySecurityTab.css         # Estilos de lista de sesiones y dispositivos
├── BlockedUsersTab.jsx            # Pestaña 4: Lista y desbloqueo de usuarios
├── BlockedUsersTab.css            # Estilos de filas de usuarios bloqueados y empty state
├── AvatarSelectorModal.jsx        # Modal emergente para seleccionar avatar vectorial
└── AvatarSelectorModal.css        # Estilos del backdrop, diálogo y grid de avatares
```

---

##  Sistema de Diseño y Tokens Empleados

- **Fondo Global / Glassmorphism:** Utiliza fondos translúcidos `var(--bg-surface-glass)` combinados con `backdrop-filter: blur(16px)` para acoplarse con la imagen de fondo estática global.
- **Paleta Oficial:** `Obsidian Carbon` (`#08090b` / `#101216`) y acento `Acid Lime` (`#d4ff00`).
- **Iconografía Vectorial:** Integración 100% SVG nativa sin emojis ni dependencias externas pesadas.
