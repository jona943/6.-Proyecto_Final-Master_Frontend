const fs = require('fs');
let content = fs.readFileSync('backend/routes/chat.routes.js', 'utf8');

const newRoutes = `
// VACIAR MENSAJES DE UN CHAT
router.post('/clear', async (req, res) => {
  try {
    const { targetUsername } = req.body
    const currentUser = req.user.username

    if (!targetUsername) {
      return res.status(400).json({ success: false, message: 'Usuario objetivo requerido' })
    }

    await ChatMessage.deleteMany({
      $or: [
        { senderUsername: currentUser, recipientUsername: targetUsername },
        { senderUsername: targetUsername, recipientUsername: currentUser }
      ]
    })

    res.json({ success: true, message: 'Mensajes eliminados correctamente para ambos' })
  } catch (error) {
    console.error('Error al vaciar chat:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
})

// ELIMINAR CONTACTO Y CONVERSACION COMPLETA
router.post('/delete-contact', async (req, res) => {
  try {
    const { targetUsername } = req.body
    const currentUser = req.user.username

    if (!targetUsername) {
      return res.status(400).json({ success: false, message: 'Usuario objetivo requerido' })
    }

    // 1. Borrar mensajes
    await ChatMessage.deleteMany({
      $or: [
        { senderUsername: currentUser, recipientUsername: targetUsername },
        { senderUsername: targetUsername, recipientUsername: currentUser }
      ]
    })

    // 2. Borrar conexión (cualquiera de los dos sentidos)
    await ConnectionRequest.deleteMany({
      $or: [
        { senderUsername: currentUser, targetUsername: targetUsername },
        { senderUsername: targetUsername, targetUsername: currentUser }
      ]
    })

    res.json({ success: true, message: 'Contacto y mensajes eliminados correctamente' })
  } catch (error) {
    console.error('Error al eliminar contacto:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
})

export default router
`;

content = content.replace("export default router", newRoutes);
fs.writeFileSync('backend/routes/chat.routes.js', content);
console.log("Backend routes patched!");
