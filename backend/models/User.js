import mongoose from 'mongoose'

/**
 * Esquema de Usuario para Nexu Mensajería Privada
 * Premisa: Autenticación minimalista y segura basada exclusivamente en Username y Password.
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'El nombre de usuario es obligatorio.'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'El alias debe tener al menos 3 caracteres.'],
      maxlength: [10, 'El alias debe tener máximo 10 caracteres.'],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        'El alias solo puede contener letras, números, guión bajo (_) y guión (-).'
      ]
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria.'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres.']
    },
    displayName: {
      type: String,
      trim: true,
      default: function () {
        return this.username
      }
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    }
  },
  {
    timestamps: true
  }
)

export const User = mongoose.model('User', userSchema)
export default User
