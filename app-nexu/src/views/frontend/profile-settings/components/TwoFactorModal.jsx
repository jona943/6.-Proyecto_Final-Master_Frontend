import { useState, useEffect } from 'react'
import { authService } from '../../../../services/authService'
import {
  IconCheckCircle,
  IconAlertCircle,
  IconCopy,
  IconX,
  IconShield
} from '../../../../components/icons/Icons'

function TwoFactorModal({ isOpen, onClose, username, isEnabled, onStatusChange, showToast }) {
  // Modo: 'setup' (para activar) | 'disable' (para desactivar)
  const [step, setStep] = useState(1) // 1: QR/Clave, 2: Verificar PIN, 3: Códigos de respaldo
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Datos de configuración 2FA
  const [setupData, setSetupData] = useState({
    secret: '',
    qrCodeDataUrl: ''
  })
  const [verifyCode, setVerifyCode] = useState('')
  const [backupCodes, setBackupCodes] = useState([])

  // Desactivación
  const [disablePassword, setDisablePassword] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setError(null)
      setVerifyCode('')
      setDisablePassword('')
      return
    }

    if (!isEnabled) {
      // Iniciar configuración al abrir
      setLoading(true)
      setError(null)
      authService
        .setup2FA(username)
        .then((data) => {
          setSetupData({
            secret: data.secret,
            qrCodeDataUrl: data.qrCodeDataUrl
          })
          setStep(1)
        })
        .catch((err) => {
          setError(err.message || 'Error al iniciar configuración 2FA')
        })
        .finally(() => setLoading(false))
    }
  }, [isOpen, isEnabled, username])

  if (!isOpen) return null

  // Copiar secreto manual
  const handleCopySecret = () => {
    navigator.clipboard.writeText(setupData.secret)
    if (showToast) showToast('Clave de seguridad copiada al portapapeles')
  }

  // Copiar códigos de respaldo
  const handleCopyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    if (showToast) showToast('Códigos de respaldo copiados')
  }

  // Confirmar y activar
  const handleVerifySubmit = async (e) => {
    e.preventDefault()
    if (!verifyCode.trim() || verifyCode.trim().length !== 6) {
      setError('Ingresa el código de 6 dígitos.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await authService.enable2FA(username, setupData.secret, verifyCode.trim())
      setBackupCodes(res.backupCodes || [])
      setStep(3)
      if (onStatusChange) onStatusChange(true)
      if (showToast) showToast('¡Autenticación en Dos Pasos activada con éxito!')
    } catch (err) {
      setError(err.message || 'Código incorrecto. Verifica la hora de tu teléfono e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  // Desactivar 2FA
  const handleDisableSubmit = async (e) => {
    e.preventDefault()
    if (!disablePassword.trim()) {
      setError('Ingresa tu contraseña para confirmar.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await authService.disable2FA(username, disablePassword)
      if (onStatusChange) onStatusChange(false)
      if (showToast) showToast('Autenticación en Dos Pasos desactivada.')
      onClose()
    } catch (err) {
      setError(err.message || 'Contraseña incorrecta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-backdrop-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 24, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        className="two-factor-modal-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'linear-gradient(180deg, rgba(20, 27, 45, 0.98) 0%, rgba(12, 17, 30, 0.99) 100%)',
          border: '1px solid rgba(212, 255, 0, 0.25)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 255, 0, 0.1)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--accent-acid, #d4ff00)', display: 'flex' }}>
              <IconShield size={20} />
            </span>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
              {isEnabled ? 'Desactivar Autenticación 2FA' : 'Configurar Autenticación en Dos Pasos (2FA)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex'
            }}
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                marginBottom: '1.2rem',
                padding: '0.75rem 1rem',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#f87171',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <IconAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* CASO: DESACTIVAR 2FA */}
          {isEnabled ? (
            <form onSubmit={handleDisableSubmit}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                Para desactivar la protección de dos factores, ingresa tu contraseña de cuenta. Ten en cuenta que esto reducirá la seguridad de tu sesión.
              </p>

              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', marginBottom: '0.4rem' }}>
                  Contraseña de Nexu
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--text-secondary, #94a3b8)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !disablePassword}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  {loading ? 'Desactivando...' : 'Confirmar Desactivación'}
                </button>
              </div>
            </form>
          ) : (
            /* CASO: ACTIVAR 2FA (WIZARD 3 PASOS) */
            <>
              {/* PASO 1: Escanear QR */}
              {step === 1 && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #94a3b8)', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
                      Escanea este código QR con tu aplicación Authenticator (<strong>Google Authenticator, Aegis, Ente, Bitwarden o 1Password</strong>).
                    </p>

                    {setupData.qrCodeDataUrl ? (
                      <div
                        style={{
                          display: 'inline-block',
                          padding: '0.75rem',
                          background: '#fff',
                          borderRadius: '12px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                          marginBottom: '1rem'
                        }}
                      >
                        <img
                          src={setupData.qrCodeDataUrl}
                          alt="Código QR 2FA"
                          style={{ width: '180px', height: '180px', display: 'block' }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Cargando código QR...</div>
                    )}

                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted, #94a3b8)' }}>
                        ¿No puedes escanear el código? Ingresa la clave manualmente:
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          marginTop: '0.4rem'
                        }}
                      >
                        <code
                          style={{
                            background: 'rgba(0,0,0,0.4)',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            color: 'var(--accent-acid, #d4ff00)',
                            letterSpacing: '1px',
                            fontSize: '0.85rem'
                          }}
                        >
                          {setupData.secret || '...'}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          title="Copiar clave"
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex'
                          }}
                        >
                          <IconCopy size={15} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      style={{
                        padding: '0.65rem 1.4rem',
                        borderRadius: '8px',
                        background: 'var(--accent-acid, #d4ff00)',
                        border: 'none',
                        color: '#000',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.88rem'
                      }}
                    >
                      Siguiente: Verificar código →
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 2: Verificar PIN de 6 dígitos */}
              {step === 2 && (
                <form onSubmit={handleVerifySubmit}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #94a3b8)', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                    Ingresa el código dinámico de 6 dígitos que ahora muestra tu aplicación Authenticator para confirmar la vinculación:
                  </p>

                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      style={{
                        width: '200px',
                        padding: '0.85rem',
                        textAlign: 'center',
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        letterSpacing: '8px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '2px solid var(--accent-acid, #d4ff00)',
                        borderRadius: '10px',
                        color: '#fff',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'var(--text-secondary, #94a3b8)',
                        cursor: 'pointer',
                        fontSize: '0.84rem'
                      }}
                    >
                      ← Volver al código QR
                    </button>

                    <button
                      type="submit"
                      disabled={loading || verifyCode.length !== 6}
                      style={{
                        padding: '0.65rem 1.4rem',
                        borderRadius: '8px',
                        background: 'var(--accent-acid, #d4ff00)',
                        border: 'none',
                        color: '#000',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        opacity: verifyCode.length === 6 ? 1 : 0.6
                      }}
                    >
                      {loading ? 'Verificando...' : 'Confirmar y Activar 2FA'}
                    </button>
                  </div>
                </form>
              )}

              {/* PASO 3: Códigos de Respaldo de Emergencia */}
              {step === 3 && (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                    <div style={{ color: 'var(--accent-acid, #d4ff00)', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                      <IconCheckCircle size={36} />
                    </div>
                    <h4 style={{ margin: '0 0 0.4rem 0', color: '#fff', fontSize: '1.1rem' }}>
                      ¡Autenticación en Dos Pasos Activada!
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary, #94a3b8)', margin: 0, lineHeight: 1.4 }}>
                      Guarda estos 5 códigos de respaldo en un lugar seguro. Si pierdes tu celular, cada código te permitirá acceder una única vez.
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      padding: '1rem',
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      marginBottom: '1.2rem'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {backupCodes.map((c, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.4rem 0.6rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: 'var(--accent-acid, #d4ff00)',
                            textAlign: 'center'
                          }}
                        >
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={handleCopyBackupCodes}
                      style={{
                        padding: '0.65rem 1.1rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <IconCopy size={16} />
                      Copiar Códigos
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        padding: '0.65rem 1.4rem',
                        borderRadius: '8px',
                        background: 'var(--accent-acid, #d4ff00)',
                        border: 'none',
                        color: '#000',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.88rem'
                      }}
                    >
                      Finalizar y Guardar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TwoFactorModal
