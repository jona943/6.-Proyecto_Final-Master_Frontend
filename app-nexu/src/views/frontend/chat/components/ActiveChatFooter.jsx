import { IconClock, IconImage, IconPaperclip, IconCode, IconSend } from '../../../../components/icons/Icons'

function ActiveChatFooter({
  activeChat,
  inputText,
  onInputTextChange,
  onSendMessage,
  onTriggerToast,
  onInsertCodeSnippet,
  onCancelRequest
}) {
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
            title="Adjuntar imagen"
            onClick={() => onTriggerToast('Simulación: Adjuntar imagen disponible')}
          >
            <IconImage size={16} />
          </button>
          <button
            type="button"
            className="btn-tool-icon"
            title="Adjuntar archivo"
            onClick={() => onTriggerToast('Simulación: Adjuntar documento disponible')}
          >
            <IconPaperclip size={16} />
          </button>
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

      <form className="input-controls-row" onSubmit={onSendMessage}>
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
