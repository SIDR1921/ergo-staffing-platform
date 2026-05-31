import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Search, Download, AlertTriangle, CheckCircle, Clock, XCircle, Filter, Users, ChevronDown } from 'lucide-react';

import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_PROFESSIONALS = [
  { id: 1, name: 'Sarah Johnson', role: 'RN', facility: 'Memorial Hospital', docs: { license: 'verified', cpr: 'verified', tb: 'expiring', background: 'verified', w9: 'missing' } },
  { id: 2, name: 'Michael Chen', role: 'LPN', facility: 'City Medical', docs: { license: 'verified', cpr: 'expired', tb: 'verified', background: 'pending', w9: 'verified' } },
  { id: 3, name: 'Emily Rodriguez', role: 'CNA', facility: 'Sunrise Care', docs: { license: 'pending', cpr: 'verified', tb: 'verified', background: 'verified', w9: 'verified' } },
  { id: 4, name: 'James Williams', role: 'PT', facility: 'Regional Med', docs: { license: 'verified', cpr: 'verified', tb: 'verified', background: 'verified', w9: 'verified' } },
  { id: 5, name: 'Ashley Thompson', role: 'RN', facility: 'Memorial Hospital', docs: { license: 'verified', cpr: 'missing', tb: 'expiring', background: 'verified', w9: 'pending' } },
  { id: 6, name: 'David Park', role: 'EMT', facility: 'Metro EMS', docs: { license: 'expired', cpr: 'verified', tb: 'verified', background: 'pending', w9: 'verified' } },
];

const DOC_TYPES = ['license', 'cpr', 'tb', 'background', 'w9'];

const statusIcon = (s) => {
  switch (s) {
    case 'verified': return <CheckCircle size={14} color="var(--color-success)" />;
    case 'pending': return <Clock size={14} color="var(--color-warning)" />;
    case 'expiring': return <AlertTriangle size={14} color="var(--color-warning)" />;
    case 'expired': return <XCircle size={14} color="var(--color-alert)" />;
    case 'missing': return <XCircle size={14} color="var(--color-alert)" />;
    default: return null;
  }
};

const statusBadgeClass = (s) => {
  switch (s) {
    case 'verified': return 'success';
    case 'pending': return 'warning';
    case 'expiring': return 'warning';
    case 'expired': return 'alert';
    case 'missing': return 'alert';
    default: return '';
  }
};

export default function ComplianceDashboard() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selected, setSelected] = useState([]);

  const professionals = MOCK_PROFESSIONALS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== 'all' && p.role !== filterRole) return false;
    if (filterStatus !== 'all') {
      const statuses = Object.values(p.docs);
      if (filterStatus === 'compliant' && statuses.some(s => s !== 'verified')) return false;
      if (filterStatus === 'issues' && statuses.every(s => s === 'verified')) return false;
    }
    return true;
  });

  const totalPros = MOCK_PROFESSIONALS.length;
  const compliant = MOCK_PROFESSIONALS.filter(p => Object.values(p.docs).every(s => s === 'verified')).length;
  const expiring = MOCK_PROFESSIONALS.filter(p => Object.values(p.docs).some(s => s === 'expiring')).length;
  const missing = MOCK_PROFESSIONALS.filter(p => Object.values(p.docs).some(s => s === 'missing' || s === 'expired')).length;

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === professionals.length ? [] : professionals.map(p => p.id));

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>COMPLIANCE DASHBOARD</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Track credential status across all professionals.</p>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={itemV} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'TOTAL PROS', value: totalPros, color: 'var(--color-accent)', icon: Users },
            { label: 'FULLY COMPLIANT', value: compliant, color: 'var(--color-success)', icon: CheckCircle },
            { label: 'EXPIRING SOON', value: expiring, color: 'var(--color-warning)', icon: AlertTriangle },
            { label: 'MISSING / EXPIRED', value: missing, color: 'var(--color-alert)', icon: XCircle },
          ].map(m => (
            <div key={m.label} className="brutal-card compact no-hover" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <m.icon size={16} color={m.color} />
                <span className="brutal-metric-label">{m.label}</span>
              </div>
              <div className="brutal-metric-value" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemV} className="brutal-card compact no-hover" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="brutal-input small" placeholder="Search professionals..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.25rem' }} />
          </div>
          <select className="brutal-input small" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: '150px' }}>
            <option value="all">All Statuses</option>
            <option value="compliant">Fully Compliant</option>
            <option value="issues">Has Issues</option>
          </select>
          <select className="brutal-input small" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: 'auto', minWidth: '120px' }}>
            <option value="all">All Roles</option>
            {['RN', 'LPN', 'CNA', 'PT', 'EMT'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {selected.length > 0 && (
            <button className="brutal-button small" onClick={() => alert(`Downloading ${selected.length} compliance packets...`)}>
              <Download size={14} /> EXPORT ({selected.length})
            </button>
          )}
        </motion.div>

        {/* Table */}
        <motion.div variants={itemV}>
          <table className="brutal-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.length === professionals.length && professionals.length > 0} onChange={toggleAll} /></th>
                <th>Professional</th>
                <th>Role</th>
                <th>Facility</th>
                {DOC_TYPES.map(d => <th key={d}>{d.toUpperCase()}</th>)}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {professionals.map(p => {
                const allGood = Object.values(p.docs).every(s => s === 'verified');
                return (
                  <tr key={p.id}>
                    <td><input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><span className="brutal-badge" style={{ fontSize: '0.65rem' }}>{p.role}</span></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{p.facility}</td>
                    {DOC_TYPES.map(d => (
                      <td key={d}><span className={`brutal-badge ${statusBadgeClass(p.docs[d])}`} style={{ fontSize: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>{statusIcon(p.docs[d])} {p.docs[d].toUpperCase()}</span></td>
                    ))}
                    <td>{allGood ? <span className="brutal-badge success" style={{ fontSize: '0.65rem' }}>✓ COMPLIANT</span> : <span className="brutal-badge alert" style={{ fontSize: '0.65rem' }}>ACTION NEEDED</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {professionals.length === 0 && (
            <div className="brutal-card no-hover" style={{ textAlign: 'center', padding: '2rem', marginTop: '1rem' }}>
              <p style={{ color: 'var(--color-text-muted)' }}>No professionals match your filters.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
}
