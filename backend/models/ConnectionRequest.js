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

// Índices compuestos de alto rendimiento para búsquedas frecuentes y polling
connectionRequestSchema.index({ targetUsername: 1, status: 1, createdAt: -1 })
connectionRequestSchema.index({ senderUsername: 1, status: 1, createdAt: -1 })
connectionRequestSchema.index({ senderUsername: 1, targetUsername: 1, status: 1 })
connectionRequestSchema.index({ status: 1, senderUsername: 1 })
connectionRequestSchema.index({ status: 1, targetUsername: 1 })

export const ConnectionRequest = mongoose.model('ConnectionRequest', connectionRequestSchema)
export default ConnectionRequest
