import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Users, DollarSign, CheckCircle, Share2, Link } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_REFERRALS = [
  { id: 1, name: 'Jessica Adams', status: 'completed', role: 'RN', bonus: 250, date: '2026-04-20' },
  { id: 2, name: 'Tom Wilson', status: 'onboarding', role: 'CNA', bonus: 0, date: '2026-05-10' },
  { id: 3, name: 'Anna Kim', status: 'pending', role: 'LPN', bonus: 0, date: '2026-05-14' },
];

export default function Referrals() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'ERGO-SJ2026';
  const referralLink = `https://ergo.health/join?ref=${referralCode}`;

  const copyCode = () => { navigator.clipboard?.writeText(referralLink); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const totalBonus = MOCK_REFERRALS.filter(r => r.status === 'completed').reduce((s, r) => s + r.bonus, 0);

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>REFERRAL PROGRAM</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Earn $250 for every qualified professional you refer.</p>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={itemV} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="brutal-card compact no-hover" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <span className="brutal-metric-label">TOTAL EARNED</span>
            <div className="brutal-metric-value" style={{ color: 'var(--color-success)' }}>${totalBonus}</div>
          </div>
          <div className="brutal-card compact no-hover" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <span className="brutal-metric-label">REFERRALS SENT</span>
            <div className="brutal-metric-value" style={{ color: 'var(--color-accent)' }}>{MOCK_REFERRALS.length}</div>
          </div>
          <div className="brutal-card compact no-hover" style={{ borderLeft: '4px solid var(--color-purple)' }}>
            <span className="brutal-metric-label">CONVERSION RATE</span>
            <div className="brutal-metric-value" style={{ color: 'var(--color-purple)' }}>33%</div>
          </div>
        </motion.div>

        {/* Referral Code */}
        <motion.div variants={itemV} className="brutal-card no-hover" style={{ textAlign: 'center', padding: '2.5rem', marginBottom: '1.5rem' }}>
          <Gift size={40} style={{ margin: '0 auto 1rem', color: 'var(--color-accent)' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>YOUR REFERRAL CODE</h2>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.05em', marginBottom: '1rem', padding: '0.75rem', border: '3px dashed var(--color-accent)', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
            {referralCode}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="brutal-button small" onClick={copyCode}>
              {copied ? <><CheckCircle size={14} /> COPIED!</> : <><Copy size={14} /> COPY LINK</>}
            </button>
            <button className="brutal-button small secondary" onClick={() => alert('Sharing...')}><Share2 size={14} /> SHARE</button>
          </div>
        </motion.div>

        {/* Referral List */}
        <motion.div variants={itemV}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>YOUR REFERRALS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {MOCK_REFERRALS.map(r => (
              <div key={r.id} className="brutal-card compact" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, border: '2px solid var(--color-border)' }}>
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{r.role} • Referred {r.date}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`brutal-badge ${r.status === 'completed' ? 'success' : r.status === 'onboarding' ? 'accent' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                    {r.status.toUpperCase()}
                  </span>
                  {r.bonus > 0 && <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>+${r.bonus}</div>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
