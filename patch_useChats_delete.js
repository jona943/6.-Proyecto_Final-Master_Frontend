const fs = require('fs');
let content = fs.readFileSync('app-nexu/src/hooks/useChats.js', 'utf8');

// Replace deleteConversation
let newDelete = `  const deleteConversation = async (chatId) => {
    const targetChat = chats.find(c => c.id === chatId)
    if (!targetChat) return

    if (!targetChat.isBot) {
      await chatService.deleteContact(currentUsername, targetChat.handle.replace('@', ''))
    }

    const updated = chats.filter((c) => c.id !== chatId)
    queryClient.setQueryData(['chats', currentUsername], updated)
    if (targetChat.isBot) saveBotHistory(currentUsername, updated)
    if (selectedChatId === chatId) {
      setSelectedChatId(null)
    }
  }`;
content = content.replace(/  const deleteConversation = \(chatId\) => \{[\s\S]*?setSelectedChatId\(null\)\n    \}\n  \}/, newDelete);

// Replace clearCurrentChat
let newClear = `  const clearCurrentChat = async () => {
    if (!activeChat) return

    if (!activeChat.isBot) {
      await chatService.clearMessages(currentUsername, activeChat.handle.replace('@', ''))
    }

    const updated = chats.map((c) =>
      c.id === activeChat.id ? { ...c, messages: [] } : c
    )
    queryClient.setQueryData(['chats', currentUsername], updated)
    if (activeChat.isBot) saveBotHistory(currentUsername, updated)
  }`;
content = content.replace(/  const clearCurrentChat = \(\) => \{[\s\S]*?queryClient\.setQueryData\(\['chats', currentUsername\], updated\)\n    if \(activeChat\.isBot\) saveBotHistory\(currentUsername, updated\)\n  \}/, newClear);

fs.writeFileSync('app-nexu/src/hooks/useChats.js', content);
console.log("useChats patched!");
