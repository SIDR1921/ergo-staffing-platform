import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Settings, CreditCard, LifeBuoy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsMenu({ isOpen, onClose, onEditProfile }) {
  const { userProfile, signOut } = useAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 998,
              backdropFilter: 'blur(4px)'
            }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '100%', maxWidth: '400px',
              backgroundColor: 'var(--color-bg)',
              borderLeft: '4px solid var(--color-border)',
              zIndex: 999, padding: 'var(--space-md)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-md)',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '2rem' }}>COMMAND MENU</h2>
              <button onClick={onClose} className="brutal-button secondary" style={{ padding: '0.5rem' }}>
                <X size={24} />
              </button>
            </div>

            <div className="brutal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <User size={24} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{userProfile?.full_name || 'User'}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{userProfile?.role.toUpperCase()} PORTAL</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button onClick={() => { if (onEditProfile) onEditProfile(); else alert("Edit Profile is available on the Professional Dashboard."); }} className="brutal-button secondary" style={{ justifyContent: 'flex-start', padding: '1rem', border: '2px solid var(--color-border)' }}>
                <User size={20} style={{ marginRight: '1rem' }} /> EDIT PROFILE
              </button>
              <button onClick={() => alert("System Preferences are locked in this environment.")} className="brutal-button secondary" style={{ justifyContent: 'flex-start', padding: '1rem', border: '2px solid var(--color-border)' }}>
                <Settings size={20} style={{ marginRight: '1rem' }} /> SYSTEM PREFERENCES
              </button>
              <button onClick={() => alert("Billing & Payouts integration via Stripe is active on the main dashboard.")} className="brutal-button secondary" style={{ justifyContent: 'flex-start', padding: '1rem', border: '2px solid var(--color-border)' }}>
                <CreditCard size={20} style={{ marginRight: '1rem' }} /> BILLING & PAYOUTS
              </button>
              <button onClick={() => alert("Support Terminal connecting... Error: Network offline.")} className="brutal-button secondary" style={{ justifyContent: 'flex-start', padding: '1rem', border: '2px solid var(--color-border)' }}>
                <LifeBuoy size={20} style={{ marginRight: '1rem' }} /> SUPPORT TERMINAL
              </button>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <button onClick={() => { onClose(); signOut(); }} className="brutal-button" style={{ width: '100%', backgroundColor: 'var(--color-alert)', color: '#fff' }}>
                TERMINATE SESSION (LOGOUT)
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
