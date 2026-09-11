import React from 'react'
import { IconShield, IconUserPlus, IconLink, IconLock } from '../../../../../../components/icons/Icons'

const EmptyFeed = ({ onOpenConnectModal, onCopyInviteLink }) => {
  return (
    <div className="sidebar-empty-state">
      <div className="sidebar-empty-icon">
        <IconShield />
      </div>
      <div>
        <h4 className="sidebar-empty-title">Bandeja Privada</h4>
        <p className="sidebar-empty-desc">
          No tienes conversaciones activas aún. Conecta mediante un alias o comparte tu enlace directo.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        <button
          type="button"
          className="btn-connect-primary"
          onClick={onOpenConnectModal}
          title="Conectar mediante alias de usuario"
        >
          <IconUserPlus />
          <span>Conectar con un usuario</span>
        </button>

        <button
          type="button"
          className="btn-invite-link"
          onClick={onCopyInviteLink}
          title="Copiar enlace de conexión directa"
        >
          <IconLink />
          <span>Copiar mi enlace directo</span>
        </button>
      </div>

      <div className="sidebar-privacy-box">
        <span className="sidebar-privacy-tag">
          <IconLock /> Cero Spam · Punto a Punto
        </span>
        <p className="sidebar-privacy-text">
          Solo los usuarios con solicitudes aceptadas pueden enviarte mensajes.
        </p>
      </div>
    </div>
  )
}

export default EmptyFeed
