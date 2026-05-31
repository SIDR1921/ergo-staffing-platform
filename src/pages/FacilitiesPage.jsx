import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Star, Users, Search, Phone, Mail, Globe, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_FACILITIES = [
  { id: 1, name: 'Memorial Hospital', type: 'Hospital', location: 'Downtown, CA', rating: 4.8, reviews: 124, activeShifts: 23, verified: true, specialties: ['ICU', 'ER', 'Med-Surg'], phone: '(555) 100-0001' },
  { id: 2, name: 'City Medical Center', type: 'Medical Center', location: 'Midtown, CA', rating: 4.5, reviews: 89, activeShifts: 15, verified: true, specialties: ['Outpatient', 'Pediatrics'], phone: '(555) 100-0002' },
  { id: 3, name: 'Sunrise Care Center', type: 'Long-term Care', location: 'Westside, CA', rating: 4.2, reviews: 67, activeShifts: 8, verified: true, specialties: ['Memory Care', 'Rehab'], phone: '(555) 100-0003' },
  { id: 4, name: 'Regional Med Center', type: 'Hospital', location: 'North County, CA', rating: 4.6, reviews: 156, activeShifts: 31, verified: true, specialties: ['Surgery', 'Cardiac', 'OB'], phone: '(555) 100-0004' },
  { id: 5, name: 'Pacific Rehab', type: 'Rehabilitation', location: 'East Side, CA', rating: 4.0, reviews: 34, activeShifts: 5, verified: false, specialties: ['PT', 'OT'], phone: '(555) 100-0005' },
  { id: 6, name: 'Metro EMS Station', type: 'EMS', location: 'Central, CA', rating: 4.7, reviews: 45, activeShifts: 12, verified: true, specialties: ['Paramedic', 'EMT'], phone: '(555) 100-0006' },
];

export default function FacilitiesPage() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filtered = MOCK_FACILITIES.filter(f => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && f.type !== filterType) return false;
    return true;
  });

  const types = [...new Set(MOCK_FACILITIES.map(f => f.type))];

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>FACILITY DIRECTORY</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Browse healthcare facilities in your network.</p>
        </motion.div>

        <motion.div variants={itemV} className="brutal-card compact no-hover" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="brutal-input small" placeholder="Search facilities..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
          </div>
          <select className="brutal-input small" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
          {filtered.map((f, i) => (
            <motion.div key={f.id} variants={itemV} custom={i} className="brutal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{f.name}</h3>
                    {f.verified && <CheckCircle size={16} color="var(--color-success)" />}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <MapPin size={12} /> {f.location}
                  </div>
                </div>
                <span className="brutal-badge" style={{ fontSize: '0.65rem' }}>{f.type.toUpperCase()}</span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', padding: '0.75rem 0', borderTop: '2px dashed var(--color-border)', borderBottom: '2px dashed var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Star size={14} fill="var(--color-warning)" stroke="var(--color-warning)" />
                  <span style={{ fontWeight: 600 }}>{f.rating}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>({f.reviews})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Users size={14} />
                  <span style={{ fontWeight: 600 }}>{f.activeShifts}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>open shifts</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {f.specialties.map(s => (
                  <span key={s} className="brutal-badge" style={{ fontSize: '0.6rem', background: 'rgba(0,229,255,0.1)', border: '1px solid var(--color-accent)' }}>{s}</span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="brutal-button small" style={{ flex: 1 }}>VIEW SHIFTS</button>
                <button className="brutal-button small secondary"><Phone size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </Layout>
  );
}
