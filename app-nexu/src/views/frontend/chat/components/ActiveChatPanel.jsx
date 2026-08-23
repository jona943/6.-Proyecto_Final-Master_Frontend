import {
  IconArrowLeft,
  IconInfo,
  IconCopy,
  IconCheck,
  IconCheckCheck,
  IconImage,
  IconPaperclip,
  IconCode,
  IconSend
} from '../../../../components/icons/Icons'

function ActiveChatPanel({
  activeChat,
  mobileView,
  isTyping,
  showDetailsPanel,
  inputText,
  onInputTextChange,
  onSendMessage,
  onBackToList,
  onToggleDetails,
  onCopyMessage,
  onInsertCodeSnippet,
  onTriggerToast,
  messagesEndRef
}) {
  if (!activeChat) return null

  // Renderizar icono de estado del mensaje
  const renderStatusIcon = (status) => {
    if (status === 'read') {
      return <span className="msg-status-icon read" title="Leído"><IconCheckCheck /></span>
    }
    if (status === 'delivered') {
      return <span className="msg-status-icon delivered" title="Entregado"><IconCheckCheck /></span>
    }
    return <span className="msg-status-icon sent" title="Enviado"><IconCheck /></span>
  }

  return (
    <main className={`chat-main-panel ${mobileView === 'list' ? 'hidden-mobile' : ''}`}>
      {/* 1. Cabecera del Chat Activo */}
      <header className="active-chat-header">
        <div className="chat-header-user">
          <button
            className="btn-mobile-back"
            onClick={onBackToList}
            title="Volver a lista"
          >
            <IconArrowLeft />
          </button>

          <div className="avatar-wrapper">
            <div className={`avatar-badge ${activeChat.isBot ? 'system-avatar' : ''}`}>
              {activeChat.avatar}
            </div>
            <span className={`user-status-dot ${activeChat.status}`}></span>
          </div>

          <div className="chat-header-title-box">
            <h3 className="chat-header-title">{activeChat.name}</h3>
            <div className={`chat-header-status ${isTyping ? 'typing' : ''}`}>
              {isTyping ? (
                <span>Generando respuesta en tiempo real...</span>
              ) : (
                <>
                  <span className={`status-dot-sm ${activeChat.status}`}></span>
                  <span>{activeChat.statusText}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            className={`btn-chat-action ${showDetailsPanel ? 'active' : ''}`}
            onClick={onToggleDetails}
            title="Ver detalles del contacto"
          >
            <IconInfo />
            <span>Detalles</span>
          </button>
        </div>
      </header>

      {/* 2. Feed de Mensajes */}
      <div className="messages-container">
        <div className="date-divider">
          <span>Mensajería Directa 1 a 1</span>
        </div>

        {activeChat.messages.length === 0 ? (
          <div className="empty-search-msg">
            <p>No hay mensajes en esta conversación. Envía el primer mensaje.</p>
          </div>
        ) : (
          activeChat.messages.map((msg) => {
            const isMe = msg.sender === 'me'
            return (
              <div key={msg.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                {!isMe && (
                  <div className="msg-avatar-tiny">
                    {activeChat.avatar}
                  </div>
                )}

                <div className="message-bubble-wrapper">
                  <div className="message-actions-overlay">
                    <button
                      className="btn-msg-hover"
                      title="Copiar texto"
                      onClick={() => onCopyMessage(msg.text)}
                    >
                      <IconCopy />
                    </button>
                  </div>

                  <div className="message-bubble">
                    <p className="message-text">{msg.text}</p>
                    <div className="message-meta">
                      <span className="message-time">{msg.time}</span>
                      {isMe && renderStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}

        {isTyping && (
          <div className="typing-indicator-row">
            <div className="typing-bubble">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Barra de Entrada (Input Footer) */}
      <footer className="chat-input-footer">
        <div className="chat-toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              className="btn-tool-icon"
              title="Adjuntar imagen"
              onClick={() => onTriggerToast('Simulación: Adjuntar imagen disponible')}
            >
              <IconImage />
            </button>
            <button
              type="button"
              className="btn-tool-icon"
              title="Adjuntar archivo"
              onClick={() => onTriggerToast('Simulación: Adjuntar documento disponible')}
            >
              <IconPaperclip />
            </button>
            <button
              type="button"
              className="btn-tool-icon"
              title="Insertar código"
              onClick={onInsertCodeSnippet}
            >
              <IconCode />
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
            <IconSend />
          </button>
        </form>
      </footer>
    </main>
  )
}

export default ActiveChatPanel
