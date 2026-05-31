import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, ChevronRight, UploadCloud, AlertTriangle, Clock } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const requiredDocs = [
  { name: 'W-9 Tax Form', category: 'tax' },
  { name: 'State Medical License', category: 'license' },
  { name: 'CPR/BLS Certification', category: 'certification' },
  { name: 'TB Test Results', category: 'health' },
  { name: 'Background Check Consent', category: 'compliance' },
];

export default function CredentialVault() {
  const { userProfile } = useAuth();
  const [credentials, setCredentials] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');

  const fetchCreds = async () => {
    if (!userProfile?.id) return;
    try {
      const q = query(collection(db, 'credentials'), where('professional_id', '==', userProfile.id));
      const querySnapshot = await getDocs(q);
      const credsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCredentials(credsData);
    } catch (err) {
      console.error("Error fetching credentials:", err);
    }
  };

  useEffect(() => {
    fetchCreds();
  }, [userProfile]);

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const diff = new Date(expiryDate) - new Date();
    const daysLeft = diff / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft < 30;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const handleUpload = async () => {
    if (!uploadName || !userProfile?.id) return;
    try {
      await addDoc(collection(db, 'credentials'), {
        professional_id: userProfile.id,
        document_name: uploadName,
        document_url: `https://vault.ergo.health/${userProfile.id}/${uploadName.replace(/\s+/g, '_').toLowerCase()}`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
      alert("Document uploaded! Pending verification.");
      setShowUpload(false);
      setUploadName('');
      fetchCreds(); // Refresh list
    } catch (error) {
      alert("Upload error: " + error.message);
    }
  };

  // Count expiring credentials for the notification badge
  const expiringCount = credentials.filter(c => isExpiringSoon(c.expires_at) || isExpired(c.expires_at)).length;

  return (
    <motion.div variants={itemVariants} className="brutal-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} /> CREDENTIAL VAULT
          {expiringCount > 0 && (
            <span className="brutal-badge" style={{ backgroundColor: 'var(--color-alert)', color: '#fff', border: 'none', fontSize: '0.65rem' }}>
              {expiringCount} EXPIRING
            </span>
          )}
        </h3>
        <button onClick={() => setShowUpload(!showUpload)} className="brutal-button secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
          <UploadCloud size={14} /> UPLOAD
        </button>
      </div>

      {/* Upload Panel */}
      {showUpload && (
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '2px dashed var(--color-accent)', display: 'flex', gap: '0.5rem' }}>
          <select className="brutal-input" value={uploadName} onChange={e => setUploadName(e.target.value)} style={{ flex: 1 }}>
            <option value="">Select Document...</option>
            {requiredDocs.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            <option value="I-9 Employment Verification">I-9 Employment Verification</option>
            <option value="Professional Liability Insurance">Professional Liability Insurance</option>
            <option value="Other">Other Document</option>
          </select>
          <button onClick={handleUpload} className="brutal-button" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
            SUBMIT
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {requiredDocs.map((doc) => {
          const uploaded = credentials.find(c => c.document_name === doc.name);
          const expiring = uploaded && isExpiringSoon(uploaded.expires_at);
          const expired = uploaded && isExpired(uploaded.expires_at);

          return (
            <div key={doc.name} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5rem', border: `2px solid ${expired ? 'var(--color-alert)' : expiring ? '#FFA500' : 'var(--color-border)'}`,
              opacity: uploaded ? 1 : 0.6
            }}>
              <div>
                <span style={{ fontWeight: 500 }}>{doc.name}</span>
                {uploaded?.expires_at && (
                  <div style={{ fontSize: '0.7rem', color: expired ? 'var(--color-alert)' : expiring ? '#FFA500' : 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                    {(expired || expiring) && <AlertTriangle size={10} />}
                    <Clock size={10} /> Expires: {new Date(uploaded.expires_at).toLocaleDateString()}
                  </div>
                )}
              </div>
              {uploaded ? (
                <span className="brutal-badge" style={{ 
                  backgroundColor: expired ? 'var(--color-alert)' : uploaded.status === 'verified' ? 'var(--color-success)' : 'var(--color-surface)', 
                  color: expired ? '#fff' : '#000', border: 'none' 
                }}>
                  {expired ? 'EXPIRED' : uploaded.status.toUpperCase()}
                </span>
              ) : (
                <span className="brutal-badge" style={{ backgroundColor: 'var(--color-alert)', color: '#fff', border: 'none' }}>
                  MISSING
                </span>
              )}
            </div>
          );
        })}
        {credentials.filter(c => !requiredDocs.find(r => r.name === c.document_name)).map((doc) => (
          <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', border: '2px solid var(--color-border)' }}>
            <span style={{ fontWeight: 500 }}>{doc.document_name}</span>
            <span className="brutal-badge" style={{ backgroundColor: doc.status === 'verified' ? 'var(--color-success)' : 'var(--color-surface)', color: '#000', border: 'none' }}>
              {doc.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      
      <button onClick={() => alert("Document Manager: You can view, edit, and delete documents from this interface.")} className="brutal-button secondary" style={{ width: '100%', marginTop: '1rem' }}>
        MANAGE DOCUMENTS <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}
