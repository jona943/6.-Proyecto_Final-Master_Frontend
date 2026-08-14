import { useState } from 'react'
import './style.css'
import Landing from '../frontend/landing/Landing.jsx'
import Login from '../frontend/login-auth/Login.jsx'
import ChatHome from '../frontend/chat/ChatHome.jsx'

function Demo() {
  const [currentView, setCurrentView] = useState('landing')

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-wrapper">
          <div className="logo-badge">N</div>
          <span className="app-logo">Nexu</span>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-btn ${currentView === 'landing' ? 'active' : ''}`}
            onClick={() => setCurrentView('landing')}
          >
            Landing · Jonathan
          </button>
          <button
            className={`nav-btn ${currentView === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentView('login')}
          >
            Login · Rosa
          </button>
          <button
            className={`nav-btn ${currentView === 'chat' ? 'active' : ''}`}
            onClick={() => setCurrentView('chat')}
          >
            Chat · Jose
          </button>
        </nav>
      </header>

      <main className="app-content">
        {currentView === 'landing' && <Landing />}
        {currentView === 'login' && <Login />}
        {currentView === 'chat' && <ChatHome />}
      </main>
    </div>
  )
}

export default Demo


