import { IconShield, renderAvatarBadge } from './SettingsIcons'

function BlockedUsersTab({ blockedUsers, onUnblockUser }) {
  return (
    <div className="tab-content-area">
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Lista de Usuarios Bloqueados</h3>
            <p>
              Las personas en esta lista no podrán enviarte mensajes, llamarte ni ver tu estado en línea.
            </p>
          </div>
        </div>

        {blockedUsers.length > 0 ? (
          <div className="blocked-users-list">
            {blockedUsers.map((user) => (
              <div key={user.id} className="blocked-user-row">
                <div className="blocked-user-info">
                  {renderAvatarBadge(user.avatarType, user.initials, 40)}
                  <div className="blocked-names">
                    <span className="blocked-name">{user.name}</span>
                    <span className="blocked-handle">{user.handle} · Bloqueado el {user.date}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => onUnblockUser(user.id, user.name)}
                >
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-blocked-state">
            <IconShield />
            <p>No tienes ningún usuario bloqueado en este momento.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default BlockedUsersTab
