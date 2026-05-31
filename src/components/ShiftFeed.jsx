import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, CheckCircle, XCircle, List, Zap, Star } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function ShiftFeed() {
  const { userProfile } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my_shifts'
  const [feedbackShiftId, setFeedbackShiftId] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(0);

  useEffect(() => {
    // Realtime subscription to open shifts
    const q = query(
      collection(db, 'shifts'),
      where('status', '==', 'open'),
      orderBy('shift_date', 'asc')
    );

    const unsubscribeShifts = onSnapshot(q, (snapshot) => {
      const shiftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShifts(shiftsData);
      setLoading(false);
    });

    return () => unsubscribeShifts();
  }, []);

  const fetchMyApplications = async () => {
    if (!userProfile?.id) return;
    
    // In NoSQL, we fetch applications, then we need to fetch the related shifts if we want to display them
    const q = query(
      collection(db, 'applications'),
      where('professional_id', '==', userProfile.id),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const apps = await Promise.all(snapshot.docs.map(async (docSnap) => {
      const appData = { id: docSnap.id, ...docSnap.data() };
      if (appData.shift_id) {
        const shiftDoc = await getDoc(doc(db, 'shifts', appData.shift_id));
        if (shiftDoc.exists()) {
          appData.shifts = { id: shiftDoc.id, ...shiftDoc.data() };
        }
      }
      return appData;
    }));
    
    setMyApplications(apps);
  };

  useEffect(() => {
    if (userProfile?.id) {
      fetchMyApplications();
    }
  }, [userProfile]);

  const handleAccept = async (shiftId) => {
    if (!userProfile?.id) return;
    
    // Optimistic UI update
    setShifts(shifts.filter(s => s.id !== shiftId));
    
    try {
      await addDoc(collection(db, 'applications'), {
        shift_id: shiftId, 
        professional_id: userProfile.id, 
        status: 'accepted',
        created_at: new Date().toISOString()
      });
      alert("Shift Accepted! GPS Tracking will unlock 1 hour before shift.");
      fetchMyApplications();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleReject = (shiftId) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
  };

  const handleFeedback = async (applicationId) => {
    alert(`Thank you! You rated this shift ${feedbackRating}/5 ⭐`);
    setFeedbackShiftId(null);
    setFeedbackRating(0);
  };

  const tabs = [
    { id: 'available', label: 'AVAILABLE', icon: <Zap size={14} /> },
    { id: 'my_shifts', label: 'MY SHIFTS', icon: <List size={14} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <motion.div variants={itemVariants}>
        <h2 style={{ fontSize: '3rem', marginBottom: 'var(--space-xs)' }}>
          {activeTab === 'available' ? 'AVAILABLE SHIFTS' : 'MY SHIFTS'}
        </h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          {loading ? "SEARCHING NETWORK..." : activeTab === 'available' ? `MATCHING ALGORITHM ACTIVE // ${shifts.length} MATCHES` : `${myApplications.length} RECORDS`}
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`brutal-button ${activeTab === tab.id ? '' : 'secondary'}`}
            style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'available' ? (
          <motion.div key="available" variants={containerVariants} initial="hidden" animate="visible" exit="hidden"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {shifts.map(shift => (
              <motion.div key={shift.id} variants={itemVariants} className="brutal-card"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
                {shift.is_urgent && (
                  <div style={{ position: 'absolute', top: '-15px', right: '-20px', background: 'var(--color-alert)', color: '#fff',
                    fontFamily: 'var(--font-display)', fontWeight: 800, padding: '2rem 3rem 0.5rem', transform: 'rotate(45deg)',
                    fontSize: '0.7rem', border: '2px solid var(--color-border)', boxShadow: 'var(--shadow-brutal)' }}>URGENT</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.5rem' }}>{shift.role}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      <MapPin size={14} /><span style={{ fontSize: '0.85rem' }}>{shift.facility_name}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>${shift.hourly_rate}/hr</div>
                    <span className="brutal-badge">EST. ${(shift.hourly_rate * 12).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderTop: '2px dashed var(--color-border)', borderBottom: '2px dashed var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={16} /> <strong>{shift.shift_date}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={16} /> <strong>{shift.start_time} - {shift.end_time}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => handleAccept(shift.id)} className="brutal-button" style={{ flex: 1, backgroundColor: 'var(--color-success)' }}>
                    <CheckCircle size={18} /> ACCEPT SHIFT
                  </button>
                  <button onClick={() => handleReject(shift.id)} className="brutal-button" style={{ backgroundColor: 'var(--color-alert)', color: '#fff' }}>
                    <XCircle size={18} /> REJECT
                  </button>
                </div>
              </motion.div>
            ))}
            {!loading && shifts.length === 0 && (
              <motion.div variants={itemVariants} className="brutal-card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <h3 style={{ margin: 0 }}>NO SHIFTS MATCHING YOUR CRITERIA</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>We'll notify you when new shifts are posted.</p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div key="my_shifts" variants={containerVariants} initial="hidden" animate="visible" exit="hidden"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            {myApplications.map(app => (
              <motion.div key={app.id} variants={itemVariants} className="brutal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{app.shifts?.role || 'SHIFT'}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {app.shifts?.facility_name} • {app.shifts?.shift_date}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="brutal-badge" style={{
                      backgroundColor: app.status === 'accepted' ? 'var(--color-success)' :
                        app.status === 'completed' ? 'var(--color-accent)' :
                        app.status === 'rejected' ? 'var(--color-alert)' : 'var(--color-surface)',
                      color: app.status === 'rejected' ? '#fff' : '#000', border: 'none'
                    }}>
                      {app.status.toUpperCase()}
                    </span>
                    {app.shifts && <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.25rem' }}>${app.shifts.hourly_rate}/hr</div>}
                  </div>
                </div>
                {app.status === 'completed' && feedbackShiftId !== app.id && (
                  <button onClick={() => setFeedbackShiftId(app.id)} className="brutal-button secondary" style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.8rem' }}>
                    <Star size={14} /> LEAVE FEEDBACK
                  </button>
                )}
                {feedbackShiftId === app.id && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', border: '2px solid var(--color-border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={24} fill={n <= feedbackRating ? 'var(--color-accent)' : 'none'}
                        stroke={n <= feedbackRating ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                        style={{ cursor: 'pointer' }} onClick={() => setFeedbackRating(n)} />
                    ))}
                    <button onClick={() => handleFeedback(app.id)} className="brutal-button" style={{ marginLeft: 'auto', fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>SUBMIT</button>
                  </div>
                )}
              </motion.div>
            ))}
            {myApplications.length === 0 && (
              <motion.div variants={itemVariants} className="brutal-card" style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                <h3 style={{ margin: 0 }}>NO SHIFT HISTORY</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Accept shifts from the Available tab to start building your record.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
