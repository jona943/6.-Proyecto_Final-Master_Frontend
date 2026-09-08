import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import Landing from './views/frontend/landing/Landing.jsx'
import Login from './views/frontend/login-auth/Login.jsx'
import ChatHome from './views/frontend/chat/ChatHome.jsx'
import ProfileSettings from './views/frontend/profile-settings/ProfileSettings.jsx'

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
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login initialTab="login" /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Login initialTab="register" /></PublicRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatHome /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
