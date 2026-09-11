const fs = require('fs');
let content = fs.readFileSync('app-nexu/src/services/chatService.js', 'utf8');

const newMethods = `
  async clearMessages(currentUser, targetUser) {
    if (targetUser === '@nexu_assistant' || targetUser === 'chat_bot') return true;
    try {
      const res = await api.post('/chat/clear', { targetUsername: targetUser });
      return res.success;
    } catch (e) {
      console.error('Error clearing messages:', e);
      return false;
    }
  },

  async deleteContact(currentUser, targetUser) {
    if (targetUser === '@nexu_assistant' || targetUser === 'chat_bot') return true;
    try {
      const res = await api.post('/chat/delete-contact', { targetUsername: targetUser });
      return res.success;
    } catch (e) {
      console.error('Error deleting contact:', e);
      return false;
    }
  },

  // Obtener lista de chats
`;

content = content.replace("  // Obtener lista de chats (sólo backend, sin persistencia en localStorage)\n", newMethods);
fs.writeFileSync('app-nexu/src/services/chatService.js', content);
console.log("Service patched!");
