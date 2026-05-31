const functions = require('firebase-functions');
const admin = require('firebase-admin');
const pdfParse = require('pdf-parse');
// Using the provided Live Stripe Key as fallback if environment is missing
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || ''); 

admin.initializeApp();

// API Keys
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const SIGNNOW_ACCESS_TOKEN = process.env.SIGNNOW_ACCESS_TOKEN || "";

// --- 1. AI Concierge ---
const SYSTEM_PROMPT = `You are Float Assistant, the AI concierge for Ergo, a healthcare staffing platform.
Answer the user's questions based on the following platform policies:
- SSN: We collect your SSN for background checks and tax reporting (1099). Encrypted with AES-256-GCM.
- Payments: Direct deposit within 24-48 hours of a completed shift. Instant Pay enabled shifts receive funds within 2 hours.
- Human Support: Contact support@ergo.health or call (555) 123-4567 (8AM-8PM EST).
- Labs/Screenings: Visit Quest Diagnostics or LabCorp. TB tests, drug screens, and flu vaccines are covered by Ergo.
Keep your answers brief, professional, and helpful.`;

exports.chatWithAI = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages.map(m => ({ role: m.role, content: m.text }))]
      })
    });
    const result = await response.json();
    return { reply: result.choices[0].message.content };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// --- 2. NPI Validation ---
exports.validateNPI = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  const { npi } = data;
  
  try {
    const response = await fetch(`https://npiregistry.cms.hhs.gov/api/?number=${npi}&version=2.1`);
    const result = await response.json();
    
    if (result.results && result.results.length > 0) {
      const provider = result.results[0];
      if (provider.basic.status === 'A') { // Active
        return { 
          valid: true, 
          name: `${provider.basic.first_name} ${provider.basic.last_name}`,
          taxonomy: provider.taxonomies[0]?.desc || 'Unknown'
        };
      }
    }
    return { valid: false, reason: "NPI not found or inactive." };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error connecting to CMS NPI Registry.');
  }
});

// --- 3. Resume OCR ---
exports.parseResume = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  const { storagePath } = data; // gs://... or relative path
  
  try {
    // 1. Download PDF from Firebase Storage
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);
    const [buffer] = await file.download();
    
    // 2. Parse PDF to Text
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;
    
    // 3. Send to OpenAI for structured extraction
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost efficient but smart
        messages: [
          { role: "system", content: "Extract the work history, education, and skills from the following resume text. Output purely as a JSON object with keys: 'work_history' (array of objects with 'title', 'company', 'duration'), 'education' (string), 'skills' (array of strings). Do not include markdown blocks." },
          { role: "user", content: rawText }
        ]
      })
    });
    
    const result = await response.json();
    let structuredData;
    try {
      structuredData = JSON.parse(result.choices[0].message.content);
    } catch (e) {
      // If parsing fails (e.g. OpenAI outputted markdown formatting)
      const cleanString = result.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '');
      structuredData = JSON.parse(cleanString);
    }
    
    return { success: true, data: structuredData };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('internal', 'Failed to process resume OCR.');
  }
});

// --- 4. Stripe Connect ---
exports.createStripeConnectAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  
  try {
    // 1. Create the account
    const account = await stripe.accounts.create({
      type: 'express',
      email: context.auth.token.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // 2. Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:5173/onboarding?stripe=refresh',
      return_url: 'http://localhost:5173/onboarding?stripe=success',
      type: 'account_onboarding',
    });

    // Save the Stripe Account ID to the user's profile
    await admin.firestore().collection('profiles').doc(context.auth.uid).update({
      stripe_account_id: account.id,
      stripe_onboarding_status: 'pending'
    });

    return { url: accountLink.url };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// --- 5. SignNow Invite ---
exports.sendSignNowInvite = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  const { documentId, email } = data; 
  // We'll assume a template ID is passed or hardcoded
  
  try {
    const response = await fetch(`https://api.signnow.com/document/${documentId}/invite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SIGNNOW_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        to: [
          {
            email: email,
            role_id: '', // Would map to your template's specific role ID
            order: 1
          }
        ],
        from: 'system@ergo.health',
        subject: 'Signature Required: Ergo Staffing Agreements',
        message: 'Please complete the attached documents to finish your onboarding.'
      })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SignNow API Error: ${errorText}`);
    }

    return { success: true, message: "Invite sent successfully." };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError('internal', 'Failed to send E-Sign invite via SignNow.');
  }
});
