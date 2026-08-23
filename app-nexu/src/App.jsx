import { useState } from 'react'
import Landing from './views/frontend/landing/Landing.jsx'
import Login from './views/frontend/login-auth/Login.jsx'
import ChatHome from './views/frontend/chat/ChatHome.jsx'
import ProfileSettings from './views/frontend/profile-settings/ProfileSettings.jsx'

function App() {
  // Estado de la pantalla activa: 'landing' | 'login' | 'register' | 'chat' | 'settings'
  const [currentView, setCurrentView] = useState('landing')
  // Usuario con sesión activa (por defecto adminUser)
  const [activeUser, setActiveUser] = useState('adminUser')

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
          onLoginSuccess={(user) => {
            setActiveUser(user || 'adminUser')
            setCurrentView('chat')
          }}
          onNavigateToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'chat' && (
        <ChatHome
          currentUserHandle={activeUser}
          onOpenSettings={() => setCurrentView('settings')}
        />
      )}

      {currentView === 'settings' && (
        <ProfileSettings
          currentUserHandle={activeUser}
          onBackToChat={() => setCurrentView('chat')}
          onLogout={() => setCurrentView('landing')}
        />
      )}
    </>
  )
}

export default App


