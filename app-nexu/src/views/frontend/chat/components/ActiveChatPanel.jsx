import { useState, useRef, useEffect } from 'react'
import './ActiveChatPanel.css'
import ActiveChatHeader from './ActiveChatHeader'
import ActiveChatFeed from './ActiveChatFeed'
import ActiveChatFooter from './ActiveChatFooter'

function ActiveChatPanel({
  activeChat,
  mobileView,
  isTyping,
  showDetailsPanel,
  inputText,
  onInputTextChange,
  onSendMessage,
  onBackToList,
  onToggleDetails,
  onCopyMessage,
  onInsertCodeSnippet,
  onTriggerToast,
  onCancelRequest,
  onSendConnectionRequest,
  onAcceptRequest,
  onRejectRequest,
  soundEnabled,
  onToggleSound,
  messagesEndRef
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  // Enfocar input automáticamente al abrir el buscador interno
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80)
    }
  }, [isSearchOpen])

  // Limpiar búsqueda si cambia el chat activo
  useEffect(() => {
    setSearchQuery('')
  }, [activeChat?.id])

  if (!activeChat) return null

  // Calcular número de coincidencias en la conversación activa
  const matchCount = searchQuery.trim() && Array.isArray(activeChat.messages)
    ? activeChat.messages.filter((m) =>
        m.text?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ).length
    : 0

  return (
    <main className={`chat-main-panel ${mobileView === 'list' ? 'hidden-mobile' : ''}`}>
      <ActiveChatHeader 
        activeChat={activeChat}
        isTyping={isTyping}
        showDetailsPanel={showDetailsPanel}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        matchCount={matchCount}
        searchInputRef={searchInputRef}
        onBackToList={onBackToList}
        onToggleDetails={onToggleDetails}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />

      <ActiveChatFeed 
        activeChat={activeChat}
        searchQuery={searchQuery}
        matchCount={matchCount}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        onCopyMessage={onCopyMessage}
      />

      <ActiveChatFooter 
        activeChat={activeChat}
        inputText={inputText}
        onInputTextChange={onInputTextChange}
        onSendMessage={onSendMessage}
        onTriggerToast={onTriggerToast}
        onInsertCodeSnippet={onInsertCodeSnippet}
        onCancelRequest={onCancelRequest}
        onSendConnectionRequest={onSendConnectionRequest}
        onAcceptRequest={onAcceptRequest}
        onRejectRequest={onRejectRequest}
      />
    </main>
  )
}

export default ActiveChatPanel
