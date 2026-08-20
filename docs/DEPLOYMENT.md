# RB_Protein — Deployment Guide

## 1. Prerequisites
- Node.js 20+
- A Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- Firebase CLI: `npm install -g firebase-tools`

## 2. Firebase project setup

```bash
firebase login
firebase init
```

Select: **Firestore, Functions, Hosting, Storage**. Point Firestore rules to
`firestore.rules`, Storage rules to `storage.rules`, and Hosting's public
directory to `dist`.

In the Firebase Console:
1. **Authentication** → Sign-in method → enable **Email/Password** and **Google**.
2. **Firestore Database** → Create database (production mode, pick a region close to your users).
3. **Storage** → Create default bucket.
4. **Project settings → General** → add a Web App → copy the config values into `.env` (copy `.env.example` → `.env` first).

## 3. Environment variables

```bash
cp .env.example .env
```

Fill in `VITE_FIREBASE_*` from the Firebase console web app config, and
`VITE_AI_API_URL` once the `aiChat` Cloud Function is deployed (step 6).

## 4. Install & run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## 5. Seed an initial admin user

There's no self-serve admin signup (by design). After registering your first
account as a normal customer through the UI, promote it manually:

```bash
firebase functions:shell
> setUserRole({uid: '<your-uid>', role: 'admin'}, {auth: {token: {role: 'admin'}}})
```

Or, for the very first admin (no admin exists yet to call `setUserRole`), set
the custom claim directly with the Admin SDK in a one-off script:

```js
// scripts/bootstrap-admin.js
const admin = require('firebase-admin');
admin.initializeApp();
admin.auth().setCustomUserClaims('<your-uid>', { role: 'admin' })
  .then(() => console.log('done'));
```
```bash
node scripts/bootstrap-admin.js
```

The user must log out and back in (or call `getIdToken(true)`) to pick up the new claim.

## 6. Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

This deploys:
- `setUserRole` — callable function admins use to change roles
- `onUserStatusChange` — Firestore trigger that syncs seller approval into custom claims
- `aiChat` — HTTPS endpoint backing the chatbot / nutrition recommendations / product suggestions

Wire your LLM provider key as a secret rather than plaintext:

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

Then reference `process.env.ANTHROPIC_API_KEY` in `functions/ai.js` (already
stubbed — uncomment the real `callLLM` implementation).

After deploying, copy the function's HTTPS URL into `VITE_AI_API_URL` in `.env`.

## 7. Deploy Firestore rules, indexes, and Storage rules

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 8. Build & deploy the frontend

```bash
npm run build
firebase deploy --only hosting
```

Your app is now live at `https://<project-id>.web.app`.

## 9. Payments (optional, production)

Checkout currently records `paymentStatus: 'pending'` and does not call a
payment gateway. To go live:
1. Add a Razorpay/Stripe Cloud Function that creates a payment intent/order.
2. On the client, call it from `Checkout.jsx` before `placeOrder`.
3. Verify the payment via a webhook Cloud Function, then update
   `orders/{id}.paymentStatus` to `'paid'`.

## 10. CI/CD (optional)

Add a GitHub Actions workflow that runs `npm run build` and
`firebase deploy --only hosting` on push to `main`, using a
`FIREBASE_TOKEN` secret from `firebase login:ci`.

## 11. Custom domain

Firebase Hosting → Add custom domain → follow the DNS verification steps,
then re-point your registrar's records as instructed.

---

## Local production preview

```bash
npm run build
npm run preview     # serves dist/ locally
```
