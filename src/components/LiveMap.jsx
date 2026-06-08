import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  border: '2px solid var(--color-border)'
};

const center = {
  lat: 40.7128,
  lng: -74.0060
};

// Soft lavender map style — matches the PRN Float light glass aesthetic.
const lavenderMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#F2EEFB" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#7E7C90" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#C9BFF0" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#E5DFF8" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#8475C8" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#D9F0E4" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#F7F5FC" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#E0DBF8" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9E97B5" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#C9BFF0" }] }
];

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

export default function LiveMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [activeProfessionals, setActiveProfessionals] = useState([
    { id: 1, lat: 40.7150, lng: -74.0100 },
    { id: 2, lat: 40.7100, lng: -74.0020 }
  ]);

  // Simulate movement
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProfessionals(prev => prev.map(p => ({
        ...p,
        lat: p.lat + (Math.random() - 0.5) * 0.001,
        lng: p.lng + (Math.random() - 0.5) * 0.001
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div variants={itemVariants} className="brutal-card" style={{ padding: 'var(--space-sm)' }}>
      <h3 style={{ margin: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem' }}>
        <Map size={18} /> Live workforce map
      </h3>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          options={{
            styles: lavenderMapStyle,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {activeProfessionals.map((pro) => (
            <Marker 
              key={pro.id} 
              position={{ lat: pro.lat, lng: pro.lng }} 
              icon={{
                path: 'M -10,0 A 10,10 0 1,1 10,0 A 10,10 0 1,1 -10,0',
                fillColor: '#8475C8',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
                scale: 0.8
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-accent-light)', color: 'var(--color-accent-dark)', border: '2px solid var(--color-border)', borderRadius: '8px', fontWeight: 600 }}>
          Loading map…
        </div>
      )}
    </motion.div>
  );
}
