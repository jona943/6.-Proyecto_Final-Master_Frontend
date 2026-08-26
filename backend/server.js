import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Importar Rutas Modulares
import publicRoutes from './routes/public.routes.js'
import authRoutes from './routes/auth.routes.js'
import chatRoutes from './routes/chat.routes.js'
import userRoutes from './routes/user.routes.js'

// Importar Conexión a Base de Datos
import { connectDB } from './config/db.js'

// Cargar variables de entorno
dotenv.config()

// Conectar a MongoDB Atlas
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

// ============================================================================
// MIDDLEWARES GLOBALES
// ============================================================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ============================================================================
// REGISTRO DE RUTAS DE LA API
// ============================================================================
app.use('/api', publicRoutes)        // /api/health, /api/public/check-alias, etc.
app.use('/api/auth', authRoutes)     // /api/auth/login, /api/auth/register
app.use('/api/chats', chatRoutes)    // /api/chats, /api/chats/message
app.use('/api/user', userRoutes)     // /api/user/profile

// Ruta Raíz Informativa
app.get('/', (req, res) => {
  res.json({
    app: 'Nexu Backend API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      public: '/api/public/network-stats',
      auth: '/api/auth/login',
      chats: '/api/chats',
      user: '/api/user/profile'
    }
  })
})

// Manejador de Rutas No Encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.originalUrl} no encontrada en el servidor Nexu.`
  })
})

// Iniciar Servidor
app.listen(PORT, () => {
  console.log(`=======================================================`)
  console.log(`Servidor Nexu Backend ejecutándose en http://localhost:${PORT}`)
  console.log(`Endpoint de prueba de salud: http://localhost:${PORT}/api/health`)
  console.log(`=======================================================`)
})
