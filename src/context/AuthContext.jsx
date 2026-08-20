import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  registerUser, loginUser, loginWithGoogle, logoutUser,
  subscribeToAuthChanges, fetchUserProfile,
} from '../firebase/auth';
import { getCurrentIdToken, decodeToken } from '../utils/jwt';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // Firestore `users/{uid}` doc
  const [role, setRole] = useState('guest');     // 'guest' | 'customer' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (user) => {
      setFirebaseUser(user);
      if (user) {
        const [token, userProfile] = await Promise.all([
          getCurrentIdToken(),
          fetchUserProfile(user.uid),
        ]);
        const decoded = decodeToken(token);
        setProfile(userProfile);

        // Determine admin role from custom claim, Firestore doc, or email keyword
        const isAdminUser =
          decoded?.role === 'admin' ||
          userProfile?.role === 'admin' ||
          user?.email?.toLowerCase().includes('admin');

        setRole(isAdminUser ? 'admin' : 'customer');
      } else {
        setProfile(null);
        setRole('guest');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signup = useCallback(async (payload) => {
    const user = await registerUser(payload);
    return user;
  }, []);

  const login = useCallback((email, password) => loginUser(email, password), []);
  const googleLogin = useCallback(() => loginWithGoogle(), []);
  const logout = useCallback(() => logoutUser(), []);

  const value = {
    user: firebaseUser,
    profile,
    role,
    isAuthenticated: !!firebaseUser,
    isAdmin: role === 'admin' || profile?.role === 'admin' || firebaseUser?.email?.toLowerCase().includes('admin'),
    loading,
    signup,
    login,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
