import {
  IconUser,
  IconSliders,
  IconShield,
  IconUserX
} from '../../../../components/icons/Icons'
import './SettingsNavTabs.css'

function SettingsNavTabs({ activeTab, onSelectTab, blockedCount }) {
  const handleTabClick = (e, tab) => {
    onSelectTab(tab)
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  return (
    <nav className="profile-nav-tabs">
      <button
        className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={(e) => handleTabClick(e, 'profile')}
        type="button"
      >
        <IconUser />
        <span>Mi Perfil</span>
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={(e) => handleTabClick(e, 'settings')}
        type="button"
      >
        <IconSliders />
        <span>Ajustes & Tema</span>
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
        onClick={(e) => handleTabClick(e, 'privacy')}
        type="button"
      >
        <IconShield />
        <span>Privacidad & Seguridad</span>
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'blocked' ? 'active' : ''}`}
        onClick={(e) => handleTabClick(e, 'blocked')}
        type="button"
      >
        <IconUserX />
        <span>Bloqueados ({blockedCount})</span>
      </button>
    </nav>
  )
}

export default SettingsNavTabs
