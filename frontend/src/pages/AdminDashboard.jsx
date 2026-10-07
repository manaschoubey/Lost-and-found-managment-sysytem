import { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [claims, setClaims] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const a = await api.get('/dashboard/admin');
    setAnalytics(a.data.data);
    const c = await api.get('/admin/claims');
    setClaims(c.data.data);
  };

  const act = async (id, action) => {
    await api.put(`/admin/claims/${id}/${action}`);
    toast.success('Updated');
    load();
  };

  if (!analytics) return <p>Loading...</p>;

  const chartData = Object.entries(analytics.lostVsFound || {})
    .map(([k, v]) => ({ name: k, count: v }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-bold mb-3">Lost vs Found</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="font-bold mb-2">Claim Requests</h2>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Claim ID</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Proof</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.status}</td>
                <td className="p-2">{c.proofDescription}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => act(c.id, 'approve')}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                  <button onClick={() => act(c.id, 'reject')}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                </td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr><td colSpan="4" className="p-3 text-center text-gray-500">No claims</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}