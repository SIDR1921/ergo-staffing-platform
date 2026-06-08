import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Key } from 'lucide-react';
import { auth } from '../lib/firebase';
import Logo from '../components/Logo';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid or expired recovery link. Please request a new one.");
    } else {
      verifyPasswordResetCode(auth, oobCode).catch(err => {
        setError("Invalid or expired recovery link. Please request a new one.");
      });
    }
  }, [oobCode]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!oobCode) return;
    setError(null);
    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password successfully updated!");
      setTimeout(() => navigate('/login'), 2000);
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
          <Key size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} /> Set a new password
        </h2>
        
        {error && <div className="brutal-card bg-alert text-alert" style={{ color: '#fff', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        {message && <div className="brutal-card" style={{ backgroundColor: 'var(--color-success)', color: '#000', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>{message}</div>}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontFamily: 'var(--font-label)', fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
              New password
            </label>
            <input
              type="password"
              className="brutal-input"
              placeholder="Enter a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!!message || !oobCode}
            />
          </div>
          
          <button type="submit" disabled={loading || !!message || !oobCode} className="brutal-button" style={{ marginTop: '1rem', width: '100%' }}>
            {loading ? "Just a moment…" : "Update password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
