import React, { useEffect, useRef } from 'react'
import {
  IconStar,
  IconCheckCheck,
  IconTrash,
  IconAlertCircle
} from '../../../../../../components/icons/Icons'

const ChatContextMenu = ({
  x,
  y,
  chat,
  onClose,
  onToggleFavorite,
  onToggleRead,
  onClearMessages,
  onDeleteContact
}) => {
  const menuRef = useRef(null)

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!chat) return null

  // Ajustar posición para que no se salga de la pantalla
  const menuWidth = 190
  const menuHeight = 175
  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10)
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10)

  return (
    <div
      ref={menuRef}
      className="chat-context-menu"
      style={{
        position: 'fixed',
        top: `${adjustedY}px`,
        left: `${adjustedX}px`,
        zIndex: 9999
      }}
    >
      <div className="context-menu-header">
        <span className="context-menu-title">{chat.name}</span>
      </div>

      <button
        type="button"
        className="context-menu-item"
        onClick={() => {
          onToggleFavorite(chat.id)
          onClose()
        }}
      >
        <span style={{ color: chat.isFavorite ? 'var(--accent-acid, #d4ff00)' : 'currentColor', display: 'flex' }}>
          <IconStar size={15} filled={chat.isFavorite} />
        </span>
        <span>{chat.isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</span>
      </button>

      <button
        type="button"
        className="context-menu-item"
        onClick={() => {
          onToggleRead(chat)
          onClose()
        }}
      >
        <span style={{ display: 'flex' }}>
          <IconCheckCheck size={15} />
        </span>
        <span>{chat.unreadCount > 0 ? 'Marcar como leído' : 'Marcar como no leído'}</span>
      </button>

      <div className="context-menu-divider" />

      <button
        type="button"
        className="context-menu-item text-danger"
        onClick={() => {
          onClearMessages(chat)
          onClose()
        }}
      >
        <span style={{ display: 'flex' }}>
          <IconAlertCircle size={15} />
        </span>
        <span>Vaciar mensajes</span>
      </button>

      {!chat.isBot && (
        <button
          type="button"
          className="context-menu-item text-danger"
          onClick={() => {
            onDeleteContact(chat.id)
            onClose()
          }}
        >
          <span style={{ display: 'flex' }}>
            <IconTrash size={15} />
          </span>
          <span>Eliminar contacto</span>
        </button>
      )}
    </div>
  )
}

export default ChatContextMenu
