import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Ensures user profile document exists in Firestore `users/{uid}` collection.
 */
export async function ensureUserDoc(user, extraData = {}) {
  if (!user) return;
  const ref = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        name: extraData.name || user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || extraData.email || '',
        role: extraData.role || 'customer',
        status: 'active',
        photoURL: user.photoURL || '',
        phone: extraData.phone || '',
        addresses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Firestore ensureUserDoc error:', err);
    throw err;
  }
}

/**
 * Registers a new user account in Firebase Auth and creates
 * profile document in the `users` Firestore collection.
 */
export async function registerUser({ name, email, password, role = 'customer' }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await updateProfile(cred.user, { displayName: name });
  } catch (e) {
    console.warn('updateProfile warning:', e.message);
  }

  await ensureUserDoc(cred.user, { name, email, role });
  return cred.user;
}

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  try {
    await ensureUserDoc(cred.user);
  } catch (err) {
    console.warn('Login user doc sync warning:', err.message);
  }
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  try {
    await ensureUserDoc(cred.user);
  } catch (err) {
    console.warn('Google login user doc sync warning:', err.message);
  }
  return cred.user;
}

export async function logoutUser() {
  return signOut(auth);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

export async function fetchUserProfile(uid) {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.warn('fetchUserProfile warning:', err.message);
    return null;
  }
}

export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
