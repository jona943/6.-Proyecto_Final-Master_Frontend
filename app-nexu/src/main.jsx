import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
})

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
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
