import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'

// Carga perezosa (lazy-loading) de vistas para optimizar bundle y tiempo de carga inicial
const Landing = lazy(() => import('./views/frontend/landing/Landing.jsx'))
const Login = lazy(() => import('./views/frontend/login-auth/Login.jsx'))
const ChatHome = lazy(() => import('./views/frontend/chat/ChatHome.jsx'))
const ProfileSettings = lazy(() => import('./views/frontend/profile-settings/ProfileSettings.jsx'))

function RouteLoadingFallback() {
  return (
    <div className="route-loading-screen">
      <div className="route-loading-spinner" />
      <span className="route-loading-text">Cargando Nexu...</span>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated || !user?.username) {
    return <Navigate to="/login" replace />
  }
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated && user?.username) {
    return <Navigate to="/chat" replace />
  }
  return children
}

function AppContent() {
  const { initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login initialTab="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Login initialTab="register" /></PublicRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatHome /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('nexu_theme')
    if (savedTheme === 'light') {
      document.documentElement.classList.add('theme-light')
    }
  }, [])

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
