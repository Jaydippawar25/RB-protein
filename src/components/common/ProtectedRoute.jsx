import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/** Wrap routes that require auth and/or a specific role. */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader full label="Checking session" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Restrict Admin routes strictly to Admin users only
  if (roles && roles.includes('admin') && !isAdmin && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
