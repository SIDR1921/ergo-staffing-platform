import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MessageSquare, CheckCircle, Clock, ChevronDown, ChevronRight, Sparkles, User, Building2, Shield, Send } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_DISPUTES = [
  {
    id: 1, shiftDate: '2026-05-10', shiftRole: 'RN — ICU Night', facility: 'Memorial Hospital', professional: 'Sarah Johnson', status: 'open', priority: 'high', createdAt: '2026-05-11',
    professionalClaim: 'I completed a full 12-hour shift but was only paid for 8 hours. The clock-out GPS recorded my departure at 7:15 AM.',
    facilityClaim: 'The nurse left the unit at 3:00 AM without notifying the charge nurse. We have security footage showing departure.',
    aiSummary: 'GPS data confirms the professional was on-site from 7:00 PM to 7:15 AM (12.25 hours). Security footage referenced by the facility has not been uploaded. Recommend requesting footage upload for resolution.',
    messages: [
      { id: 1, sender: 'Sarah Johnson', role: 'professional', text: 'I was on the floor the entire shift. I stepped out briefly at 3 AM to take a call in the hallway.', time: '2026-05-11 09:00' },
      { id: 2, sender: 'Memorial Hospital', role: 'facility', text: 'Our charge nurse reported the unit was unattended. We need to review this further.', time: '2026-05-11 10:30' },
      { id: 3, sender: 'PRN Float Support', role: 'admin', text: 'We are reviewing GPS and clock data. We will request the security footage from the facility.', time: '2026-05-11 14:00' },
    ]
  },
  {
    id: 2, shiftDate: '2026-05-08', shiftRole: 'CNA — Day Shift', facility: 'Sunrise Care Center', professional: 'Michael Chen', status: 'resolved', priority: 'medium', createdAt: '2026-05-09',
    professionalClaim: 'The facility changed my assignment mid-shift from the wing I was credentialed for to one requiring different certifications.',
    facilityClaim: 'We were short-staffed and needed coverage. The assignment change was temporary.',
    aiSummary: 'Resolved in favor of the professional. Facility acknowledged the reassignment was outside credentialed scope. Full payment issued plus 10% inconvenience bonus.',
    outcome: 'RESOLVED — Full payment + 10% bonus issued. Facility flagged for credential-mismatch warning.',
    messages: [
      { id: 1, sender: 'Michael Chen', role: 'professional', text: 'I was reassigned to the memory care wing which requires dementia care certification I don\'t have.', time: '2026-05-09 08:00' },
      { id: 2, sender: 'PRN Float Support', role: 'admin', text: 'We have confirmed the credential mismatch. Full payment will be issued.', time: '2026-05-09 16:00' },
    ]
  },
  {
    id: 3, shiftDate: '2026-05-12', shiftRole: 'LPN — Evening', facility: 'City Medical Center', professional: 'Emily Rodriguez', status: 'pending_review', priority: 'low', createdAt: '2026-05-13',
    professionalClaim: 'The break room was closed and I was unable to take my mandated 30-minute break during a 10-hour shift.',
    facilityClaim: 'Break facilities were available in the adjacent building. The information was posted on the unit board.',
    aiSummary: 'State labor law requires a 30-minute break for shifts over 6 hours. Need to verify if alternative break location was communicated to the professional at shift start.',
    messages: []
  }
];

const statusConfig = {
  open: { label: 'OPEN', bg: 'var(--color-warning)', color: '#000' },
  pending_review: { label: 'PENDING REVIEW', bg: 'var(--color-accent)', color: '#000' },
  resolved: { label: 'RESOLVED', bg: 'var(--color-success)', color: '#000' },
  escalated: { label: 'ESCALATED', bg: 'var(--color-alert)', color: '#fff' },
};

const priorityConfig = {
  high: { label: 'HIGH', bg: 'var(--color-alert)', color: '#fff' },
  medium: { label: 'MEDIUM', bg: 'var(--color-warning)', color: '#000' },
  low: { label: 'LOW', bg: 'var(--color-surface)', color: 'var(--color-text)' },
};

