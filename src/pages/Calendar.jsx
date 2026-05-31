import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalIcon } from 'lucide-react';
import Layout from '../components/Layout';
import ShiftCalendar from '../components/ShiftCalendar';

const itemV = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } } };

export default function CalendarPage() {
  const navigate = useNavigate();
  return (
    <Layout>
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
        <motion.div variants={itemV} style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}><CalIcon size={28} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />SHIFT CALENDAR</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Monthly view of all shifts and schedules.</p>
        </motion.div>
        <motion.div variants={itemV}>
          <ShiftCalendar onShiftClick={(id) => navigate(`/shifts/${id}`)} />
        </motion.div>
      </motion.div>
    </Layout>
  );
}
