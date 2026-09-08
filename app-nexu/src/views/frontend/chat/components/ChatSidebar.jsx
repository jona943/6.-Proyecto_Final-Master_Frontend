import React, { memo } from 'react'
import './ChatSidebar.css'

import ChatSidebarHeader from './sidebar/ChatSidebarHeader'
import ChatSidebarSearch from './sidebar/ChatSidebarSearch'
import ChatSidebarFeed from './sidebar/ChatSidebarFeed'

const ChatSidebar = ({
  mobileView,
  currentUser,
  chatsCount,
  filteredChats,
  searchQuery,
  activeFilter,
  activeChatId,
  presenceStatus,
  incomingRequests,
  onSearchChange,
  onFilterChange,
  onSelectChat,
  onOpenConnectModal,
  onOpenSettings,
  onCopyInviteLink,
  onAcceptRequest,
  onRejectRequest,
  onBlockUser,
  onToggleDetailsPanel,
  showDetailsPanel
}) => {

  return (
    <aside className={`chat-sidebar ${mobileView === 'chat' ? 'hidden-mobile' : ''}`}>
      {/* 1. Cabecera y Perfil */}
      <ChatSidebarHeader 
        currentUser={currentUser}
        presenceStatus={presenceStatus}
        onOpenConnectModal={onOpenConnectModal}
        onOpenSettings={onOpenSettings}
        onToggleDetailsPanel={onToggleDetailsPanel}
        showDetailsPanel={showDetailsPanel}
      />

      {/* 2. Buscador y Filtros */}
      <ChatSidebarSearch 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        chatsCount={chatsCount}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      {/* 3. Lista de Conversaciones o Estado Vacío */}
      <ChatSidebarFeed 
        incomingRequests={incomingRequests}
        chatsCount={chatsCount}
        filteredChats={filteredChats}
        activeChatId={activeChatId}
        onAcceptRequest={onAcceptRequest}
        onRejectRequest={onRejectRequest}
        onBlockUser={onBlockUser}
        onOpenConnectModal={onOpenConnectModal}
        onCopyInviteLink={onCopyInviteLink}
        onSelectChat={onSelectChat}
      />
    </aside>
  )
}

export default memo(ChatSidebar)
