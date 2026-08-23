import {
  IconX,
  AVATAR_TYPES,
  renderAvatarBadge
} from '../../../../components/icons/Icons'

function AvatarSelectorModal({
  isOpen,
  onClose,
  currentAvatarType,
  userInitials,
  onSelectAvatar
}) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <h3>Elige tu Icono de Identidad</h3>
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
          >
            <IconX />
          </button>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Selecciona el estilo de icono vectorial que te representará en la red de Nexu:
        </p>

        <div className="avatar-vector-picker-grid">
          {AVATAR_TYPES.map((av) => (
            <div
              key={av.id}
              className={`avatar-vector-option-card ${currentAvatarType === av.id ? 'selected' : ''}`}
              onClick={() => onSelectAvatar(av.id)}
            >
              {renderAvatarBadge(av.id, userInitials, 52)}
              <span className="avatar-option-label">{av.label}</span>
            </div>
          ))}
        </div>

        <div className="form-actions-bar">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AvatarSelectorModal
