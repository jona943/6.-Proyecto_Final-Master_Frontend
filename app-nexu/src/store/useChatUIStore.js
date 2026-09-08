import { create } from 'zustand'

export const useChatUIStore = create((set) => ({
  selectedChatId: null,
  isTyping: false,
  presenceStatus: 'online',
  
  setSelectedChatId: (id) => set({ selectedChatId: id }),
  setIsTyping: (status) => set({ isTyping: status }),
  setPresenceStatus: (status) => set({ presenceStatus: status }),
  
  // Limpiar estado al cerrar sesión o cambiar cuenta
  clearUIState: () => set({
    selectedChatId: null,
    isTyping: false,
    presenceStatus: 'online'
  })
}))
