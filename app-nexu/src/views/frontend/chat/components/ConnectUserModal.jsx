import { IconUserPlus, IconX } from './ChatIcons'

function ConnectUserModal({
  isOpen,
  onClose,
  searchAlias,
  onSearchChange,
  searchError,
  searchedUser,
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
          Ingresa el alias exacto de 3 a 10 caracteres alfanuméricos para enviar una solicitud de conexión privada.
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
      </div>
    </div>
  )
}

export default ConnectUserModal
