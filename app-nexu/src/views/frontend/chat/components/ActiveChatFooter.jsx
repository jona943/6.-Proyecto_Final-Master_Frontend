import { useRef, useState } from 'react'
import { IconClock, IconCode, IconSend, IconAlertCircle, IconUserPlus, IconCheck, IconPaperclip, IconX } from '../../../../components/icons/Icons'
import { imageOptimizer } from '../../../../services/imageOptimizer'
import { cryptoVault } from '../../../../services/cryptoVault'
import { mediaVault } from '../../../../services/mediaVault'
import { useAuthStore } from '../../../../store/useAuthStore'

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
  const fileInputRef = useRef(null)
  const [uploadState, setUploadState] = useState(null)
  const currentUser = useAuthStore((state) => state.user)

  const handleFileClick = () => {
    if (uploadState?.active) return
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Validar límite estricto de 10 MB
    const validation = imageOptimizer.validateFileSize(file)
    if (!validation.valid) {
      if (onTriggerToast) onTriggerToast(validation.message)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : null

    setUploadState({
      active: true,
      progress: 15,
      status: isImage ? 'Optimizando imagen en HD (WebP)...' : 'Procesando archivo seguro...',
      fileName: file.name,
      fileSize: imageOptimizer.formatSize(file.size),
      previewUrl,
      error: null
    })

    try {
      let processed
      if (isImage) {
        processed = await imageOptimizer.optimizeImage(file, (p) => {
          setUploadState((prev) => (prev ? { ...prev, progress: Math.max(15, Math.min(45, p)) } : null))
        })
      } else {
        processed = await imageOptimizer.processDocument(file, (p) => {
          setUploadState((prev) => (prev ? { ...prev, progress: Math.max(15, Math.min(45, p)) } : null))
        })
      }

      setUploadState((prev) => (prev ? {
        ...prev,
        progress: 60,
        status: 'Cifrando de extremo a extremo (AES-GCM)...'
      } : null))

      const myUsername = (currentUser?.username || '').trim().toLowerCase()
      const partnerUsername = (activeChat.handle ? activeChat.handle.replace(/^@/, '') : activeChat.name).trim().toLowerCase()
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

      // 2. Guardar copia local permanente en IndexedDB para el emisor
      await mediaVault.saveMedia(fileId, {
        dataUrl: processed.dataUrl,
        name: processed.name,
        type: processed.type,
        size: processed.size,
        mimeType: processed.mimeType
      })

      // 3. Cifrar el payload para el buzón efímero del servidor
      const encryptedPayload = await cryptoVault.encryptPayload(
        processed.dataUrl,
        myUsername,
        partnerUsername
      )

      setUploadState((prev) => (prev ? {
        ...prev,
        progress: 85,
        status: 'Subiendo al buzón efímero...'
      } : null))

      const attachment = {
        fileId,
        name: processed.name,
        type: processed.type,
        size: processed.size,
        mimeType: processed.mimeType,
        encryptedPayload
      }

      // Enviar el mensaje con el adjunto
      await onSendMessage(null, attachment)

      setUploadState((prev) => (prev ? {
        ...prev,
        progress: 100,
        status: '¡Archivo entregado al buzón efímero!'
      } : null))

      setTimeout(() => {
        setUploadState(null)
      }, 1200)

    } catch (err) {
      console.error('Error al subir archivo:', err)
      setUploadState((prev) => (prev ? {
        ...prev,
        error: 'Error al procesar el archivo. Inténtalo nuevamente.',
        progress: 0
      } : null))
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return
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
      {/* Barra de progreso visual de carga y optimización */}
      {uploadState && (
        <div
          className="upload-progress-banner"
          style={{
            margin: '0.4rem 1rem 0.6rem 1rem',
            padding: '0.75rem 1rem',
            background: uploadState.error ? 'rgba(239, 68, 68, 0.12)' : 'rgba(15, 23, 42, 0.95)',
            border: `1px solid ${uploadState.error ? 'rgba(239, 68, 68, 0.4)' : 'rgba(212, 255, 0, 0.3)'}`,
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              {uploadState.previewUrl ? (
                <img
                  src={uploadState.previewUrl}
                  alt="preview"
                  style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                />
              ) : (
                <span style={{ fontSize: '1.2rem' }}>📎</span>
              )}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #fff)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '280px' }}>
                  {uploadState.fileName} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 400 }}>({uploadState.fileSize})</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: uploadState.error ? '#f87171' : 'var(--accent-acid, #d4ff00)' }}>
                  {uploadState.error || uploadState.status}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {!uploadState.error && (
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-acid, #d4ff00)' }}>
                  {uploadState.progress}%
                </span>
              )}
              <button
                type="button"
                onClick={() => setUploadState(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex'
                }}
                title="Cerrar"
              >
                <IconX size={15} />
              </button>
            </div>
          </div>

          {!uploadState.error && (
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${uploadState.progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--accent-primary, #6366f1), var(--accent-acid, #d4ff00))',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="chat-toolbar">
        <div className="toolbar-group">
          {!activeChat.isBot && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,application/pdf,text/*,.zip,.rar,.doc,.docx"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                className="btn-tool-icon"
                title="Adjuntar imagen o archivo (máx. 10 MB)"
                onClick={handleFileClick}
                disabled={uploadState?.active}
              >
                <IconPaperclip size={16} />
              </button>
            </>
          )}

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
