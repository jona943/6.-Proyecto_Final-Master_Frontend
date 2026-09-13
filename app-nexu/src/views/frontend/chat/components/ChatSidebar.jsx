import React, { memo } from 'react'
import './ChatSidebar.css'

import ChatSidebarHeader from './sidebar/ChatSidebarHeader'
import ChatSidebarSearch from './sidebar/ChatSidebarSearch'
import ChatSidebarFeed from './sidebar/ChatSidebarFeed'

const ChatSidebar = ({
  mobileView,
  currentUser,
  chatsCount,
  unreadChatsCount = 0,
  favoritesCount = 0,
  filteredChats,
  searchQuery,
  activeFilter,
  activeChatId,
  incomingRequests,
  outgoingRequests,
  onCancelRequest,
  onSearchChange,
  onFilterChange,
  onSelectChat,
  onOpenConnectModal,
  onOpenSettings,
  onCopyInviteLink,
  onAcceptRequest,
  onRejectRequest,
  onBlockUser,
  onToggleFavorite,
  onToggleRead,
  onClearMessages,
  onDeleteContact
}) => {
  return (
    <aside className={`chat-sidebar ${mobileView === 'chat' ? 'hidden-mobile' : ''}`}>
      {/* 1. Cabecera y Perfil */}
      <ChatSidebarHeader 
        currentUser={currentUser}
        onOpenConnectModal={onOpenConnectModal}
        onOpenSettings={onOpenSettings}
      />

      {/* 2. Buscador y Filtros */}
      <ChatSidebarSearch 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        chatsCount={chatsCount}
        unreadChatsCount={unreadChatsCount}
        favoritesCount={favoritesCount}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        incomingRequestsCount={(incomingRequests?.length || 0) + (outgoingRequests?.length || 0)}
      />

      {/* 3. Lista de Conversaciones o Estado Vacío */}
      <ChatSidebarFeed 
        activeFilter={activeFilter}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        onCancelRequest={onCancelRequest}
        chatsCount={chatsCount}
        filteredChats={filteredChats}
        activeChatId={activeChatId}
        onAcceptRequest={onAcceptRequest}
        onRejectRequest={onRejectRequest}
        onBlockUser={onBlockUser}
        onOpenConnectModal={onOpenConnectModal}
        onCopyInviteLink={onCopyInviteLink}
        onSelectChat={onSelectChat}
        onToggleFavorite={onToggleFavorite}
        onToggleRead={onToggleRead}
        onClearMessages={onClearMessages}
        onDeleteContact={onDeleteContact}
      />
    </aside>
  )
}

export default memo(ChatSidebar)
