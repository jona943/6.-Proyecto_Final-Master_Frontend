import { useState, useEffect } from 'react'
import {
  IconLock,
  IconArrowRight,
  IconAlertCircle
} from '../../../../components/icons/Icons'
import { authService } from '../../../../services/authService'

import AliasInputField from './AliasInputField'
import PasswordInputField from './PasswordInputField'

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
  const [suggestions, setSuggestions] = useState(() => authService.getAliasSuggestions(4))
  const [availability, setAvailability] = useState({ state: 'idle', reason: '' })
  const [showAliasInfo, setShowAliasInfo] = useState(false)
  const [showPasswordInfo, setShowPasswordInfo] = useState(false)

  const refreshSuggestions = () => {
    setSuggestions(authService.getAliasSuggestions(4))
  }

  useEffect(() => {
    if (!regUsername || regUsername.trim().length === 0) {
      setAvailability({ state: 'idle', reason: '' })
      return
    }

    const timer = setTimeout(() => {
      const check = authService.checkAliasAvailability(regUsername)
      setAvailability(check)
    }, 180)

    return () => clearTimeout(timer)
  }, [regUsername])

  return (
    <form className="auth-form" onSubmit={onSubmit} noValidate>
      <div className="auth-form-header">
        <h2 className="auth-form-title">Crea tu usuario único</h2>
        <p className="auth-form-desc">
          Sin correos ni números de teléfono. Tu alias es inmutable y siempre estará en minúsculas para proteger tu identidad.
        </p>
      </div>

      <AliasInputField
        regUsername={regUsername}
        onUsernameChange={onUsernameChange}
        formErrors={formErrors}
        availability={availability}
        showAliasInfo={showAliasInfo}
        setShowAliasInfo={setShowAliasInfo}
        suggestions={suggestions}
        refreshSuggestions={refreshSuggestions}
      />

      <PasswordInputField
        regPassword={regPassword}
        onPasswordChange={onPasswordChange}
        showRegPassword={showRegPassword}
        onToggleShowPassword={onToggleShowPassword}
        showPasswordInfo={showPasswordInfo}
        setShowPasswordInfo={setShowPasswordInfo}
        passwordStrength={passwordStrength}
        formErrors={formErrors}
      />

      {/* CAMPO: CONFIRMAR CONTRASEÑA */}
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
