const fs = require('fs');

let content = fs.readFileSync('app-nexu/src/hooks/useChats.js', 'utf8');

const encryptHelpers = `
const ENCRYPTION_KEY = 'NEXU_SECURE_VAULT_2026';

const encryptData = (data) => {
  const str = JSON.stringify(data);
  let encrypted = '';
  for(let i = 0; i < str.length; i++) {
    encrypted += String.fromCharCode(str.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(encrypted);
};

const decryptData = (encodedData) => {
  try {
    const decoded = atob(encodedData);
    let decrypted = '';
    for(let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
};
`;

// Inject encryption helpers
content = content.replace(
  "const getInitialChats = (username) => {",
  encryptHelpers + "\nconst getInitialChats = (username) => {"
);

// Replace JSON.parse(savedBotHistory) with decryptData(savedBotHistory)
content = content.replace(
  "chatsCopy[0].messages = JSON.parse(savedBotHistory);",
  "const decrypted = decryptData(savedBotHistory);\n      if (decrypted) chatsCopy[0].messages = decrypted;"
);

// Replace JSON.stringify with encryptData
content = content.replace(
  "localStorage.setItem(\`nexu_bot_history_\${username}\`, JSON.stringify(botChat.messages));",
  "localStorage.setItem(\`nexu_bot_history_\${username}\`, encryptData(botChat.messages));"
);

fs.writeFileSync('app-nexu/src/hooks/useChats.js', content);
console.log('Encryption patched');
