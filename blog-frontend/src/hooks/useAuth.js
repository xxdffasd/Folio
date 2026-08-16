import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Usage: const { user, isAuthenticated, loading, login, logout } = useAuth();
 * Throws early and loudly if used outside <AuthProvider> — much easier to
 * debug than a silent `undefined` context value.
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
};

export default useAuth;
