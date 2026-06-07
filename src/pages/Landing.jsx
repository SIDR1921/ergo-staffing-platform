import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Zap, Shield, MapPin, Clock, Star, Users, Building2, FileCheck,
  DollarSign, ArrowRight, Sparkles, CheckCircle, BarChart3
} from 'lucide-react';
import Logo from '../components/Logo';

// Verticals served, per the platform product spec.
const VERTICALS = ['EMS', 'NEMT', 'Rehab', 'Nursing', 'DSP / Home Care', 'Allied Health'];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] } })
};

const STATS = [
  { value: '15K+', label: 'Professionals' },
  { value: '2,400+', label: 'Facilities' },
  { value: '98.7%', label: 'Fill Rate' },
  { value: '<4hrs', label: 'Time to Fill' },
];

const FEATURES = [
  { icon: Zap, title: 'INSTANT MATCHING', desc: 'AI matches qualified pros to shifts in seconds.', color: 'var(--color-accent)' },
  { icon: Shield, title: 'COMPLIANCE ENGINE', desc: 'Automated credential tracking & license verification.', color: 'var(--color-success)' },
  { icon: MapPin, title: 'GPS GEOFENCING', desc: 'Verified clock-in/out with real-time location.', color: 'var(--color-purple)' },
  { icon: DollarSign, title: 'INSTANT PAY', desc: 'Get paid within hours of completing your shift.', color: 'var(--color-warning)' },
  { icon: FileCheck, title: 'DIGITAL ONBOARDING', desc: 'AI-powered doc parsing fast-tracks your profile.', color: 'var(--color-alert)' },
  { icon: BarChart3, title: 'ANALYTICS', desc: 'Real-time staffing insights and spend analytics.', color: 'var(--color-accent)' },
];

const ROLES = [
  { title: 'REGISTERED NURSE', abbr: 'RN', shifts: '3,200+', rate: '$45-85/hr' },
  { title: 'LICENSED PRACTICAL NURSE', abbr: 'LPN', shifts: '1,800+', rate: '$32-55/hr' },
  { title: 'CERTIFIED NURSING ASST', abbr: 'CNA', shifts: '4,100+', rate: '$22-38/hr' },
  { title: 'PHYSICAL THERAPIST', abbr: 'PT', shifts: '890+', rate: '$55-95/hr' },
  { title: 'EMT / PARAMEDIC', abbr: 'EMS', shifts: '1,200+', rate: '$28-52/hr' },
  { title: 'OCCUPATIONAL THERAPIST', abbr: 'OT', shifts: '640+', rate: '$50-88/hr' },
];

const TESTIMONIALS = [
  { name: 'Sarah M., RN', text: 'PRN Float changed how I work. I pick shifts that fit my life and get paid fast.', stars: 5 },
  { name: 'Dr. James L., CMO', text: 'Our fill rate went from 72% to 98%. The compliance dashboard saves us 20hrs/week.', stars: 5 },
  { name: 'Maria K., CNA', text: 'I uploaded my resume and the AI filled everything. I was picking up shifts same day.', stars: 5 },
];

export default function Landing() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('professional');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); };

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* NAVBAR */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(249,249,246,0.85)', backdropFilter: 'blur(16px)', borderBottom: '2px solid var(--color-border)' }}>
        <Logo size={38} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="brutal-button secondary small" onClick={() => navigate('/login')}>LOG IN</button>
          <button className="brutal-button small" onClick={() => navigate('/login')}>GET STARTED <ArrowRight size={14} /></button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8rem 2rem 4rem', textAlign: 'center' }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <span className="brutal-badge accent" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', display: 'inline-block' }}>
            <Sparkles size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem' }} /> AI-POWERED STAFFING
          </span>
        </motion.div>
        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', maxWidth: '900px', lineHeight: 0.95, marginBottom: '1.5rem' }}>
          THE FUTURE OF<span style={{ display: 'block', color: 'var(--color-accent)', WebkitTextStroke: '2px var(--color-border)' }}>HEALTHCARE</span>STAFFING
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} style={{ fontSize: '1.15rem', maxWidth: '600px', color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          AI-powered matching, real-time compliance tracking, and same-day pay. Built for the modern healthcare workforce.
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="brutal-button" onClick={() => navigate('/login')} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>START PICKING UP SHIFTS <ArrowRight size={18} /></button>
          <button className="brutal-button secondary" onClick={() => navigate('/login')} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>POST A SHIFT <Building2 size={18} /></button>
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '4rem', maxWidth: '800px', width: '100%' }}>
          {STATS.map(s => (
            <div key={s.label} className="brutal-card compact no-hover" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--color-accent)' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>WHY PRN FLOAT?</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="brutal-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <div style={{ width: 48, height: 48, background: f.color, border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: 'var(--shadow-brutal-sm)' }}><f.icon size={24} /></div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROLES */}
      <section style={{ padding: '6rem 2rem', background: 'var(--color-text)', color: 'var(--color-bg)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem', color: '#fff' }}>OPEN ROLES</motion.h2>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
            {VERTICALS.map(v => (
              <span key={v} className="brutal-badge accent" style={{ fontSize: '0.75rem' }}>{v}</span>
            ))}
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {ROLES.map((r, i) => (
              <motion.div key={r.abbr} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                style={{ padding: '1.5rem', border: '2px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                whileHover={{ borderColor: 'var(--color-accent)', x: 4 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{r.shifts} open shifts</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-accent)' }}>{r.rate}</div>
                  <span className="brutal-badge accent" style={{ fontSize: '0.65rem' }}>{r.abbr}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>TRUSTED BY THE INDUSTRY</motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} className="brutal-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>{Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={18} fill="var(--color-warning)" stroke="var(--color-warning)" />)}</div>
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>"{t.text}"</p>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.85rem' }}>— {t.name}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* WAITLIST */}
      <section style={{ padding: '6rem 2rem' }}>
        <motion.div className="brutal-card no-hover" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>JOIN THE WAITLIST</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Get early access and $100 credit when we launch in your area.</p>
          <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <div className="brutal-tabs" style={{ width: 'auto' }}>
              <button className={`brutal-tab ${tab === 'professional' ? 'active' : ''}`} onClick={() => setTab('professional')}><Users size={14} /> Professional</button>
              <button className={`brutal-tab ${tab === 'facility' ? 'active' : ''}`} onClick={() => setTab('facility')}><Building2 size={14} /> Facility</button>
            </div>
          </div>
          <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: '0.5rem' }}>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="brutal-input" style={{ flex: 1 }} />
            <button type="submit" className="brutal-button" disabled={submitted}>{submitted ? <><CheckCircle size={16} /> JOINED!</> : <>JOIN <ArrowRight size={16} /></>}</button>
          </form>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '3rem 2rem', borderTop: '4px solid var(--color-border)', background: 'var(--color-text)', color: 'rgba(255,255,255,0.5)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Logo size={30} tone="dark" />
          <div style={{ fontSize: '0.8rem' }}>© 2026 PRN Float · AI Healthcare Staffing.</div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem' }}>
            <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
