import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { auth } from '../lib/firebase';
import { multiFactor } from 'firebase/auth';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function SecuritySettings() {
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [setupState, setSetupState] = useState('idle'); // idle, enrolling, verifying
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkMfaStatus();
  }, [auth.currentUser]);

  const checkMfaStatus = async () => {
    if (auth.currentUser) {
      const mfaUser = multiFactor(auth.currentUser);
      if (mfaUser.enrolledFactors.length > 0) {
        setIsMfaEnabled(true);
      }
    }
  };

  const handleEnroll = async () => {
    setSetupState('enrolling');
    setError(null);
    
    try {
      // Firebase TOTP MFA requires Identity Platform and specific configuration.
      // Mocking the QR code step for the prototype
      setTimeout(() => {
        setQrCodeUrl('otpauth://totp/PRNFloat:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=PRNFloat');
        setSetupState('verifying');
      }, 1000);
    } catch (err) {
      setError(err.message);
      setSetupState('idle');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Mocking the verification for prototype since full GCIP requires Blaze
      if (verificationCode.length === 6) {
        setIsMfaEnabled(true);
        setSetupState('idle');
        alert("Two-Factor Authentication successfully enabled!");
      } else {
        throw new Error("Invalid verification code.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div variants={itemVariants} className="brutal-card" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} /> SECURITY CLEARANCE
        </h3>
        {isMfaEnabled ? (
          <span className="brutal-badge" style={{ backgroundColor: 'var(--color-success)', color: '#000', border: 'none' }}>
            <CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }} /> SECURE
          </span>
        ) : (
          <span className="brutal-badge" style={{ backgroundColor: 'var(--color-alert)', color: '#fff', border: 'none' }}>
            AT RISK
          </span>
        )}
      </div>

      <div style={{ padding: '1rem', border: '2px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={16} /> TWO-FACTOR AUTHENTICATION
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          Require a 6-digit code from your authenticator app to log in. Required for HIPAA compliance.
        </p>

        {error && (
          <div className="brutal-card bg-alert text-alert" style={{ color: '#fff', padding: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {isMfaEnabled ? (
          <button className="brutal-button secondary" disabled style={{ width: '100%', opacity: 0.5 }}>
            2FA ENABLED
          </button>
        ) : setupState === 'idle' ? (
          <button onClick={handleEnroll} className="brutal-button" style={{ width: '100%', backgroundColor: 'var(--color-accent)' }}>
            ENROLL IN 2FA
          </button>
        ) : setupState === 'verifying' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#fff', border: '2px solid #000' }}>
              <QRCodeSVG value={qrCodeUrl} size={150} />
            </div>
            <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              Scan with Google Authenticator or Authy, then enter the code below.
            </p>
            <form onSubmit={handleVerify} style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                className="brutal-input" 
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                style={{ flex: 1, letterSpacing: '0.2rem', textAlign: 'center' }}
                required
              />
              <button type="submit" className="brutal-button" style={{ padding: '0.5rem 1rem' }}>
                VERIFY
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>GENERATING SECURE KEY...</div>
        )}
      </div>
    </motion.div>
  );
}
