import {
  collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

/** Helper to prevent long network hangs when Firebase SDK tries to connect */
function withTimeout(promise, ms = 1500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms)),
  ]);
}

/** Generic paginated query builder used by product/order/review services. */
export async function queryCollection(colName, { filters = [], sort, pageSize = 20, cursor } = {}) {
  let q = collection(db, colName);
  const clauses = filters.map((f) => where(f.field, f.op, f.value));
  const parts = [...clauses];
  if (sort) parts.push(orderBy(sort.field, sort.dir || 'asc'));
  if (cursor) parts.push(startAfter(cursor));
  parts.push(limit(pageSize));
  q = query(q, ...parts);
  const snap = await withTimeout(getDocs(q), 1500);
  return {
    docs: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    lastVisible: snap.docs[snap.docs.length - 1] || null,
  };
}

export async function getDocument(colName, id) {
  const snap = await withTimeout(getDoc(doc(db, colName, id)), 1500);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createDocument(colName, data, id) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  if (id) {
    await setDoc(doc(db, colName, id), payload);
    return id;
  }
  const ref = await addDoc(collection(db, colName), payload);
  return ref.id;
}

export async function updateDocument(colName, id, data) {
  await updateDoc(doc(db, colName, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteDocument(colName, id) {
  await deleteDoc(doc(db, colName, id));
}

export function listenToCollection(colName, filters = [], callback) {
  const clauses = filters.map((f) => where(f.field, f.op, f.value));
  const q = query(collection(db, colName), ...clauses);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function listenToDocument(colName, id, callback) {
  return onSnapshot(doc(db, colName, id), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}
