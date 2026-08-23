import {
  IconX,
  IconUser,
  IconMail,
  IconShield,
  IconTrash
} from './ChatIcons'

function ContactDetailsPanel({
  activeChat,
  onClose,
  onClearChat,
  onDeleteConversation
}) {
  if (!activeChat) return null

  return (
    <aside className="chat-details-panel">
      <header className="details-header">
        <h4>Información de Contacto</h4>
        <button
          className="btn-icon-subtle"
          onClick={onClose}
          title="Cerrar panel"
        >
          <IconX />
        </button>
      </header>

      <div className="details-profile-card">
        <div className={`details-avatar-lg ${activeChat.isBot ? 'system-avatar' : ''}`}>
          {activeChat.avatar}
        </div>
        <h3 className="details-name">{activeChat.name}</h3>
        <span className="details-handle">{activeChat.handle}</span>
        <span className="details-role-pill">{activeChat.role}</span>
      </div>

      <div className="details-section">
        <span className="details-section-title">Detalles de Cuenta</span>
        <div className="details-info-row">
          <IconUser />
          <div className="details-info-text">
            <strong>Nombre</strong>
            <span>{activeChat.name}</span>
          </div>
        </div>
        <div className="details-info-row">
          <IconMail />
          <div className="details-info-text">
            <strong>Correo</strong>
            <span>{activeChat.email}</span>
          </div>
        </div>
      </div>

      <div className="details-section">
        <span className="details-section-title">Descripción / Bio</span>
        <p className="conv-preview" style={{ whiteSpace: 'normal', lineHeight: '1.4' }}>
          {activeChat.bio || 'Usuario miembro del equipo de desarrollo de Nexu.'}
        </p>
      </div>

      <div className="details-section">
        <span className="details-section-title">Seguridad y Cifrado</span>
        <div className="security-box">
          <IconShield />
          <p>Conexión directa 1 a 1 cliente-servidor con confirmaciones de entrega verificadas.</p>
        </div>
      </div>

      <div className="details-section" style={{ marginTop: 'auto', borderBottom: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          className="btn-icon-subtle"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--text-secondary)' }}
          onClick={onClearChat}
          title="Limpiar mensajes"
        >
          <span>Vaciar Mensajes</span>
        </button>

        <button
          className="btn-danger-action"
          onClick={() => onDeleteConversation(activeChat.id)}
          title="Eliminar contacto y conversación"
        >
          <IconTrash />
          <span>Eliminar Contacto</span>
        </button>
      </div>
    </aside>
  )
}

export default ContactDetailsPanel
