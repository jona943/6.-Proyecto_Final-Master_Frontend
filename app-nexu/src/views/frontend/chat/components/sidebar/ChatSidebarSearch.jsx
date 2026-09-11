import React, { memo } from 'react'
import { IconSearch } from '../../../../../components/icons/Icons'

const ChatSidebarSearch = ({
  searchQuery,
  onSearchChange,
  chatsCount,
  unreadChatsCount = 0,
  activeFilter,
  onFilterChange,
  incomingRequestsCount = 0
}) => {
  return (
    <div className="chat-search-bar-box">
      <div className="search-input-wrapper">
        <IconSearch />
        <input
          type="text"
          placeholder="Buscar contactos..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="filter-pills">
        <button
          className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          Todos ({chatsCount})
        </button>
        <button
          className={`filter-pill-btn ${activeFilter === 'favorites' ? 'active' : ''}`}
          onClick={() => onFilterChange('favorites')}
        >
          Favoritos
        </button>
        <button
          className={`filter-pill-btn ${activeFilter === 'unread' ? 'active' : ''}`}
          onClick={() => onFilterChange('unread')}
          style={unreadChatsCount > 0 ? { color: 'var(--accent-acid)', fontWeight: 700 } : {}}
        >
          No leídos {unreadChatsCount > 0 && `(${unreadChatsCount})`}
        </button>
        <button
          className={`filter-pill-btn ${activeFilter === 'requests' ? 'active' : ''}`}
          onClick={() => onFilterChange('requests')}
          style={incomingRequestsCount > 0 ? { color: 'var(--accent-acid)' } : {}}
        >
          Solicitudes {incomingRequestsCount > 0 && `(${incomingRequestsCount})`}
        </button>
      </div>
    </div>
  )
}

export default memo(ChatSidebarSearch)
