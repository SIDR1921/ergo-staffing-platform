# PRN Float — Gap Analysis & Improvement Roadmap

This report compares the current application against the canonical product spec
(`docs/AI-Healthcare-Staffing-User-Journey.docx`) and lists what's built, what's partial, and what's
missing — prioritized by impact and effort.

**Legend:** ✅ Present · 🟡 Partial / mocked · ⛔ Missing
**Effort:** S (hours) · M (days) · L (weeks)

---

## 1. Clinician / Contractor journey

| Spec capability | Status | Notes | Effort | Priority |
|---|---|---|---|---|
| Discovery & acquisition (ad/referral/SMS attribution) | 🟡 | Referral code/link exists (`Referrals.jsx`); no UTM/source capture or attribution analytics. | M | Med |
| Mobile-first landing page | ✅ | `Landing.jsx`, responsive. | — | — |
| **Discipline-specific landing pages** (EMT/PT/RN/DSP…) | ⛔ | Single generic landing. Verticals now shown as badges (quick win), but no per-discipline routes/pay/testimonials. | M | High |
| AI personalization (location/device/profession → dynamic pay, shifts, testimonials) | ⛔ | All landing content is static. | L | Med |
| Account creation (phone/Google/Apple/email) | 🟡 | Email + Google + Apple wired (`AuthContext`); **phone auth not implemented**. | S | Med |
| Fraud scoring / duplicate / geo / device fingerprint at signup | ⛔ | None. | L | Med |
| Smart onboarding — NPI verify | ✅ | Real CMS NPI lookup (`functions/validateNPI`). | — | — |
| Onboarding — resume OCR / AI extraction | ✅ | `parseResume` (pdf-parse + OpenAI). | — | — |
| Credential upload (license/CPR/DL/insurance/vaccine) | 🟡 | `CredentialVault.jsx` exists; no OCR expiration detection or license auto-verify on upload. | M | High |
| **Compliance packet signing** (Contractor, NDA, Confidentiality, **EVV, HIPAA, Arbitration**) | ✅ | **Now complete** — all 6 in onboarding step 5 (was 3). SignNow call is still a stub invite. | — | — |
| AI credentialing engine — OIG/SAM exclusion, background, scoring | 🟡 | Background check is a mocked timer (`handleBgCheck`); no OIG/SAM; no compliance score. | L | High |
| Shift marketplace (nearby, surge, AI-recommended, est. earnings) | 🟡 | `ShiftFeed.jsx` lists shifts & filters; **no surge pricing, no AI recommendation/earnings model**. | L | High |
| Shift acceptance with instant credential/conflict/no-show/fraud checks | 🟡 | Accept flow exists; the automated gating checks are not implemented. | M | High |
| Pre-shift workflow (instructions, GPS, checklist, lateness prediction) | 🟡 | `ShiftDetail.jsx` + `LiveMap.jsx`; no lateness/traffic prediction. | M | Med |
| **EVV / clock-in** — GPS, **QR, kiosk, telephony backup**, geofence, face/device verify | 🟡 | `GPSCheckInOut.jsx` does GPS geofence only. QR/kiosk/telephony/face missing. | M | High |
| During shift — messaging, incident reporting, AI assist, burnout detection | 🟡 | Messaging + concierge present; incident reporting & burnout detection missing. | M | Med |
| Shift completion — EVV validation, doc review, payable-hours calc | 🟡 | UI for clock-out exists; server-side validation/anomaly flagging not implemented. | M | High |
| Payments & earnings (completed, pending, **instant pay**, bonuses, forecast) | 🟡 | `Payments.jsx` / `Earnings.jsx` + Stripe Connect onboarding; payouts & instant-pay are not executed; no forecast. | L | High |
| Reputation & growth (ratings, reliability, completion, clinical-quality scores) | ⛔ | No scoring system. | M | Med |
| Long-term engagement (license renewal, CEU, upskilling) | ⛔ | None. | M | Low |

## 2. Facility / Client journey

