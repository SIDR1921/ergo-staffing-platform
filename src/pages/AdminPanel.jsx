import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, BarChart3, Settings, Search, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, Activity } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_USERS = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', role: 'professional', type: 'RN', status: 'active', joined: '2026-01-15', shifts: 47 },
  { id: 2, name: 'Memorial Hospital', email: 'hr@memorial.org', role: 'facility', type: 'Hospital', status: 'active', joined: '2025-11-20', shifts: 234 },
  { id: 3, name: 'Michael Chen', email: 'michael@email.com', role: 'professional', type: 'LPN', status: 'suspended', joined: '2026-03-01', shifts: 12 },
  { id: 4, name: 'City Medical Center', email: 'admin@citymed.org', role: 'facility', type: 'Clinic', status: 'active', joined: '2026-02-10', shifts: 89 },
  { id: 5, name: 'Emily Rodriguez', email: 'emily@email.com', role: 'professional', type: 'CNA', status: 'active', joined: '2026-04-05', shifts: 8 },
  { id: 6, name: 'David Park', email: 'david@email.com', role: 'professional', type: 'EMT', status: 'pending', joined: '2026-05-10', shifts: 0 },
];

const METRICS = [
  { label: 'TOTAL USERS', value: '1,247', change: '+12%', icon: Users, color: 'var(--color-accent)' },
  { label: 'ACTIVE SHIFTS', value: '342', change: '+8%', icon: Activity, color: 'var(--color-success)' },
  { label: 'FILL RATE', value: '98.7%', change: '+2.1%', icon: TrendingUp, color: 'var(--color-purple)' },
  { label: 'MONTHLY REVENUE', value: '$1.2M', change: '+15%', icon: DollarSign, color: 'var(--color-warning)' },
];

