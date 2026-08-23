import {
  IconUser,
  IconSliders,
  IconShield,
  IconUserX
} from '../../../../components/icons/Icons'

function SettingsNavTabs({ activeTab, onSelectTab, blockedCount }) {
  return (
    <nav className="profile-nav-tabs">
      <button
        className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onSelectTab('profile')}
        type="button"
      >
        <IconUser />
        <span>Mi Perfil</span>
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onSelectTab('settings')}
        type="button"
      >
        <IconSliders />
        <span>Ajustes & Tema</span>
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
        onClick={() => onSelectTab('privacy')}
        type="button"
      >
        <IconShield />
        <span>Privacidad & Seguridad</span>
      </button>

      <button
        className={`nav-tab-btn ${activeTab === 'blocked' ? 'active' : ''}`}
        onClick={() => onSelectTab('blocked')}
        type="button"
      >
        <IconUserX />
        <span>Bloqueados ({blockedCount})</span>
      </button>
    </nav>
  )
}

export default SettingsNavTabs
