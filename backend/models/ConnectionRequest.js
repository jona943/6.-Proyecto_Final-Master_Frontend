import mongoose from 'mongoose'

/**
 * Esquema de Solicitudes de Conexión entre Usuarios
 */
const connectionRequestSchema = new mongoose.Schema(
  {
    senderUsername: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    targetUsername: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
)

export const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema)
export default ConnectionRequest
