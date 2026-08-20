import { doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

// wishlist/{uid} -> { productIds: string[] }
export function subscribeWishlist(uid, callback) {
  return onSnapshot(doc(db, 'wishlist', uid), (snap) => {
    callback(snap.exists() ? snap.data().productIds || [] : []);
  });
}

export async function toggleWishlist(uid, productId, currentIds) {
  const isIn = currentIds.includes(productId);
  const next = isIn ? currentIds.filter((id) => id !== productId) : [...currentIds, productId];
  await setDoc(doc(db, 'wishlist', uid), { productIds: next }, { merge: true });
  return next;
}
