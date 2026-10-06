import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './auth.tsx'
import './index.css'
import { CVProvider } from './store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CVProvider>
        <App />
      </CVProvider>
    </AuthProvider>
  </StrictMode>,
)
