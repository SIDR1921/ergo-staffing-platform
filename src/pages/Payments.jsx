import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, TrendingUp, Clock, Download, Calendar, CheckCircle, ArrowUpRight } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_PAYMENTS = [
  { id: 1, date: '2026-05-15', shift: 'RN — ICU Night', facility: 'Memorial Hospital', hours: 12, rate: 55, total: 660, status: 'paid', method: 'Direct Deposit' },
  { id: 2, date: '2026-05-12', shift: 'RN — Day Shift', facility: 'Memorial Hospital', hours: 12, rate: 52, total: 624, status: 'paid', method: 'Direct Deposit' },
  { id: 3, date: '2026-05-10', shift: 'RN — Evening', facility: 'City Medical', hours: 8, rate: 48, total: 384, status: 'paid', method: 'Direct Deposit' },
  { id: 4, date: '2026-05-08', shift: 'RN — ICU Night', facility: 'Memorial Hospital', hours: 12, rate: 55, total: 660, status: 'processing', method: 'Direct Deposit' },
  { id: 5, date: '2026-05-05', shift: 'RN — Day Shift', facility: 'Sunrise Care', hours: 8, rate: 45, total: 360, status: 'paid', method: 'Direct Deposit' },
];

export default function Payments() {
  const [period, setPeriod] = useState('month');
  const totalEarned = MOCK_PAYMENTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.total, 0);
  const totalHours = MOCK_PAYMENTS.reduce((s, p) => s + p.hours, 0);
  const avgRate = Math.round(totalEarned / totalHours);
  const pending = MOCK_PAYMENTS.filter(p => p.status === 'processing').reduce((s, p) => s + p.total, 0);

  const { userProfile } = useAuth();
  const isFacility = userProfile?.role === 'facility';

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>PAYMENTS</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>{isFacility ? 'Invoices, billing, and shift funding.' : 'Earnings, payment history, and payouts.'}</p>
          </div>
          {/* Stripe Integration Mock UI */}
          <div className="brutal-card compact no-hover" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.8)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>PAYMENT PROCESSOR</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }}></span>
                Stripe Connected
              </div>
            </div>
            <button className="brutal-button small secondary" onClick={() => alert(isFacility ? 'Opening Stripe Billing portal...' : 'Opening Stripe Express dashboard...')}>
              MANAGE <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={itemV} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'TOTAL EARNED', value: `$${totalEarned.toLocaleString()}`, icon: DollarSign, color: 'var(--color-success)' },
            { label: 'HOURS WORKED', value: totalHours, icon: Clock, color: 'var(--color-accent)' },
            { label: 'AVG RATE', value: `$${avgRate}/hr`, icon: TrendingUp, color: 'var(--color-purple)' },
            { label: 'PENDING', value: `$${pending}`, icon: CreditCard, color: 'var(--color-warning)' },
          ].map(m => (
            <div key={m.label} className="brutal-card compact no-hover" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span className="brutal-metric-label">{m.label}</span>
                  <div className="brutal-metric-value">{m.value}</div>
                </div>
                <m.icon size={20} color={m.color} />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Period Filter */}
        <motion.div variants={itemV} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="brutal-tabs" style={{ width: 'auto', display: 'inline-flex' }}>
            {['week', 'month', 'year', 'all'].map(p => (
              <button key={p} className={`brutal-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p.toUpperCase()}</button>
            ))}
          </div>
          <button className="brutal-button small secondary" onClick={() => alert('Downloading payment report...')}><Download size={14} /> EXPORT</button>
        </motion.div>

        {/* Earnings Chart Placeholder */}
        <motion.div variants={itemV} className="brutal-card no-hover" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>EARNINGS TREND</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '120px' }}>
            {[40, 65, 55, 80, 70, 90, 85, 95, 60, 75, 88, 70].map((h, i) => (
              <div key={i} style={{ flex: 1, background: i === 11 ? 'var(--color-accent)' : 'rgba(176,164,229,0.3)', height: `${h}%`, border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', transition: 'all 0.3s' }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m} style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', flex: 1, textAlign: 'center' }}>{m}</span>
            ))}
          </div>
        </motion.div>

        {/* Payment Table */}
        <motion.div variants={itemV}>
          <table className="brutal-table">
            <thead><tr><th>Date</th><th>Shift</th><th>Facility</th><th>Hours</th><th>Rate</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {MOCK_PAYMENTS.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.date}</td>
                  <td>{p.shift}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{p.facility}</td>
                  <td>{p.hours}h</td>
                  <td>${p.rate}/hr</td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>${p.total}</td>
                  <td><span className={`brutal-badge ${p.status === 'paid' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>{p.status === 'paid' ? <><CheckCircle size={10} /> PAID</> : <><Clock size={10} /> PROCESSING</>}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>
    </Layout>
  );
}
