const fs = require('fs');

// 1. Update ActiveChatPanel.css to support newlines
let css = fs.readFileSync('app-nexu/src/views/frontend/chat/components/ActiveChatPanel.css', 'utf8');
css = css.replace(
  "word-break: break-word;",
  "word-break: break-word;\n  white-space: pre-wrap;"
);
fs.writeFileSync('app-nexu/src/views/frontend/chat/components/ActiveChatPanel.css', css);

// 2. Update ActiveChatFeed.jsx to support **bold** Markdown
let jsx = fs.readFileSync('app-nexu/src/views/frontend/chat/components/ActiveChatFeed.jsx', 'utf8');

const newRenderFn = `  const renderHighlightedText = (text, query) => {
    if (typeof text !== 'string') return text

    // Helper to process search highlights within any text segment
    const processSearch = (segment, keyPrefix = '') => {
      if (!query || !query.trim()) return segment
      const cleanQuery = query.trim()
      const searchRegex = new RegExp(\`(\${cleanQuery.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&')})\`, 'gi')
      const parts = segment.split(searchRegex)

      return parts.map((part, i) =>
        searchRegex.test(part) ? (
          <mark key={\`\${keyPrefix}-mark-\${i}\`} className="chat-search-match">
            {part}
          </mark>
        ) : (
          part
        )
      )
    }

    // Process Markdown Bold (**text**) first
    const boldRegex = /\\*\\*(.*?)\\*\\*/g
    const elements = []
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(processSearch(text.substring(lastIndex, match.index), \`text-\${match.index}\`))
      }
      elements.push(
        <strong key={\`bold-\${match.index}\`}>
          {processSearch(match[1], \`bold-inner-\${match.index}\`)}
        </strong>
      )
      lastIndex = boldRegex.lastIndex
    }

    if (lastIndex < text.length) {
      elements.push(processSearch(text.substring(lastIndex), \`text-last\`))
    }

    return elements.length > 0 ? elements : text
  }`;

jsx = jsx.replace(
  /const renderHighlightedText = \(text, query\) => \{[\s\S]*?return parts\.map\(\(part, index\) =>[\s\S]*?\)\n  \}/,
  newRenderFn
);

fs.writeFileSync('app-nexu/src/views/frontend/chat/components/ActiveChatFeed.jsx', jsx);
console.log('Format patched');
