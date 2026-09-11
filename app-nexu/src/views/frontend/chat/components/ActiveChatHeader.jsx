import { IconArrowLeft, IconSearch, IconInfo, IconX } from '../../../../components/icons/Icons'

function ActiveChatHeader({
  activeChat,
  isTyping,
  showDetailsPanel,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  matchCount,
  searchInputRef,
  onBackToList,
  onToggleDetails
}) {
  return (
    <>
      <header className="active-chat-header">
        <div className="chat-header-user">
          <button
            className="btn-mobile-back"
            onClick={onBackToList}
            title="Volver a lista"
          >
            <IconArrowLeft size={18} />
          </button>

          <div className="avatar-wrapper">
            {activeChat.avatarUrl ? (
              <div className="avatar-badge" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}>
                <img src={activeChat.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ) : (
              <div className={`avatar-badge ${activeChat.isBot ? 'system-avatar' : ''}`}>
                {activeChat.avatar}
              </div>
            )}
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
          {/* Botón Buscador en Conversación Activa */}
          <button
            className={`btn-chat-action ${isSearchOpen ? 'active' : ''}`}
            onClick={() => {
              setIsSearchOpen((prev) => !prev)
              if (isSearchOpen) setSearchQuery('')
            }}
            title="Buscar mensajes en esta conversación"
            type="button"
          >
            <IconSearch size={16} />
          </button>

          {/* Botón Detalles del Contacto */}
          <button
            className={`btn-chat-action ${showDetailsPanel ? 'active' : ''}`}
            onClick={onToggleDetails}
            title="Ver detalles del contacto"
            type="button"
          >
            <IconInfo size={16} />
          </button>
        </div>
      </header>

      {/* 1.1 Barra Desplegable de Búsqueda Interna en la Conversación */}
      {isSearchOpen && (
        <div className="in-chat-search-bar">
          <div className="in-chat-search-input-wrapper">
            <IconSearch size={14} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar en esta conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchOpen(false)
                  setSearchQuery('')
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search-inchat"
                onClick={() => setSearchQuery('')}
                title="Limpiar término"
              >
                <IconX size={12} />
              </button>
            )}
          </div>

          <div className="in-chat-search-meta">
            {searchQuery.trim() ? (
              <span className={`in-chat-match-badge ${matchCount > 0 ? 'has-matches' : 'no-matches'}`}>
                {matchCount > 0
                  ? `${matchCount} ${matchCount === 1 ? 'coincidencia' : 'coincidencias'}`
                  : 'Sin coincidencias'}
              </span>
            ) : (
              <span className="in-chat-search-hint">Escribe para buscar</span>
            )}

            <button
              type="button"
              className="btn-close-inchat-search"
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery('')
              }}
              title="Cerrar buscador (Esc)"
            >
              <IconX size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ActiveChatHeader
