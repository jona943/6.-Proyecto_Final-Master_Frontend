import { useState, useMemo } from 'react'
import './ContactDetailsPanel.css'
import {
  IconX,
  IconUser,
  IconMail,
  IconShield,
  IconTrash,
  IconPaperclip,
  IconImage,
  IconCode,
  IconLink
} from '../../../../components/icons/Icons'

function ContactDetailsPanel({
  activeChat,
  onClose,
  onClearChat,
  onDeleteConversation
}) {
  const [activeTab, setActiveTab] = useState('info') // 'info' | 'media'

  // Extraer enlaces de los mensajes en tiempo real
  const sharedLinks = useMemo(() => {
    if (!activeChat?.messages) return []
    const links = []
    const urlRegex = /(https?:\/\/[^\s]+)/g

    activeChat.messages.forEach((msg) => {
      if (msg.text) {
        const matches = msg.text.match(urlRegex)
        if (matches) {
          matches.forEach((url) => {
            try {
              const domain = new URL(url).hostname
              links.push({
                id: `${msg.id}-${url}`,
                url,
                domain,
                title: url.length > 40 ? url.substring(0, 40) + '...' : url
              })
            } catch (e) {
              // Ignore invalid URLs
            }
          })
        }
      }
    })
    return links
  }, [activeChat?.messages])

  // Extraer archivos adjuntos (preparado para la nueva funcionalidad)
  const sharedFiles = useMemo(() => {
    if (!activeChat?.messages) return []
    // Buscamos mensajes que tengan la propiedad 'attachment'
    return activeChat.messages
      .filter((msg) => msg.attachment)
      .map((msg) => msg.attachment)
  }, [activeChat?.messages])

  if (!activeChat) return null

  return (
    <aside className="chat-details-panel">
      {/* 1. Encabezado del Panel */}
      <header className="details-header">
        <h4>Información de Contacto</h4>
        <button
          className="btn-icon-subtle"
          onClick={onClose}
          title="Cerrar panel"
          type="button"
        >
          <IconX size={16} />
        </button>
      </header>

      {/* 2. Tarjeta Resumen del Contacto */}
      <div className="details-profile-card">
        <div className={`details-avatar-lg ${activeChat.isBot ? 'system-avatar' : ''}`}>
          {activeChat.avatar}
        </div>
        <h3 className="details-name">{activeChat.name}</h3>
        <span className="details-handle">{activeChat.handle}</span>
        <span className="details-role-pill">{activeChat.role}</span>
      </div>

      {/* 3. Pestañas de Navegación */}
      <div className="details-nav-tabs">
        <button
          className={`details-tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
          type="button"
        >
          <span>Perfil & Cuenta</span>
        </button>
        <button
          className={`details-tab-btn ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
          type="button"
        >
          <span>Archivos & Enlaces</span>
        </button>
      </div>

      {/* 4. Contenido según pestaña */}
      {activeTab === 'info' ? (
        <>
          <div className="details-section">
            <span className="details-section-title">Detalles de Cuenta</span>
            <div className="details-info-row">
              <IconUser size={15} />
              <div className="details-info-text">
                <strong>Nombre</strong>
                <span>{activeChat.name}</span>
              </div>
            </div>
            <div className="details-info-row">
              <IconMail size={15} />
              <div className="details-info-text">
                <strong>Correo</strong>
                <span>{activeChat.email}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <span className="details-section-title">Descripción / Bio</span>
            <p className="conv-preview" style={{ whiteSpace: 'normal', lineHeight: '1.45' }}>
              {activeChat.bio || 'Usuario miembro del equipo de desarrollo de Nexu.'}
            </p>
          </div>

          <div className="details-section">
            <span className="details-section-title">Seguridad y Cifrado</span>
            <div className="security-box">
              <IconShield size={16} />
              <p>Conexión directa 1 a 1 cliente-servidor con confirmaciones de entrega verificadas.</p>
            </div>
          </div>

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

            <button
              className="btn-danger-action"
              onClick={() => onDeleteConversation(activeChat.id)}
              title="Eliminar contacto y conversación"
              type="button"
            >
              <IconTrash size={14} />
              <span>Eliminar Contacto</span>
            </button>
          </div>
        </>
      ) : (
        /* Pestaña: Archivos y Enlaces Compartidos */
        <div className="details-media-tab-content">
          
          {/* Sección de Documentos y Archivos */}
          <div className="details-section">
            <span className="details-section-title">Documentos y Archivos ({sharedFiles.length})</span>
            {sharedFiles.length === 0 ? (
              <div className="empty-media-msg" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No hay archivos compartidos.</div>
            ) : (
              <div className="shared-files-list">
                {sharedFiles.map((file) => (
                  <div key={file.id} className="shared-file-item" title={`Archivo: ${file.name}`}>
                    <div className="shared-file-icon">
                      {file.type === 'image' ? <IconImage size={15} /> : <IconPaperclip size={15} />}
                    </div>
                    <div className="shared-file-info">
                      <span className="shared-file-name">{file.name}</span>
                      <span className="shared-file-meta">{file.size} · Local</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Enlaces Compartidos */}
          <div className="details-section">
            <span className="details-section-title">Enlaces Compartidos ({sharedLinks.length})</span>
            {sharedLinks.length === 0 ? (
              <div className="empty-media-msg" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No hay enlaces compartidos.</div>
            ) : (
              <div className="shared-links-list">
                {sharedLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shared-link-item"
                    title={link.url}
                  >
                    <div className="shared-link-icon">
                      <IconLink size={15} />
                    </div>
                    <div className="shared-link-info">
                      <span className="shared-link-title">{link.title}</span>
                      <span className="shared-link-domain">{link.domain}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="details-section" style={{ marginTop: 'auto', borderBottom: 'none' }}>
            <div className="sidebar-privacy-box">
              <span className="sidebar-privacy-tag">
                <IconShield size={14} /> Almacenamiento Local
              </span>
              <p className="sidebar-privacy-text">
                Los archivos se guardan únicamente en el almacenamiento local de este dispositivo.
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default ContactDetailsPanel
