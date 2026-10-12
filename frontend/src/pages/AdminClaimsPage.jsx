import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ──────────────────────────────────────────────────
   STATUS CONFIG
────────────────────────────────────────────────── */
const S = {
  PENDING:      { label: 'Pending',      icon: '⏳', ring: 'ring-amber-400',   bg: 'bg-amber-50',   text: 'text-amber-800',   dot: '#f59e0b' },
  UNDER_REVIEW: { label: 'Under Review', icon: '🔍', ring: 'ring-indigo-400',  bg: 'bg-indigo-50',  text: 'text-indigo-800',  dot: '#6366f1' },
  APPROVED:     { label: 'Approved',     icon: '✅', ring: 'ring-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-800', dot: '#10b981' },
  REJECTED:     { label: 'Rejected',     icon: '❌', ring: 'ring-red-400',     bg: 'bg-red-50',     text: 'text-red-800',     dot: '#ef4444' },
};

/* ──────────────────────────────────────────────────
   SMALL COMPONENTS
────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const m = S[status] || S.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${m.bg} ${m.text}`}>
      <span className="w-2 h-2 rounded-full" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function Avatar({ name, size = 10 }) {
  const initials = (name || '?').slice(0, 2).toUpperCase();
  const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
  const color  = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className={`w-${size} h-${size} rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Spinner() {
  return (
    <div className="w-8 h-8 border-[3px] border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
  );
}

/* ──────────────────────────────────────────────────
   IMAGE LIGHTBOX
────────────────────────────────────────────────── */
function Lightbox({ src, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} alt="proof" className="max-h-[90vh] max-w-full rounded-xl shadow-2xl" />
      <button className="absolute top-4 right-4 text-white text-3xl w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full" onClick={onClose}>×</button>
    </div>
  );
}

