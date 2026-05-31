import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Star, Shield, Calendar, Clock, Briefcase, FileText, CheckCircle, Phone, Mail } from 'lucide-react';
import Layout from '../components/Layout';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

const MOCK_PRO = {
  id: 1, name: 'Sarah Johnson', type: 'Registered Nurse', email: 'sarah@email.com', phone: '(555) 123-4567',
  location: 'Downtown, CA', rating: 4.9, reliability: 98, totalShifts: 47, yearsExp: 8,
  specialties: ['ICU', 'ER', 'Med-Surg', 'PICU'],
  licenses: [{ state: 'CA', number: 'RN-456789', status: 'active', expires: '2027-03-15' }],
  credentials: [
    { name: 'State License', status: 'verified' },
    { name: 'CPR/BLS', status: 'verified' },
    { name: 'TB Test', status: 'verified' },
    { name: 'Background Check', status: 'verified' },
    { name: 'W-9', status: 'verified' },
  ],
  recentShifts: [
    { date: '2026-05-15', role: 'RN — ICU Night', facility: 'Memorial Hospital', rating: 5 },
    { date: '2026-05-12', role: 'RN — Day Shift', facility: 'Memorial Hospital', rating: 5 },
    { date: '2026-05-10', role: 'RN — Evening', facility: 'City Medical', rating: 4 },
  ],
};

export default function ProfessionalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pro = MOCK_PRO;

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV}>
          <button className="brutal-button secondary small" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}><ArrowLeft size={16} /> BACK</button>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          {/* Profile Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <motion.div variants={itemV} className="brutal-card no-hover" style={{ textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-accent)', border: '3px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem' }}>
                {pro.name.charAt(0)}
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{pro.name}</h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>{pro.type}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className="brutal-badge success" style={{ fontSize: '0.65rem' }}><CheckCircle size={10} /> VERIFIED</span>
                <span className="brutal-badge accent" style={{ fontSize: '0.65rem' }}>SHIFT-READY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                <MapPin size={14} /> {pro.location}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemV} className="brutal-card compact no-hover">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'RATING', value: pro.rating, icon: Star, color: 'var(--color-warning)' },
                  { label: 'RELIABILITY', value: `${pro.reliability}%`, icon: Shield, color: 'var(--color-success)' },
                  { label: 'SHIFTS', value: pro.totalShifts, icon: Calendar, color: 'var(--color-accent)' },
                  { label: 'EXPERIENCE', value: `${pro.yearsExp}yr`, icon: Briefcase, color: 'var(--color-purple)' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <s.icon size={16} color={s.color} style={{ margin: '0 auto 0.25rem', display: 'block' }} />
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>{s.value}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div variants={itemV} className="brutal-card compact no-hover">
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>CONTACT</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Phone size={14} /> {pro.phone}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}><Mail size={14} /> {pro.email}</div>
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Specialties */}
            <motion.div variants={itemV} className="brutal-card no-hover">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>SPECIALTIES</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {pro.specialties.map(s => <span key={s} className="brutal-badge accent" style={{ fontSize: '0.75rem' }}>{s}</span>)}
              </div>
            </motion.div>

            {/* Credentials */}
            <motion.div variants={itemV} className="brutal-card no-hover">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}><FileText size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />CREDENTIALS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pro.credentials.map(c => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                    <span className={`brutal-badge ${c.status === 'verified' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>{c.status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Shifts */}
            <motion.div variants={itemV} className="brutal-card no-hover">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>RECENT SHIFTS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {pro.recentShifts.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.role}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.facility} • {s.date}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {Array.from({ length: s.rating }).map((_, j) => <Star key={j} size={12} fill="var(--color-warning)" stroke="var(--color-warning)" />)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemV} style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="brutal-button" style={{ flex: 1 }}>OFFER A SHIFT</button>
              <button className="brutal-button secondary" style={{ flex: 1 }}>SEND MESSAGE</button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
