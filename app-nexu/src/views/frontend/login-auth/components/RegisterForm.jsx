import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle
} from './LoginIcons'

function RegisterForm({
  regUsername,
  onUsernameChange,
  regPassword,
  onPasswordChange,
  regConfirmPassword,
  onConfirmPasswordChange,
  showRegPassword,
  onToggleShowPassword,
  passwordStrength,
  formErrors,
  isLoading,
  onSubmit
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Crea tu usuario único</h2>
        <p className="auth-form-desc">
          Sin correos ni números de teléfono. Solo tu usuario y contraseña.
        </p>
      </div>

      {/* Usuario Único */}
      <div className="form-group">
        <div className="form-label">
          <label htmlFor="reg-username">Usuario único</label>
          <span className="input-hint">3 a 10 caracteres alfanuméricos</span>
        </div>
        <div className="input-container">
          <span className="input-prefix-at">@</span>
          <input
            id="reg-username"
            type="text"
            className={`auth-input has-right-btn ${formErrors.regUsername ? 'input-error' : ''}`}
            placeholder="TuAlias"
            value={regUsername}
            onChange={(e) => onUsernameChange(e.target.value)}
            maxLength={10}
            autoComplete="username"
          />
          <span className={`input-char-counter ${regUsername.length === 10 ? 'limit' : regUsername.length >= 3 ? 'valid' : ''}`}>
            {regUsername.length}/10
          </span>
        </div>
        {formErrors.regUsername && (
          <span className="input-error-msg">
            <IconAlertCircle /> {formErrors.regUsername}
          </span>
        )}
      </div>

      {/* Contraseña (Mínimo 8 caracteres) */}
      <div className="form-group">
        <label className="form-label" htmlFor="reg-password">
          Contraseña (mínimo 8 caracteres)
        </label>
        <div className="input-container">
          <span className="input-icon-left">
            <IconLock />
          </span>
          <input
            id="reg-password"
            type={showRegPassword ? 'text' : 'password'}
            className={`auth-input has-right-btn ${formErrors.regPassword ? 'input-error' : ''}`}
            placeholder="Mínimo 8 caracteres"
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

        {/* Indicador visual de longitud/seguridad */}
        {regPassword && (
          <>
            <div className="password-strength-bar">
              <div className={`strength-segment ${passwordStrength.level >= 1 ? passwordStrength.class : ''}`} />
              <div className={`strength-segment ${passwordStrength.level >= 2 ? passwordStrength.class : ''}`} />
              <div className={`strength-segment ${passwordStrength.level >= 3 ? passwordStrength.class : ''}`} />
            </div>
            <div className="strength-label">
              Seguridad: <strong>{passwordStrength.label}</strong>
            </div>
          </>
        )}

        {formErrors.regPassword && (
          <span className="input-error-msg">
            <IconAlertCircle /> {formErrors.regPassword}
          </span>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div className="form-group">
        <label className="form-label" htmlFor="reg-confirm-password">
          Confirmar contraseña
        </label>
        <div className="input-container">
          <span className="input-icon-left">
            <IconLock />
          </span>
          <input
            id="reg-confirm-password"
            type={showRegPassword ? 'text' : 'password'}
            className={`auth-input ${formErrors.regConfirmPassword ? 'input-error' : ''}`}
            placeholder="Repite tu contraseña de 8+ caracteres"
            value={regConfirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {formErrors.regConfirmPassword && (
          <span className="input-error-msg">
            <IconAlertCircle /> {formErrors.regConfirmPassword}
          </span>
        )}
      </div>

      {/* Botón de Registro */}
      <button
        type="submit"
        className="btn-auth-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner"></span>
            <span>Creando usuario...</span>
          </>
        ) : (
          <>
            <span>Crear mi usuario</span>
            <IconArrowRight />
          </>
        )}
      </button>
    </form>
  )
}

export default RegisterForm
