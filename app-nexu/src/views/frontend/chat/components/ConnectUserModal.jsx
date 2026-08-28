import { IconUserPlus, IconX } from '../../../../components/icons/Icons'

function ConnectUserModal({
  isOpen,
  onClose,
  searchAlias,
  onSearchChange,
  searchError,
  searchedUser,
  userSuggestions = [],
  sentRequests,
  onSendRequest
}) {
  if (!isOpen) return null

  return (
    <div className="connect-modal-backdrop" onClick={onClose}>
      <div className="connect-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="connect-modal-header">
          <div className="connect-modal-title">
            <IconUserPlus /> Conectar con un usuario
          </div>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={onClose}
            title="Cerrar modal"
          >
            <IconX />
          </button>
        </div>

        <p className="connect-modal-desc">
          Ingresa el alias exacto o parcial (3 a 10 caracteres) para enviar una solicitud de conexión privada.
        </p>

        <div className="connect-input-box">
          <span className="input-prefix-at">@</span>
          <input
            type="text"
            className="connect-input-field"
            placeholder="ej. rosi_master"
            value={searchAlias}
            onChange={(e) => onSearchChange(e.target.value)}
            maxLength={10}
            autoFocus
          />
          <span className={`connect-char-count ${searchAlias.length === 10 ? 'limit' : ''}`}>
            {searchAlias.length}/10
          </span>
        </div>

        {searchError && (
          <div className="connect-error-msg">
            <span>{searchError}</span>
          </div>
        )}

        {searchedUser && (
          <div className="user-found-card">
            <div className="user-found-meta">
              <div className="avatar-badge">{searchedUser.avatar}</div>
              <div>
                <div className="user-found-name">{searchedUser.name}</div>
                <div className="user-found-handle">{searchedUser.handle}</div>
              </div>
            </div>

            <button
              type="button"
              className="btn-accept-req"
              style={{ flex: 'none', padding: '0.55rem 1rem' }}
              onClick={() => onSendRequest(searchedUser)}
            >
              {sentRequests.includes(searchedUser.username) ? 'Enviada' : 'Enviar Solicitud'}
            </button>
          </div>
        )}

        {userSuggestions && userSuggestions.length > 0 && (
          <div className="connect-suggestions-box" style={{ marginTop: '1rem' }}>
            <span className="input-hint" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted, #94a3b8)' }}>
              Sugerencias de usuarios registrados:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {userSuggestions.map((sug) => (
                <div key={sug.username} className="user-found-card" style={{ padding: '0.6rem 0.8rem' }}>
                  <div className="user-found-meta">
                    <div className="avatar-badge" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>{sug.avatar}</div>
                    <div>
                      <div className="user-found-name" style={{ fontSize: '0.85rem' }}>{sug.name}</div>
                      <div className="user-found-handle" style={{ fontSize: '0.75rem' }}>{sug.handle}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-accept-req"
                    style={{ flex: 'none', padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                    onClick={() => onSendRequest(sug)}
                  >
                    {sentRequests.includes(sug.username) ? 'Enviada' : 'Enviar Solicitud'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectUserModal
