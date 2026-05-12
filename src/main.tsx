import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import type { Session } from '@supabase/supabase-js'
import './index.css'
import App from './App.tsx'
import { supabase, makeSupabaseStorage, migrateLocalToCloud } from './supabase'

declare global {
  interface Window {
    storage: {
      get: (key: string) => Promise<{ value: string } | null>;
      set: (key: string, value: string, isPublic?: boolean) => Promise<void>;
      delete: (key: string, isPublic?: boolean) => Promise<void>;
    };
  }
}

// localStorage polyfill — used as a fallback when Supabase env vars aren't set
// (so prod doesn't break the moment this code ships before VITE_SUPABASE_* land
// in Vercel) and as the seed source for the one-time cloud migration.
function installLocalStorage() {
  (window as any).storage = {
    get: async (key: string) => {
      const v = localStorage.getItem(key);
      return v != null ? { value: v } : null;
    },
    set: async (key: string, value: string) => { localStorage.setItem(key, value); },
    delete: async (key: string) => { localStorage.removeItem(key); },
  };
}

if (typeof (window as any).storage === 'undefined') installLocalStorage();

function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // When a session lands, swap window.storage to the cloud adapter and run
  // the one-shot localStorage → cloud migration. Until that resolves we keep
  // showing the gate to avoid a flash of empty state.
  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    if (!session || !supabase) { setStorageReady(false); return; }
    (window as any).storage = makeSupabaseStorage(supabase);
    let cancelled = false;
    migrateLocalToCloud(supabase).finally(() => { if (!cancelled) setStorageReady(true); });
    return () => { cancelled = true; };
  }, [session]);

  if (!ready) return null;

  // No Supabase configured — run in offline/local mode (no auth, no cloud)
  if (!supabase) return <App />;

  if (session && storageReady) return <App />;
  if (session && !storageReady) return <Splash msg="Syncing your data…" />;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim() || sending) return;
    setSending(true); setErr('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) setErr(error.message); else setSent(true);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0E0E0E', color: '#FAFAFA',
      fontFamily: '"Space Grotesk", "Manrope", -apple-system, BlinkMacSystemFont, "Inter", "Helvetica Neue", Arial, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 18,
        padding: 28, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#84CC16', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#84CC16', boxShadow: '0 0 8px #84CC16' }} />
          Hyrox Tracker
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: '#FAFAFA', letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 18 }}>
          Sign in to sync<br />your training
        </div>

        {sent ? (
          <div style={{ background: '#222222', border: '1px solid #2A2A2A', borderRadius: 12, padding: '14px 16px', fontSize: 13, color: '#D4D4D4', lineHeight: 1.5 }}>
            Check <b style={{ color: '#FAFAFA' }}>{email}</b> for a sign-in link.
            <div style={{ marginTop: 10, fontSize: 12, color: '#A3A3A3' }}>You can close this tab — the link opens you back here.</div>
          </div>
        ) : (
          <form onSubmit={send}>
            <label style={{ fontSize: 12, color: '#A3A3A3', marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: 0.2 }}>EMAIL</label>
            <input
              type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '13px 15px', fontSize: 15, borderRadius: 12, border: '1.5px solid #3A3A3A', background: '#1A1A1A', color: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'inherit' }}
            />
            {err && <div style={{ marginTop: 10, fontSize: 12, color: '#EF4444' }}>{err}</div>}
            <button
              type="submit" disabled={sending || !email.trim()}
              style={{
                marginTop: 14, width: '100%', padding: '14px', fontSize: 14, fontWeight: 800,
                background: sending || !email.trim() ? '#3A3A3A' : '#84CC16',
                color: sending || !email.trim() ? '#A3A3A3' : '#000',
                border: 'none', borderRadius: 12, cursor: sending || !email.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: 0.3,
              }}
            >{sending ? 'SENDING…' : 'SEND MAGIC LINK'}</button>
          </form>
        )}

        <div style={{ marginTop: 18, fontSize: 11, color: '#A3A3A3', lineHeight: 1.5 }}>
          We email you a one-tap sign-in link. No password.
        </div>
      </div>
    </div>
  );
}

function Splash({ msg }: { msg: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0E', color: '#A3A3A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Space Grotesk", sans-serif', fontSize: 13 }}>
      {msg}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}
