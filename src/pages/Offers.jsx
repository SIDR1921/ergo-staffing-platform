import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle, XCircle, Clock, MapPin, DollarSign, Calendar } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_OFFERS = [
  { id: 1, role: 'RN — ICU Night', facility: 'Memorial Hospital', date: '2026-05-20', time: '7PM–7AM', rate: 55, status: 'pending', expiresIn: '2 hours', location: 'Downtown' },
  { id: 2, role: 'CNA — Day Shift', facility: 'Sunrise Care', date: '2026-05-18', time: '7AM–3PM', rate: 28, status: 'pending', expiresIn: '45 min', location: 'Westside' },
  { id: 3, role: 'LPN — Evening', facility: 'City Medical', date: '2026-05-19', time: '3PM–11PM', rate: 38, status: 'accepted', location: 'Midtown' },
  { id: 4, role: 'RN — Day Shift', facility: 'Regional Med', date: '2026-05-17', time: '7AM–7PM', rate: 50, status: 'declined', location: 'North' },
  { id: 5, role: 'PT — Morning', facility: 'Rehab Center', date: '2026-05-21', time: '8AM–12PM', rate: 65, status: 'expired', location: 'East Side' },
];

const statusConfig = {
  pending: { label: 'PENDING', class: 'warning' },
  accepted: { label: 'ACCEPTED', class: 'success' },
  declined: { label: 'DECLINED', class: 'alert' },
  expired: { label: 'EXPIRED', class: '' },
};

export default function Offers() {
  const [filter, setFilter] = useState('all');
  const filtered = MOCK_OFFERS.filter(o => filter === 'all' || o.status === filter);

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>SHIFT OFFERS</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Direct shift offers from facilities.</p>
        </motion.div>

        <motion.div variants={itemV} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['all', 'pending', 'accepted', 'declined', 'expired'].map(s => (
            <button key={s} className={`brutal-button tiny ${filter === s ? '' : 'secondary'}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'ALL' : s.toUpperCase()} {s !== 'all' && `(${MOCK_OFFERS.filter(o => o.status === s).length})`}
            </button>
          ))}
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(o => {
            const sc = statusConfig[o.status];
            return (
              <motion.div key={o.id} variants={itemV} className="brutal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{o.role}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                      <span><MapPin size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {o.facility}</span>
                      <span><Calendar size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {o.date}</span>
                      <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {o.time}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>${o.rate}/hr</div>
                    <span className={`brutal-badge ${sc.class}`} style={{ fontSize: '0.65rem' }}>{sc.label}</span>
                  </div>
                  {o.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="brutal-button small success" onClick={() => alert('Offer accepted!')}><CheckCircle size={14} /> ACCEPT</button>
                      <button className="brutal-button small danger" onClick={() => alert('Offer declined')}><XCircle size={14} /></button>
                    </div>
                  )}
                </div>
                {o.status === 'pending' && o.expiresIn && (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                    <span className="brutal-badge alert" style={{ fontSize: '0.6rem' }}><Clock size={10} /> EXPIRES IN {o.expiresIn.toUpperCase()}</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </Layout>
  );
}
