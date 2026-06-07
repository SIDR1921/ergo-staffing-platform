import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, MapPin, DollarSign, FileText, BarChart3, Sparkles,
  ArrowUpRight, Check, Star, Building2, Clock,
} from 'lucide-react';
import Logo from '../components/Logo';
import './Landing.css';

/* ---- content ----------------------------------------------------------- */
const STATS = [
  { value: '15K', suffix: '+', label: 'Clinicians' },
  { value: '2,400', suffix: '+', label: 'Facilities' },
  { value: '98.7', suffix: '%', label: 'Fill rate', em: true },
  { value: '< 4', suffix: 'hrs', label: 'Time to fill' },
];

const VERTICALS = ['Nursing', 'EMS', 'NEMT', 'Rehab', 'DSP / Home Care', 'Allied Health', 'Paramedic', 'Physical Therapy'];

const FEATURES = [
  { n: '01', icon: Sparkles, title: 'Instant matching', desc: 'AI ranks qualified clinicians against every open shift in seconds — by distance, credentials, reliability and acceptance probability.' },
  { n: '02', icon: ShieldCheck, title: 'Compliance engine', desc: 'Automated credentialing, NPI + OIG verification, and expiration tracking. Audit-ready, always-on, zero spreadsheets.' },
  { n: '03', icon: MapPin, title: 'EVV & geofencing', desc: 'Verified GPS, QR, and kiosk clock-in with geo-fence validation and fraud detection on every visit.' },
  { n: '04', icon: DollarSign, title: 'Same-day pay', desc: 'Instant Pay lands funds within hours of clock-out. Stripe-powered, W-9 handled, taxes squared away.' },
  { n: '05', icon: FileText, title: 'AI onboarding', desc: 'Upload a resume — we parse it, validate your license, and build a shift-ready profile in minutes.' },
  { n: '06', icon: BarChart3, title: 'Live intelligence', desc: 'Real-time fill rates, spend analytics, and predictive staffing so facilities never run short.' },
];

const ROLES = [
  { abbr: 'RN', name: 'Registered Nurse', shifts: '3,200+ open', rate: '$45–85' },
  { abbr: 'LPN', name: 'Licensed Practical Nurse', shifts: '1,800+ open', rate: '$32–55' },
  { abbr: 'CNA', name: 'Certified Nursing Asst.', shifts: '4,100+ open', rate: '$22–38' },
  { abbr: 'PT', name: 'Physical Therapist', shifts: '890+ open', rate: '$55–95' },
  { abbr: 'EMS', name: 'EMT / Paramedic', shifts: '1,200+ open', rate: '$28–52' },
  { abbr: 'OT', name: 'Occupational Therapist', shifts: '640+ open', rate: '$50–88' },
];

const QUOTES = [
  { mark: '“', text: 'PRN Float changed how I work. I pick shifts that fit my life and get paid the same day.', name: 'Sarah M. · RN' },
  { mark: '“', text: 'Our fill rate went from 72% to 98%. The compliance dashboard saves us twenty hours a week.', name: 'Dr. James L. · CMO' },
  { mark: '“', text: 'I uploaded my resume and the AI filled everything. I was picking up shifts the same day.', name: 'Maria K. · CNA' },
];

/* ---- motion ------------------------------------------------------------ */
const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.75, ease: [0.16, 1, 0.3, 1] } }),
};
const line = {
  hidden: { y: '110%' },
  show: (i = 0) => ({ y: '0%', transition: { delay: 0.15 + i * 0.12, duration: 0.85, ease: [0.16, 1, 0.3, 1] } }),
};
const LineMask = ({ children, i }) => (
  <span style={{ display: 'block', overflow: 'hidden' }}>
    <motion.span style={{ display: 'block' }} variants={line} custom={i} initial="hidden" animate="show">
      {children}
    </motion.span>
  </span>
);

