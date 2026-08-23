import {
  IconAtSign,
  IconArrowRight,
  IconAlertCircle
} from './LoginIcons'

function ForgotPasswordForm({
  forgotUsername,
  onUsernameChange,
  formErrors,
  isLoading,
  onSubmit,
  onBackToLogin
}) {
  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Recuperar acceso</h2>
        <p className="auth-form-desc">
          Ingresa tu usuario único para restablecer tu acceso.
        </p>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="forgot-username">
          Usuario único registrado
        </label>
        <div className="input-container">
          <span className="input-icon-left">
            <IconAtSign />
          </span>
          <input
            id="forgot-username"
            type="text"
            className={`auth-input ${formErrors.forgotUsername ? 'input-error' : ''}`}
            placeholder="ej. rosi_master"
            value={forgotUsername}
            onChange={(e) => onUsernameChange(e.target.value.toLowerCase().replace(/\s+/g, ''))}
          />
        </div>
        {formErrors.forgotUsername && (
          <span className="input-error-msg">
            <IconAlertCircle /> {formErrors.forgotUsername}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="btn-auth-submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner"></span>
            <span>Restableciendo...</span>
          </>
        ) : (
          <>
            <span>Restablecer acceso</span>
            <IconArrowRight />
          </>
        )}
      </button>

      <button
        type="button"
        className="btn-auth-secondary"
        onClick={onBackToLogin}
      >
        Volver a Iniciar Sesión
      </button>
    </form>
  )
}

export default ForgotPasswordForm