| Spec capability | Status | Notes | Effort | Priority |
|---|---|---|---|---|
| Facility signup (type, locations, needs, credential reqs) | 🟡 | Facility role + `FacilityDashboard.jsx`; structured intake form is thin. | M | High |
| AI staffing intake (urgency, specialty, acuity, ratios, certs) | ⛔ | No guided AI intake. | M | High |
| Shift posting (open, contracts, float pool, last-minute) | 🟡 | Posting exists; contracts/float-pool/last-minute typing not modeled. | M | Med |
| **AI matching engine** (distance, creds, reliability, accept-probability ranking) | ⛔ | No ranking/matching service. | L | High |
| Real-time fill engine (push/SMS blasts, surge, batching, waitlist) | ⛔ | No notification/fill automation. | L | High |
| Facility dashboard (live status, ETAs, compliance, EVV, billing) | 🟡 | Dashboard present; ETAs/EVV/billing widgets are mocked. | M | Med |
| Billing & invoicing (auto invoices, EVV verify, bill rates, OT, flags) | ⛔ | No billing/invoicing engine. | L | High |

## 3. Internal Ops / AI layer

| Spec capability | Status | Notes | Effort | Priority |
|---|---|---|---|---|
| Role-based ops dashboards (Super Admin, CEO, CTO, Ops, Compliance, Payroll, Marketing, Account Mgr) | 🟡 | Single `AdminPanel.jsx` + `ComplianceDashboard.jsx`. The 8 ops personas/KPIs are not modeled. | L | Med |
| Role-based auth + MFA + risk scoring | 🟡 | Roles exist; `SecuritySettings.jsx` mocks TOTP; no real MFA enforcement or risk scoring. | M | Med |
| AI task queue / escalations / recommended decisions | ⛔ | None. | L | Med |
| Cross-team collaboration (notes, tags, audit trails, AI summaries) | 🟡 | `Disputes.jsx` threads only. | M | Low |
| Reporting & analytics (GMV, fill rate, margin, retention, liquidity) | ⛔ | No analytics layer. | L | Med |
| AI copilot per ops user | ⛔ | Only the clinician-facing concierge exists. | L | Low |

## 4. Platform / infra

| Area | Status | Notes |
|---|---|---|
| Stripe redirect URLs | ✅ Fixed | Were hardcoded to `localhost:5173`; now read `APP_URL` (default `https://prnfloat.com`). |
| Function secrets | 🟡 | OpenAI/Stripe/SignNow keys read from env; ensure set in Functions config (see `DEPLOYMENT.md`). |
| Phone auth, SMS (Twilio) | ⛔ | Needed for phone signup + fill-engine SMS blasts. |
| Push notifications (FCM) | ⛔ | Needed for real-time fill. |
| Custom domain `prnfloat.com` | 🟡 | Code updated; DNS + Firebase Hosting custom-domain steps in `DEPLOYMENT.md`. |

---

## Recommended sequencing

**Shipped in this pass (quick wins):**
1. Full PRN Float rebrand + new "Pulse + Float wave" logo (favicon, sidebar, landing, auth, onboarding).
2. Compliance packet completed — added EVV / HIPAA / Arbitration acknowledgments; hardened the "sign all" gate.
3. Landing now advertises the real verticals (EMS, NEMT, Rehab, Nursing, DSP/Home Care, Allied Health).
4. Stripe redirect URLs made environment-aware for production.
5. Source legal docs + product spec committed to the repo (`agreements/`, `docs/`).

**Next (highest impact / reasonable effort):**
1. Credential upload → OCR + expiration detection + license auto-verify (extends existing `parseResume` + `validateNPI`).
2. Real background screening (Checkr/Yardstik) + OIG/SAM exclusion checks (replace mocked `handleBgCheck`).
3. AI matching + ranking service feeding `ShiftFeed`, with surge pricing and est. weekly earnings.
4. Instant-pay payout execution on top of the existing Stripe Connect onboarding.
5. Facility AI intake form + structured shift typing (contracts / float pool / last-minute).

**Later (platform depth):**
EVV multi-mode (QR/kiosk/telephony/face), reputation scoring, ops role dashboards + AI task queue,
billing/invoicing engine, analytics (GMV/fill/margin/retention), phone auth + FCM/Twilio fill engine.
