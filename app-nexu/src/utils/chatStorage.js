import { encryptData, decryptData } from './cryptoVault'

/**
 * Chat inicial por defecto (Nexu Assistant)
 */
export const INITIAL_CHATS_DEFAULT = [
  {
    id: 'chat_bot',
    name: 'Nexu Assistant',
    handle: '@nexu_assistant',
    avatar: 'NX',
    isBot: true,
    status: 'online',
    statusText: 'Asistente de Protocolo · En linea',
    unreadCount: 0,
    isPending: false,
    role: 'Asistente de Privacidad',
    email: 'assistant@nexu.app',
    bio: 'Bot automatizado para verificar el funcionamiento de la mensajeria punto a punto.',
    messages: [
      {
        id: 'msg_01',
        sender: 'them',
        text: 'Bienvenido al santuario de comunicacion privada de Nexu. Todas tus conversaciones son directas y anonimas.',
        time: '10:00 AM',
        status: 'read'
      }
    ]
  }
]

export const isChatFavorite = (favList, chatId) => {
  if (!Array.isArray(favList) || !chatId) return false
  const lower = chatId.toLowerCase()
  return favList.some((id) => (id || '').toLowerCase() === lower)
}

export const loadFavorites = (username) => {
  if (!username) return []
  try {
    const clean = username.trim().toLowerCase()
    const raw = localStorage.getItem(`nexu_favs_${clean}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const saveFavorites = (username, favIds) => {
  if (!username) return
  try {
    const clean = username.trim().toLowerCase()
    localStorage.setItem(`nexu_favs_${clean}`, JSON.stringify(favIds))
  } catch (e) {
    console.error('[Error al guardar favoritos]:', e)
  }
}

export const isChatManualUnread = (unreadList, chatId) => {
  if (!Array.isArray(unreadList) || !chatId) return false
  const lower = chatId.toLowerCase()
  return unreadList.some((id) => (id || '').toLowerCase() === lower)
}

export const loadManualUnread = (username) => {
  if (!username) return []
  try {
    const clean = username.trim().toLowerCase()
    const raw = localStorage.getItem(`nexu_manual_unread_${clean}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const saveManualUnread = (username, unreadIds) => {
  if (!username) return
  try {
    const clean = username.trim().toLowerCase()
    localStorage.setItem(`nexu_manual_unread_${clean}`, JSON.stringify(unreadIds))
  } catch (e) {
    console.error('[Error al guardar no leidos manuales]:', e)
  }
}

export const getInitialChats = (username) => {
  if (!username) return INITIAL_CHATS_DEFAULT
  const clean = username.trim().toLowerCase()
  const chatsCopy = JSON.parse(JSON.stringify(INITIAL_CHATS_DEFAULT))
  try {
    const savedBotHistory = localStorage.getItem(`nexu_bot_history_${clean}`)
    if (savedBotHistory) {
      const decrypted = decryptData(savedBotHistory)
      if (decrypted) chatsCopy[0].messages = decrypted
    }
    const favs = loadFavorites(clean)
    const manualUnread = loadManualUnread(clean)
    chatsCopy.forEach((c) => {
      c.isFavorite = isChatFavorite(favs, c.id)
      if (isChatManualUnread(manualUnread, c.id)) {
        c.unreadCount = Math.max(c.unreadCount || 0, 1)
      }
    })
  } catch (e) {
    console.error('[Error al leer historial del bot o favoritos]:', e)
  }
  return chatsCopy
}

export const saveBotHistory = (username, chats) => {
  try {
    const clean = (username || '').trim().toLowerCase()
    const botChat = chats.find((c) => c.id === 'chat_bot')
    if (botChat) {
      localStorage.setItem(`nexu_bot_history_${clean}`, encryptData(botChat.messages))
    }
  } catch (e) {
    console.error('[Error al guardar historial del bot]:', e)
  }
}
