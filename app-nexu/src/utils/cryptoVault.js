/**
 * Utilidad criptografica para cifrado simetrico XOR y codificacion Base64
 * Utilizada para salvaguardar el historial local del bot y datos sensibles en el cliente
 */

const ENCRYPTION_KEY = 'NEXU_SECURE_VAULT_2026'

export const encryptData = (data) => {
  try {
    const str = JSON.stringify(data)
    let encrypted = ''
    for (let i = 0; i < str.length; i++) {
      encrypted += String.fromCharCode(str.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    }
    return btoa(encrypted)
  } catch (error) {
    console.error('[CryptoVault Error al encriptar]:', error.message)
    return ''
  }
}

export const decryptData = (encodedData) => {
  try {
    if (!encodedData) return null
    const decoded = atob(encodedData)
    let decrypted = ''
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    }
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}
