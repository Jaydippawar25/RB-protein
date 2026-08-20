import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC2YVhFRT1yytnXFf9MokSZSWdlI8zp1Ls",
  authDomain: "cars-65113.firebaseapp.com",
  projectId: "cars-65113",
  storageBucket: "cars-65113.firebasestorage.app",
  messagingSenderId: "672080619951",
  appId: "1:672080619951:web:39a2d39b5bb72728e3a75a",
  measurementId: "G-E0GN2JY4TV"
};

const isConfigured = Boolean(
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('PLACEHOLDER') &&
  firebaseConfig.apiKey !== 'AIzaSyC2YVhFRT1yytnXFf9MokSZSWdlI8zp1Ls'
);

if (!isConfigured) {
  console.warn(
    '⚠️ [Firebase] API Key is missing or unconfigured.\n' +
    'Please configure your Firebase credentials in config.js or .env.'
  );
}

// Avoid re-initializing during Vite HMR
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
