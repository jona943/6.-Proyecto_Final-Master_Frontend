import { useRef } from 'react'
import { IconClock, IconImage, IconPaperclip, IconCode, IconSend, IconAlertCircle, IconUserPlus } from '../../../../components/icons/Icons'

function ActiveChatFooter({
  activeChat,
  inputText,
  onInputTextChange,
  onSendMessage,
  onTriggerToast,
  onInsertCodeSnippet,
  onCancelRequest,
  onSendConnectionRequest
}) {
  const fileInputRef = useRef(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Compresión al 70% calidad JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
          resolve(dataUrl)
        }
      }
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limite de 5MB
    if (file.size > 5 * 1024 * 1024) {
      onTriggerToast('El archivo supera los 5MB permitidos.')
      return
    }

    const isImage = file.type.startsWith('image/')
    
    // Generamos un ID único para guardar en LocalStorage temporalmente
    const fileId = `file_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    
    try {
      let dataUrl = ''
      
      if (isImage) {
        onTriggerToast('Comprimiendo imagen...')
        dataUrl = await compressImage(file)
      } else {
        onTriggerToast('Procesando archivo local...')
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result)
        })
      }

      // Guardar en el almacenamiento local del dispositivo emisor
      localStorage.setItem(fileId, dataUrl)

      // Tamaño formateado
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2)
      
      const attachment = {
        fileId,
        name: file.name,
        type: isImage ? 'image' : 'document',
        size: `${sizeMb} MB`
      }

      // Enviar el mensaje adjuntando el archivo
      onSendMessage(null, attachment)
      
    } catch (error) {
      console.error(error)
      onTriggerToast('Error al procesar el archivo.')
    } finally {
      // Limpiar el input
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSendMessage(e)
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
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="chat-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="btn-tool-icon"
            title="Adjuntar archivo o imagen"
            onClick={handleFileClick}
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
