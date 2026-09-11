import React from 'react'
import IncomingRequestCard from './IncomingRequestCard'
import OutgoingRequestCard from './OutgoingRequestCard'

const RequestsSection = ({
  incomingRequests = [],
  outgoingRequests = [],
  onAcceptRequest,
  onRejectRequest,
  onBlockUser,
  onCancelRequest
}) => {
  const hasRequests = incomingRequests.length > 0 || outgoingRequests.length > 0

  if (!hasRequests) {
    return (
      <div className="sidebar-empty-state">
        <div>
          <h4 className="sidebar-empty-title">Sin solicitudes</h4>
          <p className="sidebar-empty-desc">No tienes solicitudes de conexión pendientes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sidebar-pending-requests">
      {incomingRequests.length > 0 && (
        <>
          <span
            className="input-hint"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 700,
              marginTop: '0.5rem'
            }}
          >
            Recibidas ({incomingRequests.length})
          </span>
          {incomingRequests.map((req) => (
            <IncomingRequestCard
              key={req.id}
              req={req}
              onAcceptRequest={onAcceptRequest}
              onRejectRequest={onRejectRequest}
              onBlockUser={onBlockUser}
            />
          ))}
        </>
      )}

      {outgoingRequests.length > 0 && (
        <>
          <span
            className="input-hint"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 700,
              marginTop: '1rem'
            }}
          >
            Enviadas ({outgoingRequests.length})
          </span>
          {outgoingRequests.map((req) => (
            <OutgoingRequestCard
              key={req.id}
              req={req}
              onCancelRequest={onCancelRequest}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default RequestsSection
