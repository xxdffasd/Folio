import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If ProtectedRoute redirected here, send the user back to where they were
  // trying to go instead of always landing on the home page.
  const redirectTo = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900">Log in</h1>

      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        No account?{' '}
        <Link to="/register" className="text-blue-600 underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
