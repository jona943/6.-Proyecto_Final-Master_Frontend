import { useState, useEffect } from 'react'
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconArrowRight,
  IconAlertCircle,
  IconCheck,
  IconCheckCircle,
  IconInfo,
  IconAtSign
} from '../../../../components/icons/Icons'
import { authService } from '../../../../services/authService'

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
  // Sugerencias de alias disponibles
  const [suggestions, setSuggestions] = useState(() => authService.getAliasSuggestions(4))

  // Estado de disponibilidad en vivo
  const [availability, setAvailability] = useState({
    state: 'idle',
    reason: ''
  })

  // Refrescar sugerencias de alias
  const refreshSuggestions = () => {
    setSuggestions(authService.getAliasSuggestions(4))
  }

  // Comprobación de disponibilidad en tiempo real con debounce
  useEffect(() => {
    if (!regUsername) {
      setAvailability({ state: 'idle', reason: '' })
      return
    }

    let isMounted = true
    const timer = setTimeout(async () => {
      const res = await authService.checkUsernameAvailability(regUsername)
      if (isMounted) {
        setAvailability({
          state: res.state,
          reason: res.reason
        })
      }
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [regUsername])

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Crea tu usuario único</h2>
        <p className="auth-form-desc">
          Sin correos ni números de teléfono. Tu alias es tu identidad soberana e irrepetible.
        </p>
      </div>

      {/* 1. CAMPO: USUARIO ÚNICO */}
      <div className="form-group">
        <div className="form-label">
          <label htmlFor="reg-username">Usuario único (Alias)</label>
          <span className="input-hint">3 a 10 caracteres alfanuméricos</span>
        </div>

        <div className="input-container">
          <span className="input-prefix-at">@</span>
          <input
            id="reg-username"
            type="text"
            className={`auth-input has-right-btn ${
              formErrors.regUsername || availability.state === 'error'
                ? 'input-error'
                : availability.state === 'valid'
                ? 'input-valid'
                : ''
            }`}
            placeholder="ej. neo_dev"
            value={regUsername}
            onChange={(e) => onUsernameChange(e.target.value)}
            maxLength={10}
            autoComplete="username"
            spellCheck="false"
          />
          <span
            className={`input-char-counter ${
              regUsername.length === 10
                ? 'limit'
                : regUsername.length >= 3
                ? 'valid'
                : ''
            }`}
          >
            {regUsername.length}/10
          </span>
        </div>

        {/* Indicador de Disponibilidad en Tiempo Real */}
        {availability.state !== 'idle' && (
          <div className={`alias-status-indicator status-${availability.state}`}>
            <span className="status-dot">
              {availability.state === 'valid' && <IconCheck size={12} />}
              {availability.state === 'error' && <IconAlertCircle size={12} />}
              {availability.state === 'warning' && <IconInfo size={12} />}
            </span>
            <span>{availability.reason}</span>
          </div>
        )}

        {formErrors.regUsername && (
          <span className="input-error-msg">
            <IconAlertCircle /> {formErrors.regUsername}
          </span>
        )}

        {/* Sugerencias Rápidas de Alias Únicos Disponibles */}
        <div className="alias-suggestions-wrapper">
          <div className="alias-suggestions-header">
            <span className="suggestions-title">
              <IconAtSign size={13} /> Sugerencias disponibles para ti:
            </span>
            <button
              type="button"
              className="btn-refresh-suggestions"
              onClick={refreshSuggestions}
              title="Generar otras sugerencias de alias"
            >
              🔄 Otras
            </button>
          </div>

          <div className="alias-chips-container">
            {suggestions.map((alias) => (
              <button
                key={alias}
                type="button"
                className={`alias-chip-btn ${regUsername.toLowerCase() === alias.toLowerCase() ? 'active' : ''}`}
                onClick={() => onUsernameChange(alias)}
                title={`Usar @${alias}`}
              >
                @{alias}
              </button>
            ))}
          </div>
        </div>

        {/* Caja de Recomendaciones para Crear Usuario */}
        <div className="alias-recommendations-box">
          <div className="recommendations-header">
            <IconInfo size={14} />
            <span>Recomendaciones para tu usuario único:</span>
          </div>
          <ul className="recommendations-list">
            <li>
              <span className="rec-bullet">•</span>
              <span><strong>Unicidad absoluta:</strong> No se repiten usuarios. Tu alias es tu dirección irrepetible para que otros puedan buscarte sin confusiones.</span>
            </li>
            <li>
              <span className="rec-bullet">•</span>
              <span><strong>Longitud:</strong> Debe tener entre <strong>3 y 10 caracteres</strong>.</span>
            </li>
            <li>
              <span className="rec-bullet">•</span>
              <span><strong>Caracteres permitidos:</strong> Letras (a-z), números (0-9) y guión bajo (_). Sin espacios ni símbolos extraños.</span>
            </li>
            <li>
              <span className="rec-bullet">•</span>
              <span><strong>Privacidad:</strong> No uses nombres reales ni teléfonos; elige un alias distintivo.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. CAMPO: CONTRASEÑA */}
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

      {/* 3. CAMPO: CONFIRMAR CONTRASEÑA */}
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

      {/* 4. BOTÓN DE REGISTRO */}
      <button
        type="submit"
        className="btn-auth-submit"
        disabled={isLoading || availability.state === 'error'}
      >
        {isLoading ? (
          <>
            <span className="btn-spinner"></span>
            <span>Creando usuario...</span>
          </>
        ) : (
          <>
            <span>Crear mi usuario único</span>
            <IconArrowRight />
          </>
        )}
      </button>
    </form>
  )
}

export default RegisterForm
