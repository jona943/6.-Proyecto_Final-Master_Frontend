import React, { memo, useState } from 'react'
import RequestsSection from './requests/RequestsSection'
import ConversationItem from './feed/ConversationItem'
import EmptyFeed from './feed/EmptyFeed'
import ChatContextMenu from './feed/ChatContextMenu'

const ChatSidebarFeed = ({
  incomingRequests = [],
  outgoingRequests = [],
  onCancelRequest,
  chatsCount,
  filteredChats,
  activeChatId,
  onAcceptRequest,
  onRejectRequest,
  onBlockUser,
  onOpenConnectModal,
  onCopyInviteLink,
  onSelectChat,
  onToggleFavorite,
  onToggleRead,
  onClearMessages,
  onDeleteContact,
  activeFilter
}) => {
  const [contextMenu, setContextMenu] = useState(null)

  const handleContextMenu = (e, chat) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      chat
    })
  }

  return (
    <div className="conversations-feed">
      {/* 1. Vista de Solicitudes (Entrantes y Salientes) */}
      {activeFilter === 'requests' && (
        <RequestsSection
          incomingRequests={incomingRequests}
          outgoingRequests={outgoingRequests}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          onBlockUser={onBlockUser}
          onCancelRequest={onCancelRequest}
        />
      )}

      {/* 2. Vista de Chats: Estado Vacío cuando no hay chats */}
      {chatsCount === 0 && activeFilter !== 'requests' && (
        <EmptyFeed
          onOpenConnectModal={onOpenConnectModal}
          onCopyInviteLink={onCopyInviteLink}
        />
      )}

      {/* 3. Vista de Chats: Búsqueda sin resultados */}
      {chatsCount > 0 && activeFilter !== 'requests' && filteredChats.length === 0 && (
        <div className="empty-search-msg">
          <p>No se encontraron resultados</p>
        </div>
      )}

      {/* 4. Vista de Chats: Lista de Conversaciones Filtradas */}
      {activeFilter !== 'requests' && filteredChats.length > 0 && (
        filteredChats.map((chat) => (
          <ConversationItem
            key={chat.id}
            chat={chat}
            isSelected={chat.id === activeChatId}
            onSelectChat={onSelectChat}
            onContextMenu={handleContextMenu}
          />
        ))
      )}

      {/* 5. Menú Contextual Flotante (Clic Derecho) */}
      {contextMenu && (
        <ChatContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          chat={contextMenu.chat}
          onClose={() => setContextMenu(null)}
          onToggleFavorite={onToggleFavorite}
          onToggleRead={onToggleRead}
          onClearMessages={onClearMessages}
          onDeleteContact={onDeleteContact}
        />
      )}
    </div>
  )
}

export default memo(ChatSidebarFeed)