export default function Landing() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('professional');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const go = () => navigate('/login');
  const handleWaitlist = (e) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 2600); };

  return (
    <div className="lp-root">
      <div className="lp-aura"><span /><span /><span /></div>

      {/* NAV */}
      <nav className="lp-nav">
        <Logo size={36} />
        <div className="lp-nav-links">
          <a className="lp-nav-link lp-hide-sm" href="#how">How it works</a>
          <a className="lp-nav-link lp-hide-sm" href="#roles">Open roles</a>
          <a className="lp-nav-link lp-hide-sm" href="#join">Facilities</a>
          <a className="lp-nav-link" onClick={go} style={{ cursor: 'pointer' }}>Log in</a>
          <button className="lp-btn lp-btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem' }} onClick={go}>
            Get started <ArrowUpRight size={15} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="lp-section lp-hero">
        <div className="lp-wrap lp-hero-grid">
          <div>
            <motion.div className="lp-eyebrow" variants={reveal} custom={0} initial="hidden" animate="show">
              <span className="lp-livedot" /> AI-native healthcare staffing
            </motion.div>

            <h1 className="lp-display lp-h1">
              <LineMask i={0}>The shift</LineMask>
              <LineMask i={1}>marketplace that</LineMask>
              <LineMask i={2}><em>thinks</em> for itself.</LineMask>
            </h1>

            <motion.p className="lp-sub" variants={reveal} custom={5} initial="hidden" animate="show">
              Instant AI matching, automated compliance, verified clock-in, and same-day pay — for the clinicians and facilities who keep care running.
            </motion.p>

            <motion.div className="lp-hero-cta" variants={reveal} custom={6} initial="hidden" animate="show">
              <button className="lp-btn lp-btn-primary" onClick={go}>Start picking up shifts <ArrowUpRight size={17} /></button>
              <button className="lp-btn lp-btn-ghost" onClick={go}>Post a shift <Building2 size={16} /></button>
            </motion.div>

            <motion.div className="lp-trust" variants={reveal} custom={7} initial="hidden" animate="show">
              <span><ShieldCheck size={14} /> HIPAA-ready</span>
              <span><Check size={14} /> NPI + OIG verified</span>
              <span><Clock size={14} /> Live in 38 states</span>
            </motion.div>
          </div>

          {/* visual: pulse + floating cards */}
          <motion.div className="lp-hero-visual"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
            <svg className="lp-pulse-svg" viewBox="0 0 500 440" fill="none" preserveAspectRatio="xMidYMid meet">
              <path className="lp-pulse-path"
                d="M6 300 H150 l24 -72 l30 156 l26 -214 C250 168 272 250 322 250 C384 250 404 116 478 86" />
            </svg>

            <div className="lp-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span className="lp-chip"><Check size={11} /> Verified shift</span>
                <Logo variant="mark" size={26} />
              </div>
              <div className="lp-mono" style={{ fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--lp-muted)' }}>Memorial Hospital · 0.8 mi</div>
              <div className="lp-serif" style={{ fontSize: '1.5rem', fontWeight: 600, margin: '4px 0 2px' }}>ICU Registered Nurse</div>
              <div style={{ color: 'var(--lp-ink-soft)', fontSize: '0.92rem' }}>Today · 7:00 PM – 7:00 AM</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '18px 0 16px' }}>
                <span className="lp-serif" style={{ fontSize: '2.2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>$82</span>
                <span className="lp-mono" style={{ fontSize: '0.74rem', color: 'var(--lp-muted)' }}>/hr · Instant Pay</span>
              </div>
              <button className="lp-btn lp-btn-light" style={{ width: '100%', justifyContent: 'center' }} onClick={go}>
                Accept shift <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="lp-card-2">
              <div className="lp-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--lp-lav-2)', marginBottom: 4 }}>
                <span className="lp-livedot" style={{ display: 'inline-block', marginRight: 6 }} /> AI matched
              </div>
              <div className="lp-serif" style={{ fontSize: '1.15rem', fontWeight: 600 }}>1.4 seconds</div>
            </div>
          </motion.div>
        </div>

        {/* STATS */}
        <div className="lp-wrap">
          <motion.div className="lp-stats" variants={reveal} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {STATS.map((s) => (
              <div className="lp-stat" key={s.label}>
                <div className="lp-stat-num">{s.em ? <em>{s.value}</em> : s.value}<span style={{ fontSize: '1.3rem' }}>{s.suffix}</span></div>
                <div className="lp-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* MARQUEE BAND */}
      <div className="lp-band">
        <div className="lp-marquee">
          {[0, 1].map((dup) => (
            <span key={dup} aria-hidden={dup === 1}>
              {VERTICALS.map((v) => (
                <React.Fragment key={v}>{v} <i className="lp-star">✺</i> </React.Fragment>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="lp-section lp-feat" id="how">
        <div className="lp-wrap">
          <motion.div className="lp-kicker" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}>What runs underneath</motion.div>
          <motion.h2 className="lp-display lp-h2" variants={reveal} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}>
            An operating system for <em>on-demand</em> care.
          </motion.h2>

          <div className="lp-feat-list">
            {FEATURES.map((f, i) => (
              <motion.div className="lp-feat-row" key={f.n}
                variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
                <div className="lp-feat-num">{f.n}</div>
                <div className="lp-feat-title">
                  <div className="lp-feat-ico"><f.icon size={20} /></div>
                  <h3 className="lp-feat-h3">{f.title}</h3>
                </div>
                <p className="lp-feat-desc">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BIG PROOF */}
      <section className="lp-section lp-proof">
        <div className="lp-wrap">
          <motion.div className="lp-proof-num" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}>98.7%</motion.div>
          <div className="lp-proof-cap">average shift fill rate across the network</div>
        </div>
      </section>

      {/* ROLES */}
      <section className="lp-section lp-roles" id="roles">
        <div className="lp-wrap">
          <motion.div className="lp-kicker" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}>Now hiring everywhere</motion.div>
          <motion.h2 className="lp-display lp-h2" variants={reveal} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}>
            Find your next <em>shift</em>.
          </motion.h2>

          <div style={{ marginTop: 44 }}>
            {ROLES.map((r, i) => (
              <motion.div className="lp-role" key={r.abbr} onClick={go} style={{ cursor: 'pointer' }}
                variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}>
                <span className="lp-role-abbr">{r.abbr}</span>
                <span className="lp-role-name">{r.name}</span>
                <span className="lp-role-shifts">{r.shifts}</span>
                <span className="lp-role-rate">{r.rate}<span className="lp-mono" style={{ fontSize: '0.7rem', fontStyle: 'normal', color: 'var(--lp-muted)' }}>/hr</span></span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTES */}
      <section className="lp-section">
        <div className="lp-wrap lp-quotes">
          {QUOTES.map((q, i) => (
            <motion.div className="lp-quote" key={i}
              variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <div className="lp-quote-mark">{q.mark}</div>
              <p className="lp-quote-text">{q.text}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="lp-quote-name">{q.name}</span>
                <span style={{ display: 'flex', gap: 2 }}>{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={13} fill="var(--lp-violet)" stroke="var(--lp-violet)" />)}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta" id="join">
        <div className="lp-cta-glow" />
        <div className="lp-cta-inner">
          <motion.h2 variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true }}>
            Join the <em>float pool</em>.
          </motion.h2>
          <motion.p variants={reveal} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}>
            Get early access and a $100 credit when we launch in your area.
          </motion.p>
          <motion.div variants={reveal} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="lp-toggle">
              <button className={tab === 'professional' ? 'on' : ''} onClick={() => setTab('professional')}>Clinician</button>
              <button className={tab === 'facility' ? 'on' : ''} onClick={() => setTab('facility')}>Facility</button>
            </div>
          </motion.div>
          <motion.form className="lp-form" onSubmit={handleWaitlist}
            variants={reveal} custom={3} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <input className="lp-input" type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button type="submit" className="lp-btn lp-btn-light" style={{ flex: 'none' }}>
              {submitted ? <><Check size={16} /> Joined</> : <>Join <ArrowUpRight size={16} /></>}
            </button>
          </motion.form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div style={{ maxWidth: 300 }}>
            <Logo size={34} tone="dark" />
            <p style={{ marginTop: 14, fontSize: '0.88rem', lineHeight: 1.6 }}>
              The AI-native marketplace for on-demand healthcare work.
            </p>
          </div>
          <div className="lp-foot-col">
            <span className="lp-foot-h">Clinicians</span>
            <a onClick={go} style={{ cursor: 'pointer' }}>Find shifts</a>
            <a onClick={go} style={{ cursor: 'pointer' }}>Instant pay</a>
            <a onClick={go} style={{ cursor: 'pointer' }}>Onboarding</a>
          </div>
          <div className="lp-foot-col">
            <span className="lp-foot-h">Facilities</span>
            <a onClick={go} style={{ cursor: 'pointer' }}>Post a shift</a>
            <a onClick={go} style={{ cursor: 'pointer' }}>Compliance</a>
            <a onClick={go} style={{ cursor: 'pointer' }}>Billing</a>
          </div>
          <div className="lp-foot-col">
            <span className="lp-foot-h">Company</span>
            <a href="mailto:support@ergoconscious.com">Support</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 PRN Float · prnfloat.com</span>
          <span>support@ergoconscious.com</span>
        </div>
      </footer>
    </div>
  );
}
