import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle,
  IconCheck
} from '../../../../components/icons/Icons'

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

      {/* Contraseña */}
      <div className="form-group">
        <div className="form-label">
          <label htmlFor="reg-password">Contraseña</label>
          <span className="input-hint">Mín. 8 caracteres</span>
        </div>
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

        {/* Requisitos descritos de la contraseña */}
        <div className="password-requirements-box">
          <span className="password-requirements-title">
            Requisitos de la contraseña:
          </span>
          <ul className="password-requirements-list">
            <li className={regPassword.length >= 8 ? 'met' : ''}>
              <span className="req-bullet">{regPassword.length >= 8 ? <IconCheck size={12} /> : '•'}</span>
              <span>Mínimo 8 caracteres</span>
            </li>
            <li className={/[A-Z]/.test(regPassword) ? 'met' : ''}>
              <span className="req-bullet">{/[A-Z]/.test(regPassword) ? <IconCheck size={12} /> : '•'}</span>
              <span>Al menos una mayúscula (A-Z)</span>
            </li>
            <li className={/[a-z]/.test(regPassword) ? 'met' : ''}>
              <span className="req-bullet">{/[a-z]/.test(regPassword) ? <IconCheck size={12} /> : '•'}</span>
              <span>Al menos una minúscula (a-z)</span>
            </li>
            <li className={/[0-9]/.test(regPassword) ? 'met' : ''}>
              <span className="req-bullet">{/[0-9]/.test(regPassword) ? <IconCheck size={12} /> : '•'}</span>
              <span>Al menos un número (0-9)</span>
            </li>
            <li className={/[^a-zA-Z0-9]/.test(regPassword) ? 'met' : ''}>
              <span className="req-bullet">{/[^a-zA-Z0-9]/.test(regPassword) ? <IconCheck size={12} /> : '•'}</span>
              <span>Al menos un símbolo (+, -, *, !, etc.)</span>
            </li>
          </ul>
        </div>

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
            placeholder="Repite tu contraseña"
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
