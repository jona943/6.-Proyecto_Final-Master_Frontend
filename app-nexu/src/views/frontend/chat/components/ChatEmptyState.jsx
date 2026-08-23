import { IconShield, IconArrowLeft } from './ChatIcons'

function ChatEmptyState({ mobileView, onBackToList }) {
  return (
    <div className={`chat-empty-state ${mobileView === 'list' ? 'hidden-mobile' : ''}`}>
      <div className="empty-state-badge">
        <IconShield />
      </div>
      <h3>Nexu · Mensajería Privada</h3>
      <p>Tus conversaciones son punto a punto y anónimas hasta que ambas partes deciden conectar.</p>
      <button
        type="button"
        className="btn-empty-back-mobile"
        onClick={onBackToList}
      >
        <IconArrowLeft />
        <span>Volver a conversaciones</span>
      </button>
    </div>
  )
}

export default ChatEmptyState
