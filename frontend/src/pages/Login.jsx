import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const u = await login(email, password);
      toast.success('Welcome ' + u.name);
      nav(u.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" className="w-full border p-2 rounded" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Login</button>
      </form>
      <p className="mt-3 text-sm">
        No account? <Link to="/register" className="text-indigo-600">Register</Link>
      </p>
    </div>
  );
}