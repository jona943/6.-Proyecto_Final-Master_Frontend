/**
 * Servicio de Almacenamiento Seguro Local (Media Vault) Nexu
 * - Utiliza IndexedDB nativo para soportar almacenamiento de cientos de MB en el dispositivo
 * - Resuelve el límite crítico de 5MB de LocalStorage
 * - Permite acceso instantáneo y fluido sin peticiones de red repetidas
 */

const DB_NAME = 'nexu_vault_db'
const DB_VERSION = 1
const STORE_NAME = 'media'

let dbPromise = null

function openDatabase() {
  if (dbPromise) return dbPromise

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB no está disponible en este entorno.'))
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fileId' })
      }
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      console.error('Error al abrir IndexedDB Nexu:', event.target.error)
      reject(event.target.error)
    }
  })

  return dbPromise
}

export const mediaVault = {
  /**
   * Guarda un recurso multimedia en IndexedDB
   * @param {string} fileId - Identificador único
   * @param {object} record - { dataUrl, name, type, size, mimeType }
   */
  async saveMedia(fileId, record) {
    if (!fileId || !record) return false

    try {
      const db = await openDatabase()
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)

        const item = {
          fileId,
          ...record,
          savedAt: Date.now()
        }

        const req = store.put(item)
        req.onsuccess = () => resolve(true)
        req.onerror = (e) => {
          console.error('Error al guardar en mediaVault:', e.target.error)
          reject(e.target.error)
        }
      })
    } catch (e) {
      console.warn('Fallback: guardando en localStorage temporal si IndexedDB falla', e)
      try {
        localStorage.setItem(fileId, record.dataUrl || '')
        return true
      } catch {
        return false
      }
    }
  },

  /**
   * Recupera un recurso multimedia por su fileId
   * @returns {Promise<{ fileId, dataUrl, name, type, size, mimeType } | null>}
   */
  async getMedia(fileId) {
    if (!fileId) return null

    try {
      const db = await openDatabase()
      const record = await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const req = store.get(fileId)

        req.onsuccess = () => resolve(req.result || null)
        req.onerror = (e) => reject(e.target.error)
      })

      if (record) return record
    } catch (e) {
      console.warn('Error leyendo de IndexedDB:', e)
    }

    // Verificación de respaldo en localStorage
    try {
      const localFallback = localStorage.getItem(fileId)
      if (localFallback) {
        return { fileId, dataUrl: localFallback }
      }
    } catch {
      // Ignorar
    }

    return null
  },

  /**
   * Elimina un archivo de la bóveda local
   */
  async deleteMedia(fileId) {
    if (!fileId) return false
    try {
      const db = await openDatabase()
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(fileId)
      try {
        localStorage.removeItem(fileId)
      } catch {}
      return true
    } catch (e) {
      console.error('Error eliminando de mediaVault:', e)
      return false
    }
  }
}

export default mediaVault
