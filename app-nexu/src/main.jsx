import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Detección exclusiva para entorno nativo APK (Capacitor / Android WebView)
// NO afecta a navegadores de escritorio (Chrome/Firefox) ni a navegadores móviles (Chrome/Safari)
if (
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() ||
    window.Capacitor?.platform === 'android' ||
    window.location.search.includes('apk=true'))
) {
  document.documentElement.classList.add('is-webview-apk')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
