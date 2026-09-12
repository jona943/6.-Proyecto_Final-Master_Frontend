import { useState } from 'react'
import {
  IconShield,
  IconArrowRight,
  IconAlertCircle,
  IconKey
} from '../../../../components/icons/Icons'

function TwoFactorLoginForm({
  username,
  isLoading,
  onSubmit2FA,
  onCancel
}) {
  const [code, setCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [localError, setLocalError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const clean = code.trim()

    if (!clean) {
      setLocalError(useBackupCode ? 'Ingresa el código de respaldo' : 'Ingresa el código de 6 dígitos')
      return
    }

    if (!useBackupCode && clean.length !== 6) {
      setLocalError('El código debe tener exactamente 6 dígitos')
      return
    }

    setLocalError(null)
    onSubmit2FA(clean)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form-header" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(212, 255, 0, 0.1)',
            border: '1px solid rgba(212, 255, 0, 0.3)',
            color: 'var(--accent-acid, #d4ff00)',
            marginBottom: '0.85rem'
          }}
        >
          <IconShield size={28} />
        </div>
        <h2 className="auth-form-title">Autenticación en Dos Pasos</h2>
        <p className="auth-form-desc" style={{ maxWidth: '340px', margin: '0 auto' }}>
          {useBackupCode
            ? 'Ingresa uno de tus códigos de respaldo de emergencia guardados al activar 2FA.'
            : `Hola @${username}. Ingresa el código de 6 dígitos de tu aplicación Authenticator.`}
        </p>
      </div>

      {localError && (
        <div className="auth-alert error" style={{ marginBottom: '1rem' }}>
          <span className="alert-icon">
            <IconAlertCircle />
          </span>
          <span>{localError}</span>
        </div>
      )}

      {/* Input de Código */}
      <div className="form-group">
        <div className="form-label" style={{ justifyContent: 'center' }}>
          <label htmlFor="twofa-code">
            {useBackupCode ? 'Código de Respaldo' : 'Código de 6 Dígitos (TOTP)'}
          </label>
        </div>

        {useBackupCode ? (
          <div className="input-container">
            <span className="input-icon-left">
              <IconKey />
            </span>
            <input
              id="twofa-code"
              type="text"
              autoFocus
              className="auth-input"
              placeholder="NEXU-XXXX-XXXX"
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setLocalError(null)
              }}
              autoComplete="one-time-code"
              style={{ textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <input
              id="twofa-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              className="auth-input"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, '')
                setCode(numericOnly)
                setLocalError(null)
              }}
              autoComplete="one-time-code"
              style={{
                maxWidth: '220px',
                textAlign: 'center',
                fontSize: '1.8rem',
                fontWeight: 700,
                letterSpacing: '8px',
                padding: '0.75rem'
              }}
            />
          </div>
        )}
      </div>

      {/* Alternar modo TOTP vs Código de respaldo */}
      <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
        <button
          type="button"
          className="label-link"
          style={{ fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => {
            setUseBackupCode(!useBackupCode)
            setCode('')
            setLocalError(null)
          }}
        >
          {useBackupCode
            ? '← Usar código dinámico de la app Authenticator'
            : '¿Perdiste tu teléfono? Usar código de respaldo'}
        </button>
      </div>

      {/* Botón de Envío */}
      <button
        type="submit"
        className="btn-auth-submit"
        disabled={isLoading || (!useBackupCode && code.length !== 6)}
      >
        {isLoading ? (
          <span className="btn-loading-content">
            <span className="btn-spinner"></span>
            Verificando...
          </span>
        ) : (
          <>
            <span>Verificar y Entrar</span>
            <IconArrowRight />
          </>
        )}
      </button>

      {/* Botón Cancelar */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted, #94a3b8)',
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          ← Cancelar y volver al inicio de sesión
        </button>
      </div>
    </form>
  )
}

export default TwoFactorLoginForm
