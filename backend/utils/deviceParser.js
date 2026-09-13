/**
 * Utilidad para detectar dispositivo, plataforma, navegador e IP desde la petición HTTP
 */
export function parseDeviceInfo(req) {
  const ua = req.headers['user-agent'] || ''

  // 1. Extraer dirección IP
  let ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    req.ip ||
    '127.0.0.1'

  if (ip.includes('::ffff:')) {
    ip = ip.replace('::ffff:', '')
  }
  if (ip === '::1' || ip === '127.0.0.1') {
    ip = '127.0.0.1 (Local)'
  }

  // 2. Detectar Plataforma
  let platform = 'Desktop'
  if (/iPad|Tablet/i.test(ua)) {
    platform = 'Tablet'
  } else if (/Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    platform = 'Mobile'
  }

  // 3. Detectar Sistema Operativo / Dispositivo
  let deviceName = 'Dispositivo Desconocido'
  if (/Windows NT 10.0/i.test(ua)) {
    deviceName = 'Windows 10/11'
  } else if (/Windows/i.test(ua)) {
    deviceName = 'Windows PC'
  } else if (/iPhone/i.test(ua)) {
    deviceName = 'iPhone'
  } else if (/iPad/i.test(ua)) {
    deviceName = 'iPad'
  } else if (/Android/i.test(ua)) {
    deviceName = 'Dispositivo Android'
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceName = 'macOS'
  } else if (/Linux/i.test(ua)) {
    deviceName = 'Linux PC'
  }

  // 4. Detectar Navegador Web
  let browser = 'Navegador Web'
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge'
  } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
    browser = 'Google Chrome'
  } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
    browser = 'Apple Safari'
  } else if (/Firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox'
  } else if (/Opera|OPR\//i.test(ua)) {
    browser = 'Opera'
  }

  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()

  return {
    deviceName,
    browser,
    platform,
    ip,
    userAgent: ua,
    lastLoginDate: 'Hoy',
    lastLoginFormattedDate: `${day}/${month}/${year}`,
    lastLoginTime: `${hours}:${minutes}`,
    lastActive: now
  }
}

/**
 * Formatea la fecha de última actividad para mostrar texto amigable
 */
export function formatRelativeActive(date) {
  if (!date) return 'Desconocido'
  const d = new Date(date)
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 2) {
    return 'Activo ahora'
  }
  if (diffMins < 60) {
    return `Activo hace ${diffMins} min`
  }
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) {
    return `Activo hace ${diffHours} h`
  }
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) {
    return 'Activo ayer'
  }
  return `Activo hace ${diffDays} días`
}
