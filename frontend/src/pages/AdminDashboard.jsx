import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('claims');
  const [analytics, setAnalytics] = useState(null);
  const [claims, setClaims] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const a = await api.get('/dashboard/admin');
      setAnalytics(a.data.data);
      const c = await api.get('/admin/claims');
      setClaims(c.data.data || []);
    } catch {
      toast.error('Failed to load dashboard data');
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadUsers();
  }, [loadData, loadUsers]);

  const actClaim = async (id, action) => {
    try {
      await api.put(`/admin/claims/${id}/${action}`);
      toast.success(`Claim ${action}d successfully`);
      loadData();
    } catch {
      toast.error(`Failed to ${action} claim`);
    }
  };

  const toggleUserStatus = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle-status`);
      toast.success(res.data.data.enabled ? 'User enabled' : 'User disabled');
      loadUsers();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const changeUserRole = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch {
      toast.error('Failed to update user role');
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      loadUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const chartData = Object.entries(analytics?.lostVsFound || {}).map(([k, v]) => ({
    name: k,
    count: v,
  }));

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🛠️ Admin Panel</h1>
          <p className="text-sm text-gray-500">Manage claims, view analytics, and oversee users</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('claims')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'claims'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            📊 Claims & Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'users'
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            👥 User Management ({users.length})
          </button>
        </div>
      </div>

      {activeTab === 'claims' && (
        <div className="space-y-6">
          {/* Analytics Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="font-bold text-gray-800 dark:text-white mb-4">📈 Lost vs Found Overview</h2>
            {analytics ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      borderColor: '#374151',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                    }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">Loading chart...</p>
            )}
          </div>

          {/* Claims Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 dark:text-white">📋 Claim Requests</h2>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2.5 py-1 rounded-full">
                {claims.length} total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="p-3 text-left">Claim ID</th>
                    <th className="p-3 text-left">Claimant</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Proof Description</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="p-3 font-mono text-xs text-gray-500">{c.id?.slice(-8)}</td>
                      <td className="p-3 text-gray-700 dark:text-gray-200">{c.claimantUserId}</td>
                      <td className="p-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            c.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : c.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {c.proofDescription || 'No proof provided'}
                      </td>
                      <td className="p-3 space-x-2">
                        {c.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => actClaim(c.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => actClaim(c.id, 'reject')}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {c.status !== 'PENDING' && (
                          <span className="text-xs text-gray-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {claims.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-6 text-center text-gray-400">
                        No claim requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Search & Stats */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-xs text-gray-500 self-end sm:self-auto">
              Showing {filteredUsers.length} of {users.length} users
            </span>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Joined</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-gray-400">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="p-3">
                        <p className="font-semibold text-gray-800 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300 text-xs">
                        {u.phone || '—'}
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeUserRole(u.id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            u.enabled !== false
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {u.enabled !== false ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="p-3 space-x-2">
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                            u.enabled !== false
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {u.enabled !== false ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.name)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-medium transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loadingUsers && filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-6 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}