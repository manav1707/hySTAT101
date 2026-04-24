import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string, isPublic?: boolean) => Promise<void>;
      delete: (key: string, isPublic?: boolean) => Promise<void>;
    };
  }
}

if (typeof (window as any).storage === 'undefined') {
  (window as any).storage = {
    get: async (key: string) => {
      const v = localStorage.getItem(key);
      return v != null ? { value: v } : null;
    },
    set: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    },
    delete: async (key: string) => {
      localStorage.removeItem(key);
    },
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
