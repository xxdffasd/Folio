import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenLine, Menu, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth.js';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#FAFAF7]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl italic text-stone-900">
          Folio<span className="text-accent-700">.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated && user?.role === 'author' && (
            <Link
              to="/create-post"
              className="flex items-center gap-1.5 rounded-full bg-accent-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-800"
            >
              <PenLine className="h-4 w-4" />
              Write a Story
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 pl-2">
              {/* FIXED: Bulletproof onError added to Desktop Avatar */}
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                alt={user?.name || 'User'}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-accent-100"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
                }}
              />
              <span className="text-sm font-medium text-stone-700">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-stone-600 hover:text-stone-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-stone-700 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="flex flex-col gap-3 border-t border-stone-200 bg-[#FAFAF7] px-4 py-4 md:hidden">
          {isAuthenticated && user?.role === 'author' && (
            <Link
              to="/create-post"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-accent-700 px-4 py-2 text-sm font-medium text-white"
            >
              <PenLine className="h-4 w-4" />
              Write a Story
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* FIXED: Bulletproof onError added to Mobile Avatar */}
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} 
                  alt={user?.name || 'User'} 
                  className="h-8 w-8 rounded-full object-cover" 
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`;
                  }}
                />
                <span className="text-sm font-medium text-stone-700">{user?.name}</span>
              </div>
              <button onClick={handleLogout} className="text-sm font-medium text-stone-500">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-stone-200 px-4 py-2 text-center text-sm font-medium text-stone-700"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-full bg-stone-900 px-4 py-2 text-center text-sm font-medium text-white"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;