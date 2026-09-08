import { IconInfo, IconX, IconCheck, IconLock, IconEye, IconEyeOff, IconAlertCircle } from '../../../../components/icons/Icons'

function PasswordInputField({
  regPassword,
  onPasswordChange,
  showRegPassword,
  onToggleShowPassword,
  showPasswordInfo,
  setShowPasswordInfo,
  passwordStrength,
  formErrors
}) {
  return (
    <div className="form-group">
      <div className="form-label">
        <div className="label-with-info">
          <label htmlFor="reg-password">Contraseña</label>
          <button
            type="button"
            className="btn-info-icon"
            onClick={() => setShowPasswordInfo(!showPasswordInfo)}
            title="Ver requisitos de contraseña segura"
            aria-label="Ver requisitos de contraseña"
          >
            <IconInfo size={14} />
          </button>
        </div>
        <span className="input-hint">Mín. 8 caracteres</span>
      </div>

      {showPasswordInfo && (
        <div className="info-popover-box">
          <div className="popover-header">
            <IconInfo size={14} />
            <span>Requisitos de contraseña</span>
            <button
              type="button"
              className="popover-close-btn"
              onClick={() => setShowPasswordInfo(false)}
              aria-label="Cerrar"
            >
              <IconX size={12} />
            </button>
          </div>
          <ul className="popover-list">
            <li className={regPassword.length >= 8 ? 'met' : ''}>
              {regPassword.length >= 8 ? <IconCheck size={12} /> : '•'} Mínimo 8 caracteres
            </li>
            <li className={/[A-Z]/.test(regPassword) ? 'met' : ''}>
              {/[A-Z]/.test(regPassword) ? <IconCheck size={12} /> : '•'} Al menos una mayúscula (A-Z)
            </li>
            <li className={/[a-z]/.test(regPassword) ? 'met' : ''}>
              {/[a-z]/.test(regPassword) ? <IconCheck size={12} /> : '•'} Al menos una minúscula (a-z)
            </li>
            <li className={/[0-9]/.test(regPassword) ? 'met' : ''}>
              {/[0-9]/.test(regPassword) ? <IconCheck size={12} /> : '•'} Al menos un número (0-9)
            </li>
            <li className={/[^a-zA-Z0-9]/.test(regPassword) ? 'met' : ''}>
              {/[^a-zA-Z0-9]/.test(regPassword) ? <IconCheck size={12} /> : '•'} Al menos un símbolo (!, #, $, etc.)
            </li>
          </ul>
        </div>
      )}

      <div className="input-container">
        <span className="input-icon-left">
          <IconLock />
        </span>
        <input
          id="reg-password"
          type={showRegPassword ? 'text' : 'password'}
          className={`auth-input has-right-btn ${formErrors.regPassword ? 'input-error' : ''}`}
          placeholder="Crea tu contraseña"
          value={regPassword}
          onChange={(e) => onPasswordChange(e.target.value)}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="btn-toggle-pw"
          onClick={onToggleShowPassword}
          title={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
        >
          {showRegPassword ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>

      {regPassword && (
        <div className="password-strength-compact">
          <div className="password-strength-bar">
            <div className={`strength-segment ${passwordStrength.level >= 1 ? passwordStrength.class : ''}`} />
            <div className={`strength-segment ${passwordStrength.level >= 2 ? passwordStrength.class : ''}`} />
            <div className={`strength-segment ${passwordStrength.level >= 3 ? passwordStrength.class : ''}`} />
          </div>
          <span className="strength-label">
            Seguridad: <strong>{passwordStrength.label}</strong>
          </span>
        </div>
      )}

      {formErrors.regPassword && (
        <span className="input-error-msg">
          <IconAlertCircle /> {formErrors.regPassword}
        </span>
      )}
    </div>
  )
}

export default PasswordInputField
