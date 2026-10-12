import { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import toast from 'react-hot-toast';

/* ─────────────── palette ─────────────── */
const STATUS_META = {
  PENDING:      { label: 'Pending',      color: '#f59e0b', bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  UNDER_REVIEW: { label: 'Under Review', color: '#6366f1', bg: '#ede9fe', text: '#3730a3', dot: '#6366f1' },
  APPROVED:     { label: 'Approved',     color: '#10b981', bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  REJECTED:     { label: 'Rejected',     color: '#ef4444', bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
};

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

/* ─────────────── tiny helpers ─────────────── */
const Badge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span style={{ background: m.bg, color: m.text }}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
};

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col gap-2"
    style={{ background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`, border: `1px solid ${color}30` }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
      style={{ background: `${color}20` }}>
      {icon}
    </div>
    <p className="text-3xl font-extrabold text-gray-900">{value ?? '—'}</p>
    <p className="text-sm font-semibold text-gray-600">{label}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
    <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-10"
      style={{ background: color }} />
  </div>
);

/* ─────────────── Claim Detail Modal ─────────────── */
function ClaimModal({ claim, onClose, onAction }) {
  const [remarks, setRemarks] = useState(claim.adminRemarks || '');
  const [loading, setLoading] = useState('');
  const overlayRef = useRef();

  const act = async (action) => {
    setLoading(action);
    try {
      await onAction(claim.id, action, remarks);
      onClose();
    } finally {
      setLoading('');
    }
  };

  return (
    <div ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* header */}
        <div className="sticky top-0 bg-white rounded-t-3xl px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Claim Review</h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {claim.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={claim.status} />
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-lg transition">
              ×
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* claimant info */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Claimant</h3>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {(claim.claimantUserId || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{claim.claimantUserId}</p>
                <p className="text-xs text-gray-400">
                  Submitted {claim.createdAt ? new Date(claim.createdAt).toLocaleString() : '—'}
                </p>
              </div>
            </div>
          </section>

          {/* item info */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Item Reference</h3>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-mono text-gray-600">
              Found Item ID: <span className="font-semibold text-gray-800">{claim.foundItemId}</span>
            </div>
          </section>

          {/* proof description */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">Proof Description</h3>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {claim.proofDescription || <span className="italic text-gray-400">No description provided</span>}
            </div>
          </section>

          {/* proof images */}
          {claim.proofImages?.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
                Proof Images ({claim.proofImages.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {claim.proofImages.map((url, i) => (
                  <a key={i} href={`http://localhost:8080${url}`} target="_blank" rel="noreferrer"
                    className="group relative block rounded-xl overflow-hidden border border-gray-200 hover:border-indigo-400 transition">
                    <img src={`http://localhost:8080${url}`} alt={`proof-${i}`}
                      className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold bg-black/50 px-2 py-1 rounded-full transition">
                        Open full size
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* admin remarks */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-2">
              Admin Remarks <span className="normal-case text-gray-300">(optional — visible to claimant)</span>
            </h3>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-gray-50"
              rows={3}
              placeholder="Add remarks for the claimant (e.g. 'Please visit office with ID proof')"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </section>

          {/* actions */}
          {claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW' ? (
            <div className="flex flex-wrap gap-3 pt-1">
              {claim.status === 'PENDING' && (
                <button
                  onClick={() => act('review')}
                  disabled={!!loading}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50">
                  {loading === 'review' ? '⏳' : '🔍'} Mark Under Review
                </button>
              )}
              <button
                onClick={() => act('approve')}
                disabled={!!loading}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50 shadow-md shadow-emerald-200">
                {loading === 'approve' ? '⏳' : '✅'} Approve Claim
              </button>
              <button
                onClick={() => act('reject')}
                disabled={!!loading}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50 shadow-md shadow-red-200">
                {loading === 'reject' ? '⏳' : '❌'} Reject Claim
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-500">
              <span>ℹ️</span>
              This claim has already been <strong className="ml-1">{claim.status.toLowerCase()}</strong>.
              {claim.adminRemarks && <span className="ml-2 italic">"{claim.adminRemarks}"</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('claims');

  /* data */
  const [analytics, setAnalytics]   = useState(null);
  const [claims, setClaims]           = useState([]);
  const [users, setUsers]             = useState([]);

  /* UI state */
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [loadingUsers, setLoadingUsers]   = useState(false);
  const [filterStatus, setFilterStatus]   = useState('ALL');
  const [searchClaims, setSearchClaims]   = useState('');
  const [searchUsers, setSearchUsers]     = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);

  /* ── loaders ── */
  const loadAnalytics = useCallback(async () => {
    try {
      const r = await api.get('/dashboard/admin');
      setAnalytics(r.data.data);
    } catch { /* silent */ }
  }, []);

  const loadClaims = useCallback(async () => {
    setLoadingClaims(true);
    try {
      const r = await api.get('/admin/claims');
      setClaims(r.data.data || []);
    } catch { toast.error('Failed to load claims'); }
    finally { setLoadingClaims(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const r = await api.get('/admin/users');
      setUsers(r.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoadingUsers(false); }
  }, []);

  useEffect(() => {
    loadAnalytics();
    loadClaims();
  }, [loadAnalytics, loadClaims]);

  useEffect(() => {
    if (activeTab === 'users' && users.length === 0) loadUsers();
  }, [activeTab, users.length, loadUsers]);

  /* ── claim action ── */
  const handleClaimAction = async (id, action, remarks) => {
    try {
      const params = remarks ? { params: { remarks } } : {};
      await api.put(`/admin/claims/${id}/${action}`, null, params);
      toast.success(`Claim ${action}d successfully`);
      await loadClaims();
      await loadAnalytics();
    } catch {
      toast.error(`Failed to ${action} claim`);
      throw new Error('action failed');
    }
  };

  /* ── user actions ── */
  const toggleUserStatus = async (id) => {
    try {
      const r = await api.put(`/admin/users/${id}/toggle-status`);
      toast.success(r.data.data.enabled ? 'User enabled' : 'User disabled');
      loadUsers();
    } catch { toast.error('Failed to update user'); }
  };

  const changeRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      toast.success(`Role changed to ${role}`);
      loadUsers();
    } catch { toast.error('Failed to change role'); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      loadUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  /* ── derived data ── */
  const filteredClaims = claims.filter((c) => {
    const statusOk = filterStatus === 'ALL' || c.status === filterStatus;
    const q = searchClaims.toLowerCase();
    const textOk = !q ||
      c.claimantUserId?.toLowerCase().includes(q) ||
      c.foundItemId?.toLowerCase().includes(q) ||
      c.proofDescription?.toLowerCase().includes(q);
    return statusOk && textOk;
  });

  const filteredUsers = users.filter((u) => {
    const q = searchUsers.toLowerCase();
    return !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q);
  });

  const statusCounts = {
    PENDING:      claims.filter(c => c.status === 'PENDING').length,
    UNDER_REVIEW: claims.filter(c => c.status === 'UNDER_REVIEW').length,
    APPROVED:     claims.filter(c => c.status === 'APPROVED').length,
    REJECTED:     claims.filter(c => c.status === 'REJECTED').length,
  };

  const pieData = Object.entries(statusCounts).map(([k, v]) => ({
    name: STATUS_META[k]?.label || k, value: v,
  }));

  const barData = Object.entries(analytics?.lostVsFound || {}).map(([k, v]) => ({
    name: k.charAt(0).toUpperCase() + k.slice(1), count: v,
  }));

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="space-y-6 pb-10">

      {/* ── Page Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 text-white">
        <div className="relative z-10">
          <h1 className="text-2xl font-extrabold tracking-tight">🛠️ Admin Control Center</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Manage claims, review evidence, and oversee all users
          </p>
        </div>
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute top-4 right-16 w-16 h-16 rounded-full bg-white/5" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="📋" label="Total Claims" value={claims.length} color="#6366f1" sub={`${statusCounts.PENDING} pending review`} />
        <StatCard icon="⏳" label="Pending" value={statusCounts.PENDING} color="#f59e0b" sub="Awaiting decision" />
        <StatCard icon="✅" label="Approved" value={statusCounts.APPROVED} color="#10b981" sub="Items returned" />
        <StatCard icon="❌" label="Rejected" value={statusCounts.REJECTED} color="#ef4444" sub="Claim denied" />
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { id: 'claims', label: '📋 Claims', badge: statusCounts.PENDING || null },
          { id: 'analytics', label: '📊 Analytics' },
          { id: 'users', label: '👥 Users', badge: users.length || null },
        ].map(({ id, label, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`relative px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}>
            {label}
            {badge != null && badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: CLAIMS ════════════════ */}
      {activeTab === 'claims' && (
        <div className="space-y-4">

          {/* Filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="🔍  Search by claimant, item ID, or description…"
              value={searchClaims}
              onChange={(e) => setSearchClaims(e.target.value)}
              className="flex-1 min-w-[220px] px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    filterStatus === s
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}>
                  {s === 'ALL' ? `All (${claims.length})` :
                   s === 'UNDER_REVIEW' ? `Under Review (${statusCounts[s]})` :
                   `${STATUS_META[s]?.label} (${statusCounts[s]})`}
                </button>
              ))}
            </div>
          </div>

          {/* Claims list */}
          {loadingClaims ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading claims…</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="font-semibold text-gray-600">No claims found</p>
              <p className="text-sm text-gray-400 mt-1">
                {filterStatus !== 'ALL' ? 'Try clearing the filter' : 'No claims have been submitted yet'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* table header */}
              <div className="grid grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Claim</span>
                <span>Description</span>
                <span>Claimant</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {filteredClaims.map((c, idx) => (
                <div
                  key={c.id}
                  className={`grid grid-cols-[1fr_2fr_1.5fr_1fr_auto] gap-3 px-5 py-4 items-center border-b border-gray-50 hover:bg-indigo-50/40 transition cursor-pointer ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                  onClick={() => setSelectedClaim(c)}>

                  {/* claim id + date */}
                  <div>
                    <p className="font-mono text-xs text-gray-500">{c.id?.slice(-8).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </p>
                    {c.proofImages?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full mt-1">
                        📷 {c.proofImages.length} img
                      </span>
                    )}
                  </div>

                  {/* description */}
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {c.proofDescription || <span className="italic text-gray-300">No description</span>}
                  </p>

                  {/* claimant */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                      {(c.claimantUserId || '?')[0].toUpperCase()}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{c.claimantUserId}</p>
                  </div>

                  {/* status */}
                  <Badge status={c.status} />

                  {/* action */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedClaim(c); }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition whitespace-nowrap">
                    {c.status === 'PENDING' || c.status === 'UNDER_REVIEW' ? '⚖️ Review' : '🔎 View'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════ TAB: ANALYTICS ════════════════ */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Claim status pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">🥧 Claim Status Breakdown</h3>
            {claims.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No claims data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90} paddingAngle={4} stroke="none">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [v, 'Count']} />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Lost vs Found bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">📊 Lost vs Found Items</h3>
            {barData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No analytics data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barCategoryGap="40%">
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '0.75rem', color: '#fff' }}
                    cursor={{ fill: '#6366f110' }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#6366f1' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* summary cards */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:col-span-2">
            <h3 className="font-bold text-gray-800 mb-4">📈 Platform Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Lost Reports',  value: analytics?.lostVsFound?.lost   ?? '—', emoji: '🔍' },
                { label: 'Found Reports', value: analytics?.lostVsFound?.found  ?? '—', emoji: '🎒' },
                { label: 'Total Claims',  value: analytics?.totalClaims         ?? '—', emoji: '📋' },
                { label: 'Total Users',   value: users.length || '—',                    emoji: '👥' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                  <p className="text-2xl mb-1">{emoji}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ TAB: USERS ════════════════ */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <input
              type="text"
              placeholder="🔍  Search users by name, email, or role…"
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              className="flex-1 min-w-[220px] px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <span className="text-xs text-gray-400">
              {filteredUsers.length} of {users.length} users
            </span>
          </div>

          {loadingUsers ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Loading users…</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_auto] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>User</span><span>Phone</span><span>Role</span><span>Status</span><span>Joined</span><span>Actions</span>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No users found</div>
              ) : filteredUsers.map((u, idx) => (
                <div key={u.id}
                  className={`grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_auto] gap-3 px-5 py-4 items-center border-b border-gray-50 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}>

                  {/* user */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {(u.name || u.email || '?')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  <span className="text-xs text-gray-500">{u.phone || '—'}</span>

                  {/* role select */}
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    className="text-xs font-semibold px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer">
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>

                  {/* status */}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    u.enabled !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                  }`}>
                    {u.enabled !== false ? '● Active' : '● Disabled'}
                  </span>

                  {/* joined */}
                  <span className="text-xs text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </span>

                  {/* actions */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => toggleUserStatus(u.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        u.enabled !== false
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}>
                      {u.enabled !== false ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Claim Detail Modal ── */}
      {selectedClaim && (
        <ClaimModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onAction={handleClaimAction}
        />
      )}
    </div>
  );
}