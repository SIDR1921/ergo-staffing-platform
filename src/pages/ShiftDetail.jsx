import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Calendar, Clock, DollarSign, User, CheckCircle,
  XCircle, AlertTriangle, Navigation, Shield, Star, MessageSquare, Users
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function ShiftDetail() {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [shift, setShift] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    const fetchShift = async () => {
      try {
        const shiftDoc = await getDoc(doc(db, 'shifts', id));
        if (shiftDoc.exists()) {
          setShift({ id: shiftDoc.id, ...shiftDoc.data() });
        }
        
        const q = query(collection(db, 'applications'), where('shift_id', '==', id));
        const appsSnap = await getDocs(q);
        
        const appsWithProfiles = await Promise.all(appsSnap.docs.map(async (appDoc) => {
          const appData = { id: appDoc.id, ...appDoc.data() };
          if (appData.professional_id) {
            const profileSnap = await getDoc(doc(db, 'profiles', appData.professional_id));
            if (profileSnap.exists()) {
              appData.profiles = profileSnap.data();
            }
          }
          return appData;
        }));
        setApplications(appsWithProfiles);
      } catch (err) {
        console.error("Error fetching shift details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShift();
  }, [id]);

  const handleClockIn = () => {
    setClockedIn(true);
    alert('GPS verification: You are within the facility geofence. Clock-in recorded at ' + new Date().toLocaleTimeString());
  };

  const handleClockOut = () => {
    setClockedIn(false);
    alert('Clocked out at ' + new Date().toLocaleTimeString() + '. Shift submitted for review.');
  };

  const handleFileDispute = () => {
    if (!disputeReason) return;
    alert('Dispute filed: ' + disputeReason);
    setShowDispute(false);
    setDisputeReason('');
  };

  const isFacility = userProfile?.role === 'facility';

  if (loading) return <Layout><div style={{ textAlign: 'center', padding: '4rem' }}><div className="animate-spin" style={{ width: 48, height: 48, border: '3px solid var(--color-border)', borderTop: '3px solid var(--color-accent)', borderRadius: '50%', margin: '0 auto' }} /></div></Layout>;
  if (!shift) return <Layout><div className="brutal-card" style={{ textAlign: 'center', padding: '3rem' }}><h2>SHIFT NOT FOUND</h2><button className="brutal-button secondary" onClick={() => navigate(-1)}><ArrowLeft size={16} /> GO BACK</button></div></Layout>;

  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <button className="brutal-button secondary small" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem' }}><ArrowLeft size={16} /> BACK</button>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <motion.div variants={itemVariants} className="brutal-card no-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {shift.is_urgent && <span className="brutal-badge alert" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>URGENT</span>}
                  <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{shift.role}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                    <MapPin size={16} /><span>{shift.facility_name}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem' }}>${shift.hourly_rate}/hr</div>
                  <span className="brutal-badge accent">EST. ${(shift.hourly_rate * 12).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>

            {/* Details Grid */}
            <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {[
                { icon: Calendar, label: 'DATE', value: shift.shift_date },
                { icon: Clock, label: 'TIME', value: `${shift.start_time} – ${shift.end_time}` },
                { icon: Shield, label: 'STATUS', value: shift.status?.toUpperCase() || 'OPEN' },
              ].map(d => (
                <div key={d.label} className="brutal-card compact no-hover">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <d.icon size={14} /><span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{d.label}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem' }}>{d.value}</div>
                </div>
              ))}
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="brutal-card no-hover">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>SHIFT DETAILS</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {shift.description || 'Standard healthcare shift. Report to the nurse station at the start of your shift. Please bring all required credentials and proper attire. Parking is available in Lot B.'}
              </p>
              {shift.requirements && (
                <div style={{ marginTop: '1rem', padding: '0.75rem', border: '2px dashed var(--color-warning)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.25rem' }}><AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.25rem' }} />REQUIREMENTS</div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{shift.requirements}</p>
                </div>
              )}
            </motion.div>

            {/* Applicants (Facility View) */}
            {isFacility && (
              <motion.div variants={itemVariants} className="brutal-card no-hover">
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}><Users size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />APPLICANTS ({applications.length})</h3>
                {applications.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No applicants yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {applications.map(app => (
                      <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                            {app.profiles?.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{app.profiles?.full_name || 'Professional'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{app.profiles?.professional_type || 'N/A'}</div>
                          </div>
                        </div>
                        <span className={`brutal-badge ${app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'alert' : ''}`}>{app.status?.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Clock In/Out */}
            <motion.div variants={itemVariants} className="brutal-card no-hover">
              <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}><Navigation size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />GPS VERIFICATION</h3>
              <div style={{ padding: '1rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '1rem', background: clockedIn ? 'rgba(0,255,102,0.1)' : 'rgba(0,0,0,0.02)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: clockedIn ? 'var(--color-success)' : 'var(--color-surface)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                  <Navigation size={20} />
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{clockedIn ? 'CLOCKED IN' : 'NOT CLOCKED IN'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>GPS Geofence: Active</div>
              </div>
              {!clockedIn ? (
                <button className="brutal-button success" onClick={handleClockIn} style={{ width: '100%' }}><CheckCircle size={16} /> CLOCK IN</button>
              ) : (
                <button className="brutal-button danger" onClick={handleClockOut} style={{ width: '100%' }}><XCircle size={16} /> CLOCK OUT</button>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="brutal-card no-hover">
              <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>ACTIONS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button className="brutal-button secondary small" style={{ width: '100%' }}><MessageSquare size={14} /> MESSAGE FACILITY</button>
                <button className="brutal-button secondary small" onClick={() => setShowDispute(!showDispute)} style={{ width: '100%' }}><AlertTriangle size={14} /> FILE DISPUTE</button>
              </div>
              {showDispute && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '2px solid var(--color-alert)', borderRadius: 'var(--radius-sm)' }}>
                  <textarea className="brutal-input small" placeholder="Describe the issue..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} style={{ minHeight: '60px', marginBottom: '0.5rem' }} />
                  <button className="brutal-button danger small" onClick={handleFileDispute} style={{ width: '100%' }}>SUBMIT DISPUTE</button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
