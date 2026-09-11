// ============================================================================
// NEXU SOUND SERVICE · WEB AUDIO API
// Sintetizador procedural nativo para sonidos de notificación (0KB, baja latencia)
// ============================================================================

let audioCtx = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export const soundService = {
  STORAGE_KEY: 'nexu_sound_enabled',

  // 'true' | 'false' | null (null = primera vez, nunca se ha preguntado)
  getPermissionState() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.STORAGE_KEY)
  },

  isSoundEnabled() {
    return this.getPermissionState() === 'true'
  },

  setSoundEnabled(enabled) {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, enabled ? 'true' : 'false')
    if (enabled) {
      getAudioContext()
    }
  },

  /**
   * Sonido de Mensaje Recibido: Burbuja líquida / Pop suave (Estilo Telegram)
   * Una gota de agua amortiguada y placentera que no aturde el oído.
   */
  playMessageReceivedSound() {
    if (!this.isSoundEnabled()) return

    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      // Onda senoidal pura para suavidad orgánica
      osc.type = 'sine'

      // Curva de frecuencia de burbuja (salto ascendente y estabilización rápida: 420Hz -> 860Hz -> 620Hz)
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.03)
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.09)

      // Filtro pasa-bajos resonante para textura líquida "plop"
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1600, now)
      filter.Q.setValueAtTime(2.5, now)

      // Curva de volumen: ataque casi instantáneo y caída exponencial rápida (100ms total)
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.11)
    } catch {
      // Manejo silencioso en caso de bloqueo por autoplay
    }
  },

  /**
   * Sonido de Mensaje Enviado: Tick / Pop háptico ultracorto y tenue
   * Mucho más sutil que el de recepción para feedback táctil sin cansar.
   */
  playMessageSentSound() {
    if (!this.isSoundEnabled()) return

    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = 'sine'

      // Tono ascendente ultracorto (320Hz -> 540Hz en 25ms)
      osc.frequency.setValueAtTime(320, now)
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.025)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1400, now)

      // Volumen significativamente más bajo (0.07) y duración de solo 45ms
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.07, now + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.048)
    } catch {
      // Manejo silencioso
    }
  }
}

export default soundService
