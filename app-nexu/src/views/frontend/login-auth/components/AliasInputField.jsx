import { IconInfo, IconX, IconCheck, IconAlertCircle, IconAtSign, IconRefresh } from '../../../../components/icons/Icons'

function AliasInputField({
  regUsername,
  onUsernameChange,
  formErrors,
  availability,
  showAliasInfo,
  setShowAliasInfo,
  suggestions,
  refreshSuggestions
}) {
  return (
    <div className="form-group">
      <div className="form-label">
        <div className="label-with-info">
          <label htmlFor="reg-username">Alias Único NexuHub</label>
          <button
            type="button"
            className="btn-info-icon"
            onClick={() => setShowAliasInfo(!showAliasInfo)}
            title="¿Por qué necesitas un Alias Único?"
            aria-label="Ver ayuda sobre Alias Único"
          >
            <IconInfo size={14} />
          </button>
        </div>
        <span className="input-hint">3 - 10 caracteres</span>
      </div>

      {showAliasInfo && (
        <div className="info-popover-box">
          <div className="popover-header">
            <IconInfo size={14} />
            <span>Criterios de usuario único</span>
            <button
              type="button"
              className="popover-close-btn"
              onClick={() => setShowAliasInfo(false)}
              aria-label="Cerrar"
            >
              <IconX size={12} />
            </button>
          </div>
          <ul className="popover-list">
            <li>• <strong>Unicidad:</strong> Tu alias es irrepetible en la red NexuHub.</li>
            <li>• <strong>Longitud:</strong> Entre 3 y 10 caracteres.</li>
            <li>• <strong>Caracteres:</strong> Letras (a-z), números (0-9) y guión bajo (_).</li>
            <li>• <strong>Privacidad:</strong> Evita teléfonos o datos personales.</li>
          </ul>
        </div>
      )}

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

      <div className="alias-suggestions-wrapper">
        <div className="alias-suggestions-header">
          <span className="suggestions-title">
            <IconAtSign size={12} /> Sugerencias:
          </span>
          <button
            type="button"
            className="btn-refresh-suggestions"
            onClick={refreshSuggestions}
            title="Generar otras sugerencias de alias"
          >
            <IconRefresh size={12} /> Otras
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
    </div>
  )
}

export default AliasInputField
