import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserMenu from '../components/UserMenu';

export default function MainLayout({ children }) {
  const { user } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:text-indigo-600'
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <span>🎒</span> LostFound
          </Link>

          <div className="flex gap-2 items-center">
            <NavLink to="/" className={navLinkClass} end>Home</NavLink>
            <NavLink to="/report-lost" className={navLinkClass}>Report Lost</NavLink>
            <NavLink to="/report-found" className={navLinkClass}>Report Found</NavLink>

            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 hover:text-indigo-600 px-3">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>

      <footer className="text-center text-xs text-gray-400 py-4">
        Lost & Found Management System © 2026
      </footer>
    </div>
  );
}