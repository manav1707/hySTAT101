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
    auth?: { signOut: () => Promise<void> };
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
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
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
    (window as any).auth = { signOut: async () => { await supabase.auth.signOut(); } };
    let cancelled = false;
    migrateLocalToCloud(supabase).finally(() => { if (!cancelled) setStorageReady(true); });
    return () => { cancelled = true; };
  }, [session]);

  if (!ready) return null;

  // No Supabase configured — run in offline/local mode (no auth, no cloud)
  if (!supabase) return <App />;

  if (session && storageReady) return <App />;
  if (session && !storageReady) return <Splash msg="Syncing your data…" />;

  // We use OTP (6-digit code) instead of magic-link redirect because installed
  // PWAs and the default browser are separate storage contexts — a link opened
  // in Chrome can't authenticate the PWA on the home screen. The code keeps
  // the whole flow inside whatever surface the user started in.
  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !email.trim() || sending) return;
    setSending(true); setErr('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (error) setErr(error.message);
    else { setStep('code'); setCode(''); }
  };

  const signInGoogle = async () => {
    if (!supabase || sending) return;
    setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error) setErr(error.message);
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || code.trim().length < 6 || verifying) return;
    setVerifying(true); setErr('');
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    setVerifying(false);
    if (error) setErr(error.message);
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
          {step === 'email' ? <>Sign in to sync<br />your training</> : <>Enter your<br />6-digit code</>}
        </div>

        {step === 'email' ? (
          <>
            <button
              type="button" onClick={signInGoogle}
              style={{
                width: '100%', padding: '13px', fontSize: 14, fontWeight: 700,
                background: '#FAFAFA', color: '#0E0E0E', border: 'none', borderRadius: 12,
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#2A2A2A' }} />
              <div style={{ fontSize: 11, color: '#A3A3A3', letterSpacing: 1.5, fontWeight: 600 }}>OR</div>
              <div style={{ flex: 1, height: 1, background: '#2A2A2A' }} />
            </div>

            <form onSubmit={sendCode}>
              <label style={{ fontSize: 12, color: '#A3A3A3', marginBottom: 8, display: 'block', fontWeight: 600, letterSpacing: 0.2 }}>EMAIL</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
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
              >{sending ? 'SENDING…' : 'SEND CODE'}</button>
            </form>
          </>
        ) : (
          <form onSubmit={verifyCode}>
            <div style={{ fontSize: 12, color: '#A3A3A3', marginBottom: 12, lineHeight: 1.5 }}>
              We sent a code to <b style={{ color: '#FAFAFA' }}>{email}</b>. Open your email and paste it below.
            </div>
            <input
              type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*"
              required autoFocus maxLength={6}
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              style={{ width: '100%', padding: '14px 15px', fontSize: 24, fontWeight: 800, letterSpacing: 8, textAlign: 'center', borderRadius: 12, border: '1.5px solid #3A3A3A', background: '#1A1A1A', color: '#FAFAFA', boxSizing: 'border-box', fontFamily: 'SF Mono, Monaco, monospace' }}
            />
            {err && <div style={{ marginTop: 10, fontSize: 12, color: '#EF4444' }}>{err}</div>}
            <button
              type="submit" disabled={verifying || code.length < 6}
              style={{
                marginTop: 14, width: '100%', padding: '14px', fontSize: 14, fontWeight: 800,
                background: verifying || code.length < 6 ? '#3A3A3A' : '#84CC16',
                color: verifying || code.length < 6 ? '#A3A3A3' : '#000',
                border: 'none', borderRadius: 12, cursor: verifying || code.length < 6 ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: 0.3,
              }}
            >{verifying ? 'VERIFYING…' : 'VERIFY & SIGN IN'}</button>
            <button
              type="button"
              onClick={() => { setStep('email'); setCode(''); setErr(''); }}
              style={{ marginTop: 10, width: '100%', padding: '10px', fontSize: 12, fontWeight: 600, background: 'transparent', color: '#A3A3A3', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >← Use a different email</button>
          </form>
        )}

        <div style={{ marginTop: 18, fontSize: 11, color: '#A3A3A3', lineHeight: 1.5 }}>
          Continue with Google, or get a one-time code by email.
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
