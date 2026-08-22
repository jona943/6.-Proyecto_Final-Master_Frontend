import { useState } from 'react'
import Landing from './views/frontend/landing/Landing.jsx'
import Login from './views/frontend/login-auth/Login.jsx'
import ChatHome from './views/frontend/chat/ChatHome.jsx'
import ProfileSettings from './views/frontend/profile-settings/ProfileSettings.jsx'

function App() {
  // Estado de la pantalla activa: 'landing' | 'login' | 'register' | 'chat' | 'settings'
  const [currentView, setCurrentView] = useState('landing')

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
          onLogout={() => setCurrentView('landing')}
        />
      )}
    </>
  )
}

export default App


