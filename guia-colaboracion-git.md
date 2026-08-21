# Guía de Colaboración y Flujo de Git — Proyecto Nexu

Esta guía contiene los comandos básicos y las buenas prácticas que utilizaremos el equipo (**Jonathan**, **Rosy**, **EmaRama** y **Victor**) para trabajar de forma ordenada, evitar pisarnos el código y resolver integraciones sin problemas.

---

## 1. Equipo y Asignación de Ramas

Cada integrante cuenta con su propia rama de trabajo dedicada a su módulo:

| Integrante | Rama de Trabajo | Módulo Asignado | Carpeta en el Proyecto |
| :--- | :--- | :--- | :--- |
| **Jonathan** | `feature/jonathan` | Landing Page & Presentación | `src/views/frontend/landing/` |
| **Rosy** | `feature/rosy` | Login & Autenticación | `src/views/frontend/login-auth/` |
| **EmaRama** | `feature/EmaRama` | Chat & Mensajería | `src/views/frontend/chat/` |
| **Victor** | `feature/victor` | Perfil de Usuario & Configuración | `src/views/frontend/profile-settings/` |

> **Regla de Oro:** La rama `main` es la rama central y compartida. Todo el desarrollo diario se realiza dentro de tu rama `feature/...`.

---

## 2. Flujo de Trabajo Diario (Paso a Paso)

Sigue estos pasos **cada vez que vayas a comenzar a trabajar**:

### Paso 1: Actualizar tu copia local de `main`
Antes de escribir código, asegúrate de tener lo último que subió el equipo a `main`:
```bash
# Cambiar a la rama principal
git switch main

# Descargar y aplicar los últimos cambios de GitHub
git pull origin main
```

### Paso 2: Cambiar a tu rama de trabajo
```bash
# Para Jonathan:
git switch feature/jonathan

# Para Rosy:
git switch feature/rosy

# Para EmaRama:
git switch feature/EmaRama

# Para Victor:
git switch feature/victor
```

### Paso 3: Sincronizar tu rama con los cambios nuevos de `main`
Para que tu rama siempre esté al día con lo que hayan subido los demás:
```bash
git merge main
```

### Paso 4: Levantar el servidor de desarrollo y programar
```bash
cd app-nexu
npm run dev
```

---

## 3. Cómo Guardar y Subir tus Cambios a GitHub

Cuando hayas terminado una función, pantalla o avance en tu módulo:

### 1. Ver qué archivos modificaste
```bash
git status
```

### 2. Preparar los archivos para el commit
```bash
git add .
```
*(O si solo quieres agregar archivos específicos: `git add ruta/al/archivo`)*

### 3. Crear el commit con un mensaje claro
```bash
git commit -m "feat(landing): agrega seccion hero y llamados a la accion"
```
*Usa mensajes descriptivos como:*
- `feat(...)`: para nuevas funcionalidades o vistas.
- `fix(...)`: para corrección de errores.
- `style(...)`: para ajustes de CSS o diseño visual.

### 4. Subir tus cambios a tu rama en GitHub
```bash
# Jonathan:
git push origin feature/jonathan

# Rosy:
git push origin feature/rosy

# EmaRama:
git push origin feature/EmaRama

# Victor:
git push origin feature/victor
```

---

## 4. Cómo Integrar tus Avances a `main` (Merge)

Cuando un módulo esté listo y probado, se integra a `main`:

### Método Local:
```bash
# 1. Asegúrate de haber hecho commit y push en tu feature branch
# 2. Cambiar a main y actualizar
git switch main
git pull origin main

# 3. Traer los cambios de tu rama a main
git merge feature/tu-nombre

# 4. Subir main actualizado a GitHub
git push origin main

# 5. Volver a tu rama para seguir trabajando
git switch feature/tu-nombre
```

---

## 5. Resumen Rápido de Comandos Útiles

| Qué quiero hacer | Comando |
| :--- | :--- |
| Ver en qué rama estoy y qué cambios tengo | `git status` |
| Ver la lista de todas las ramas locales | `git branch` |
| Cambiarme de rama | `git switch <nombre-rama>` |
| Crear y cambiarme a una rama nueva | `git switch -c <nombre-rama>` |
| Descargar lo último de GitHub | `git pull origin <rama>` |
| Subir mis cambios a GitHub | `git push origin <rama>` |
| Ver historial de commits resumido | `git log --oneline -n 5` |
| Deshacer cambios no guardados en un archivo | `git restore <archivo>` |

---

**Nexu**
