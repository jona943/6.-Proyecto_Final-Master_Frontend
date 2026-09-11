import React from 'react'

const OutgoingRequestCard = ({ req, onCancelRequest }) => {
  return (
    <div className="pending-request-card" style={{ opacity: 0.85 }}>
      <div className="pending-request-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', alignItems: 'flex-start' }}>
        <div className="user-found-name" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
          {req.toUser?.handle || req.toUser?.name || `@${req.toUser?.username}`}
        </div>
        <div className="user-found-handle" style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
          Pendiente de aceptación...
        </div>
      </div>
      <div className="pending-request-actions">
        <button
          type="button"
          className="btn-reject-req"
          style={{ width: '100%', padding: '0.45rem' }}
          onClick={() => onCancelRequest && onCancelRequest(req.id, req.toUser?.username)}
        >
          Cancelar solicitud
        </button>
      </div>
    </div>
  )
}

export default OutgoingRequestCard
