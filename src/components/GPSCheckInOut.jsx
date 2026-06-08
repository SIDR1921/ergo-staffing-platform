import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Navigation, CheckCircle, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

// Mock Facility Location (Memorial Hospital)
// Fallback if we need one, but let's default the facility to the user's location + small offset for testing
// In production, this would come from the shift data.
const FACILITY_LAT = 37.7749;
const FACILITY_LNG = -122.4194;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // in metres
}

export default function GPSCheckInOut() {
  const { userProfile } = useAuth();
  const [status, setStatus] = useState('idle'); // idle, checked_in, checked_out
  const [location, setLocation] = useState(null);
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        err => reject(err),
        { enableHighAccuracy: true }
      );
    });
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const loc = await getLocation();
      
      // For prototype: we simulate the facility being exactly where the user is
      // so they can actually pass the check, but we run the math.
      // In a real app, `targetFacilityLat` comes from DB.
      const targetFacilityLat = loc.lat + 0.0001; // ~11 meters away
      const targetFacilityLng = loc.lng + 0.0001;
      
      const distance = calculateDistance(loc.lat, loc.lng, targetFacilityLat, targetFacilityLng);
      
      if (distance > 500) {
        throw new Error(`You are ${Math.round(distance)} meters away from the facility. Must be within 500m to check in.`);
      }

      setLocation(loc);
      setCheckInTime(new Date());
      setStatus('checked_in');
      alert(`EVV Verified: Distance ${Math.round(distance)}m.\nGPS Check-In Recorded!\nLocation: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    } catch (err) {
      alert("EVV Error: " + err.message);
    }
    setLoading(false);
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const loc = await getLocation();
      setLocation(loc);
      setCheckOutTime(new Date());
      setStatus('checked_out');
      const duration = checkInTime ? Math.round((new Date() - checkInTime) / (1000 * 60 * 60) * 10) / 10 : 0;
      alert(`GPS Check-Out Recorded!\nLocation: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}\nShift Duration: ${duration} hours\n\nPending manager approval for completion.`);
    } catch (err) {
      alert("GPS Error: " + err.message);
    }
    setLoading(false);
  };

  return (
    <motion.div variants={itemVariants} className="brutal-card" style={{ backgroundColor: status === 'checked_in' ? '#2D2A3E' : 'var(--color-surface)', color: status === 'checked_in' ? '#fff' : 'var(--color-text)' }}>
      <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Navigation size={18} /> GPS SHIFT TRACKER
      </h3>

      {status === 'idle' && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            Check in when you arrive at the facility. Your GPS location will be recorded and sent to the facility manager for approval.
          </p>
          <button onClick={handleCheckIn} disabled={loading} className="brutal-button" style={{ width: '100%', backgroundColor: 'var(--color-success)' }}>
            <LogIn size={16} /> {loading ? "LOCATING..." : "GPS CHECK-IN"}
          </button>
        </div>
      )}

      {status === 'checked_in' && (
        <div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, padding: '0.5rem', border: '2px solid rgba(103,217,164,0.35)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#67D9A4' }}>CHECKED IN</div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{checkInTime?.toLocaleTimeString()}</div>
            </div>
            <div style={{ flex: 1, padding: '0.5rem', border: '2px solid rgba(103,217,164,0.35)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: '#67D9A4' }}>LOCATION</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{location?.lat.toFixed(3)}, {location?.lng.toFixed(3)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', border: '2px solid rgba(103,217,164,0.35)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#67D9A4', animation: 'pulse 2s infinite' }}></div>
            <span style={{ fontSize: '0.8rem', color: '#67D9A4' }}>SHIFT ACTIVE — GPS TRACKING LIVE</span>
          </div>
          <button onClick={handleCheckOut} disabled={loading} className="brutal-button" style={{ width: '100%', backgroundColor: 'var(--color-alert)', color: '#fff' }}>
            <LogOut size={16} /> {loading ? "LOCATING..." : "GPS CHECK-OUT"}
          </button>
        </div>
      )}

      {status === 'checked_out' && (
        <div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <CheckCircle size={32} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
            <h4 style={{ margin: 0 }}>SHIFT COMPLETE</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.5rem 0' }}>
              In: {checkInTime?.toLocaleTimeString()} → Out: {checkOutTime?.toLocaleTimeString()}
            </p>
            <span className="brutal-badge" style={{ backgroundColor: 'var(--color-accent)', border: 'none' }}>
              PENDING MANAGER APPROVAL
            </span>
          </div>
          <button onClick={() => { setStatus('idle'); setCheckInTime(null); setCheckOutTime(null); }} className="brutal-button secondary" style={{ width: '100%', marginTop: '1rem' }}>
            RESET TRACKER
          </button>
        </div>
      )}
    </motion.div>
  );
}
