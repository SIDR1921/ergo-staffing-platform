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

// Brutalist/Dark aesthetic map style
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
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
        <Map size={18} /> GPS TELEMETRY
      </h3>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          options={{
            styles: darkMapStyle,
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
                fillColor: 'var(--color-accent)',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#000',
                scale: 0.8
              }}
            />
          ))}
        </GoogleMap>
      ) : (
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'var(--color-accent)', border: '2px solid var(--color-border)', borderRadius: '8px' }}>
          INITIALIZING MAP SATELLITES...
        </div>
      )}
    </motion.div>
  );
}
