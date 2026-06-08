import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Briefcase, GraduationCap, Shield, Save, X, AlertTriangle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const sections = [
  { id: 'details', label: 'DETAILS', icon: <User size={14} /> },
  { id: 'licenses', label: 'LICENSES', icon: <Shield size={14} /> },
  { id: 'education', label: 'EDUCATION', icon: <GraduationCap size={14} /> },
  { id: 'work', label: 'WORK HISTORY', icon: <Briefcase size={14} /> },
  { id: 'emergency', label: 'EMERGENCY', icon: <Phone size={14} /> },
];

// Module-level so its identity is stable across renders — defining this inside
// the component remounts every input on each keystroke (focus loss).
function Field({ profile, setProfile, label, field, type = 'text', placeholder = '' }) {
  const id = `pf-${field}`;
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{label}</label>
      <input id={id} type={type} className="brutal-input" placeholder={placeholder} value={profile[field]} onChange={e => setProfile(prev => ({ ...prev, [field]: e.target.value }))} />
    </div>
  );
}

export default function ProfileEditor({ isOpen, onClose }) {
  const { userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('details');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '', phone: '', address: '', date_of_birth: '', professional_type: '',
    license_number: '', license_state: '', npi_number: '',
    education_institution: '', education_degree: '', education_year: '',
    work_employer: '', work_role: '', work_years: '',
    emergency_name: '', emergency_phone: '', emergency_relationship: '',
    references: ''
  });

  const [savedMsg, setSavedMsg] = useState(null);

  useEffect(() => {
    if (userProfile) {
      // Hydrate every editable field so existing values show on open.
      setProfile(prev => Object.keys(prev).reduce((acc, key) => {
        acc[key] = userProfile[key] ?? prev[key] ?? '';
        return acc;
      }, { ...prev }));
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!userProfile?.id) return;
    setSaving(true);
    setSavedMsg(null);
    try {
      // Persist the full profile object (previously DOB / education / work /
      // references were collected but silently dropped on save).
      await updateDoc(doc(db, 'profiles', userProfile.id), { ...profile });
      setSavedMsg({ ok: true, text: 'Profile saved' });
      setTimeout(() => setSavedMsg(null), 2500);
    } catch (error) {
      setSavedMsg({ ok: false, text: 'Error saving: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998, backdropFilter: 'blur(4px)' }} />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '520px', backgroundColor: 'var(--color-bg)',
          borderLeft: '4px solid var(--color-border)', zIndex: 999, padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>EDIT PROFILE</h2>
          <button onClick={onClose} className="brutal-button secondary" style={{ padding: '0.5rem' }}><X size={20} /></button>
        </div>

        {/* Section Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`brutal-button ${activeSection === s.id ? '' : 'secondary'}`}
              style={{ fontSize: '0.65rem', padding: '0.3rem 0.5rem', flex: '1 1 auto' }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Details */}
        {activeSection === 'details' && (
          <div>
            <Field profile={profile} setProfile={setProfile} label="FULL LEGAL NAME" field="full_name" placeholder="Jane Doe" />
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>SPECIALTY TYPE</label>
              <select className="brutal-input" value={profile.professional_type} onChange={e => setProfile({...profile, professional_type: e.target.value})}>
                <option value="">Select...</option>
                <option value="nurse">Nurse (RN/LPN/CNA)</option>
                <option value="therapist">Therapist (PT/OT/ST)</option>
                <option value="ems">EMS (EMT/Paramedic)</option>
              </select>
            </div>
            <Field profile={profile} setProfile={setProfile} label="PHONE NUMBER" field="phone" type="tel" placeholder="+1 (555) 000-0000" />
            <Field profile={profile} setProfile={setProfile} label="ADDRESS" field="address" placeholder="123 Main St, City, State" />
            <Field profile={profile} setProfile={setProfile} label="DATE OF BIRTH" field="date_of_birth" type="date" />
          </div>
        )}

        {/* Licenses */}
        {activeSection === 'licenses' && (
          <div>
            <Field profile={profile} setProfile={setProfile} label="STATE LICENSE #" field="license_number" placeholder="RN-123456" />
            <Field profile={profile} setProfile={setProfile} label="ISSUING STATE" field="license_state" placeholder="California" />
            <Field profile={profile} setProfile={setProfile} label="NPI NUMBER" field="npi_number" placeholder="1234567890" />
            <div style={{ padding: '1rem', border: '2px dashed var(--color-accent)', marginTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                <Shield size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem' }} />
                License documents can be uploaded via the Credential Vault on your dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Education */}
        {activeSection === 'education' && (
          <div>
            <Field profile={profile} setProfile={setProfile} label="INSTITUTION NAME" field="education_institution" placeholder="University of Healthcare" />
            <Field profile={profile} setProfile={setProfile} label="DEGREE / CERTIFICATION" field="education_degree" placeholder="BSN, Nursing" />
            <Field profile={profile} setProfile={setProfile} label="GRADUATION YEAR" field="education_year" type="number" placeholder="2020" />
          </div>
        )}

        {/* Work History */}
        {activeSection === 'work' && (
          <div>
            <Field profile={profile} setProfile={setProfile} label="PREVIOUS EMPLOYER" field="work_employer" placeholder="St. Mary's Hospital" />
            <Field profile={profile} setProfile={setProfile} label="ROLE / POSITION" field="work_role" placeholder="Registered Nurse - ICU" />
            <Field profile={profile} setProfile={setProfile} label="YEARS OF EXPERIENCE" field="work_years" type="number" placeholder="5" />
            <Field profile={profile} setProfile={setProfile} label="REFERENCES (Name, Phone)" field="references" placeholder="Dr. Smith, (555) 123-4567" />
          </div>
        )}

        {/* Emergency Contacts */}
        {activeSection === 'emergency' && (
          <div>
            <div style={{ padding: '0.75rem', border: '2px solid var(--color-alert)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertTriangle size={16} color="var(--color-alert)" />
              <span style={{ fontSize: '0.8rem' }}>Required for HIPAA-compliant shift assignments.</span>
            </div>
            <Field profile={profile} setProfile={setProfile} label="EMERGENCY CONTACT NAME" field="emergency_name" placeholder="John Doe" />
            <Field profile={profile} setProfile={setProfile} label="EMERGENCY PHONE" field="emergency_phone" type="tel" placeholder="+1 (555) 000-0000" />
            <Field profile={profile} setProfile={setProfile} label="RELATIONSHIP" field="emergency_relationship" placeholder="Spouse" />
          </div>
        )}

        {/* Save Button */}
        <div style={{ marginTop: 'auto' }}>
          {savedMsg && (
            <div style={{ textAlign: 'center', marginBottom: '0.6rem', fontSize: '0.85rem', fontWeight: 600,
              color: savedMsg.ok ? 'var(--color-success)' : 'var(--color-alert)' }}>
              {savedMsg.text}
            </div>
          )}
          <button onClick={handleSave} disabled={saving} className="brutal-button" style={{ width: '100%' }}>
            <Save size={16} /> {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </motion.div>
    </>
  );
}
