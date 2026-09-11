const fs = require('fs');
let content = fs.readFileSync('backend/routes/chat.routes.js', 'utf8');

content = content.replace(
  "const { targetUsername } = req.body\n    const currentUser = req.user.username",
  "const { targetUsername, currentUser } = req.body\n    if (!currentUser) return res.status(400).json({ success: false, message: 'Usuario actual requerido' })"
);

content = content.replace(
  "const { targetUsername } = req.body\n    const currentUser = req.user.username",
  "const { targetUsername, currentUser } = req.body\n    if (!currentUser) return res.status(400).json({ success: false, message: 'Usuario actual requerido' })"
);

fs.writeFileSync('backend/routes/chat.routes.js', content);
console.log("Backend fixed!");
