import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Key, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard'); // will redirect based on role in reality
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      navigate('/dashboard');
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
        
        alert("Registration successful! Logging you in...");
        navigate(`/${role}`);
      } else if (view === 'login') {
        await signIn(email, password);
        // We'd ideally wait for profile fetch to route properly, 
        // but for now redirecting to generic dashboard 
        navigate('/dashboard'); 
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem', border: '2px solid var(--color-border)', boxShadow: '4px 4px 0px var(--color-border)' }}>
            <Activity size={32} strokeWidth={3} />
            <h1 style={{ fontSize: '2rem', margin: 0 }}>ERGO</h1>
          </div>
        </div>

        <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
          {view === 'signup' ? "INITIALIZE CLEARANCE" : view === 'forgot_password' ? "RECOVER CLEARANCE" : "SECURE PORTAL"}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 'var(--space-md)' }}>
          <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> HIPAA COMPLIANT SYSTEM
        </p>

        {error && <div className="brutal-card bg-alert text-alert" style={{ color: '#fff', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        {message && <div className="brutal-card" style={{ backgroundColor: 'var(--color-success)', color: '#000', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{message}</div>}

        {/* OAuth Providers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button type="button" onClick={handleGoogleSignIn} className="brutal-button secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/><path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77a4.73 4.73 0 0 1-4.45-3.23H1.87v2.08A8 8 0 0 0 8.98 17Z"/><path fill="#FBBC05" d="M4.53 10.59a4.8 4.8 0 0 1 0-3.17V5.33H1.87a8 8 0 0 0 0 7.33l2.66-2.08Z"/><path fill="#EA4335" d="M8.98 3.58c1.16 0 2.23.4 3.06 1.2l2.37-2.26A8 8 0 0 0 1.87 5.33L4.53 7.4a4.77 4.77 0 0 1 4.45-3.83Z"/></svg>
            CONTINUE WITH GOOGLE
          </button>
          <button type="button" onClick={handleAppleSignIn} className="brutal-button" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: '#000', color: '#fff' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="#fff"><path d="M13.71 9.43c-.02-1.85 1.51-2.75 1.58-2.8a3.45 3.45 0 0 0-2.72-1.47c-1.14-.12-2.25.68-2.83.68-.6 0-1.5-.67-2.47-.65a3.63 3.63 0 0 0-3.06 1.87c-1.32 2.28-.34 5.63.93 7.48.63.91 1.38 1.92 2.35 1.88.95-.04 1.31-.61 2.46-.61 1.14 0 1.46.61 2.45.59.1 0 1.73-1 2.35-1.89a7.92 7.92 0 0 0 1.07-2.19 3.3 3.3 0 0 1-2.1-3.08ZM11.75 3.7a3.36 3.36 0 0 0 .77-2.42 3.43 3.43 0 0 0-2.22 1.15 3.2 3.2 0 0 0-.8 2.33 2.83 2.83 0 0 0 2.25-1.06Z"/></svg>
            CONTINUE WITH APPLE
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
                <button type="button" onClick={() => setRole('professional')} className={`brutal-button ${role === 'professional' ? '' : 'secondary'}`} style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>PROFESSIONAL</button>
                <button type="button" onClick={() => setRole('facility')} className={`brutal-button ${role === 'facility' ? '' : 'secondary'}`} style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem', backgroundColor: role === 'facility' ? 'var(--color-alert)' : '', color: role === 'facility' ? '#fff' : '' }}>FACILITY MANAGER</button>
              </div>

              {role === 'professional' && (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>SPECIALTY TYPE</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['nurse', 'therapist', 'ems'].map(type => (
                      <button key={type} type="button" onClick={() => setProfessionalType(type)}
                        className={`brutal-button ${professionalType === type ? '' : 'secondary'}`}
                        style={{ flex: 1, fontSize: '0.7rem', padding: '0.4rem 0.25rem' }}>
                        {type === 'nurse' ? '🩺 NURSE' : type === 'therapist' ? '🧠 THERAPIST' : '🚑 EMS'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>FULL LEGAL NAME</label>
                <input type="text" className="brutal-input" placeholder={role === 'professional' ? "SARAH BELL" : "ST. JUDE GENERAL"} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            </>
          )}
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              {role === 'facility' && view === 'signup' ? "FACILITY EMAIL" : "PROFESSIONAL ID (EMAIL)"}
            </label>
            <input type="email" className="brutal-input" placeholder="ENTER EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          {view !== 'forgot_password' && (
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                <span>ACCESS CODE</span>
                {view === 'login' && (
                  <span onClick={() => setView('forgot_password')} style={{ cursor: 'pointer', color: 'var(--color-accent)', textDecoration: 'underline' }}>FORGOT?</span>
                )}
              </label>
              <input type="password" className="brutal-input" placeholder="ENTER PASSWORD" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          
          <button type="submit" disabled={loading} className="brutal-button" style={{ marginTop: '1rem', width: '100%', opacity: loading ? 0.7 : 1 }}>
            {loading ? "PROCESSING..." : view === 'signup' ? "REGISTER ACCOUNT" : view === 'forgot_password' ? "SEND RESET LINK" : "AUTHENTICATE SESSION"}
          </button>
        </form>

        {view === 'login' ? (
          <button type="button" onClick={() => setView('signup')} className="brutal-button secondary" style={{ width: '100%', marginTop: '0.5rem', border: 'none', boxShadow: 'none' }}>NO CLEARANCE? REGISTER</button>
        ) : (
          <button type="button" onClick={() => setView('login')} className="brutal-button secondary" style={{ width: '100%', marginTop: '0.5rem', border: 'none', boxShadow: 'none' }}>RETURN TO LOGIN</button>
        )}
      </motion.div>
    </div>
  );
}
