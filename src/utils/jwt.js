import { jwtDecode } from "jwt-decode";
import { auth } from "../firebase/firebase";

/**
 * RB_Protein uses Firebase Authentication as the identity provider. Firebase
 * ID tokens ARE signed JWTs (RS256), so we don't hand-roll a parallel token
 * system — we decode/verify the Firebase-issued JWT and read the custom
 * claims (role, status) that a Cloud Function attaches on signup/approval.
 *
 * Flow:
 * 1. User signs in via Firebase Auth (email/password or Google).
 * 2. `onAuthStateChanged` fires -> client calls `getIdToken()` to get the JWT.
 * 3. Client decodes the JWT locally (for instant UI role-gating) AND sends
 *    it as `Authorization: Bearer <token>` to any backend/Cloud Function.
 * 4. The backend verifies the JWT signature with `firebase-admin` before
 *    trusting the claims (see docs/DEPLOYMENT.md -> Cloud Functions section).
 * 5. Admin promotes a user's role by calling a Cloud Function that runs
 *    `admin.auth().setCustomUserClaims(uid, { role: 'admin' })`. The client
 *    must force-refresh the token (`getIdToken(true)`) to pick up new claims.
 */

export async function getCurrentIdToken(forceRefresh = false) {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken(forceRefresh);
}

/** Client-side decode ONLY — never trust this for authorization decisions
 *  on a server; it's for instant, non-security-critical UI state (nav links,
 *  route gating before Firestore rules kick in as the real enforcement layer). */
export function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function getRoleFromToken(decoded) {
  return decoded?.role || decoded?.claims?.role || "customer";
}

export function isTokenExpired(decoded) {
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

/** Attach bearer token to fetch() calls made to Cloud Functions / AI proxy. */
export async function authHeader() {
  const token = await getCurrentIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
