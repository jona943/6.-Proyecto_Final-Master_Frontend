// ============================================================================
// SINTETIZADOR DE AUDIO WEB (Notificaciones Audibles Ligeras y Seguras)
// ============================================================================

/**
 * Reproduce un tono sintético suave usando Web Audio API sin requerir archivos mp3 externos.
 * @param {number} startFreq
 * @param {number} endFreq
 * @param {number} duration
 */
export function playNotificationChime(startFreq = 587.33, endFreq = 880, duration = 0.3) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.1)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration + 0.05)
  } catch (err) {
    console.warn('Audio playback not supported or user has not interacted with DOM yet', err)
  }
}
