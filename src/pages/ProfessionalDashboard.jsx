import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Menu, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ShiftFeed from '../components/ShiftFeed';
import CredentialVault from '../components/CredentialVault';
import Earnings from '../components/Earnings';
import StripeCheckoutButton from '../components/StripeCheckoutButton';
import SecuritySettings from '../components/SecuritySettings';
import SettingsMenu from '../components/SettingsMenu';
import ProfileEditor from '../components/ProfileEditor';
import GPSCheckInOut from '../components/GPSCheckInOut';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function ProfessionalDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <Layout>
      <SettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onEditProfile={() => { setIsSettingsOpen(false); setIsProfileOpen(true); }} />
      <ProfileEditor isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <motion.main variants={containerVariants} initial="hidden" animate="visible"
        style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-lg)' }}>
        
        <ShiftFeed />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {/* Identity Card */}
          <motion.div variants={itemVariants} className="brutal-card" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--color-accent)', border: '2px solid var(--color-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--color-text)', fontWeight: 800, fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>
                  {userProfile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-bg)' }}>{userProfile?.full_name?.toUpperCase() || 'PROFESSIONAL'}</h3>
                <span style={{ color: 'var(--color-accent)', fontSize: '0.85rem' }}>
                  {userProfile?.professional_type?.toUpperCase() || 'PROFESSIONAL'} • TIER: {userProfile?.tier === 'priority' ? 'PRIORITY' : 'FREE'}
                </span>
              </div>
            </div>
            <button onClick={() => setIsProfileOpen(true)} className="brutal-button secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.4rem', backgroundColor: '#222', color: '#fff', border: '2px solid #444' }}>
              EDIT PROFILE
            </button>
            {userProfile?.tier !== 'priority' && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #333' }}>
                <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '0.75rem' }}>Unlock early access to high-paying shifts.</p>
                <StripeCheckoutButton planName="Priority Access" amount={49} buttonText="UPGRADE TO PRIORITY ($49/MO)" isSecondary={true} />
              </div>
            )}
          </motion.div>

          <GPSCheckInOut />
          <SecuritySettings />
          <CredentialVault />
          <Earnings />
        </div>
      </motion.main>
    </Layout>
  );
}
