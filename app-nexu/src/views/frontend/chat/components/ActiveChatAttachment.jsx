import { useState, useEffect } from 'react'
import { mediaVault } from '../../../../services/mediaVault'
import { cryptoVault } from '../../../../services/cryptoVault'
import { useAuthStore } from '../../../../store/useAuthStore'
import { IconAlertCircle } from '../../../../components/icons/Icons'

function ActiveChatAttachment({ attachment, isMe, activeChat }) {
  const [mediaData, setMediaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    let isMounted = true

    async function loadAttachmentData() {
      if (!attachment) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        // 1. Verificar si ya existe en la bóveda local (IndexedDB)
        const localRecord = await mediaVault.getMedia(attachment.fileId)
        if (localRecord && localRecord.dataUrl) {
          if (isMounted) {
            setMediaData(localRecord.dataUrl)
            setLoading(false)
          }
          return
        }

        // 2. Si no está en local, pero el mensaje incluye el payload efímero cifrado
        if (attachment.encryptedPayload) {
          const myUsername = currentUser?.username || ''
          const partnerUsername = activeChat?.handle ? activeChat.handle.replace(/^@/, '') : ''

          const decrypted = await cryptoVault.decryptPayload(
            attachment.encryptedPayload,
            myUsername,
            partnerUsername
          )

          if (decrypted) {
            // Guardar inmediatamente en la bóveda local para acceso permanente y offline
            await mediaVault.saveMedia(attachment.fileId, {
              dataUrl: decrypted,
              name: attachment.name,
              type: attachment.type,
              size: attachment.size,
              mimeType: attachment.mimeType
            })

            if (isMounted) {
              setMediaData(decrypted)
              setLoading(false)
            }
            return
          }
        }

        // 3. Si no hay datos locales ni payload efímero (expiró o fue borrado en tránsito)
        if (isMounted) {
          setMediaData(null)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error al resolver archivo adjunto:', err)
        if (isMounted) {
          setMediaData(null)
          setLoading(false)
        }
      }
    }

    loadAttachmentData()

    return () => {
      isMounted = false
    }
  }, [attachment, activeChat, currentUser])

  if (!attachment) return null

  // Estado de Descifrado / Carga
  if (loading) {
    return (
      <div
        className="attachment-loading-box"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          marginTop: '0.4rem',
          marginBottom: '0.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary, #94a3b8)'
        }}
      >
        <span className="shimmer-dot" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-acid, #d4ff00)', animation: 'pulse 1.5s infinite' }} />
        <span>Descifrando archivo seguro de punto a punto...</span>
      </div>
    )
  }

  // Estado No Disponible (Eliminado del servidor efímero tras entrega o expiración)
  if (!mediaData) {
    return (
      <div
        className="attachment-missing-box"
        style={{
          background: 'rgba(239, 68, 68, 0.08)',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          marginTop: '0.45rem',
          marginBottom: '0.45rem',
          border: '1px dashed rgba(239, 68, 68, 0.35)',
          fontSize: '0.84rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 600 }}>
          <IconAlertCircle size={16} />
          <span>{attachment.name} ({attachment.size})</span>
        </div>
        <div style={{ color: 'var(--text-muted, #94a3b8)', marginTop: '0.35rem', fontSize: '0.78rem', lineHeight: 1.4 }}>
          {isMe
            ? 'Este archivo fue purgado de la memoria local de este dispositivo y ya no se encuentra en el servidor efímero.'
            : 'Este archivo no está disponible en este dispositivo. Pídele al remitente que te lo reenvíe si aún lo conserva en su almacenamiento local.'}
        </div>
      </div>
    )
  }

  // Renderizado: Imagen en Alta Definición (HD)
  if (attachment.type === 'image') {
    return (
      <div
        className="attachment-image-box"
        style={{
          marginTop: '0.5rem',
          marginBottom: '0.5rem',
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxWidth: '380px'
        }}
      >
        <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
          <img
            src={mediaData}
            alt={attachment.name}
            style={{
              width: '100%',
              maxHeight: '320px',
              objectFit: 'cover',
              display: 'block',
              transition: 'transform 0.25s ease'
            }}
            onClick={() => {
              const win = window.open('')
              win?.document.write(`<img src="${mediaData}" style="max-width:100%; height:auto; margin:auto; display:block; background:#0b0f19;" />`)
            }}
            title="Haz clic para ver imagen completa"
          />
        </div>

        <div
          style={{
            padding: '0.5rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.9)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.76rem'
          }}
        >
          <span style={{ color: 'var(--text-secondary, #94a3b8)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
            {attachment.name} · {attachment.size}
          </span>
          <a
            href={mediaData}
            download={attachment.name}
            style={{
              color: 'var(--accent-acid, #d4ff00)',
              textDecoration: 'none',
              fontWeight: 600,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              background: 'rgba(212, 255, 0, 0.1)'
            }}
          >
            Descargar
          </a>
        </div>
      </div>
    )
  }

  // Renderizado: Documento / Archivo general
  return (
    <div
      className="attachment-doc-box"
      style={{
        background: 'rgba(255, 255, 255, 0.07)',
        padding: '0.85rem 1rem',
        borderRadius: '10px',
        marginTop: '0.5rem',
        marginBottom: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div style={{ padding: '0.6rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', fontSize: '1.2rem' }}>
        📁
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: 600, fontSize: '0.85rem' }}>
          {attachment.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '0.15rem' }}>
          {attachment.size}
        </div>
      </div>
      <a
        href={mediaData}
        download={attachment.name}
        style={{
          background: 'var(--accent-primary, #6366f1)',
          color: 'white',
          padding: '0.4rem 0.85rem',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap'
        }}
      >
        Descargar
      </a>
    </div>
  )
}

export default ActiveChatAttachment
