import { create } from 'zustand'
import { authService } from '../services/authService'

export const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: !!authService.getCurrentUser()?.username,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true })
    try {
      const loggedUser = await authService.login(username, password)
      set({ user: loggedUser, isAuthenticated: true })
      return loggedUser
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (username, password) => {
    set({ isLoading: true })
    try {
      const newUser = await authService.register(username, password)
      set({ user: newUser, isAuthenticated: true })
      return newUser
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authService.logout()
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (profileData) => {
    const { user } = get()
    if (!user) return
    const updated = await authService.saveProfile(user.username, profileData)
    set({ user: { ...user, ...updated } })
    return updated
  },

  changePassword: async (currentPass, newPass) => {
    const { user } = get()
    if (!user) throw new Error('No hay sesión activa')
    return await authService.changePassword(user.username, currentPass, newPass)
  },

  // Alias compatible con el hook viejo por si se necesita
  setUser: (newUser) => set({ user: newUser, isAuthenticated: !!newUser })
}))
