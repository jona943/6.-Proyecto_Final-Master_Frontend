const fs = require('fs');
let content = fs.readFileSync('app-nexu/src/services/chatService.js', 'utf8');

let newClear = `  async clearMessages(currentUser, targetUser) {
    if (targetUser === '@nexu_assistant' || targetUser === 'chat_bot') return true;
    try {
      const res = await api.post('/chats/clear', { targetUsername: targetUser, currentUser });
      return res.success;
    } catch (e) {
      console.error('Error clearing messages:', e);
      return false;
    }
  },`;

let newDelete = `  async deleteContact(currentUser, targetUser) {
    if (targetUser === '@nexu_assistant' || targetUser === 'chat_bot') return true;
    try {
      const res = await api.post('/chats/delete-contact', { targetUsername: targetUser, currentUser });
      return res.success;
    } catch (e) {
      console.error('Error deleting contact:', e);
      return false;
    }
  },`;

content = content.replace(/  async clearMessages\(currentUser, targetUser\) \{[\s\S]*?\},/, newClear);
content = content.replace(/  async deleteContact\(currentUser, targetUser\) \{[\s\S]*?\},/, newDelete);

fs.writeFileSync('app-nexu/src/services/chatService.js', content);
console.log("Service fixed!");
