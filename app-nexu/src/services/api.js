// ============================================================================
// CLIENTE DE COMUNICACIÓN HTTP (FRONTEND ↔ BACKEND)
// Centraliza las peticiones de red hacia el servidor Node.js/Express.
// ============================================================================

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`
  }
  return 'http://localhost:5000/api'
}

const API_BASE_URL = getApiBaseUrl()

/**
 * Cliente HTTP ligero basado en Fetch con timeout y manejo de errores.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `Error en la petición: ${response.statusText}`)
    }

    return { success: true, data, status: response.status }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'No se pudo conectar con el servidor backend.',
      status: error.status || 500
    }
  }
}

export const api = {
  // 1. Solicitud de Muestra / Prueba de Vida (Requisito Parte 3)
  async checkHealth() {
    return request('/health')
  },

  // 2. Verificación de alias en vivo
  async checkAlias(alias) {
    return request(`/public/check-alias?alias=${encodeURIComponent(alias)}`)
  },

  // 3. Métricas públicas de red
  async getNetworkStats() {
    return request('/public/network-stats')
  },

  // 4. Búsqueda de usuarios en tiempo real
  async searchUsers(query, currentUsername) {
    return request(`/user/search?q=${encodeURIComponent(query)}&currentUsername=${encodeURIComponent(currentUsername || '')}`)
  },

  // 4. Métodos genéricos
  get(endpoint) {
    return request(endpoint, { method: 'GET' })
  },

  post(endpoint, body) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  },

  put(endpoint, body) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
  },

  delete(endpoint) {
    return request(endpoint, { method: 'DELETE' })
  }
}

export default api
