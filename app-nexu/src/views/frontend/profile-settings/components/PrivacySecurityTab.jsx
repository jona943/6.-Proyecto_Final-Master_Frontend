import { useState, useEffect } from 'react'
import {
  IconSmartphone,
  IconLaptop,
  IconShield,
  IconCheckCircle,
  IconAlertCircle
} from '../../../../components/icons/Icons'
import { authService } from '../../../../services/authService'
import TwoFactorModal from './TwoFactorModal'
import './PrivacySecurityTab.css'

function PrivacySecurityTab({
  username,
  showToast,
  privacy,
  onPrivacyToggle,
  passwords,
  onPasswordsChange,
  onPasswordSubmit,
  sessions,
  onCloseSession
}) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isTwoFactorModalOpen, setIsTwoFactorModalOpen] = useState(false)
  const [loading2FA, setLoading2FA] = useState(true)

  useEffect(() => {
    if (username) {
      authService
        .get2FAStatus(username)
        .then((data) => {
          setTwoFactorEnabled(Boolean(data?.twoFactorEnabled))
        })
        .catch(() => {})
        .finally(() => setLoading2FA(false))
    }
  }, [username])
  return (
    <div className="tab-content-area">
      {/* 1. Privacidad de Lectura y Conexión */}
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Control de Privacidad</h3>
            <p>Decide qué información compartes en tus conversaciones.</p>
          </div>
        </div>

        <div className="settings-toggle-list">
          <div className="toggle-item-row">
            <div className="toggle-info">
              <span className="toggle-title">Confirmación de Lectura (Doble Check)</span>
              <span className="toggle-desc">Permite a otros saber cuando has leído sus mensajes</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={privacy.readReceipts}
                onChange={(e) => onPrivacyToggle('readReceipts', e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-info">
              <span className="toggle-title">Mostrar Última Hora de Conexión</span>
              <span className="toggle-desc">Tus contactos podrán ver cuándo estuviste activo por última vez</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={privacy.lastSeen}
                onChange={(e) => onPrivacyToggle('lastSeen', e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-info">
              <span className="toggle-title">Indicador de "Escribiendo..."</span>
              <span className="toggle-desc">Muestra a tu destinatario cuando estás redactando una respuesta</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={privacy.typingIndicator}
                onChange={(e) => onPrivacyToggle('typingIndicator', e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
          </div>
        </div>
      </section>

      {/* 2. Cambio de Contraseña */}
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Cambio de Contraseña</h3>
            <p>Mantén tu cuenta protegida actualizando tu clave periódicamente.</p>
          </div>
        </div>

        <form onSubmit={onPasswordSubmit} className="form-grid-2col">
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">Contraseña Actual</label>
            <input
              id="currentPassword"
              type="password"
              className="form-input"
              placeholder="••••••••••••"
              value={passwords.current}
              onChange={(e) => onPasswordsChange('current', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">Nueva Contraseña</label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              placeholder="Mínimo 8 caracteres"
              value={passwords.newPass}
              onChange={(e) => onPasswordsChange('newPass', e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Repite la nueva contraseña"
              value={passwords.confirmPass}
              onChange={(e) => onPasswordsChange('confirmPass', e.target.value)}
              required
            />
          </div>

          <div className="form-actions-bar" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-secondary">
              <span>Actualizar Contraseña</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. Autenticación en Dos Pasos (2FA TOTP) */}
      <section className="settings-section-card" style={{ border: twoFactorEnabled ? '1px solid rgba(212, 255, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="section-card-header">
          <div className="section-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
              <span style={{ color: twoFactorEnabled ? 'var(--accent-acid, #d4ff00)' : 'var(--text-muted, #94a3b8)', display: 'flex' }}>
                <IconShield size={18} />
              </span>
              <h3 style={{ margin: 0 }}>Autenticación en Dos Pasos (2FA TOTP)</h3>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  background: twoFactorEnabled ? 'rgba(212, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  color: twoFactorEnabled ? 'var(--accent-acid, #d4ff00)' : 'var(--text-muted, #94a3b8)',
                  border: `1px solid ${twoFactorEnabled ? 'rgba(212, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                }}
              >
                {twoFactorEnabled ? '● Activado' : '○ Desactivado'}
              </span>
            </div>
            <p>
              Protección criptográfica adicional compatible con Google Authenticator, Aegis, Ente o 1Password. <strong>Cero uso de número telefónico o correo electrónico</strong> para garantizar tu privacidad total.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)', maxWidth: '480px', lineHeight: 1.45 }}>
            {twoFactorEnabled
              ? 'Tu cuenta requiere un código dinámico de 6 dígitos cada vez que inicias sesión en un nuevo equipo.'
              : 'Al activar 2FA, un atacante no podrá ingresar a tu cuenta incluso si conoce tu contraseña.'}
          </div>

          <button
            type="button"
            className={twoFactorEnabled ? 'btn-danger-outline' : 'btn-primary'}
            onClick={() => setIsTwoFactorModalOpen(true)}
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {twoFactorEnabled ? 'Desactivar 2FA' : 'Configurar 2FA con Authenticator'}
          </button>
        </div>
      </section>

      {/* 4. Sesiones Activas */}
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Dispositivos y Sesiones Activas</h3>
            <p>Equipos donde tu cuenta de Nexu se encuentra actualmente iniciada.</p>
          </div>
        </div>

        <div className="security-session-list">
          {sessions.map((sess) => (
            <div key={sess.id} className="session-card">
              <div className="session-device-meta">
                <div className="device-icon-box">
                  {sess.platform === 'Mobile' || sess.platform === 'Tablet' ? (
                    <IconSmartphone />
                  ) : (
                    <IconLaptop />
                  )}
                </div>
                <div className="device-text">
                  <span className="device-name">
                    {sess.browser} en {sess.deviceName}
                    {sess.isCurrent && (
                      <span className="badge-current-session">Sesión Actual</span>
                    )}
                  </span>
                  <span className="device-location">
                    {sess.ip} · Último acceso: {sess.lastLoginDate} ({sess.lastLoginTime}) · {sess.lastActive}
                  </span>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => onCloseSession(sess.id)}
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <TwoFactorModal
        isOpen={isTwoFactorModalOpen}
        onClose={() => setIsTwoFactorModalOpen(false)}
        username={username}
        isEnabled={twoFactorEnabled}
        onStatusChange={(newStatus) => setTwoFactorEnabled(newStatus)}
        showToast={showToast}
      />
    </div>
  )
}

export default PrivacySecurityTab
