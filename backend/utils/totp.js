import crypto from 'crypto'
import QRCode from 'qrcode'

// Alfabeto estándar Base32 RFC 4648
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/**
 * Decodifica una cadena Base32 a Buffer
 */
function base32Decode(base32Str) {
  const cleanStr = base32Str.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '')
  let bits = 0
  let value = 0
  const output = []

  for (let i = 0; i < cleanStr.length; i++) {
    const val = BASE32_ALPHABET.indexOf(cleanStr[i])
    if (val === -1) continue
    value = (value << 5) | val
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return Buffer.from(output)
}

/**
 * Genera un secreto Base32 aleatorio
 */
export function generateSecret(length = 20) {
  const randomBytes = crypto.randomBytes(length)
  let base32 = ''
  let bits = 0
  let value = 0

  for (let i = 0; i < randomBytes.length; i++) {
    value = (value << 8) | randomBytes[i]
    bits += 8

    while (bits >= 5) {
      base32 += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    base32 += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return base32
}

/**
 * Genera el código TOTP de 6 dígitos para un timestamp y secreto dados (RFC 6238)
 */
export function generateTotpCode(secret, time = Date.now(), timeStep = 30) {
  const key = base32Decode(secret)
  const epoch = Math.floor(time / 1000)
  const counter = Math.floor(epoch / timeStep)

  // Counter en 8 bytes Big Endian
  const counterBuf = Buffer.alloc(8)
  counterBuf.writeBigInt64BE(BigInt(counter))

  const hmac = crypto.createHmac('sha1', key)
  hmac.update(counterBuf)
  const digest = hmac.digest()

  // Dynamic truncation (RFC 4226)
  const offset = digest[digest.length - 1] & 0xf
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)

  const otp = binary % 1000000
  return otp.toString().padStart(6, '0')
}

/**
 * Verifica un código TOTP contra el secreto permitiendo ventana de deriva temporal (clock drift)
 */
export function verifyTotp(token, secret, window = 1, timeStep = 30) {
  if (!token || !secret) return false
  const cleanToken = token.toString().trim()
  if (cleanToken.length !== 6) return false

  const now = Date.now()
  for (let i = -window; i <= window; i++) {
    const testTime = now + i * timeStep * 1000
    const expected = generateTotpCode(secret, testTime, timeStep)
    if (crypto.timingSafeEqual(Buffer.from(cleanToken), Buffer.from(expected))) {
      return true
    }
  }

  return false
}

/**
 * Genera la URI otpauth para aplicaciones Authenticator
 */
export function generateOtpAuthUri(username, secret, issuer = 'Nexu') {
  const cleanUser = encodeURIComponent(username.replace(/^@/, ''))
  const cleanIssuer = encodeURIComponent(issuer)
  return `otpauth://totp/${cleanIssuer}:${cleanUser}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`
}

/**
 * Genera un código QR en DataURL a partir de la URI otpauth
 */
export async function generateQrCodeDataUrl(otpAuthUri) {
  return QRCode.toDataURL(otpAuthUri, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 260,
    color: {
      dark: '#0f172a',
      light: '#ffffff'
    }
  })
}

/**
 * Genera códigos de respaldo de emergencia únicos (ej. NEXU-8192-M72A)
 */
export function generateBackupCodes(count = 5) {
  const codes = []
  for (let i = 0; i < count; i++) {
    const randA = crypto.randomBytes(2).toString('hex').toUpperCase()
    const randB = crypto.randomBytes(2).toString('hex').toUpperCase()
    codes.push(`NEXU-${randA}-${randB}`)
  }
  return codes
}
