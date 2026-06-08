import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser) => {
    try {
      const docRef = doc(db, 'profiles', firebaseUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        // Always attach the uid as `id` — many components query Firestore by
        // userProfile.id, which is otherwise undefined on the raw doc data.
        setUserProfile({ id: firebaseUser.uid, ...docSnap.data() });
      } else {
        setUserProfile({
          id: firebaseUser.uid,
          role: 'professional',
          full_name: firebaseUser.displayName || 'User'
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setUserProfile({
        id: firebaseUser.uid,
        role: 'professional',
        full_name: firebaseUser.displayName || 'User'
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signInWithApple = async () => {
    const provider = new OAuthProvider('apple.com');
    return signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    return firebaseSignOut(auth);
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      signIn, 
      signInWithGoogle,
      signInWithApple,
      signOut, 
      resetPassword, 
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
