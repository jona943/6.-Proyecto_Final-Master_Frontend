// Configuración del System Prompt
const SYSTEM_PROMPT = `Eres Nexu Assistant, el soporte oficial e IA de la aplicación NexuHub.
NexuHub es una app de mensajería altamente segura, enfocada en la privacidad, que utiliza alias (nombres de usuario) en lugar de números de teléfono o correos electrónicos para conectar a las personas.
Tu objetivo es responder de forma amable, clara y concisa a cualquier pregunta sobre la plataforma.
Mantén tus respuestas breves y directas, evitando párrafos excesivamente largos.
Si te preguntan por funcionalidades, NexuHub cuenta con encriptación, cero recolección de datos innecesarios, perfiles soberanos y chats 1 a 1.`

export const askAssistant = async (req, res) => {
  try {
    const { text, history = [] } = req.body

    if (!text) {
      return res.status(400).json({ success: false, message: 'El texto del mensaje es requerido.' })
    }

    // Validar configuración de Google AI Studio
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        answer: 'Mensaje verificado (Mock). Por favor, configura GEMINI_API_KEY en las variables de entorno de tu servidor para activar Gemini.'
      })
    }

    // Formatear el historial para la API REST directa de Gemini
    const formattedContents = []
    
    if (Array.isArray(history)) {
      history.forEach(msg => {
        formattedContents.push({
          role: msg.sender === 'me' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })
      })
    }

    // Añadir el mensaje actual
    formattedContents.push({
      role: 'user',
      parts: [{ text }]
    })

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Error desconocido de la API de Gemini')
    }

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.'

    return res.status(200).json({
      success: true,
      answer
    })
  } catch (error) {
    console.error('Error en Gemini Assistant:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al contactar al asistente de IA.',
      error: error.message
    })
  }
}
