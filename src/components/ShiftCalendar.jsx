import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

export default function ShiftCalendar({ onShiftClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    const fetchShifts = async () => {
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${daysInMonth}`;
      
      try {
        const q = query(
          collection(db, 'shifts'),
          where('shift_date', '>=', startDate),
          where('shift_date', '<=', endDate)
        );
        const snapshot = await getDocs(q);
        const shiftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Order by start_time manually since we used range on shift_date
        shiftsData.sort((a, b) => a.start_time.localeCompare(b.start_time));
        
        setShifts(shiftsData);
      } catch (err) {
        console.error("Error fetching shifts for calendar:", err);
      }
    };
    fetchShifts();
  }, [year, month, daysInMonth]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const getShiftsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return shifts.filter(s => s.shift_date === dateStr);
  };

  const statusColor = (status) => {
    switch (status) {
      case 'open': return 'var(--color-warning)';
      case 'filled': return 'var(--color-accent)';
      case 'completed': return 'var(--color-success)';
      default: return 'var(--color-text-muted)';
    }
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedShifts = selectedDay ? getShiftsForDay(selectedDay) : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Month Nav */}
      <div className="brutal-card compact no-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="brutal-button tiny secondary" onClick={prevMonth}><ChevronLeft size={16} /></button>
        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{MONTHS[month]} {year}</h3>
        <button className="brutal-button tiny secondary" onClick={nextMonth}><ChevronRight size={16} /></button>
      </div>

      {/* Calendar Grid */}
      <div className="brutal-card no-hover" style={{ padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            const dayShifts = getShiftsForDay(day);
            const isSelected = selectedDay === day;
            return (
              <motion.div
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: '0.5rem', border: `2px solid ${isSelected ? 'var(--color-accent)' : isToday(day) ? 'var(--color-border)' : 'transparent'}`,
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer', textAlign: 'center', minHeight: '60px',
                  background: isSelected ? 'rgba(0,229,255,0.1)' : isToday(day) ? 'rgba(0,0,0,0.03)' : 'transparent',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: isToday(day) ? 800 : 400, fontSize: '0.85rem' }}>{day}</div>
                {dayShifts.length > 0 && (
                  <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                    {dayShifts.slice(0, 3).map((s, j) => (
                      <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(s.status), border: '1px solid var(--color-border)' }} />
                    ))}
                    {dayShifts.length > 3 && <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>+{dayShifts.length - 3}</span>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Panel */}
      {selectedDay && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="brutal-card no-hover">
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{MONTHS[month]} {selectedDay}, {year}</h3>
          {selectedShifts.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>No shifts scheduled.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedShifts.map(s => (
                <div key={s.id} onClick={() => onShiftClick?.(s.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{s.role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.facility_name} • {s.start_time}–{s.end_time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)' }}>${s.hourly_rate}/hr</div>
                    <span className="brutal-badge" style={{ fontSize: '0.6rem', background: statusColor(s.status), border: 'none' }}>{s.status?.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