export default function Disputes() {
  const [expanded, setExpanded] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newMsg, setNewMsg] = useState('');

  const filtered = MOCK_DISPUTES.filter(d => filterStatus === 'all' || d.status === filterStatus);
  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const roleIcon = (role) => {
    switch (role) {
      case 'professional': return <User size={14} />;
      case 'facility': return <Building2 size={14} />;
      case 'admin': return <Shield size={14} />;
      default: return null;
    }
  };

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>DISPUTE RESOLUTION</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>AI-assisted dispute management with 3-party resolution.</p>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={itemV} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'TOTAL', value: MOCK_DISPUTES.length, color: 'var(--color-accent)' },
            { label: 'OPEN', value: MOCK_DISPUTES.filter(d => d.status === 'open').length, color: 'var(--color-warning)' },
            { label: 'PENDING', value: MOCK_DISPUTES.filter(d => d.status === 'pending_review').length, color: 'var(--color-accent)' },
            { label: 'RESOLVED', value: MOCK_DISPUTES.filter(d => d.status === 'resolved').length, color: 'var(--color-success)' },
          ].map(m => (
            <div key={m.label} className="brutal-card compact no-hover" style={{ borderLeft: `4px solid ${m.color}` }}>
              <span className="brutal-metric-label">{m.label}</span>
              <div className="brutal-metric-value" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemV} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['all', 'open', 'pending_review', 'resolved'].map(s => (
            <button key={s} className={`brutal-button tiny ${filterStatus === s ? '' : 'secondary'}`} onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'ALL' : s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </motion.div>

        {/* Dispute Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(d => {
            const isExpanded = expanded === d.id;
            const sc = statusConfig[d.status];
            const pc = priorityConfig[d.priority];
            return (
              <motion.div key={d.id} variants={itemV} className="brutal-card no-hover" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div onClick={() => toggle(d.id)} style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <AlertTriangle size={20} color={d.priority === 'high' ? 'var(--color-alert)' : 'var(--color-warning)'} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{d.shiftRole}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.facility} • {d.shiftDate} • Filed {d.createdAt}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="brutal-badge" style={{ background: pc.bg, color: pc.color, border: 'none', fontSize: '0.6rem' }}>{pc.label}</span>
                    <span className="brutal-badge" style={{ background: sc.bg, color: sc.color, border: 'none', fontSize: '0.6rem' }}>{sc.label}</span>
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ borderTop: '2px solid var(--color-border)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Claims */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div style={{ padding: '1rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <User size={14} /><span style={{ fontWeight: 600, fontSize: '0.8rem' }}>PROFESSIONAL CLAIM</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{d.professionalClaim}</p>
                          </div>
                          <div style={{ padding: '1rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <Building2 size={14} /><span style={{ fontWeight: 600, fontSize: '0.8rem' }}>FACILITY CLAIM</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{d.facilityClaim}</p>
                          </div>
                        </div>

                        {/* AI Summary */}
                        <div style={{ padding: '1rem', background: 'rgba(168,85,247,0.08)', border: '2px solid var(--color-purple)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <Sparkles size={14} color="var(--color-purple)" /><span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-purple)' }}>AI ANALYSIS</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{d.aiSummary}</p>
                        </div>

                        {/* Outcome */}
                        {d.outcome && (
                          <div style={{ padding: '1rem', background: 'rgba(103,217,164,0.08)', border: '2px solid var(--color-success)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <CheckCircle size={14} color="var(--color-success)" /><span style={{ fontWeight: 600, fontSize: '0.8rem' }}>OUTCOME</span>
                            </div>
                            <p style={{ fontSize: '0.85rem' }}>{d.outcome}</p>
                          </div>
                        )}

                        {/* Thread */}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={14} /> CONVERSATION ({d.messages.length})
                          </div>
                          <div className="brutal-timeline">
                            {d.messages.map(m => (
                              <div key={m.id} className={`brutal-timeline-item ${m.role === 'admin' ? 'active' : ''}`}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                  {roleIcon(m.role)}
                                  <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{m.sender}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{m.time}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{m.text}</p>
                              </div>
                            ))}
                          </div>
                          {d.status !== 'resolved' && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                              <input className="brutal-input small" placeholder="Add a message..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                              <button className="brutal-button small" onClick={() => { alert('Message sent: ' + newMsg); setNewMsg(''); }}><Send size={14} /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </Layout>
  );
}
