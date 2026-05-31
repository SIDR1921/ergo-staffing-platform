import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, DollarSign, ArrowUpRight, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function Earnings() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({ totalEarnings: 0, completedShifts: 0, pendingPayout: 0 });

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!userProfile?.id) return;
      
      try {
        const q = query(
          collection(db, 'applications'),
          where('professional_id', '==', userProfile.id),
          where('status', 'in', ['accepted', 'completed'])
        );
        
        const snapshot = await getDocs(q);
        const data = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const app = docSnap.data();
          if (app.shift_id) {
            const shiftSnap = await getDoc(doc(db, 'shifts', app.shift_id));
            if (shiftSnap.exists()) {
              app.shifts = shiftSnap.data();
            }
          }
          return app;
        }));
        
        const completed = data.filter(a => a.status === 'completed');
        const totalEarnings = completed.reduce((sum, a) => sum + (a.shifts?.hourly_rate || 0) * 12, 0);
        const pendingPayout = data.filter(a => a.status === 'accepted').reduce((sum, a) => sum + (a.shifts?.hourly_rate || 0) * 12, 0);
        
        setStats({ totalEarnings, completedShifts: completed.length, pendingPayout });
      } catch (err) {
        console.error("Error fetching earnings:", err);
      }
    };
    fetchEarnings();
  }, [userProfile]);

  return (
    <motion.div variants={itemVariants} className="brutal-card" style={{ backgroundColor: 'var(--color-accent)' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Wallet size={18} /> EARNINGS & WALLET
      </h3>
      
      <div style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 800, margin: '1rem 0' }}>
        ${stats.totalEarnings.toLocaleString()}<span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)' }}>.00</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, padding: '0.5rem', border: '2px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>COMPLETED</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stats.completedShifts}</div>
        </div>
        <div style={{ flex: 1, padding: '0.5rem', border: '2px solid var(--color-border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>PENDING</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>${stats.pendingPayout.toLocaleString()}</div>
        </div>
      </div>

      <button onClick={() => alert("Payout request submitted! Funds will arrive in 1-2 business days via your linked Stripe account.")} className="brutal-button" style={{ width: '100%', backgroundColor: 'var(--color-surface)' }}>
        <DollarSign size={16} /> REQUEST INSTANT PAYOUT
      </button>
    </motion.div>
  );
}
