import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

/**
 * Wraps any route that requires login (and optionally a specific role).
 *
 * Usage:
 *   <Route path="/create-post" element={
 *     <ProtectedRoute allowedRoles={['author']}>
 *       <CreatePost />
 *     </ProtectedRoute>
 *   } />
 *
 * Behavior:
 *   - While the initial session check is running (`loading`), render nothing
 *     (or a spinner) instead of redirecting — prevents a logged-in author from
 *     being bounced to /login for a split second on every page refresh.
 *   - Not authenticated -> redirect to /login, remembering where they came
 *     from via location state so Login.jsx can send them back after success.
 *   - Authenticated but wrong role -> redirect to home (403-style UX) rather
 *     than /login, since re-logging-in won't fix a role mismatch.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
