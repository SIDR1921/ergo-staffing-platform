import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';

// Firebase web config — supplied via environment variables only (never committed).
// Local dev: a gitignored .env file. CI/CD: GitHub Actions secrets injected at build.
// See DEPLOYMENT.md for the required VITE_FIREBASE_* keys.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey) {
  // Fail loudly in dev instead of silently rendering a blank app.
  console.error(
    '[firebase] Missing VITE_FIREBASE_* environment variables. ' +
    'Create a local .env (see DEPLOYMENT.md) or set the GitHub Actions secrets.'
  );
}

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
