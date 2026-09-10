const fs = require('fs');

let content = fs.readFileSync('app-nexu/src/hooks/useChats.js', 'utf8');

// 1. Insert helpers right after INITIAL_CHATS_DEFAULT
const helpers = `
const getInitialChats = (username) => {
  if (!username) return INITIAL_CHATS_DEFAULT;
  const chatsCopy = JSON.parse(JSON.stringify(INITIAL_CHATS_DEFAULT));
  try {
    const savedBotHistory = localStorage.getItem(\`nexu_bot_history_\${username}\`);
    if (savedBotHistory) {
      chatsCopy[0].messages = JSON.parse(savedBotHistory);
    }
  } catch (e) {
    console.error('Error reading bot history:', e);
  }
  return chatsCopy;
}

const saveBotHistory = (username, chats) => {
  try {
    const botChat = chats.find(c => c.id === 'chat_bot');
    if (botChat) {
      localStorage.setItem(\`nexu_bot_history_\${username}\`, JSON.stringify(botChat.messages));
    }
  } catch (e) {
    console.error('Error saving bot history:', e);
  }
}
`;

content = content.replace(
  "export function useChats(currentUsername) {",
  helpers + "\nexport function useChats(currentUsername) {"
);

// 2. Replace INITIAL_CHATS_DEFAULT inside useQuery
content = content.replace(
  "queryFn: () => INITIAL_CHATS_DEFAULT,",
  "queryFn: () => getInitialChats(currentUsername),"
);
content = content.replace(
  "const { data: chats = INITIAL_CHATS_DEFAULT }",
  "const { data: chats = getInitialChats(currentUsername) }"
);
content = content.replace(
  "const prevChats = queryClient.getQueryData(['chats', currentUsername]) || INITIAL_CHATS_DEFAULT",
  "const prevChats = queryClient.getQueryData(['chats', currentUsername]) || getInitialChats(currentUsername)"
);

// 3. Update sendMessage to save bot history
content = content.replace(
  "queryClient.setQueryData(['chats', currentUsername], updatedChats)",
  "queryClient.setQueryData(['chats', currentUsername], updatedChats)\n    if (activeChat.isBot) saveBotHistory(currentUsername, updatedChats)"
);
content = content.replace(
  "queryClient.setQueryData(['chats', currentUsername], replyChats)",
  "queryClient.setQueryData(['chats', currentUsername], replyChats)\n          saveBotHistory(currentUsername, replyChats)"
);

// 4. Update clearCurrentChat to save bot history
content = content.replace(
  "queryClient.setQueryData(['chats', currentUsername], updated)",
  "queryClient.setQueryData(['chats', currentUsername], updated)\n    if (activeChat.isBot) saveBotHistory(currentUsername, updated)"
);

fs.writeFileSync('app-nexu/src/hooks/useChats.js', content);
console.log('useChats.js patched for persistent bot history');
