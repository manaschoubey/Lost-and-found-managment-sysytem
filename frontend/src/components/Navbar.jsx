import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { useState } from 'react';

export default function Navbar() {
  const { user, logoutUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              LostFound
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all">
              Home
            </Link>
            {user && (
              <>
                <Link to="/report-lost" className="px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all">
                  Report Lost
                </Link>
                <Link to="/report-found" className="px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all">
                  Report Found
                </Link>
                <Link to="/dashboard" className="px-3 py-2 text-sm text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-all">
                  Dashboard
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="px-3 py-2 text-sm text-amber-400 hover:text-amber-300 rounded-lg hover:bg-slate-800 transition-all">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="hidden sm:flex items-center gap-3">
                  <span className="text-sm text-slate-400">
                    {user.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                {mobileOpen ? (
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-800 mt-2 pt-3 space-y-1">
            <Link to="/" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800">Home</Link>
            {user && (
              <>
                <Link to="/report-lost" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800">Report Lost</Link>
                <Link to="/report-found" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800">Report Found</Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800">Dashboard</Link>
                {isAdmin() && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm text-amber-400 rounded-lg hover:bg-slate-800">Admin</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-slate-800">Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
