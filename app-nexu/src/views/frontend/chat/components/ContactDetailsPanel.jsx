import { useState, useEffect, useCallback, useRef } from 'react'
import './ContactDetailsPanel.css'
import {
  IconX,
  IconUser,
  IconShield,
  IconTrash,
  IconBot,
  IconVolume2,
  IconVolumeX
} from '../../../../components/icons/Icons'

function ContactDetailsPanel({
  activeChat,
  onClose,
  onClearChat,
  onDeleteConversation,
  soundEnabled,
  onToggleSound
}) {
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef(null)

  const handleClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    closeTimerRef.current = setTimeout(() => {
      onClose()
    }, 220)
  }, [isClosing, onClose])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  if (!activeChat) return null

  return (
    <aside className={`chat-details-panel ${isClosing ? 'is-closing' : ''}`}>
      {/* 1. Encabezado del Panel */}
      <header className="details-header">
        <h4>{activeChat.isBot ? 'Asistente del Sistema' : 'Información de Contacto'}</h4>
        <button
          className="btn-icon-subtle btn-details-close"
          onClick={handleClose}
          title="Cerrar panel"
          type="button"
        >
          <IconX size={18} />
        </button>
      </header>

      {/* 2. Tarjeta Resumen del Contacto */}
      <div className="details-profile-card">
        <div className={`details-avatar-lg ${activeChat.isBot ? 'system-avatar' : ''}`}>
          {activeChat.avatar}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.2rem' }}>
          <h3 className="details-name">{activeChat.name}</h3>
          {activeChat.isBot && (
            <span className="bot-pill-badge" title="Asistente Oficial de Nexu">
              <IconBot size={11} /> BOT
            </span>
          )}
        </div>
        <span className="details-handle">{activeChat.handle}</span>
        <span className="details-role-pill">{activeChat.role}</span>
      </div>

      {/* 3. Información de Cuenta y Bio */}
      <div className="details-section">
        <span className="details-section-title">Detalles de Cuenta</span>
        <div className="details-info-row">
          <IconUser size={16} />
          <div className="details-info-text">
            <strong>Nombre</strong>
            <span>{activeChat.name}</span>
          </div>
        </div>
      </div>

      <div className="details-section">
        <span className="details-section-title">Descripción / Bio</span>
        <p className="conv-preview" style={{ whiteSpace: 'normal', lineHeight: '1.45' }}>
          {activeChat.bio || 'Usuario miembro del equipo de desarrollo de Nexu.'}
        </p>
      </div>

      {/* 4. Preferencias y Sonido */}
      {onToggleSound && (
        <div className="details-section">
          <span className="details-section-title">Preferencias</span>
          <div className="details-toggle-row">
            <div className="details-toggle-info">
              {soundEnabled ? <IconVolume2 size={19} /> : <IconVolumeX size={19} />}
              <div className="details-info-text">
                <strong>Sonidos de mensajes</strong>
                <span>{soundEnabled ? 'Activados' : 'Silenciados'}</span>
              </div>
            </div>
            <button
              type="button"
              className={`details-switch-btn ${soundEnabled ? 'active' : ''}`}
              onClick={onToggleSound}
              title={soundEnabled ? 'Silenciar sonidos de mensajes' : 'Activar sonidos de mensajes'}
              aria-label="Alternar sonidos de mensajes"
            >
              <span className="details-switch-handle" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Seguridad y Cifrado */}
      <div className="details-section">
        <span className="details-section-title">Seguridad y Cifrado</span>
        <div className="security-box">
          <IconShield size={18} />
          <p>Conexión directa 1 a 1 cliente-servidor con confirmaciones de entrega verificadas.</p>
        </div>
      </div>

      {/* 6. Acciones del Contacto */}
      <div className="details-section" style={{ marginTop: 'auto', borderBottom: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          className="btn-icon-subtle"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--text-secondary)' }}
          onClick={onClearChat}
          title="Limpiar mensajes"
          type="button"
        >
          <span>Vaciar Mensajes</span>
        </button>

        {!activeChat.isBot ? (
          <button
            className="btn-danger-action"
            onClick={() => onDeleteConversation(activeChat.id)}
            title="Eliminar contacto y conversación"
            type="button"
          >
            <IconTrash size={16} />
            <span>Eliminar Contacto</span>
          </button>
        ) : (
          <div className="details-protected-notice">
            <IconShield size={14} />
            <span>Chat protegido · Asistente permanente del sistema</span>
          </div>
        )}
      </div>
    </aside>
  )
}

export default ContactDetailsPanel
