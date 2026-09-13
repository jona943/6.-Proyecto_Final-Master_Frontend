import mongoose from 'mongoose'

/**
 * Establece la conexión con la base de datos MongoDB Atlas en la nube.
 */
export const connectDB = async () => {
  // Escuchadores de eventos para monitoreo y reconexión de MongoDB
  mongoose.connection.on('connected', () => {
    console.log('[MongoDB]: Conexion establecida y canal de datos activo.')
  })

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB]: Error en la conexion:', err.message)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB]: Conexion interrumpida con la base de datos. Reintentando...')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB]: Conexion restablecida con exito.')
  })

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    })
    console.log(`[MongoDB]: Conectado con exito a host: ${conn.connection.host}`)
  } catch (error) {
    console.error(`[MongoDB Error Critico]: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
