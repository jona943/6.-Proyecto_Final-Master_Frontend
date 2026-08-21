/**
 * mockData.js - Datos simulados para el Módulo de Chat (Nexu v1.0)
 * Sin emojis - 100% iconos vectoriales e iniciales tipográficas.
 */

export const CURRENT_USER = {
  id: 'user_ema',
  name: 'EmaRama',
  handle: '@emarama',
  avatar: 'ER',
  role: 'Frontend Developer',
  email: 'ema.rama@nexu.app',
  status: 'online',
  statusText: 'Desarrollando Módulo 03 · Mensajería',
  joinedDate: 'Agosto 2026'
}

export const INITIAL_CHATS = [
  {
    id: 'chat_bot',
    name: 'Nexu Assistant',
    handle: '@nexu_assistant',
    avatar: 'NX',
    isBot: true,
    status: 'online',
    statusText: 'Servicio automatizado en tiempo real',
    unreadCount: 1,
    role: 'Bot del Sistema',
    email: 'system.bot@nexu.app',
    bio: 'Asistente virtual de pruebas para validar la entrega y respuesta de mensajes en la arquitectura cliente.',
    messages: [
      {
        id: 'msg_bot_1',
        sender: 'them',
        text: 'Bienvenido al canal de pruebas de Nexu Chat. Este canal simula el flujo de datos en tiempo real.',
        time: '10:30 AM',
        status: 'read'
      },
      {
        id: 'msg_bot_2',
        sender: 'them',
        text: 'Escribe cualquier mensaje en la barra inferior para probar el envío, confirmaciones de lectura y auto-scroll.',
        time: '10:31 AM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat_jona',
    name: 'Jonathan Medina',
    handle: '@jona_dev',
    avatar: 'JM',
    isBot: false,
    status: 'online',
    statusText: 'En la rama feature/jonathan',
    unreadCount: 0,
    role: 'Tech Lead / Landing',
    email: 'jonathan.medina@nexu.app',
    bio: 'Coordinando la interfaz visual y la sección Hero de la Landing Page.',
    messages: [
      {
        id: 'msg_j_1',
        sender: 'them',
        text: 'Ema, ya quedó integrada la estructura principal de la Landing Page con el carrusel de ventajas.',
        time: '09:15 AM',
        status: 'read'
      },
      {
        id: 'msg_j_2',
        sender: 'me',
        text: 'Excelente Jonathan. Aquí el chat ya cuenta con historial reactivo, búsqueda y filtros.',
        time: '09:20 AM',
        status: 'read'
      },
      {
        id: 'msg_j_3',
        sender: 'them',
        text: 'Perfecto, mantendremos la consistencia de estilos con la paleta Obsidian Carbon.',
        time: '09:22 AM',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat_rosy',
    name: 'Rosy García',
    handle: '@rosy_auth',
    avatar: 'RG',
    isBot: false,
    status: 'online',
    statusText: 'Diseñando pantallas de Login & Auth',
    unreadCount: 2,
    role: 'Frontend Developer',
    email: 'rosy.garcia@nexu.app',
    bio: 'Especialista en flujos de autenticación y validación segura de formularios.',
    messages: [
      {
        id: 'msg_r_1',
        sender: 'them',
        text: 'Hola equipo, ¿confirmamos si el registro solicita exclusivamente el alias de usuario?',
        time: 'Ayer',
        status: 'read'
      },
      {
        id: 'msg_r_2',
        sender: 'me',
        text: 'Correcto, en el MVP v1.0 el acceso es directo por alias sin requerir números telefónicos.',
        time: 'Ayer',
        status: 'read'
      },
      {
        id: 'msg_r_3',
        sender: 'them',
        text: 'Anotado. Procedo a finalizar las validaciones del formulario de registro.',
        time: '08:45 AM',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'chat_victor',
    name: 'Víctor Hugo',
    handle: '@victor_settings',
    avatar: 'VH',
    isBot: false,
    status: 'away',
    statusText: 'Ajustando Dark Mode & Perfiles',
    unreadCount: 0,
    role: 'UI Designer / Developer',
    email: 'victor.hugo@nexu.app',
    bio: 'Desarrollando los paneles de configuración, perfiles y selector de tema.',
    messages: [
      {
        id: 'msg_v_1',
        sender: 'them',
        text: 'Ema, avísame cuando tengas la estructura de burbujas para verificar los contrastes.',
        time: 'Ayer',
        status: 'read'
      },
      {
        id: 'msg_v_2',
        sender: 'me',
        text: 'Utilizamos los tokens globales: fondos oscuros #101216 y resaltes en Acid Lime #d4ff00.',
        time: 'Ayer',
        status: 'read'
      }
    ]
  },
  {
    id: 'chat_devf',
    name: 'Mentor DEV.F',
    handle: '@mentor_frontend',
    avatar: 'DF',
    isBot: false,
    status: 'offline',
    statusText: 'Última conexión hoy a las 8:00 AM',
    unreadCount: 0,
    role: 'Instructor / Revisor',
    email: 'mentor@devf.la',
    bio: 'Revisión técnica de arquitectura y buenas prácticas de desarrollo modular.',
    messages: [
      {
        id: 'msg_d_1',
        sender: 'them',
        text: 'Recuerden que la Fase 1 se enfoca en una experiencia UI/UX Mock navegable y fluida.',
        time: '18 Ago',
        status: 'read'
      },
      {
        id: 'msg_d_2',
        sender: 'me',
        text: 'Comprendido. Cada módulo está encapsulado en su respectivo directorio.',
        time: '18 Ago',
        status: 'read'
      }
    ]
  }
]

export const BOT_RESPONSES = [
  'Mensaje recibido y procesado por el despachador de eventos.',
  'Confirmación de entrega en tiempo real: paquete verificado con latencia de 12ms.',
  'Evento de mensajería ejecutado correctamente en el cliente.',
  'Simulación de respuesta automática completada sin errores.',
  'Flujo de comunicación validado en el Módulo 03.'
]
