import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Login() {
  const [view, setView] = useState('login');
  const [role, setRole] = useState('professional');
  const [professionalType, setProfessionalType] = useState('nurse');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signInWithGoogle, signInWithApple, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Map a profile role to its home route.
  const destFor = (r) => (r === 'facility' ? '/facility' : r === 'admin' ? '/admin' : '/dashboard');

  // Resolve the signed-in user's role from Firestore, then route accordingly —
  // deterministic, so facility/admin land on the right screen with no flicker.
  const routeAfterAuth = async (cred) => {
    try {
      const snap = await getDoc(doc(db, 'profiles', cred.user.uid));
      const r = snap.exists() ? (snap.data().role || 'professional') : 'professional';
      navigate(destFor(r));
    } catch {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const cred = await signInWithGoogle();
      await routeAfterAuth(cred);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const cred = await signInWithApple();
      await routeAfterAuth(cred);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (view === 'forgot_password') {
        await resetPassword(email);
        setMessage("Password reset link sent to your email.");
        setView('login');
      } else if (view === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        const profileData = { 
          id: user.uid, 
          role, 
          full_name: fullName,
          tier: 'free',
          created_at: new Date().toISOString()
        };
        if (role === 'professional') profileData.professional_type = professionalType;
        
        await setDoc(doc(db, 'profiles', user.uid), profileData);

        navigate(destFor(role));
      } else if (view === 'login') {
        const cred = await signIn(email, password);
        await routeAfterAuth(cred);
      }
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }}>
      <div className="grid-bg"></div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="brutal-card" style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
          <Logo size={48} />
        </div>

        <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          {view === 'signup' ? "Create your account" : view === 'forgot_password' ? "Reset your password" : "Welcome back"}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
          <ShieldCheck size={15} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> HIPAA-compliant, secure sign-in
        </p>

        {error && <div className="brutal-card bg-alert text-alert" style={{ color: '#fff', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        {message && <div className="brutal-card" style={{ backgroundColor: 'var(--color-success)', color: '#000', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{message}</div>}

        {/* OAuth Providers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button type="button" onClick={handleGoogleSignIn} className="brutal-button secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77a4.73 4.73 0 0 1-4.45-3.23H1.87v2.08A8 8 0 0 0 8.98 17Z"/><path fill="#FBBC05" d="M4.53 10.59a4.8 4.8 0 0 1 0-3.17V5.33H1.87a8 8 0 0 0 0 7.33l2.66-2.08Z"/><path fill="#EA4335" d="M8.98 3.58c1.16 0 2.23.4 3.06 1.2l2.37-2.26A8 8 0 0 0 1.87 5.33L4.53 7.4a4.77 4.77 0 0 1 4.45-3.83Z"/></svg>
            Continue with Google
          </button>
          <button type="button" onClick={handleAppleSignIn} className="brutal-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#000', color: '#fff' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#fff"><path d="M13.71 9.43c-.02-1.85 1.51-2.75 1.58-2.8a3.45 3.45 0 0 0-2.72-1.47c-1.14-.12-2.25.68-2.83.68-.6 0-1.5-.67-2.47-.65a3.63 3.63 0 0 0-3.06 1.87c-1.32 2.28-.34 5.63.93 7.48.63.91 1.38 1.92 2.35 1.88.95-.04 1.31-.61 2.46-.61 1.14 0 1.46.61 2.45.59.1 0 1.73-1 2.35-1.89a7.92 7.92 0 0 0 1.07-2.19 3.3 3.3 0 0 1-2.1-3.08ZM11.75 3.7a3.36 3.36 0 0 0 .77-2.42 3.43 3.43 0 0 0-2.22 1.15 3.2 3.2 0 0 0-.8 2.33 2.83 2.83 0 0 0 2.25-1.06Z"/></svg>
            Continue with Apple
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0.5rem 0 1rem' }}>
          <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-border)' }}></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>OR</span>
          <div style={{ flex: 1, height: '2px', backgroundColor: 'var(--color-border)' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {view === 'signup' && (
            <>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <button type="button" onClick={() => setRole('professional')} className={`brutal-button ${role === 'professional' ? '' : 'secondary'}`} style={{ flex: 1, fontSize: '0.85rem', padding: '0.55rem' }}>Clinician</button>
                <button type="button" onClick={() => setRole('facility')} className={`brutal-button ${role === 'facility' ? '' : 'secondary'}`} style={{ flex: 1, fontSize: '0.85rem', padding: '0.55rem' }}>Facility</button>
              </div>

              {role === 'professional' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-label)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Your specialty</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['nurse', 'therapist', 'ems'].map(type => (
                      <button key={type} type="button" onClick={() => setProfessionalType(type)}
                        className={`brutal-button ${professionalType === type ? '' : 'secondary'}`}
                        style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem 0.25rem' }}>
                        {type === 'nurse' ? 'Nurse' : type === 'therapist' ? 'Therapist' : 'EMS'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-label)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{role === 'professional' ? 'Full legal name' : 'Facility name'}</label>
                <input type="text" className="brutal-input" placeholder={role === 'professional' ? "Sarah Bell" : "St. Jude General"} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </>
          )}
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-label)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Email</label>
            <input type="email" className="brutal-input" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          {view !== 'forgot_password' && (
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-label)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                <span>Password</span>
                {view === 'login' && (
                  <span onClick={() => setView('forgot_password')} style={{ cursor: 'pointer', color: 'var(--color-accent-dark)', textTransform: 'none', letterSpacing: 0 }}>Forgot?</span>
                )}
              </label>
              <input type="password" className="brutal-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          
          <button type="submit" disabled={loading} className="brutal-button" style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? "Just a moment…" : view === 'signup' ? "Create account" : view === 'forgot_password' ? "Send reset link" : "Sign in"}
          </button>
        </form>

        {view === 'login' ? (
          <button type="button" onClick={() => setView('signup')} className="brutal-button secondary" style={{ width: '100%', marginTop: '0.5rem', border: 'none', boxShadow: 'none' }}>New here? Create an account</button>
        ) : (
          <button type="button" onClick={() => setView('login')} className="brutal-button secondary" style={{ width: '100%', marginTop: '0.5rem', border: 'none', boxShadow: 'none' }}>Back to sign in</button>
        )}
      </motion.div>
    </div>
  );
}
