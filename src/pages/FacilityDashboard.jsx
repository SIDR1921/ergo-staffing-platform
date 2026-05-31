import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, PlusCircle, Shield, Users, CheckCircle, XCircle, Clock, DollarSign, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, addDoc, orderBy } from 'firebase/firestore';
import Layout from '../components/Layout';
import LiveMap from '../components/LiveMap';
import StripeCheckoutButton from '../components/StripeCheckoutButton';
import SettingsMenu from '../components/SettingsMenu';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function FacilityDashboard() {
  const { userProfile, signOut } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shiftTab, setShiftTab] = useState('open');
  const [newShift, setNewShift] = useState({
    role: 'RN', hourly_rate: 65, shift_date: '', start_time: '07:00', end_time: '19:00', is_urgent: false, bonus: 0, dynamic_pricing: false
  });

  const fetchShifts = async () => {
    if (!userProfile?.id) return;
    try {
      const q = query(
        collection(db, 'shifts'),
        where('facility_id', '==', userProfile.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(a.shift_date) - new Date(b.shift_date));
      setShifts(data);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const fetchApplications = async () => {
    if (!userProfile?.id) return;
    try {
      // Because NoSQL doesn't support deep joins easily like Supabase did with `shifts!inner(*)`,
      // we first need to get the shifts for this facility, then the applications for those shifts.
      const shiftsQ = query(collection(db, 'shifts'), where('facility_id', '==', userProfile.id));
      const shiftsSnap = await getDocs(shiftsQ);
      const shiftIds = shiftsSnap.docs.map(d => d.id);
      
      if (shiftIds.length === 0) {
        setApplications([]);
        return;
      }

      // Chunk shiftIds if > 10 because 'in' query supports max 10
      const chunkedShiftIds = [];
      for (let i = 0; i < shiftIds.length; i += 10) {
        chunkedShiftIds.push(shiftIds.slice(i, i + 10));
      }

      let allApps = [];
      for (const chunk of chunkedShiftIds) {
        const appsQ = query(collection(db, 'applications'), where('shift_id', 'in', chunk));
        const appsSnap = await getDocs(appsQ);
        
        const appsWithDetails = await Promise.all(appsSnap.docs.map(async (appDoc) => {
          const app = { id: appDoc.id, ...appDoc.data() };
          
          // Get the shift details
          const shiftSnap = await getDoc(doc(db, 'shifts', app.shift_id));
          if (shiftSnap.exists()) {
            app.shifts = shiftSnap.data();
          }
          
          // Get the professional profile details
          if (app.professional_id) {
            const profileSnap = await getDoc(doc(db, 'profiles', app.professional_id));
            if (profileSnap.exists()) {
              app.profiles = profileSnap.data();
            }
          }
          return app;
        }));
        
        allApps = [...allApps, ...appsWithDetails];
      }
      
      setApplications(allApps);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchApplications();
  }, [userProfile]);

  const handlePostShift = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'shifts'), {
        ...newShift, 
        facility_id: userProfile.id, 
        facility_name: userProfile.full_name,
        status: 'open',
        created_at: new Date().toISOString()
      });
      alert("Shift Posted to the Network!"); 
      fetchShifts();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleApproveCompletion = async (shiftId) => {
    try {
      await updateDoc(doc(db, 'shifts', shiftId), { status: 'completed' });
      
      const appsToUpdate = applications.filter(a => a.shift_id === shiftId && a.status === 'accepted');
      for (const app of appsToUpdate) {
        await updateDoc(doc(db, 'applications', app.id), { status: 'completed' });
      }
      
      alert("Shift marked as completed. Professional will be notified.");
      fetchShifts();
      fetchApplications();
    } catch (error) {
      console.error(error);
      alert("Failed to approve completion");
    }
  };

  const handleAcceptApplicant = async (applicationId, shiftId) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), { status: 'accepted' });
      await updateDoc(doc(db, 'shifts', shiftId), { status: 'filled' });
      alert("Professional accepted! They have been notified.");
      fetchShifts();
      fetchApplications();
    } catch (error) {
      console.error(error);
      alert("Failed to accept applicant");
    }
  };

  const handleRejectApplicant = async (applicationId) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), { status: 'rejected' });
      alert("Professional rejected.");
      fetchApplications();
    } catch (error) {
      console.error(error);
      alert("Failed to reject applicant");
    }
  };

  const filteredShifts = shifts.filter(s => s.status === shiftTab);
  const pendingApps = applications.filter(a => a.status === 'applied');

  return (
    <Layout>
      <SettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <motion.main variants={containerVariants} initial="hidden" animate="visible"
        style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-lg)' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <motion.div variants={itemVariants}>
            <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-xs)' }}>SHIFT COMMAND</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>MONITORING NETWORK RESPONSES</p>
          </motion.div>

          <LiveMap />

          {/* Shift Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['open', 'filled', 'completed', 'cancelled'].map(tab => (
              <button key={tab} onClick={() => setShiftTab(tab)}
                className={`brutal-button ${shiftTab === tab ? '' : 'secondary'}`}
                style={{ flex: 1, fontSize: '0.7rem', padding: '0.4rem' }}>
                {tab.toUpperCase()} ({shifts.filter(s => s.status === tab).length})
              </button>
            ))}
          </div>

          {/* Shift List */}
          <motion.div variants={containerVariants} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {filteredShifts.map(shift => (
              <motion.div key={shift.id} variants={itemVariants} className="brutal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{shift.role}</h3>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    {shift.shift_date} | {shift.start_time} - {shift.end_time}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>${shift.hourly_rate}/hr</div>
                    <span className="brutal-badge" style={{ backgroundColor: shift.status === 'open' ? 'var(--color-success)' : shift.status === 'filled' ? 'var(--color-accent)' : 'var(--color-surface)' }}>
                      {shift.status.toUpperCase()}
                    </span>
                  </div>
                  {shift.status === 'filled' && (
                    <button onClick={() => handleApproveCompletion(shift.id)} className="brutal-button" style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem', backgroundColor: 'var(--color-success)' }}>
                      <CheckCircle size={14} /> APPROVE
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredShifts.length === 0 && (
              <div className="brutal-card" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>NO {shiftTab.toUpperCase()} SHIFTS.</p>
              </div>
            )}
          </motion.div>

          {/* Applicant Review Panel */}
          {pendingApps.length > 0 && (
            <motion.div variants={itemVariants}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> PENDING APPLICANTS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pendingApps.map(app => (
                  <div key={app.id} className="brutal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{app.profiles?.full_name || 'Professional'}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {app.profiles?.professional_type?.toUpperCase() || 'N/A'} • Applied for {app.shifts?.role}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleAcceptApplicant(app.id, app.shift_id)} className="brutal-button" style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem', backgroundColor: 'var(--color-success)' }}>
                        <CheckCircle size={14} /> ACCEPT
                      </button>
                      <button onClick={() => handleRejectApplicant(app.id)} className="brutal-button" style={{ fontSize: '0.7rem', padding: '0.4rem 0.6rem', backgroundColor: 'var(--color-alert)', color: '#fff' }}>
                        <XCircle size={14} /> REJECT
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <motion.div variants={itemVariants} className="brutal-card" style={{ backgroundColor: 'var(--color-accent)' }}>
            <h3 style={{ margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={18} /> BROADCAST SHIFT
            </h3>
            <form onSubmit={handlePostShift} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>ROLE</label>
                <select className="brutal-input" value={newShift.role} onChange={e => setNewShift({...newShift, role: e.target.value})}>
                  <option>RN</option><option>LPN</option><option>CNA</option><option>Physical Therapist</option><option>Occupational Therapist</option><option>EMT</option><option>Paramedic</option>
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>HOURLY RATE ($)</label>
                <input type="number" className="brutal-input" value={newShift.hourly_rate} onChange={e => setNewShift({...newShift, hourly_rate: e.target.value})} required />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>DATE</label>
                <input type="date" className="brutal-input" value={newShift.shift_date} onChange={e => setNewShift({...newShift, shift_date: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>START</label>
                  <input type="time" className="brutal-input" value={newShift.start_time} onChange={e => setNewShift({...newShift, start_time: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>END</label>
                  <input type="time" className="brutal-input" value={newShift.end_time} onChange={e => setNewShift({...newShift, end_time: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem' }}>BONUS ($)</label>
                  <input type="number" className="brutal-input" value={newShift.bonus} onChange={e => setNewShift({...newShift, bonus: e.target.value})} />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newShift.dynamic_pricing} onChange={e => setNewShift({...newShift, dynamic_pricing: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    DYNAMIC PRICING
                  </label>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={newShift.is_urgent} onChange={e => setNewShift({...newShift, is_urgent: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                MARK AS URGENT
              </label>
              <button type="submit" className="brutal-button" style={{ backgroundColor: 'var(--color-surface)' }}>PUBLISH TO NETWORK</button>
            </form>
          </motion.div>

          {/* Payment Overview */}
          <motion.div variants={itemVariants} className="brutal-card">
            <h3 style={{ margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} /> PAYMENT OVERVIEW
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', border: '2px solid var(--color-border)' }}>
                <span>Completed Shifts</span>
                <strong>{shifts.filter(s => s.status === 'completed').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', border: '2px solid var(--color-border)' }}>
                <span>Total Due</span>
                <strong>${shifts.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.hourly_rate * 12, 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', border: '2px solid var(--color-border)' }}>
                <span>Upcoming Costs</span>
                <strong>${shifts.filter(s => s.status === 'filled').reduce((sum, s) => sum + s.hourly_rate * 12, 0).toLocaleString()}</strong>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.main>
    </Layout>
  );
}
