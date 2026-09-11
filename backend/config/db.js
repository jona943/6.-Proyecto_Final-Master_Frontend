import mongoose from 'mongoose'

/**
 * Establece la conexión con la base de datos MongoDB Atlas en la nube.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log(`MongoDB Conectado con éxito: ${conn.connection.host}`)
  } catch (error) {
    console.error(`Error al conectar con MongoDB Atlas: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
