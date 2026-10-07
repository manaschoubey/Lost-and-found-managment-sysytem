import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">LostFound</Link>
          <div className="flex gap-4 items-center">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <Link to="/report-lost" className="hover:text-indigo-600">Report Lost</Link>
            <Link to="/report-found" className="hover:text-indigo-600">Report Found</Link>
            {user && <Link to="/dashboard" className="hover:text-indigo-600">Dashboard</Link>}
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="hover:text-indigo-600">Admin</Link>
            )}
            {user ? (
              <button
                onClick={() => { logout(); nav('/login'); }}
                className="bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-3 py-1 rounded">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">{children}</main>
    </div>
  );
}