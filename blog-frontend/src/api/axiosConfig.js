import axios from 'axios';

// withCredentials: true is REQUIRED for the JWT httpOnly cookie flow — without
// it, the browser will never attach the auth cookie to cross-origin requests
// (frontend on :5173, backend on :5000), and every protected route will 401.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
