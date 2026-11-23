import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './lib/i18n' // <-- Nouvel import

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider> {/* <-- Enveloppe l'application */}
      <App />
    </I18nProvider>
  </StrictMode>,
)