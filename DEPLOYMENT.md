# Deploying PRN Float to prnfloat.com

The app code now targets the **PRN Float** brand and the `prnfloat.com` domain. A few steps must be
done in the Firebase / DNS / registrar consoles — they can't be scripted from the repo.

> The internal Firebase **project id stays `ergo-staffing-platform`** (renaming a Firebase project id is
> not supported). Only the public-facing domain and brand change. `capacitor.config.json`'s `appId`
> (`com.ergo.healthcare`) is likewise left unchanged so existing native builds / store listings keep
> working. These are internal identifiers and never shown to users.

## 1. Build & deploy hosting
```bash
npm install
npm run build          # outputs to dist/
firebase deploy --only hosting
```

## 2. Add the custom domain in Firebase Hosting
1. Firebase Console → **Hosting** → **Add custom domain** → `prnfloat.com` (and `www.prnfloat.com`).
2. Firebase shows TXT (verification) + A records. Add them at your DNS provider:
   - `TXT @` → value Firebase provides (ownership verification)
   - `A @` → `151.101.1.195` and `151.101.65.195` (Firebase's published IPs — use whatever the console shows)
   - `CNAME www` → `prnfloat.com` (or the target Firebase shows)
3. Wait for verification + SSL cert provisioning (minutes–hours).

## 3. Cloud Functions environment variables
Set these so the backend uses the right keys and the production URL:
```bash
firebase functions:config:set \
  app.url="https://prnfloat.com"          # also exported as APP_URL below if using v2 / dotenv
# Secrets (preferred: Functions secrets / .env for the functions codebase):
#   OPENAI_API_KEY, STRIPE_SECRET_KEY, SIGNNOW_ACCESS_TOKEN, APP_URL
```
- `APP_URL` (default `https://prnfloat.com`) controls the Stripe Connect `refresh_url` / `return_url`
  in `functions/index.js`. Without it, redirects fall back to the production domain.
- The Stripe **live** key must be set via env — do **not** commit it.

## 4. Stripe & SignNow dashboards
- Stripe: add `https://prnfloat.com/onboarding?stripe=success` (and `...=refresh`) to allowed redirect
  domains; update branding/email to PRN Float; sender domain `ergoconscious.com`.
- SignNow: set the templates for the 6 onboarding agreements; the invite email sender is
  `system@ergoconscious.com`.

## 5. Frontend Firebase config (.env)
The web app reads `VITE_FIREBASE_*` vars at build time (`src/lib/firebase.js`). Keep `authDomain` as the
Firebase default (`ergo-staffing-platform.firebaseapp.com`) **or** switch it to `prnfloat.com` after the
custom domain is verified, and add `prnfloat.com` to **Authentication → Settings → Authorized domains**
(required for Google/Apple sign-in popups to work on the new domain).

## 6. Native apps (Capacitor)
- `capacitor.config.json` `server.url` points at the dev server (`localhost:5173`) for live-reload.
  For production native builds, remove the `server` block so the app loads the bundled `dist/`.
- `appName` is now **PRN Float** (store display name). `appId` is unchanged.

## Support / brand contacts
- Public domain: **prnfloat.com**
- Support email: **support@ergoconscious.com**
- System/sender email: **system@ergoconscious.com**