export default function AdminPanel() {
  const [tab, setTab] = useState('superadmin'); // superadmin, ceo, cto, ops, compliance, payroll, marketing, accountmgr
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const triggerSurgeNotification = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    
    let permission = Notification.permission;
    if (permission !== "granted" && permission !== "denied") {
      permission = await Notification.requestPermission();
    }
    
    if (permission === "granted") {
      new Notification("🚀 SURGE PRICING ACTIVE", {
        body: "Austin Metro: 14 open shifts need coverage. +$15/hr surge bonus active now!",
      });
      alert("Push notification dispatched to all Austin contractors.");
    } else {
      alert("Notification permission denied by user.");
    }
  };

  const filteredUsers = MOCK_USERS.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    return true;
  });

  const statusBadge = (s) => {
    const map = { active: 'success', suspended: 'alert', pending: 'warning' };
    return <span className={`brutal-badge ${map[s] || ''}`} style={{ fontSize: '0.65rem' }}>{s.toUpperCase()}</span>;
  };

  const ROLES = [
    { id: 'superadmin', label: 'SUPER ADMIN', icon: Shield },
    { id: 'ceo', label: 'CEO', icon: TrendingUp },
    { id: 'cto', label: 'CTO / ENG', icon: Activity },
    { id: 'ops', label: 'OPS MGR', icon: Users },
    { id: 'compliance', label: 'COMPLIANCE', icon: Shield },
    { id: 'payroll', label: 'PAYROLL', icon: DollarSign },
  ];

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}><Shield size={28} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />INTERNAL OPS HUB</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Role-based AI Copilot Dashboard.</p>
        </motion.div>

        {/* Dynamic AI Insights Header */}
        <motion.div variants={itemV} className="brutal-card compact no-hover accent" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'linear-gradient(135deg, rgba(176, 164, 229, 0.2), rgba(132, 117, 200, 0.1))', border: '1px solid var(--color-accent)' }}>
          <div style={{ padding: '0.5rem', background: '#fff', borderRadius: '50%', color: 'var(--color-accent-dark)' }}>
            <Activity size={24} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>AI COPILOT INSIGHT</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {tab === 'superadmin' && 'Platform health is stable. 4 critical alerts in compliance queue.'}
              {tab === 'ceo' && 'Revenue trending +15% MoM. Expansion into Texas recommended.'}
              {tab === 'cto' && 'API Latency normal. AI matching model v2 ready for deployment.'}
              {tab === 'ops' && 'Surge pricing recommended in Austin due to 14 open shifts.'}
              {tab === 'compliance' && '23 PT licenses expiring in 14 days. 5 clinicians flagged for missing EVV.'}
              {tab === 'payroll' && 'Payroll anomaly detected: 2 contractor shifts require manual review.'}
            </p>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={itemV} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {METRICS.map(m => (
            <div key={m.label} className="brutal-card compact no-hover" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="brutal-metric-label">{m.label}</span>
                  <div className="brutal-metric-value">{m.value}</div>
                </div>
                <m.icon size={20} color={m.color} />
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-success)', marginTop: '0.25rem' }}>{m.change} this month</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <div className="brutal-tabs" style={{ width: 'max-content', display: 'flex' }}>
            {ROLES.map(t => (
              <button key={t.id} className={`brutal-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}><t.icon size={14} /> {t.label}</button>
            ))}
          </div>
        </motion.div>

        {(tab === 'superadmin' || tab === 'ops') && (
          <>
            <motion.div variants={itemV} className="brutal-card compact no-hover" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input className="brutal-input small" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
              </div>
              <select className="brutal-input small" value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: 'auto' }}>
                <option value="all">All Roles</option>
                <option value="professional">Professionals</option>
                <option value="facility">Facilities</option>
              </select>
              {tab === 'ops' && (
                <button onClick={triggerSurgeNotification} className="brutal-button small" style={{ backgroundColor: 'var(--color-accent)' }}>
                  DISPATCH SURGE ALERT
                </button>
              )}
            </motion.div>
            <motion.div variants={itemV}>
              <table className="brutal-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Type</th><th>Status</th><th>Joined</th><th>Shifts</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{u.email}</td>
                      <td><span className="brutal-badge" style={{ fontSize: '0.65rem' }}>{u.role.toUpperCase()}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{u.type}</td>
                      <td>{statusBadge(u.status)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{u.joined}</td>
                      <td style={{ fontWeight: 600 }}>{u.shifts}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="brutal-button tiny secondary" onClick={() => alert('View user: ' + u.name)}>VIEW</button>
                          {u.status === 'active' && <button className="brutal-button tiny danger" onClick={() => alert('Suspend: ' + u.name)}>SUSPEND</button>}
                          {u.status === 'suspended' && <button className="brutal-button tiny success" onClick={() => alert('Reactivate: ' + u.name)}>ACTIVATE</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        )}

        {(tab === 'ceo' || tab === 'superadmin') && (
          <motion.div variants={itemV} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { title: 'SHIFTS BY STATUS', data: [{ label: 'Open', value: 45, color: 'var(--color-warning)' }, { label: 'Filled', value: 180, color: 'var(--color-accent)' }, { label: 'Completed', value: 342, color: 'var(--color-success)' }, { label: 'Cancelled', value: 12, color: 'var(--color-alert)' }] },
              { title: 'TOP FACILITIES', data: [{ label: 'Memorial Hospital', value: 234 }, { label: 'City Medical', value: 89 }, { label: 'Sunrise Care', value: 67 }, { label: 'Regional Med', value: 45 }] },
            ].map(chart => (
              <div key={chart.title} className="brutal-card no-hover">
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>{chart.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {chart.data.map(d => (
                    <div key={d.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <span>{d.label}</span><span style={{ fontWeight: 600 }}>{d.value}</span>
                      </div>
                      <div className="brutal-progress" style={{ height: '8px' }}>
                        <div className="brutal-progress-fill" style={{ width: `${(d.value / Math.max(...chart.data.map(x => x.value))) * 100}%`, background: d.color || 'var(--color-accent)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {(tab === 'compliance' || tab === 'payroll' || tab === 'cto') && (
          <motion.div variants={itemV} className="brutal-card no-hover" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Activity size={48} style={{ color: 'var(--color-accent)', margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tab.toUpperCase()} DASHBOARD</h3>
            <p style={{ color: 'var(--color-text-muted)' }}>This specialized operations view is under construction for the next release.</p>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
