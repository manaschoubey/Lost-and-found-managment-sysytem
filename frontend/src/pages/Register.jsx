import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      toast.success('Registered');
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Name"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="w-full border p-2 rounded" placeholder="Email"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" className="w-full border p-2 rounded" placeholder="Password"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <input className="w-full border p-2 rounded" placeholder="Phone (optional)"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="w-full bg-indigo-600 text-white py-2 rounded">Register</button>
      </form>
      <p className="mt-3 text-sm">
        Have an account? <Link to="/login" className="text-indigo-600">Login</Link>
      </p>
    </div>
  );
}