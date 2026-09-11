import React from 'react'

const OutgoingRequestCard = ({ req, onCancelRequest }) => {
  return (
    <div className="pending-request-card" style={{ opacity: 0.85 }}>
      <div className="pending-request-header">
        <div
          className="avatar-badge"
          style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}
        >
          {req.toUser?.avatar}
        </div>
        <div>
          <div className="user-found-name">{req.toUser?.name}</div>
          <div className="user-found-handle" style={{ fontSize: '0.75rem' }}>
            Pendiente de aceptación...
          </div>
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
