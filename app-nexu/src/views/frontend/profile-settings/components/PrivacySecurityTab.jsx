import {
  IconSmartphone,
  IconLaptop
} from './SettingsIcons'

function PrivacySecurityTab({
  privacy,
  onPrivacyToggle,
  passwords,
  onPasswordsChange,
  onPasswordSubmit,
  sessions,
  onCloseSession
}) {
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

      {/* 3. Sesiones Activas */}
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
    </div>
  )
}

export default PrivacySecurityTab
