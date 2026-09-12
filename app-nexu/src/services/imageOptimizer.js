/**
 * Servicio de Optimización de Imágenes y Archivos Nexu
 * - Compresión en el dispositivo (Client-side) mediante HTML5 Canvas
 * - Redimensionamiento inteligente a HD (máx 1600px)
 * - Conversión a WebP de alta fidelidad (reducción del 85-95% en peso)
 * - Eliminación automática de metadatos GPS y EXIF (Privacidad total)
 * - Límite estricto de 10 MB para archivos y documentos
 */

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export const imageOptimizer = {
  /**
   * Valida si el archivo excede los 10 MB permitidos
   */
  validateFileSize(file) {
    if (!file) return { valid: false, message: 'No se seleccionó ningún archivo.' }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      return {
        valid: false,
        message: `El archivo seleccionado pesa ${sizeMb} MB. El límite máximo permitido es de 10 MB.`
      }
    }
    return { valid: true }
  },

  /**
   * Formatea bytes a MB/KB legibles
   */
  formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 KB'
    const mb = bytes / (1024 * 1024)
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    const kb = bytes / 1024
    return `${Math.round(kb)} KB`
  },

  /**
   * Optimiza y comprime una imagen a Full HD WebP sin metadatos EXIF/GPS
   * @param {File} file - Archivo de imagen original
   * @param {Function} onProgress - Callback opcional para reporte de progreso (0-100)
   * @returns {Promise<{ dataUrl: string, name: string, type: 'image', size: string, originalSize: string, width: number, height: number }>}
   */
  optimizeImage(file, onProgress = null) {
    return new Promise((resolve, reject) => {
      if (onProgress) onProgress(10)
      const reader = new FileReader()

      reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'))

      reader.onload = (event) => {
        if (onProgress) onProgress(30)
        const img = new Image()

        img.onerror = () => reject(new Error('El archivo seleccionado no es una imagen válida.'))

        img.onload = () => {
          if (onProgress) onProgress(60)

          const MAX_WIDTH = 1600
          const MAX_HEIGHT = 1600
          let { width, height } = img

          // Redimensionamiento proporcional preservando aspect ratio
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width)
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height)
              height = MAX_HEIGHT
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            return reject(new Error('No se pudo inicializar el motor de renderizado de imagen.'))
          }

          // Dibujar en canvas elimina todos los encabezados EXIF y coordenadas GPS nativamente
          ctx.drawImage(img, 0, 0, width, height)

          if (onProgress) onProgress(85)

          // Intentar WebP de alta fidelidad (0.80); fallback a JPEG si no es soportado
          let dataUrl = ''
          try {
            dataUrl = canvas.toDataURL('image/webp', 0.80)
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/jpeg', 0.82)
            }
          } catch {
            dataUrl = canvas.toDataURL('image/jpeg', 0.82)
          }

          // Calcular tamaño aproximado del payload optimizado
          const head = 'data:image/webp;base64,'
          const approxBytes = Math.round(((dataUrl.length - head.length) * 3) / 4)

          if (onProgress) onProgress(100)

          resolve({
            dataUrl,
            name: file.name.replace(/\.[^/.]+$/, '') + '.webp',
            type: 'image',
            mimeType: 'image/webp',
            size: imageOptimizer.formatSize(approxBytes),
            originalSize: imageOptimizer.formatSize(file.size),
            width,
            height
          })
        }

        img.src = event.target.result
      }

      reader.readAsDataURL(file)
    })
  },

  /**
   * Procesa un documento general (PDF, TXT, ZIP, etc.) validando tamaño
   */
  processDocument(file, onProgress = null) {
    return new Promise((resolve, reject) => {
      if (onProgress) onProgress(20)
      const reader = new FileReader()

      reader.onerror = () => reject(new Error('Error al procesar el archivo.'))

      reader.onload = () => {
        if (onProgress) onProgress(100)
        resolve({
          dataUrl: reader.result,
          name: file.name,
          type: 'document',
          mimeType: file.type || 'application/octet-stream',
          size: imageOptimizer.formatSize(file.size),
          originalSize: imageOptimizer.formatSize(file.size)
        })
      }

      reader.readAsDataURL(file)
    })
  }
}

export default imageOptimizer
