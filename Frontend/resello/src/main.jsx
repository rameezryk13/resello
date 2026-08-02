import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './app/App.jsx'
import AppProviders from './app/providers/AppProviders.jsx'

// main.jsx is a mount point only: providers live in AppProviders, the layout
// and route table in app/App.jsx.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
