import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle,
  IconKey
} from './LoginIcons'

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
  onForgotPasswordClick,
  onLoadDemoUser
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Bienvenido(a) a Nexu</h2>
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
          <label htmlFor="login-password">Contraseña (8+ caracteres)</label>
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
            <span>Entrar a Nexu</span>
            <IconArrowRight />
          </>
        )}
      </button>

      {/* Separador y Acceso Demo Rápido */}
      <div className="auth-divider">CUENTAS DE PRUEBA</div>

      <div className="demo-credentials-box">
        <span className="demo-title">Acceso para Testing</span>
        <p className="demo-text">
          1. <strong>@adminUser</strong> (clave: 12345678)
          <br />
          2. <strong>@rosi_master</strong> (clave: Nexu2026Pass!)
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="demo-chip-btn"
            onClick={() => onLoadDemoUser('adminUser')}
          >
            <IconKey /> Cargar @adminUser
          </button>
          <button
            type="button"
            className="demo-chip-btn"
            onClick={() => onLoadDemoUser('rosi_master')}
          >
            <IconKey /> Cargar @rosi_master
          </button>
        </div>
      </div>
    </form>
  )
}

export default LoginForm
