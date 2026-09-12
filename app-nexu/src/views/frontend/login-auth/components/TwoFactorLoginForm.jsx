import { useState, useRef, useEffect } from 'react'
import {
  IconShield,
  IconArrowRight,
  IconArrowLeft,
  IconAlertCircle,
  IconKey,
  IconSmartphone
} from '../../../../components/icons/Icons'

function TwoFactorLoginForm({
  username,
  isLoading,
  onSubmit2FA,
  onCancel
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [backupCode, setBackupCode] = useState('')
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [isShaking, setIsShaking] = useState(false)

  const inputRefs = useRef([])
  const backupInputRef = useRef(null)

  // Auto-focus al montar o alternar modo
  useEffect(() => {
    if (!useBackupCode) {
      inputRefs.current[0]?.focus()
    } else {
      backupInputRef.current?.focus()
    }
  }, [useBackupCode])

  const triggerError = (msg) => {
    setLocalError(msg)
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 450)
  }

  // Manejador de cambio en cada celda de 1 dígito
  const handleDigitChange = (index, e) => {
    const raw = e.target.value
    const char = raw.slice(-1) // soporte para teclados virtuales móviles

    if (/^[0-9]$/.test(char)) {
      const newDigits = [...digits]
      newDigits[index] = char
      setDigits(newDigits)
      setLocalError(null)

      if (index < 5) {
        inputRefs.current[index + 1]?.focus()
      }

      // Si se completaron los 6 dígitos, auto-enviar para máxima agilidad
      if (newDigits.every((d) => d !== '')) {
        const full = newDigits.join('')
        onSubmit2FA(full)
      }
    } else if (raw === '') {
      const newDigits = [...digits]
      newDigits[index] = ''
      setDigits(newDigits)
    }
  }

  // Navegación con teclado (Backspace, Flechas)
  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault()
        const newDigits = [...digits]
        newDigits[index - 1] = ''
        setDigits(newDigits)
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Soporte de pegado (Paste) de 6 dígitos completos desde Google Authenticator
  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = (e.clipboardData || window.clipboardData)
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)

    if (!pasted) return

    const newDigits = [...digits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || ''
    }
    setDigits(newDigits)
    setLocalError(null)

    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()

    if (pasted.length === 6) {
      onSubmit2FA(pasted)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (useBackupCode) {
      const clean = backupCode.trim()
      if (!clean) {
        triggerError('Ingresa tu código de respaldo de emergencia')
        backupInputRef.current?.focus()
        return
      }
      setLocalError(null)
      onSubmit2FA(clean)
    } else {
      const fullCode = digits.join('')
      if (fullCode.length !== 6) {
        triggerError('Ingresa los 6 dígitos generados por tu aplicación Authenticator')
        const firstEmpty = digits.findIndex((d) => !d)
        if (firstEmpty !== -1) {
          inputRefs.current[firstEmpty]?.focus()
        }
        return
      }
      setLocalError(null)
      onSubmit2FA(fullCode)
    }
  }

  const cleanUser = (username || '').replace(/^@/, '')

  return (
    <form className="auth-form twofa-login-wrapper" onSubmit={handleSubmit} noValidate>
      {/* Badge Superior de Seguridad */}
      <div className="twofa-badge-pill">
        <span className="twofa-pulse-dot"></span>
        <span>PROTECCIÓN 2FA · RFC 6238</span>
      </div>

      {/* Icono de Escudo con Halo Criptográfico */}
      <div className="twofa-icon-glow">
        <IconShield size={32} />
      </div>

      <h2 className="auth-form-title" style={{ marginBottom: '0.2rem' }}>
        Autenticación en Dos Pasos
      </h2>

      {/* Chip de Identidad del Usuario */}
      <div className="twofa-user-chip">
        <div className="twofa-user-avatar-tiny">
          {(cleanUser[0] || 'U').toUpperCase()}
        </div>
        <span className="twofa-user-handle">@{cleanUser}</span>
        <span className="twofa-user-status">Verificación activa</span>
      </div>

      <p
        className="auth-form-desc"
        style={{ maxWidth: '360px', margin: '0 auto 1.15rem', textAlign: 'center' }}
      >
        {useBackupCode
          ? 'Ingresa uno de tus códigos de respaldo de emergencia generados al activar 2FA.'
          : 'Ingresa el código dinámico de 6 dígitos de tu aplicación Authenticator.'}
      </p>

      {/* Alerta de Error Local */}
      {localError && (
        <div className="auth-alert error" style={{ marginBottom: '1.1rem', width: '100%' }}>
          <span className="alert-icon">
            <IconAlertCircle />
          </span>
          <span>{localError}</span>
        </div>
      )}

      {/* Modo TOTP: 6 Celdas PIN Segmentadas */}
      {!useBackupCode ? (
        <div
          className={`twofa-pin-wrapper ${isShaking ? 'twofa-shake' : ''}`}
          onPaste={handlePaste}
        >
          {digits.slice(0, 3).map((val, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={val}
              autoComplete="one-time-code"
              className={`twofa-pin-cell ${val ? 'is-filled' : ''}`}
              onChange={(e) => handleDigitChange(idx, e)}
              onKeyDown={(e) => handleDigitKeyDown(idx, e)}
              onFocus={(e) => e.target.select()}
            />
          ))}

          {/* Separador central (3 y 3) */}
          <div className="twofa-pin-sep"></div>

          {digits.slice(3, 6).map((val, relIdx) => {
            const idx = relIdx + 3
            return (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={val}
                autoComplete="one-time-code"
                className={`twofa-pin-cell ${val ? 'is-filled' : ''}`}
                onChange={(e) => handleDigitChange(idx, e)}
                onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                onFocus={(e) => e.target.select()}
              />
            )
          })}
        </div>
      ) : (
        /* Modo Código de Respaldo de Emergencia */
        <div style={{ width: '100%' }} className={isShaking ? 'twofa-shake' : ''}>
          <div className="input-container">
            <span className="input-icon-left">
              <IconKey />
            </span>
            <input
              ref={backupInputRef}
              type="text"
              className="auth-input"
              placeholder="NEXU-XXXX-XXXX"
              value={backupCode}
              onChange={(e) => {
                setBackupCode(e.target.value.toUpperCase())
                setLocalError(null)
              }}
              autoComplete="off"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textAlign: 'center',
                fontSize: '1.05rem',
                fontWeight: 700
              }}
            />
          </div>

          <div className="twofa-backup-box">
            <IconKey size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              Usa un código de tu lista de respaldo (ej. <code>NEXU-8A4F-29K1</code>). Cada código se consume una sola vez.
            </span>
          </div>
        </div>
      )}

      {/* Botón Alternar: TOTP ↔ Código de Respaldo */}
      <button
        type="button"
        className="twofa-switch-btn"
        onClick={() => {
          setUseBackupCode(!useBackupCode)
          setLocalError(null)
          if (!useBackupCode) {
            setBackupCode('')
          } else {
            setDigits(['', '', '', '', '', ''])
          }
        }}
      >
        {useBackupCode ? (
          <>
            <IconSmartphone size={15} />
            <span>Usar código dinámico Authenticator</span>
          </>
        ) : (
          <>
            <IconKey size={15} />
            <span>¿Perdiste tu teléfono? Usar código de respaldo</span>
          </>
        )}
      </button>

      {/* Botón Principal de Envío */}
      <button
        type="submit"
        className="btn-auth-submit"
        disabled={isLoading || (!useBackupCode && digits.some((d) => !d))}
        style={{ width: '100%', marginTop: '0.2rem' }}
      >
        {isLoading ? (
          <span className="btn-loading-content">
            <span className="btn-spinner"></span>
            <span>Verificando protocolo...</span>
          </span>
        ) : (
          <>
            <span>Verificar y Entrar</span>
            <IconArrowRight />
          </>
        )}
      </button>

      {/* Botón Cancelar y Volver al Login */}
      <div style={{ marginTop: '1.2rem' }}>
        <button type="button" onClick={onCancel} className="twofa-cancel-btn">
          <IconArrowLeft size={15} />
          <span>Cancelar y volver al inicio de sesión</span>
        </button>
      </div>
    </form>
  )
}

export default TwoFactorLoginForm
