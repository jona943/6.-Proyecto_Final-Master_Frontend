const fs = require('fs');

// 1. Update ChatHome.jsx
let chatHome = fs.readFileSync('app-nexu/src/views/frontend/chat/ChatHome.jsx', 'utf8');
chatHome = chatHome.replace(
  "if (activeFilter === 'online') return chat.status === 'online'",
  "if (activeFilter === 'favorites') return chat.isFavorite === true;\n      if (activeFilter === 'requests') return false;"
);
fs.writeFileSync('app-nexu/src/views/frontend/chat/ChatHome.jsx', chatHome);


// 2. Update ChatSidebarSearch.jsx
let searchContent = `import React, { memo } from 'react'
import { IconSearch } from '../../../../../components/icons/Icons'

const ChatSidebarSearch = ({
  searchQuery,
  onSearchChange,
  chatsCount,
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

      <div className="filter-pills" style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
        <button
          className={\`filter-pill-btn \${activeFilter === 'all' ? 'active' : ''}\`}
          onClick={() => onFilterChange('all')}
        >
          Todos ({chatsCount})
        </button>
        <button
          className={\`filter-pill-btn \${activeFilter === 'favorites' ? 'active' : ''}\`}
          onClick={() => onFilterChange('favorites')}
        >
          Favoritos
        </button>
        <button
          className={\`filter-pill-btn \${activeFilter === 'unread' ? 'active' : ''}\`}
          onClick={() => onFilterChange('unread')}
        >
          No leídos
        </button>
        <button
          className={\`filter-pill-btn \${activeFilter === 'requests' ? 'active' : ''}\`}
          onClick={() => onFilterChange('requests')}
          style={incomingRequestsCount > 0 ? { color: 'var(--accent-acid)' } : {}}
        >
          Solicitudes {incomingRequestsCount > 0 && \`(\${incomingRequestsCount})\`}
        </button>
      </div>
    </div>
  )
}

export default memo(ChatSidebarSearch)
`;
fs.writeFileSync('app-nexu/src/views/frontend/chat/components/sidebar/ChatSidebarSearch.jsx', searchContent);


// 3. Update ChatSidebar.jsx
let sidebar = fs.readFileSync('app-nexu/src/views/frontend/chat/components/ChatSidebar.jsx', 'utf8');
sidebar = sidebar.replace(
  /onFilterChange={onFilterChange}\s*\/>/,
  "onFilterChange={onFilterChange}\n        incomingRequestsCount={incomingRequests?.length || 0}\n      />"
);
sidebar = sidebar.replace(
  /<ChatSidebarFeed\s+chatsCount={chatsCount}/,
  "<ChatSidebarFeed\n        activeFilter={activeFilter}\n        chatsCount={chatsCount}"
);
fs.writeFileSync('app-nexu/src/views/frontend/chat/components/ChatSidebar.jsx', sidebar);


// 4. Update ChatSidebarFeed.jsx
let feed = fs.readFileSync('app-nexu/src/views/frontend/chat/components/sidebar/ChatSidebarFeed.jsx', 'utf8');
// Add activeFilter to props
feed = feed.replace(
  "onSelectChat\n}) => {",
  "onSelectChat,\n  activeFilter\n}) => {"
);
feed = feed.replace(
  "incomingRequests,",
  "incomingRequests = [],"
);

// Update incoming requests render
feed = feed.replace(
  "{incomingRequests.length > 0 && (",
  "{activeFilter === 'requests' && incomingRequests.length > 0 && ("
);
// Handle empty requests state
feed = feed.replace(
  "</div>\n      )}",
  `</div>\n      )}\n      {activeFilter === 'requests' && incomingRequests.length === 0 && (\n        <div className="sidebar-empty-state">\n          <div>\n            <h4 className="sidebar-empty-title">Sin solicitudes</h4>\n            <p className="sidebar-empty-desc">No tienes solicitudes de conexión pendientes.</p>\n          </div>\n        </div>\n      )}`
);

// Update chatsCount === 0 logic
feed = feed.replace(
  "{chatsCount === 0 ? (",
  "{chatsCount === 0 && activeFilter !== 'requests' ? ("
);

// Update filteredChats === 0 logic
feed = feed.replace(
  ") : filteredChats.length === 0 ? (",
  ") : activeFilter === 'requests' ? null : filteredChats.length === 0 ? ("
);

fs.writeFileSync('app-nexu/src/views/frontend/chat/components/sidebar/ChatSidebarFeed.jsx', feed);
console.log('Patched correctly');
