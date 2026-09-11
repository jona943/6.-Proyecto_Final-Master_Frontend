import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle
} from '../../../../components/icons/Icons'

function LoginForm({
  loginUsername,
  onUsernameChange,
  loginPassword,
  onPasswordChange,
  showLoginPassword,
  onToggleShowPassword,
  rememberMe,
  onRememberMeChange,
  formErrors,
  isLoading,
  onSubmit,
  onForgotPasswordClick
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Bienvenido(a) a NexuHub</h2>
        <p className="auth-form-desc">
          Ingresa tu usuario único y contraseña para acceder.
        </p>
      </div>

      {/* Campo Usuario Único */}
      <div className="form-group">
        <div className="form-label">
          <label htmlFor="login-username">Usuario único</label>
          <span className="input-hint">Máx. 10 caracteres</span>
        </div>
        <div className="input-container">
          <span className="input-prefix-at">@</span>
          <input
            id="login-username"
            type="text"
            className={`auth-input has-right-btn ${formErrors.loginUsername ? 'input-error' : ''}`}
            placeholder="TuAlias"
            value={loginUsername}
            onChange={(e) => onUsernameChange(e.target.value)}
            maxLength={10}
            autoComplete="username"
          />
          <span className={`input-char-counter ${loginUsername.length === 10 ? 'limit' : loginUsername.length >= 3 ? 'valid' : ''}`}>
            {loginUsername.length}/10
          </span>
        </div>
        {formErrors.loginUsername && (
          <span className="input-error-msg">
            <IconAlertCircle /> {formErrors.loginUsername}
          </span>
        )}
      </div>

      {/* Campo Contraseña */}
      <div className="form-group">
        <div className="form-label">
          <label htmlFor="login-password">Contraseña</label>
          <button
            type="button"
            className="label-link"
            onClick={onForgotPasswordClick}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <div className="input-container">
          <span className="input-icon-left">
            <IconLock />
          </span>
          <input
            id="login-password"
            type={showLoginPassword ? 'text' : 'password'}
            className={`auth-input has-right-btn ${formErrors.loginPassword ? 'input-error' : ''}`}
            placeholder="Mínimo 8 caracteres"
            value={loginPassword}
            onChange={(e) => onPasswordChange(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="btn-toggle-pw"
            onClick={onToggleShowPassword}
            title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {showLoginPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
        {formErrors.loginPassword && (
          <span className="input-error-msg">
            <IconAlertCircle /> {formErrors.loginPassword}
          </span>
        )}
      </div>

      {/* Opción Recordar sesión */}
      <div className="form-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="checkbox-custom"
            checked={rememberMe}
            onChange={(e) => onRememberMeChange(e.target.checked)}
          />
          <span>Recordar mi sesión</span>
        </label>
      </div>

      {/* Botón de Enviar */}
      <button
        type="submit"
        className="btn-auth-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner"></span>
            <span>Accediendo...</span>
          </>
        ) : (
          <>
            <span>Entrar a NexuHub</span>
            <IconArrowRight />
          </>
        )}
      </button>
    </form>
  )
}

export default LoginForm
