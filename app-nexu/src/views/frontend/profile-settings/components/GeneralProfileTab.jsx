import React, { useRef } from 'react'
import {
  IconCamera,
  IconCheck,
  AvatarNeutral,
  AvatarFemale,
  AvatarMale,
  renderAvatarBadge
} from '../../../../components/icons/Icons'
import './GeneralProfileTab.css'

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
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 150
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        onProfileChange({ target: { name: 'avatarUrl', value: compressedBase64 } })
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="tab-content-area">
      <section className="settings-section-card">
        <div className="section-card-header">
          <div className="section-title-group">
            <h3>Identidad de Usuario</h3>
            <p>Sube tu fotografía real o configura tu icono vectorial, nombre y presencia.</p>
          </div>
        </div>

        {/* Fila Hero del Perfil con Avatar Vectorial y Datos Rápidos */}
        <div className="profile-hero-row">
          <div className="avatar-edit-container">
            {renderAvatarBadge(profile.avatarType, userInitials, 100, profile.avatarUrl)}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              className="avatar-change-badge"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar fotografía"
              type="button"
            >
              <IconCamera />
            </button>
          </div>

          <div className="profile-hero-details">
            <span className="hero-display-name">{profile.displayName}</span>
            <span className="hero-username-handle">@{profile.username}</span>
            <span className="hero-join-date">
              Cuenta activa · Nexu v1.0
            </span>
          </div>
        </div>

        {/* Selector de Sexo / Identidad de Género */}
        <div className="form-group">
          <label className="form-label" htmlFor="genderSelect">
            <span>Identidad de Género / Sexo</span>
            <span className="form-label-hint">Asigna tu icono representativo</span>
          </label>
          <select
            id="genderSelect"
            className="form-input"
            value={profile.gender || 'neutral'}
            onChange={(e) => onGenderChange(e.target.value)}
          >
            <option value="neutral">Prefiero no especificar</option>
            <option value="female">Femenino</option>
            <option value="male">Masculino</option>
          </select>
        </div>

        {/* Selector de Estado de Presencia */}
        <div className="form-group">
          <label className="form-label" htmlFor="presenceSelect">
            <span>Estado de Presencia</span>
            <span className="form-label-hint">Visible para tus contactos</span>
          </label>
          <select
            id="presenceSelect"
            className="form-input"
            value={profile.presence || 'online'}
            onChange={(e) => onPresenceChange(e.target.value)}
          >
            <option value="online">En línea (Alerta y mensajes al instante)</option>
            <option value="away">Ausente (Temporalmente inactivo)</option>
            <option value="dnd">No molestar (Sin notificaciones sonoras)</option>
            <option value="offline">Desconectado (Ocultar estado activo)</option>
          </select>
        </div>

        {/* Formulario de Datos */}
        <form onSubmit={onSaveProfile} className="form-grid-2col">
          <div className="form-group">
            <label className="form-label" htmlFor="displayName">Nombre Real</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="form-input"
              value={profile.displayName}
              onChange={onProfileChange}
              placeholder="Ej. Jonathan Medina"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              <span>Usuario Único (Alias)</span>
              <span className="form-label-hint">Inmutable</span>
            </label>
            <div className="form-input-container">
              <span className="form-input-prefix">@</span>
              <input
                id="username"
                name="username"
                type="text"
                className="form-input has-prefix"
                value={profile.username}
                readOnly
                disabled
                style={{ opacity: 0.75, cursor: 'not-allowed' }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: '4px', display: 'block' }}>
              Tu alias único es tu dirección soberana y no se puede modificar.
            </span>
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
              value={profile.bio || ''}
              onChange={onProfileChange}
              maxLength={150}
              placeholder="Escribe una breve descripción para que la vean tus contactos..."
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
