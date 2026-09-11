import React from 'react'

const IncomingRequestCard = ({ req, onAcceptRequest, onRejectRequest, onBlockUser }) => {
  return (
    <div className="pending-request-card">
      <div className="pending-request-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-start' }}>
        <div className="user-found-name" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
          {req.fromUser?.handle || req.fromUser?.name || `@${req.fromUser?.username}`}
        </div>
        <div className="user-found-handle" style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
          Solicitud de conexión entrante
        </div>
      </div>
      <div className="pending-request-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn-accept-req"
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}
            onClick={() => onAcceptRequest(req)}
          >
            Aceptar
          </button>
          <button
            type="button"
            className="btn-reject-req"
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
            onClick={() => onRejectRequest(req.id)}
          >
            Rechazar
          </button>
        </div>
        <button
          type="button"
          className="btn-reject-req"
          style={{
            padding: '0.45rem',
            fontSize: '0.75rem',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444',
            borderColor: 'transparent'
          }}
          onClick={() => onBlockUser && onBlockUser(req)}
          title="Rechazar y bloquear usuario"
        >
          Bloquear usuario
        </button>
      </div>
    </div>
  )
}

export default IncomingRequestCard
