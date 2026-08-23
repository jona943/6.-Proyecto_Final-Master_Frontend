import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import Landing from './views/frontend/landing/Landing.jsx'
import Login from './views/frontend/login-auth/Login.jsx'
import ChatHome from './views/frontend/chat/ChatHome.jsx'
import ProfileSettings from './views/frontend/profile-settings/ProfileSettings.jsx'

function AppContent() {
  // Estado de la pantalla activa: 'landing' | 'login' | 'register' | 'chat' | 'settings'
  const [currentView, setCurrentView] = useState('landing')
  const { logout } = useAuth()

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
