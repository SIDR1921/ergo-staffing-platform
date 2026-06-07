# PRN Float — AI Healthcare Staffing

PRN Float is an AI-native healthcare staffing marketplace connecting clinicians and contractors
(Nursing, EMS, NEMT, Rehab, DSP / Home Care, Allied Health) with facilities for on-demand and float-pool
shifts — with automated credentialing, EVV, compliance, and same-day pay.

- **Web:** React 19 + Vite, deployed on Firebase Hosting → **prnfloat.com**
- **Backend:** Firebase Cloud Functions (NPI verification, resume OCR, Stripe Connect, SignNow e-sign,
  AI concierge), Firestore, Storage
- **Native:** Capacitor (iOS / Android)
- **Support:** support@ergoconscious.com

## Quick start
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle → dist/
npm run lint
```

Create a `.env` with your Firebase web config (read in `src/lib/firebase.js`):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

## Project layout
| Path | What |
|---|---|
| `src/pages/` | Routed screens (Landing, Login, Onboarding, dashboards, etc.) |
| `src/components/` | Shared UI — incl. `Logo.jsx` (brand mark) and the design-system `brutal-*` classes |
| `src/contexts/AuthContext.jsx` | Firebase auth + profile/role |
| `functions/index.js` | Cloud Functions (NPI, resume OCR, Stripe Connect, SignNow, concierge) |
| `agreements/` | Contractor legal packet (signed during onboarding) |
| `docs/` | Product spec (`AI-Healthcare-Staffing-User-Journey.docx`) + `GAP_ANALYSIS.md` |

## Branding
- Wordmark: **PRN Float** · Logo: "Pulse + Float wave" mark (`src/components/Logo.jsx`,
  `public/favicon.svg`, `public/og-image.svg`)
- Palette: accent `#B0A4E5` → `#8475C8`, ink `#2D2A3E`, fonts Outfit + Plus Jakarta Sans

## Deploying
See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the prnfloat.com custom-domain, DNS, function env, and
Stripe/SignNow setup. The current gap roadmap is in [`docs/GAP_ANALYSIS.md`](./docs/GAP_ANALYSIS.md).
