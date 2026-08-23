import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser())
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!user?.username)

  const login = async (username, password) => {
    setIsLoading(true)
    try {
      const loggedUser = await authService.login(username, password)
      setUser(loggedUser)
      setIsAuthenticated(true)
      return loggedUser
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
    if (!user) return
    const updated = await authService.saveProfile(user.username, profileData)
    setUser((prev) => ({ ...prev, ...updated }))
    return updated
  }

  const changePassword = async (currentPass, newPass) => {
    if (!user) throw new Error('No hay sesión activa')
    return await authService.changePassword(user.username, currentPass, newPass)
  }

  const value = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,
    changePassword
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
