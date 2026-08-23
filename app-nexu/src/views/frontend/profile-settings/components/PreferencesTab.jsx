import { IconVolume2 } from './SettingsIcons'

function PreferencesTab({
  themeMode,
  onThemeChange,
  notifications,
  onNotificationToggle,
  onPlayChimeSound
}) {
  return (
    <div className="tab-content-area">
      {/* 1. Selector de Tema */}
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Apariencia & Tema Visual</h3>
            <p>Personaliza los contrastes y estilo general de la plataforma.</p>
          </div>
        </div>

        <div className="theme-selector-grid">
          <div
            className={`theme-card-option ${themeMode === 'dark' ? 'active' : ''}`}
            onClick={() => onThemeChange('dark')}
          >
            <div className="theme-preview-box dark">
              <div className="preview-side"></div>
              <div className="preview-body">
                <div className="preview-line accent"></div>
                <div className="preview-line"></div>
                <div className="preview-line" style={{ width: '70%' }}></div>
              </div>
            </div>
            <span className="theme-label-name">Modo Oscuro (Predeterminado)</span>
          </div>

          <div
            className={`theme-card-option ${themeMode === 'light' ? 'active' : ''}`}
            onClick={() => onThemeChange('light')}
          >
            <div className="theme-preview-box light">
              <div className="preview-side"></div>
              <div className="preview-body">
                <div className="preview-line accent"></div>
                <div className="preview-line"></div>
                <div className="preview-line" style={{ width: '70%' }}></div>
              </div>
            </div>
            <span className="theme-label-name">Modo Claro</span>
          </div>
        </div>
      </section>

      {/* 2. Notificaciones y Sonidos */}
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Notificaciones & Alertas Sonoras</h3>
            <p>Configura cómo y cuándo deseas ser notificado al recibir mensajes.</p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onPlayChimeSound}
          >
            <IconVolume2 />
            <span>Probar Sonido</span>
          </button>
        </div>

        <div className="settings-toggle-list">
          <div className="toggle-item-row">
            <div className="toggle-info">
              <span className="toggle-title">Notificaciones de Escritorio</span>
              <span className="toggle-desc">Mostrar ventanas emergentes al recibir nuevos mensajes</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={notifications.desktop}
                onChange={(e) => onNotificationToggle('desktop', e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-info">
              <span className="toggle-title">Sonido al Recibir Mensajes</span>
              <span className="toggle-desc">Emitir un tono audible con cada mensaje entrante</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={notifications.soundIncoming}
                onChange={(e) => onNotificationToggle('soundIncoming', e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-info">
              <span className="toggle-title">Sonido al Enviar Mensajes</span>
              <span className="toggle-desc">Efecto suave de confirmación al presionar enviar</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={notifications.soundOutgoing}
                onChange={(e) => onNotificationToggle('soundOutgoing', e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
          </div>

          <div className="toggle-item-row">
            <div className="toggle-info">
              <span className="toggle-title">Vista Previa del Mensaje</span>
              <span className="toggle-desc">Mostrar texto y remitente en los avisos de notificación</span>
            </div>
            <label className="switch-control">
              <input
                type="checkbox"
                checked={notifications.messagePreview}
                onChange={(e) => onNotificationToggle('messagePreview', e.target.checked)}
              />
              <span className="slider-round"></span>
            </label>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PreferencesTab
