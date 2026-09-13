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

export const loadCachedChats = (username) => {
  if (!username) return null
  try {
    const clean = username.trim().toLowerCase()
    const raw = localStorage.getItem(`nexu_cached_chats_${clean}`)
    if (!raw) return null
    const decrypted = decryptData(raw)
    if (decrypted && Array.isArray(decrypted) && decrypted.length > 0) {
      return decrypted
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

export const saveCachedChats = (username, chats) => {
  if (!username || !Array.isArray(chats) || chats.length === 0) return
  try {
    const clean = username.trim().toLowerCase()
    localStorage.setItem(`nexu_cached_chats_${clean}`, encryptData(chats))
  } catch (e) {
    console.error('[Error al persistir lista de chats]:', e)
  }
}

export const getInitialChats = (username) => {
  if (!username) return INITIAL_CHATS_DEFAULT
  const clean = username.trim().toLowerCase()

  try {
    const cachedChats = loadCachedChats(clean)
    const chatsToUse = cachedChats || JSON.parse(JSON.stringify(INITIAL_CHATS_DEFAULT))

    const savedBotHistory = localStorage.getItem(`nexu_bot_history_${clean}`)
    if (savedBotHistory) {
      const decrypted = decryptData(savedBotHistory)
      const botIndex = chatsToUse.findIndex((c) => c.id === 'chat_bot')
      if (decrypted && botIndex !== -1) {
        chatsToUse[botIndex].messages = decrypted
      }
    }

    const favs = loadFavorites(clean)
    const manualUnread = loadManualUnread(clean)

    chatsToUse.forEach((c) => {
      c.isFavorite = isChatFavorite(favs, c.id)
      if (isChatManualUnread(manualUnread, c.id)) {
        c.unreadCount = Math.max(c.unreadCount || 0, 1)
      }
    })

    return chatsToUse
  } catch (e) {
    console.error('[Error al inicializar chats]:', e)
    return INITIAL_CHATS_DEFAULT
  }
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
