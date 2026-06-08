import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Upload, User, Shield, Briefcase, Heart, FileText,
  ArrowRight, ArrowLeft, Sparkles, AlertTriangle, DollarSign, PenTool
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

const STEPS = [
  { id: 'npi', label: 'VERIFICATION', icon: Shield, desc: 'Free NPI validation' },
  { id: 'resume', label: 'EXTRACTION', icon: Sparkles, desc: 'Upload resume for AI parsing' },
  { id: 'details', label: 'DETAILS', icon: Briefcase, desc: 'Employment & Health' },
  { id: 'kyc', label: 'KYC & STRIPE', icon: DollarSign, desc: 'Stripe Connect Onboarding' },
  { id: 'bgcheck', label: 'BACKGROUND', icon: User, desc: 'Yardstik/Checkr Screening' },
  { id: 'esign', label: 'AGREEMENTS', icon: PenTool, desc: 'Sign required documents' },
  { id: 'complete', label: 'COMPLETE', icon: CheckCircle, desc: 'Shift-ready' },
];

const fadeVariants = {
  enter: { opacity: 0, x: 50 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export default function Onboarding() {
  const { userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const functions = getFunctions();
  
  // Step 0: NPI
  const [credentials, setCredentials] = useState({ licenseNum: '', licenseState: '', npi: '' });
  const [npiStatus, setNpiStatus] = useState('idle');
  const [npiData, setNpiData] = useState(null);

  // Step 1: Resume Extract
  const [resumeFile, setResumeFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(null);

  // Step 2: Details
  const [identity, setIdentity] = useState({ firstName: '', lastName: '', dob: '', phone: '' });
  const [health, setHealth] = useState({ tbDate: '', tbResult: '', hepB: false, covid: false });
  const [employment, setEmployment] = useState([]);
  
  // Step 3: Stripe
  const [stripeStatus, setStripeStatus] = useState('idle'); // idle, redirecting, linked
  
  // Step 4: BG Check
  const [bgCheckStatus, setBgCheckStatus] = useState('idle'); // idle, loading, cleared
  
  // Step 5: E-Sign — full compliance packet (per platform user-journey spec)
  const agreementsList = [
    { name: 'Independent Contractor Agreement', desc: 'Defines your 1099 contractor relationship, scope of work, and pay terms.' },
    { name: 'Confidentiality Agreement', desc: 'Protects facility, client, and patient information you access on assignment.' },
    { name: 'Non-Disclosure Agreement (NDA)', desc: 'Covers proprietary platform and client information.' },
    { name: 'HIPAA Privacy Agreement', desc: 'Your obligations when handling protected health information (PHI).' },
    { name: 'EVV Acknowledgment', desc: 'Consent to Electronic Visit Verification (GPS + time capture) during shifts.' },
    { name: 'Mutual Arbitration Consent', desc: 'Agreement to resolve disputes through binding arbitration.' },
  ];
  const [signatures, setSignatures] = useState({});
  const [signingStatus, setSigningStatus] = useState('idle');

  const progress = Math.round(((step) / (STEPS.length - 1)) * 100);

  // FAIL-FAST: Step 0 NPI Check via Cloud Function
  const verifyNPI = async () => {
    if (!credentials.npi) return;
    setNpiStatus('loading');
    try {
      const validateNPI = httpsCallable(functions, 'validateNPI');
      const { data } = await validateNPI({ npi: credentials.npi });
      
      if (data.valid) {
        setNpiData({ name: data.name, taxonomy: data.taxonomy });
        setNpiStatus('verified');
      } else {
        setNpiStatus('failed');
      }
    } catch (e) {
      console.error(e);
      setNpiStatus('failed');
    }
  };

  // Step 1: Resume Upload calling Firebase Function
  const handleResumeUpload = async (file) => {
    if (!file || !user) return;
    setResumeFile(file);
    setExtracting(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      
      const parseResume = httpsCallable(functions, 'parseResume');
      const { data } = await parseResume({ storagePath: `resumes/${user.uid}/${file.name}` });
      
      if (data.success && data.data) {
        const parsed = data.data;
        setExtracted(parsed);
        // Fallback or use NPI name if OpenAI didn't catch the name perfectly
        const fallbackName = npiData?.name ? npiData.name : "Jane Doe";
        const [firstName, ...lastNames] = fallbackName.split(' ');
        
        setIdentity(prev => ({ 
          ...prev, 
          firstName: firstName || '', 
          lastName: lastNames.join(' ') || '' 
        }));
        
        if (parsed.work_history && parsed.work_history.length > 0) {
          const recent = parsed.work_history[0];
          setEmployment([{ 
            id: Date.now(), 
            employer: recent.company || '', 
            title: recent.title || '', 
            startDate: '2019-01-01', 
            current: true 
          }]);
        }
      }
    } catch (e) {
      console.error("Parse Error:", e);
      alert("Failed to parse resume. Please enter details manually on the next step.");
    }
    setExtracting(false);
  };

  // Step 3: Stripe Connect via Cloud Function
  const connectStripe = async () => {
    setStripeStatus('redirecting');
    try {
      const createStripeConnectAccount = httpsCallable(functions, 'createStripeConnectAccount');
      const { data } = await createStripeConnectAccount();
      if (data.url) {
        // In a real flow, redirect the user. For prototype we show success.
        // window.location.href = data.url;
        setTimeout(() => setStripeStatus('linked'), 1500); // Simulate returning from Stripe
      }
    } catch (error) {
      console.error("Stripe connect failed:", error);
      setStripeStatus('idle');
      alert("Failed to connect to Stripe.");
    }
  };

  // Step 4: Background Check (Mocked for Checkr)
  const handleBgCheck = async () => {
    setBgCheckStatus('loading');
    // Here we would call a cloud function to create a Checkr candidate
    setTimeout(() => {
      setBgCheckStatus('cleared');
    }, 2500);
  };

  // Step 5: E-Sign via SignNow
  const handleSignatures = async () => {
    setSigningStatus('loading');
    try {
      const sendSignNowInvite = httpsCallable(functions, 'sendSignNowInvite');
      // In reality, we'd loop through real document IDs. Using a dummy ID for the call.
      await sendSignNowInvite({ documentId: "dummy_doc_123", email: user.email });
      setSigningStatus('sent');
      setTimeout(() => nextStep(), 1500);
    } catch (error) {
      console.error("SignNow Error:", error);
      alert("Failed to send signature invite. " + error.message);
      setSigningStatus('idle');
    }
  };

  // Submit all data to Firestore
  const finishOnboarding = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'profiles', user.uid), {
        onboarding_completed: true,
        npi: credentials.npi,
        first_name: identity.firstName,
        last_name: identity.lastName,
        phone: identity.phone,
        stripe_connected: stripeStatus === 'linked',
        bg_check_cleared: bgCheckStatus === 'cleared'
      });
      navigate('/professional');
    } catch (err) {
      console.error(err);
    }
  };

  const nextStep = () => {
    if (step === 0 && npiStatus !== 'verified') {
      alert("You must verify your NPI to proceed.");
      return;
    }
    if (step === 3 && stripeStatus !== 'linked') {
      alert("You must complete Stripe Connect KYC to proceed.");
      return;
    }
    if (step === 4 && bgCheckStatus !== 'cleared') {
      alert("Background check must be cleared.");
      return;
    }
    if (step === 5) {
      const signedCount = agreementsList.filter(a => (signatures[a.name] || '').trim().length > 2).length;
      if (signedCount < agreementsList.length) {
        alert("You must sign all agreements.");
        return;
      }
      handleSignatures(); // This will automatically advance the step on success
      return;
    }
    
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  
  const prevStep = () => { if (step > 0) setStep(step - 1); };

  const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{label}</label>
      <input type={type} className="brutal-input small" placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Logo variant="mark" size={36} />
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>ONBOARDING</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>STEP {step + 1} OF {STEPS.length}</p>
          </div>
        </div>
        <div className="brutal-progress" style={{ marginBottom: '1rem' }}>
          <div className="brutal-progress-fill success" style={{ width: `${progress}%` }} />
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => i < step && setStep(i)}
              style={{ flex: 1, padding: '0.5rem', border: '2px solid var(--color-border)', background: i === step ? 'var(--color-accent)' : i < step ? 'var(--color-success)' : 'var(--color-surface)', cursor: i <= step ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', fontSize: '0.65rem', fontFamily: 'var(--font-display)', fontWeight: 600, textTransform: 'uppercase', borderRadius: 'var(--radius-sm)' }}>
              <s.icon size={12} /> <span style={{ display: 'none' }}>{s.label}</span>
              {i < step && <CheckCircle size={10} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '800px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} variants={fadeVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
            
            {/* STEP 0: NPI Verification (The Gatekeeper) */}
            {step === 0 && (
              <div className="brutal-card no-hover">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}><Shield size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />INITIAL VERIFICATION</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>We require primary source validation before collecting your documents.</p>
                
                <Field label="STATE LICENSE NUMBER" value={credentials.licenseNum} onChange={e => setCredentials({...credentials, licenseNum: e.target.value})} placeholder="RN-123456" />
                <Field label="ISSUING STATE" value={credentials.licenseState} onChange={e => setCredentials({...credentials, licenseState: e.target.value})} placeholder="California" />
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>NPI NUMBER (REQUIRED)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" className="brutal-input small" placeholder="1234567890" value={credentials.npi} onChange={e => setCredentials({...credentials, npi: e.target.value})} style={{ flex: 1 }} />
                    <button className="brutal-button small" onClick={verifyNPI} disabled={npiStatus === 'loading'}>
                      {npiStatus === 'loading' ? 'VERIFYING...' : 'VERIFY NPI'}
                    </button>
                  </div>
                  {npiStatus === 'verified' && npiData && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', fontSize: '0.8rem', color: 'var(--color-success)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', background: 'rgba(103,217,164,0.1)' }}>
                      <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }}/>
                      Verified: {npiData.name} ({npiData.taxonomy})
                    </div>
                  )}
                  {npiStatus === 'failed' && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-alert)' }}>Invalid or deactivated NPI Number. Cannot proceed.</div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 1: Resume Upload */}
            {step === 1 && (
              <div className="brutal-card no-hover">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}><Sparkles size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />AI DATA EXTRACTION</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Upload your resume. Our backend extracts text and structures your details.</p>
                {!extracted ? (
                  <div style={{ border: '3px dashed var(--color-accent)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center', cursor: 'pointer' }} onClick={() => !extracting && document.getElementById('resume-input').click()}>
                    <input type="file" id="resume-input" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => handleResumeUpload(e.target.files[0])} />
                    {extracting ? (
                      <>
                        <div className="animate-spin" style={{ width: 48, height: 48, border: '3px solid var(--color-border)', borderTop: '3px solid var(--color-accent)', borderRadius: '50%', margin: '0 auto 1rem' }} />
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>EXTRACTING VIA BACKEND...</p>
                      </>
                    ) : (
                      <>
                        <Upload size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>DROP YOUR RESUME HERE</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ padding: '1rem', background: 'rgba(103,217,164,0.1)', border: '2px solid var(--color-success)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                      <CheckCircle size={18} color="var(--color-success)" style={{ display: 'inline', marginRight: '0.5rem' }}/>
                      <span style={{ fontWeight: 600 }}>Parsed successfully! Review extracted fields on next step.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Details */}
            {step === 2 && (
              <div className="brutal-card no-hover">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}><User size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />IDENTITY & HEALTH</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <Field label="FIRST NAME" value={identity.firstName} onChange={e => setIdentity({...identity, firstName: e.target.value})} />
                  <Field label="LAST NAME" value={identity.lastName} onChange={e => setIdentity({...identity, lastName: e.target.value})} />
                  <Field label="PHONE" value={identity.phone} onChange={e => setIdentity({...identity, phone: e.target.value})} />
                  <Field label="DATE OF BIRTH" value={identity.dob} onChange={e => setIdentity({...identity, dob: e.target.value})} type="date" />
                </div>
                
                <h3 style={{ fontSize: '1rem', margin: '1rem 0 0.5rem' }}>HEALTH SCREENINGS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <Field label="TB TEST DATE" value={health.tbDate} onChange={e => setHealth({...health, tbDate: e.target.value})} type="date" />
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>TB RESULT</label>
                    <select className="brutal-input small" value={health.tbResult} onChange={e => setHealth({...health, tbResult: e.target.value})}>
                      <option value="">Select...</option><option value="negative">Negative</option><option value="positive">Positive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: KYC & STRIPE */}
            {step === 3 && (
              <div className="brutal-card no-hover" style={{ textAlign: 'center' }}>
                <DollarSign size={48} style={{ color: 'var(--color-accent)', margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>FINANCIAL ONBOARDING</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>We use Stripe Connect to collect your W-9, verify your identity, and link your bank for direct deposits.</p>
                
                {stripeStatus === 'idle' && (
                  <button className="brutal-button" onClick={connectStripe} style={{ padding: '1rem 2rem' }}>
                    CONNECT WITH STRIPE <ArrowRight size={16} />
                  </button>
                )}
                {stripeStatus === 'redirecting' && (
                  <div style={{ color: 'var(--color-accent)' }}>Initiating Secure Stripe Connection...</div>
                )}
                {stripeStatus === 'linked' && (
                  <div style={{ padding: '1rem', border: '2px solid var(--color-success)', background: 'rgba(103,217,164,0.1)', color: 'var(--color-success)', fontWeight: 600, borderRadius: 'var(--radius-sm)' }}>
                    <CheckCircle size={18} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Stripe Account Connected & Identity Verified
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: BACKGROUND CHECK */}
            {step === 4 && (
              <div className="brutal-card no-hover">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}><Shield size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />BACKGROUND SCREENING</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Required 3rd party Checkr integration for 1099 platform compliance. You have passed KYC, proceeding with screening.</p>
                
                <div style={{ padding: '1.5rem', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', textAlign: 'center' }}>
                  {bgCheckStatus === 'idle' && (
                    <button className="brutal-button" onClick={handleBgCheck}>AUTHORIZE & RUN CHECK</button>
                  )}
                  {bgCheckStatus === 'loading' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-accent-dark)', fontWeight: 600 }}>
                      <div className="animate-spin" style={{ width: 16, height: 16, border: '2px solid var(--color-border-strong)', borderTop: '2px solid var(--color-accent)', borderRadius: '50%' }} />
                      RUNNING BACKGROUND SCREENING...
                    </div>
                  )}
                  {bgCheckStatus === 'cleared' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      <CheckCircle size={24} /> CLEARANCE GRANTED
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: E-SIGN FORMS */}
            {step === 5 && (
              <div className="brutal-card no-hover">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}><PenTool size={20} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} />E-SIGN AGREEMENTS</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Please review and digitally sign the following required agreements using SignNow.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {agreementsList.map((agr, idx) => (
                    <div key={idx} style={{ padding: '1rem', border: '2px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                        <FileText size={16} /> {agr.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', marginLeft: '1.5rem' }}>{agr.desc}</div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="brutal-input small"
                          placeholder="Type your full legal name to sign"
                          value={signatures[agr.name] || ''}
                          onChange={(e) => setSignatures({...signatures, [agr.name]: e.target.value})}
                          style={{ flex: 1 }}
                        />
                        {signatures[agr.name]?.length > 2 && <span style={{ color: 'var(--color-success)', alignSelf: 'center' }}><CheckCircle size={18} /></span>}
                      </div>
                    </div>
                  ))}
                </div>
                {signingStatus === 'loading' && <div style={{ marginTop: '1rem', color: 'var(--color-accent)' }}>Sending to SignNow...</div>}
                {signingStatus === 'sent' && <div style={{ marginTop: '1rem', color: 'var(--color-success)' }}>Invites sent successfully!</div>}
              </div>
            )}

            {/* STEP 6: Complete */}
            {step === 6 && (
              <div className="brutal-card no-hover" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ width: 80, height: 80, background: 'var(--color-success)', border: '3px solid var(--color-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: 'var(--shadow-brutal)' }}>
                  <CheckCircle size={40} />
                </div>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>YOU'RE SHIFT-READY!</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>Your compliance packet is complete.</p>
                <button className="brutal-button" onClick={finishOnboarding} style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  GO TO DASHBOARD <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {step < 6 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="brutal-button secondary" onClick={prevStep} disabled={step === 0}><ArrowLeft size={16} /> BACK</button>
            <button className="brutal-button" onClick={nextStep} disabled={signingStatus === 'loading'}>
              {step === 5 ? 'FINISH & SIGN' : 'NEXT'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
