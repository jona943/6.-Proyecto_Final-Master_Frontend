import { IconVolume2, IconVolumeX } from '../../../../components/icons/Icons'
import './SoundPermissionPrompt.css'

function SoundPermissionPrompt({ onEnable, onMute }) {
  return (
    <div className="sound-permission-banner" role="alert">
      <div className="sound-permission-header">
        <div className="sound-icon-box">
          <IconVolume2 size={20} />
        </div>
        <div className="sound-permission-content">
          <h4 className="sound-permission-title">Sonidos de Notificación</h4>
          <p className="sound-permission-desc">
            ¿Deseas activar una sutil campanilla de audio cada vez que recibas un mensaje nuevo?
          </p>
        </div>
      </div>
      <div className="sound-permission-actions">
        <button
          type="button"
          className="btn-sound-mute"
          onClick={onMute}
        >
          Silenciar
        </button>
        <button
          type="button"
          className="btn-sound-enable"
          onClick={onEnable}
        >
          <IconVolume2 size={15} />
          Activar sonidos
        </button>
      </div>
    </div>
  )
}

export default SoundPermissionPrompt