/* ──────────────────────────────────────────────────
   CLAIM REVIEW DRAWER (slides in from right)
────────────────────────────────────────────────── */
function ClaimDrawer({ claim, onClose, onAction }) {
  const [remarks, setRemarks]   = useState(claim.adminRemarks || '');
  const [loading, setLoading]   = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const nav = useNavigate();

  /* Load chat room if already approved */
  useEffect(() => {
    if (claim.status === 'APPROVED') {
      setLoadingRoom(true);
      api.get(`/admin/claims/${claim.id}/chat-room`)
        .then(r => setChatRoom(r.data.data))
        .catch(() => setChatRoom(null))
        .finally(() => setLoadingRoom(false));
    }
  }, [claim.id, claim.status]);

  const act = async (action) => {
    setLoading(action);
    try {
      await onAction(claim.id, action, remarks);
      onClose();
    } catch {
      setLoading('');
    }
  };

  const canAct = claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* ── Drawer Header ── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-5 flex items-start justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">Claim Review</h2>
            <p className="text-slate-400 text-xs font-mono mt-0.5 select-all">{claim.id}</p>
            <div className="mt-2">
              <StatusBadge status={claim.status} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg transition">×</button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Claimant + Item info */}
          <div className="px-6 py-5 border-b border-gray-100 space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Claimant</p>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Avatar name={claim.claimantUserId} size={10} />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{claim.claimantUserId}</p>
                  <p className="text-xs text-gray-400">
                    Submitted: {claim.createdAt ? new Date(claim.createdAt).toLocaleString() : '—'}
                  </p>
                  {claim.updatedAt && claim.updatedAt !== claim.createdAt && (
                    <p className="text-xs text-gray-400">
                      Updated: {new Date(claim.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Item Reference</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-xl">🎒</span>
                <div>
                  <p className="text-xs text-indigo-700 font-semibold">Found Item ID</p>
                  <p className="text-xs font-mono text-indigo-900">{claim.foundItemId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Proof Description */}
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">📄 Proof Description</p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[80px]">
              {claim.proofDescription || <span className="italic text-gray-400">No description provided</span>}
            </div>
          </div>

          {/* Proof Images */}
          {claim.proofImages?.length > 0 && (
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">
                📷 Evidence Photos ({claim.proofImages.length})
              </p>
              <div className="grid grid-cols-2 gap-3">
                {claim.proofImages.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(`http://localhost:8080${url}`)}
                    className="group relative rounded-xl overflow-hidden border-2 border-gray-200 hover:border-indigo-400 transition aspect-video bg-gray-100">
                    <img src={`http://localhost:8080${url}`} alt={`proof-${i}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold transition bg-black/60 px-2 py-1 rounded-full">
                        🔍 Enlarge
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Room (if approved) */}
          {claim.status === 'APPROVED' && (
            <div className="px-6 py-5 border-b border-gray-100">
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">💬 Connected Chat Room</p>
              {loadingRoom ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50">
                  <Spinner /> <span className="text-sm text-gray-400">Loading chat room…</span>
                </div>
              ) : chatRoom ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                        <span className="text-xl">💬</span> {chatRoom.itemName}
                      </p>
                      <p className="text-xs text-emerald-700 mt-1 font-mono truncate">Room ID: {chatRoom.id}</p>
                    </div>
                    <span className="text-xs bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      {chatRoom.status || 'OPEN'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                      <p className="text-emerald-600 font-semibold mb-0.5">🔍 Finder</p>
                      <p className="text-gray-700 truncate font-medium">{chatRoom.finderName || chatRoom.finderUserId}</p>
                      <p className="text-gray-400 truncate text-[10px]">{chatRoom.finderUserId}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 border border-emerald-100">
                      <p className="text-emerald-600 font-semibold mb-0.5">👤 Claimant</p>
                      <p className="text-gray-700 truncate font-medium">{chatRoom.claimantName || chatRoom.claimantUserId}</p>
                      <p className="text-gray-400 truncate text-[10px]">{chatRoom.claimantUserId}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => nav(`/chats/${chatRoom.id}`)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-md shadow-emerald-200">
                    <span>💬</span> Open Chat Room & Monitor
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-400">
                  No chat room found for this claim
                </div>
              )}
            </div>
          )}

          {/* Admin Remarks */}
          <div className="px-6 py-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
              Admin Remarks
              <span className="normal-case text-gray-300 ml-1">(shown to claimant)</span>
            </p>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={!canAct}
              placeholder={canAct ? "Add a note for the claimant (optional)…" : claim.adminRemarks || "No remarks added"}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* ── Sticky Action Bar ── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4 bg-white">
          {canAct ? (
            <div className="flex flex-wrap gap-2">
              {claim.status === 'PENDING' && (
                <button onClick={() => act('review')} disabled={!!loading}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 border-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50">
                  {loading === 'review' ? <Spinner /> : '🔍'} Under Review
                </button>
              )}
              <button onClick={() => act('approve')} disabled={!!loading}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50 shadow-lg shadow-emerald-200">
                {loading === 'approve' ? <Spinner /> : '✅'} Approve & Connect
              </button>
              <button onClick={() => act('reject')} disabled={!!loading}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50 shadow-lg shadow-red-200">
                {loading === 'reject' ? <Spinner /> : '❌'} Reject
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <span className="text-lg">{S[claim.status]?.icon}</span>
              <span>This claim was <strong>{claim.status.toLowerCase()}</strong>. No further actions available.</span>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════ */
export default function AdminClaimsPage() {
  const [claims, setClaims]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState(null);
  const [refreshing, setRefreshing]   = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const r = await api.get('/admin/claims');
      setClaims(r.data.data || []);
    } catch { toast.error('Failed to load claims'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Action handler ── */
  const handleAction = async (id, action, remarks) => {
    try {
      const params = remarks?.trim() ? { params: { remarks } } : {};
      await api.put(`/admin/claims/${id}/${action}`, null, params);
      const label = action === 'approve' ? 'Approved ✅' : action === 'reject' ? 'Rejected ❌' : 'Marked under review 🔍';
      toast.success(`${label} — claimant has been notified`);
      await load(true);
    } catch {
      toast.error(`Failed to ${action} claim`);
      throw new Error('failed');
    }
  };

  /* ── Derived ── */
  const counts = {
    ALL:          claims.length,
    PENDING:      claims.filter(c => c.status === 'PENDING').length,
    UNDER_REVIEW: claims.filter(c => c.status === 'UNDER_REVIEW').length,
    APPROVED:     claims.filter(c => c.status === 'APPROVED').length,
    REJECTED:     claims.filter(c => c.status === 'REJECTED').length,
  };

  const filtered = claims.filter(c => {
    const statusOk = filterStatus === 'ALL' || c.status === filterStatus;
    const q = search.toLowerCase();
    const textOk = !q ||
      c.claimantUserId?.toLowerCase().includes(q) ||
      c.foundItemId?.toLowerCase().includes(q) ||
      c.proofDescription?.toLowerCase().includes(q) ||
      c.id?.toLowerCase().includes(q);
    return statusOk && textOk;
  });

  const urgent = counts.PENDING + counts.UNDER_REVIEW;

  /* ════════════════ JSX ════════════════ */
  return (
    <div className="min-h-full space-y-6 pb-12">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-8 py-8 text-white">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">⚖️</span>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Claims Management</h1>
                <p className="text-indigo-300 text-sm">Review evidence · Approve claims · Connect people</p>
              </div>
            </div>
            {urgent > 0 && (
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-sm px-4 py-2 rounded-full font-semibold mt-2 animate-pulse">
                ⚡ {urgent} claim{urgent !== 1 ? 's' : ''} need{urgent === 1 ? 's' : ''} your attention
              </div>
            )}
          </div>

          {/* Mini stats */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Pending',  value: counts.PENDING,      color: 'from-amber-500/20 to-amber-600/10 border-amber-400/30 text-amber-300' },
              { label: 'Approved', value: counts.APPROVED,     color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-400/30 text-emerald-300' },
              { label: 'Total',    value: counts.ALL,           color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-400/30 text-indigo-300' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-gradient-to-br ${color} border rounded-2xl px-4 py-3 text-center min-w-[70px]`}>
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-xs opacity-80 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BG decoration */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-indigo-500/10 rounded-full" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-purple-500/10 rounded-full" />
      </div>

      {/* ── Filter + Search bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by claimant, item ID, or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg">×</button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
              }`}>
              {s === 'ALL' ? `All (${counts.ALL})`
               : s === 'UNDER_REVIEW' ? `Under Review (${counts.UNDER_REVIEW})`
               : `${S[s]?.label} (${counts[s]})`}
            </button>
          ))}

          <button onClick={() => load(true)} disabled={refreshing}
            className="px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition disabled:opacity-50">
            {refreshing ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Spinner />
          <p className="text-gray-400 text-sm font-medium">Loading claims…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-gray-100">
          <span className="text-6xl">📭</span>
          <p className="font-bold text-gray-600 text-lg">No claims found</p>
          <p className="text-sm text-gray-400">
            {filterStatus !== 'ALL' || search
              ? 'Try clearing the filters'
              : 'No claims have been submitted yet'}
          </p>
          {(filterStatus !== 'ALL' || search) && (
            <button onClick={() => { setFilterStatus('ALL'); setSearch(''); }}
              className="mt-2 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim) => {
            const m = S[claim.status] || S.PENDING;
            const needsAction = claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW';
            return (
              <div
                key={claim.id}
                onClick={() => setSelected(claim)}
                className={`group relative flex items-stretch gap-0 bg-white border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ${
                  needsAction ? 'ring-1 ring-amber-200 border-amber-100' : 'border-gray-100'
                }`}>

                {/* Left accent stripe */}
                <div className="w-1 flex-shrink-0" style={{ background: m.dot }} />

                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">

                  {/* Claimant avatar + info */}
                  <div className="flex items-center gap-3 sm:w-52 flex-shrink-0">
                    <Avatar name={claim.claimantUserId} size={10} />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{claim.claimantUserId}</p>
                      <p className="text-[10px] text-gray-400 font-mono truncate">{claim.foundItemId?.slice(-12)}</p>
                    </div>
                  </div>

                  {/* Proof snippet */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {claim.proofDescription || <span className="italic text-gray-300">No description</span>}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-gray-400">
                        🕐 {claim.createdAt ? new Date(claim.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                      {claim.proofImages?.length > 0 && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                          📷 {claim.proofImages.length} photo{claim.proofImages.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {claim.adminRemarks && (
                        <span className="text-[10px] text-gray-400 italic truncate max-w-[120px]">
                          💬 "{claim.adminRemarks}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status + CTA */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={claim.status} />
                    <div className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      needsAction
                        ? 'bg-indigo-600 text-white group-hover:bg-indigo-700 shadow-md shadow-indigo-200'
                        : claim.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100 border border-gray-200'
                    }`}>
                      {needsAction ? '⚖️ Review →' : claim.status === 'APPROVED' ? '💬 View Chat' : '🔎 View'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How it works – only show if no claims yet */}
      {!loading && claims.length === 0 && (
        <div className="rounded-3xl border border-dashed border-gray-200 p-8 mt-4">
          <h3 className="font-bold text-gray-700 text-center mb-6">How the claim flow works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            {[
              { step: '1', icon: '📋', title: 'Claimant submits', desc: 'User submits a claim with proof description & photos' },
              { step: '2', icon: '🔍', title: 'Admin reviews',    desc: 'Admin examines evidence and marks Under Review' },
              { step: '3', icon: '✅', title: 'Approve / Reject', desc: 'Approve to auto-create a chat room between both parties' },
              { step: '4', icon: '💬', title: 'Connected!',       desc: 'Finder & claimant chat to coordinate handover safely' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-extrabold text-lg flex items-center justify-center">
                  {step}
                </div>
                <span className="text-3xl">{icon}</span>
                <p className="font-semibold text-gray-700 text-sm">{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawer */}
      {selected && (
        <ClaimDrawer
          claim={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
        />
      )}
    </div>
  );
}
