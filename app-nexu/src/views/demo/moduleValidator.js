/**
 * moduleValidator.js
 * Script de validación y configuración de módulos para el Developer Hub.
 *
 * Determina dinámicamente si un módulo está en desarrollo activo en su rama
 * o si sus cambios ya se encuentran completamente integrados en la rama 'main'.
 */

export const REPO_CONFIG = {
  owner: 'jona943',
  repo: '6.-Proyecto_Final-Master_Frontend',
  mainBranch: 'main'
}

export const MODULES_DATA = [
  {
    id: 'landing',
    badge: 'Módulo 01 · Presentación',
    title: 'Landing Page',
    author: 'Jonathan',
    branch: 'feature/jonathan',
    desc: 'Página de aterrizaje, Hero Section con llamado a la acción (CTA), demostración interactiva de chat, características clave y pie de página.',
    initialStatus: {
      label: '● En Desarrollo',
      type: 'in-progress', // 'ready' | 'in-progress'
      detail: 'Rama feature/jonathan'
    }
  },
  {
    id: 'login',
    badge: 'Módulo 02 · Autenticación',
    title: 'Login & Autenticación',
    author: 'Rosy',
    branch: 'feature/rosy',
    desc: 'Pantallas de inicio de sesión, registro de nuevos usuarios, recuperación de contraseña y validación visual de formularios.',
    initialStatus: {
      label: '● En Desarrollo',
      type: 'in-progress',
      detail: 'Rama feature/rosy'
    }
  },
  {
    id: 'chat',
    badge: 'Módulo 03 · Mensajería',
    title: 'Chat & Comunicación',
    author: 'EmaRama',
    branch: 'feature/EmaRama',
    desc: 'Sidebar de contactos, canales activos, burbujas de mensajes enviadas/recibidas, barra de input y eventos en tiempo real.',
    initialStatus: {
      label: '● En Desarrollo',
      type: 'in-progress',
      detail: 'Rama feature/EmaRama'
    }
  }
]

/**
 * Consulta la API pública de GitHub para verificar si una rama feature
 * tiene commits pendientes respecto a la rama 'main'.
 *
 * @param {string} branchName Nombre de la rama feature (ej: 'feature/jonathan')
 * @returns {Promise<{ label: string, type: string, detail: string }>}
 */
export async function checkBranchStatus(branchName) {
  try {
    const url = `https://api.github.com/repos/${REPO_CONFIG.owner}/${REPO_CONFIG.repo}/compare/${REPO_CONFIG.mainBranch}...${branchName}`
    const response = await fetch(url)

    if (!response.ok) {
      // Si hay error de red o límite de API, devolver estado seguro en desarrollo
      return {
        label: '● En Desarrollo',
        type: 'in-progress',
        detail: `Rama ${branchName}`
      }
    }

    const data = await response.json()

    // Si la rama tiene commits por delante de main (ahead_by > 0) -> Está en desarrollo
    if (data.ahead_by > 0) {
      return {
        label: `● En Desarrollo (${data.ahead_by} commit${data.ahead_by > 1 ? 's' : ''} pendiente${data.ahead_by > 1 ? 's' : ''})`,
        type: 'in-progress',
        detail: `Rama ${branchName}`
      }
    }

    // Si la rama es idéntica a main y tiene commits
    if (data.status === 'identical') {
      return {
        label: '● Sincronizado con main',
        type: 'ready',
        detail: 'Rama al día'
      }
    }

    return {
      label: '● En Desarrollo',
      type: 'in-progress',
      detail: `Rama ${branchName}`
    }
  } catch {
    return {
      label: '● En Desarrollo',
      type: 'in-progress',
      detail: `Rama ${branchName}`
    }
  }
}
