import './app/providers/configureGateways'
import '../styles/globals.css'
import '../styles/portal-theme.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
