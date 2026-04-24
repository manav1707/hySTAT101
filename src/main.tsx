import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

if (typeof (window as any).storage === 'undefined') {
  (window as any).storage = {
    get: async (key: string) => {
      const v = localStorage.getItem(key);
      return v != null ? { value: v } : null;
    },
    set: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
