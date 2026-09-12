import mongoose from 'mongoose'

/**
 * Esquema de Mensajes de Chat 1 a 1 entre Usuarios en MongoDB Atlas
 */
const chatMessageSchema = new mongoose.Schema(
  {
    senderUsername: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    recipientUsername: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    text: {
      type: String,
      required: false
    },
    attachment: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    time: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    deletedFor: {
      type: [{ type: String, lowercase: true, trim: true }],
      default: []
    }
  },
  {
    timestamps: true
  }
)

// Índices Compuestos de Alto Rendimiento para Consultas de Polling y Mensajería
chatMessageSchema.index({ senderUsername: 1, recipientUsername: 1, createdAt: -1 })
chatMessageSchema.index({ recipientUsername: 1, senderUsername: 1, createdAt: -1 })
chatMessageSchema.index({ senderUsername: 1, createdAt: -1 })
chatMessageSchema.index({ recipientUsername: 1, createdAt: -1 })
chatMessageSchema.index({ recipientUsername: 1, status: 1 })
chatMessageSchema.index({ 'attachment.expiresAt': 1 }, { sparse: true })

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
export default ChatMessage
