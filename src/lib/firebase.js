import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';

// Firebase web config. These values are NOT secret (security is enforced by
// Firestore/Storage rules + Auth authorized domains). Env vars override the
// baked-in defaults so CI / other environments can swap projects if needed.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBnBl8hlus8uCj64w6H92HAasvBJyTjKlc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ergo-staffing-platform.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ergo-staffing-platform',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ergo-staffing-platform.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '617023388266',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:617023388266:web:7aa8c729313105d2c12813',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PVJD400H46'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics only runs in supported browser environments; guard so it can never
// block app startup.
export let analytics = null;
analyticsIsSupported()
  .then((supported) => { if (supported) analytics = getAnalytics(app); })
  .catch(() => { /* analytics unavailable — ignore */ });
