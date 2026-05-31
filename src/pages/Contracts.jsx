import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Clock, XCircle, Download, Eye } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_CONTRACTS = [
  { id: 1, title: 'ICU Night Shift Contract', facility: 'Memorial Hospital', startDate: '2026-05-01', endDate: '2026-08-01', rate: '$55/hr', shifts: 36, status: 'active' },
  { id: 2, title: 'Weekend Coverage Agreement', facility: 'City Medical', startDate: '2026-04-15', endDate: '2026-07-15', rate: '$48/hr', shifts: 24, status: 'active' },
  { id: 3, title: 'Travel Nurse Assignment', facility: 'Regional Med Center', startDate: '2026-03-01', endDate: '2026-05-31', rate: '$62/hr', shifts: 48, status: 'completed' },
  { id: 4, title: 'PRN Float Pool', facility: 'Sunrise Care', startDate: '2026-06-01', endDate: '2026-12-31', rate: '$42/hr', shifts: 0, status: 'pending' },
];

const statusConfig = {
  active: { label: 'ACTIVE', class: 'success' },
  completed: { label: 'COMPLETED', class: 'accent' },
  pending: { label: 'PENDING', class: 'warning' },
  terminated: { label: 'TERMINATED', class: 'alert' },
};

export default function Contracts() {
  const [filter, setFilter] = useState('all');
  const filtered = MOCK_CONTRACTS.filter(c => filter === 'all' || c.status === filter);

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>CONTRACTS</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your staffing contracts and agreements.</p>
        </motion.div>

        <motion.div variants={itemV} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['all', 'active', 'pending', 'completed'].map(s => (
            <button key={s} className={`brutal-button tiny ${filter === s ? '' : 'secondary'}`} onClick={() => setFilter(s)}>
              {s.toUpperCase()} {s !== 'all' && `(${MOCK_CONTRACTS.filter(c => c.status === s).length})`}
            </button>
          ))}
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(c => {
            const sc = statusConfig[c.status];
            return (
              <motion.div key={c.id} variants={itemV} className="brutal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <FileText size={18} />
                      <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{c.title}</h3>
                      <span className={`brutal-badge ${sc.class}`} style={{ fontSize: '0.65rem' }}>{sc.label}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                      <span>{c.facility}</span>
                      <span>{c.startDate} → {c.endDate}</span>
                      <span>{c.shifts} shifts</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem' }}>{c.rate}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button className="brutal-button tiny secondary" onClick={() => alert('Viewing contract...')}><Eye size={12} /> VIEW</button>
                      <button className="brutal-button tiny secondary" onClick={() => alert('Downloading...')}><Download size={12} /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </Layout>
  );
}
