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
      required: true
    },
    time: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'read'
    }
  },
  {
    timestamps: true
  }
)

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema)
export default ChatMessage
