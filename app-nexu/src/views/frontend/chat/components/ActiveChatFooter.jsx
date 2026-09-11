import { IconClock, IconCode, IconSend, IconAlertCircle, IconUserPlus, IconCheck } from '../../../../components/icons/Icons'

function ActiveChatFooter({
  activeChat,
  inputText,
  onInputTextChange,
  onSendMessage,
  onTriggerToast,
  onInsertCodeSnippet,
  onCancelRequest,
  onSendConnectionRequest,
  onAcceptRequest,
  onRejectRequest
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSendMessage(e)
  }

  if (activeChat.hasIncomingRequest) {
    return (
      <footer className="chat-input-footer chat-incoming-req-footer" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.2rem 1.5rem', background: 'rgba(15, 23, 42, 0.85)', gap: '0.85rem' }}>
        <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', maxWidth: '540px' }}>
          <IconAlertCircle size={18} style={{ color: 'var(--accent-acid, #d4ff00)', flexShrink: 0 }} />
          <span>
            <strong>@{activeChat.handle?.replace(/^@/, '') || activeChat.name} ya te ha enviado una solicitud de conexión.</strong> Puedes aceptarla aquí para restablecer la comunicación.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {onAcceptRequest && (
            <button
              type="button"
              className="btn-accept-req"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.55rem 1.25rem',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid rgba(212, 255, 0, 0.4)',
                background: 'rgba(212, 255, 0, 0.15)',
                color: 'var(--accent-acid, #d4ff00)',
                cursor: 'pointer'
              }}
              onClick={() => {
                const reqToAccept = activeChat.incomingRequest || {
                  id: activeChat.incomingRequestId,
                  fromUser: {
                    username: activeChat.handle?.replace(/^@/, ''),
                    name: activeChat.name,
                    handle: activeChat.handle,
                    avatar: activeChat.avatar
                  }
                }
                onAcceptRequest(reqToAccept)
              }}
            >
              <IconCheck size={16} />
              Aceptar solicitud de conexión
            </button>
          )}
          {onRejectRequest && (
            <button
              type="button"
              className="btn-reject-req"
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.84rem',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                cursor: 'pointer'
              }}
              onClick={() => onRejectRequest(activeChat.incomingRequest?.id || activeChat.incomingRequestId)}
            >
              Rechazar
            </button>
          )}
        </div>
      </footer>
    )
  }

  if (activeChat.isDisconnected) {
    return (
      <footer className="chat-input-footer chat-disconnected-footer" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.2rem 1.5rem', background: 'rgba(15, 23, 42, 0.75)', gap: '0.85rem' }}>
        <div style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', maxWidth: '540px' }}>
          <IconAlertCircle size={18} />
          <span>
            <strong>Conexión no disponible.</strong> No puedes enviar más mensajes a <strong>{activeChat.name}</strong> a menos que envíes una nueva solicitud de conexión y sea aceptada.
          </span>
        </div>
        {onSendConnectionRequest && (
          <button
            type="button"
            className="btn-send-reconnect"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid rgba(212, 255, 0, 0.4)',
              background: 'rgba(212, 255, 0, 0.12)',
              color: 'var(--accent-acid, #d4ff00)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => onSendConnectionRequest(activeChat.handle.replace(/^@/, ''))}
          >
            <IconUserPlus size={16} />
            Enviar nueva solicitud de conexión
          </button>
        )}
      </footer>
    )
  }

  if (activeChat.isPending) {
    return (
      <footer className="chat-input-footer" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1.2rem 1.5rem', background: 'rgba(15, 23, 42, 0.6)', gap: '0.8rem' }}>
        <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
          <IconClock size={16} />
          <span>
            <strong>Solicitud de conexión enviada.</strong> Podrás entablar una conversación 1 a 1 cuando <strong>{activeChat.name}</strong> acepte tu solicitud.
          </span>
        </div>
        {onCancelRequest && (
          <button
            type="button"
            className="btn-reject-req"
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={() => onCancelRequest(activeChat.handle.replace(/^@/, ''))}
          >
            Cancelar solicitud enviada
          </button>
        )}
      </footer>
    )
  }

  return (
    <footer className="chat-input-footer">
      <div className="chat-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="btn-tool-icon"
            title="Insertar código"
            onClick={onInsertCodeSnippet}
          >
            <IconCode size={16} />
          </button>
        </div>

        <span className="toolbar-hint">Presiona Enter para enviar</span>
      </div>

      <form className="input-controls-row" onSubmit={handleSubmit}>
        <input
          type="text"
          className="message-text-input"
          placeholder={`Escribe un mensaje para ${activeChat.name}...`}
          value={inputText}
          onChange={(e) => onInputTextChange(e.target.value)}
        />

        <button
          type="submit"
          className="btn-send-message"
          disabled={!inputText.trim()}
          title="Enviar mensaje"
        >
          <IconSend size={17} />
        </button>
      </form>
    </footer>
  )
}

export default ActiveChatFooter
