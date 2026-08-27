import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import Landing from './views/frontend/landing/Landing.jsx'
import Login from './views/frontend/login-auth/Login.jsx'
import ChatHome from './views/frontend/chat/ChatHome.jsx'
import ProfileSettings from './views/frontend/profile-settings/ProfileSettings.jsx'

function AppContent() {
  const { user, isAuthenticated, logout } = useAuth()

  // Estado de la pantalla activa: 'landing' | 'login' | 'register' | 'chat' | 'settings'
  // Si existe una sesión activa persistida, se restaura a 'chat' en lugar de volver a 'landing'
  const [currentView, setCurrentView] = useState(() => {
    return isAuthenticated && user?.username ? 'chat' : 'landing'
  })

  return (
    <>
      {currentView === 'landing' && (
        <Landing
          onNavigate={(targetView) => setCurrentView(targetView)}
        />
      )}

      {(currentView === 'login' || currentView === 'register') && (
        <Login
          initialTab={currentView === 'register' ? 'register' : 'login'}
          onLoginSuccess={() => setCurrentView('chat')}
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'chat' && (
        <ChatHome
          onOpenSettings={() => setCurrentView('settings')}
        />
      )}

      {currentView === 'settings' && (
        <ProfileSettings
          onBackToChat={() => setCurrentView('chat')}
          onLogout={async () => {
            await logout()
            setCurrentView('landing')
          }}
        />
      )}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  )
}

export default App
