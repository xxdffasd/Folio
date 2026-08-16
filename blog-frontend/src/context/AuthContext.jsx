import { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axiosConfig';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for active session on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axiosInstance.get('/auth/me');
        // Safely extract the user whether it's wrapped in a data object or not
        const currentUser = res.data.data?.user || res.data.user; 
        setUser(currentUser);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  // 2. Login
  // Change the parameters to accept a single object containing email and password
  const login = async ({ email, password }) => { 
    const res = await axiosInstance.post('/auth/login', { email, password });
    const currentUser = res.data.data?.user || res.data.user;
    setUser(currentUser);
    setIsAuthenticated(true);
  };

  // 3. Register
  const register = async (userData) => {
    const res = await axiosInstance.post('/auth/register', userData);
    const currentUser = res.data.data?.user || res.data.user;
    setUser(currentUser);
    setIsAuthenticated(true);
  };

  

  const logout = async () => {
    await axiosInstance.post('/auth/logout');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};