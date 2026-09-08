import React, { memo } from 'react'
import { IconSearch } from '../../../../../components/icons/Icons'

const ChatSidebarSearch = ({
  searchQuery,
  onSearchChange,
  chatsCount,
  activeFilter,
  onFilterChange
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

      {chatsCount > 0 && (
        <div className="filter-pills">
          <button
            className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            Todos ({chatsCount})
          </button>
          <button
            className={`filter-pill-btn ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => onFilterChange('unread')}
          >
            No leídos
          </button>
          <button
            className={`filter-pill-btn ${activeFilter === 'online' ? 'active' : ''}`}
            onClick={() => onFilterChange('online')}
          >
            En línea
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(ChatSidebarSearch)
