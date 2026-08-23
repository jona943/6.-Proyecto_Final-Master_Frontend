import {
  IconCamera,
  IconCheck,
  AvatarNeutral,
  AvatarFemale,
  AvatarMale,
  renderAvatarBadge
} from './SettingsIcons'

function GeneralProfileTab({
  profile,
  userInitials,
  isRosi,
  onOpenAvatarModal,
  onGenderChange,
  onPresenceChange,
  onProfileChange,
  onUsernameChange,
  onSaveProfile
}) {
  return (
    <div className="tab-content-area">
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Identidad de Usuario</h3>
            <p>Configura tu icono vectorial, nombre visible, sexo y estado de presencia.</p>
          </div>
        </div>

        {/* Fila Hero del Perfil con Avatar Vectorial y Datos Rápidos */}
        <div className="profile-hero-row">
          <div className="avatar-edit-container">
            {renderAvatarBadge(profile.avatarType, userInitials, 100)}
            <button
              className="avatar-change-badge"
              onClick={onOpenAvatarModal}
              title="Cambiar estilo de avatar"
              type="button"
            >
              <IconCamera />
            </button>
          </div>

          <div className="profile-hero-details">
            <span className="hero-display-name">{profile.displayName}</span>
            <span className="hero-username-handle">@{profile.username}</span>
            <span className="hero-join-date">
              Cuenta activa: {isRosi ? 'Rosy Master (Frontend Specialist)' : 'Admin User (System Admin)'} · Nexu v1.0
            </span>
          </div>
        </div>

        {/* Selector de Sexo / Identidad de Género */}
        <div className="form-group">
          <label className="form-label">
            <span>Identidad de Género / Sexo</span>
            <span className="form-label-hint">Asigna tu icono representativo</span>
          </label>
          <div className="gender-selector-grid">
            <button
              type="button"
              className={`gender-option-btn ${profile.gender === 'neutral' ? 'active' : ''}`}
              onClick={() => onGenderChange('neutral')}
            >
              <AvatarNeutral size={18} />
              <div className="gender-btn-meta">
                <span className="gender-btn-title">Prefiero no especificar</span>
                <span className="gender-btn-sub">Icono neutral o iniciales</span>
              </div>
            </button>

            <button
              type="button"
              className={`gender-option-btn ${profile.gender === 'female' ? 'active' : ''}`}
              onClick={() => onGenderChange('female')}
            >
              <AvatarFemale size={18} />
              <div className="gender-btn-meta">
                <span className="gender-btn-title">Femenino</span>
                <span className="gender-btn-sub">Icono femenino</span>
              </div>
            </button>

            <button
              type="button"
              className={`gender-option-btn ${profile.gender === 'male' ? 'active' : ''}`}
              onClick={() => onGenderChange('male')}
            >
              <AvatarMale size={18} />
              <div className="gender-btn-meta">
                <span className="gender-btn-title">Masculino</span>
                <span className="gender-btn-sub">Icono masculino</span>
              </div>
            </button>
          </div>
        </div>

        {/* Selector de Estado de Presencia */}
        <div className="form-group">
          <label className="form-label">
            <span>Estado de Presencia</span>
            <span className="form-label-hint">Visible para tus contactos</span>
          </label>

          <div className="presence-selector-grid">
            <button
              type="button"
              className={`presence-option-btn ${profile.presence === 'online' ? 'active' : ''}`}
              onClick={() => onPresenceChange('online')}
            >
              <span className="status-dot online"></span>
              <div className="presence-text">
                <span className="presence-label">En línea</span>
                <span className="presence-desc">Recibe alertas y mensajes al instante</span>
              </div>
            </button>

            <button
              type="button"
              className={`presence-option-btn ${profile.presence === 'away' ? 'active' : ''}`}
              onClick={() => onPresenceChange('away')}
            >
              <span className="status-dot away"></span>
              <div className="presence-text">
                <span className="presence-label">Ausente</span>
                <span className="presence-desc">Temporalmente inactivo</span>
              </div>
            </button>

            <button
              type="button"
              className={`presence-option-btn ${profile.presence === 'dnd' ? 'active' : ''}`}
              onClick={() => onPresenceChange('dnd')}
            >
              <span className="status-dot dnd"></span>
              <div className="presence-text">
                <span className="presence-label">No molestar</span>
                <span className="presence-desc">Sin notificaciones de sonido</span>
              </div>
            </button>

            <button
              type="button"
              className={`presence-option-btn ${profile.presence === 'offline' ? 'active' : ''}`}
              onClick={() => onPresenceChange('offline')}
            >
              <span className="status-dot offline"></span>
              <div className="presence-text">
                <span className="presence-label">Desconectado</span>
                <span className="presence-desc">Ocultar estado activo</span>
              </div>
            </button>
          </div>
        </div>

        {/* Formulario de Datos */}
        <form onSubmit={onSaveProfile} className="form-grid-2col">
          <div className="form-group">
            <label className="form-label" htmlFor="displayName">Nombre Completo</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="form-input"
              value={profile.displayName}
              onChange={onProfileChange}
              placeholder="Ej. Víctor Gil"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <span>Alias Único (Handle)</span>
              <span className="form-label-hint">{profile.username.length}/10</span>
            </label>
            <div className="form-input-container">
              <span className="form-input-prefix">@</span>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input has-prefix"
                value={profile.username}
                onChange={onUsernameChange}
                maxLength={10}
                placeholder="usuario"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="email">Correo Electrónico Vinculado</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={profile.email}
              onChange={onProfileChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label" htmlFor="bio">
              <span>Biografía o Estado Personal</span>
              <span className="form-label-hint">{profile.bio?.length || 0}/150</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-textarea"
              value={profile.bio}
              onChange={onProfileChange}
              maxLength={150}
              placeholder="Escribe una breve descripción para tus contactos..."
              rows={3}
            />
          </div>

          <div className="form-actions-bar" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-primary">
              <IconCheck />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default GeneralProfileTab
