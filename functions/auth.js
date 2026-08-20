const functions = require('firebase-functions');
const admin = require('firebase-admin');

/**
 * Callable function: an admin promotes/demotes a user's role.
 * The client calls this via `httpsCallable(functions, 'setUserRole')`.
 * This is what attaches `role` as a *custom claim* on the Firebase ID
 * token (a real JWT) — the client-side jwt.js decoder reads it from there.
 */
exports.setUserRole = functions.https.onCall(async (data, context) => {
  if (context.auth?.token?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can change roles.');
  }
  const { uid, role } = data;
  if (!['customer', 'admin'].includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid role.');
  }
  await admin.auth().setCustomUserClaims(uid, { role });
  await admin.firestore().doc(`users/${uid}`).update({ role });
  return { success: true };
});
