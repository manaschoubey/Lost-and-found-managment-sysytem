import { useState, useEffect } from 'react';
import { getAdminDashboardStats, getPendingClaims, approveClaim, rejectClaim } from '../services/api';
import Loader from '../components/Loader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, claimsRes] = await Promise.all([
        getAdminDashboardStats(),
        getPendingClaims()
      ]);
      setStats(statsRes.data.data);
      setClaims(claimsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') await approveClaim(id, 'Approved by admin');
      if (action === 'reject') await rejectClaim(id, 'Rejected by admin');
      
      // Refresh pending claims
      const res = await getPendingClaims();
      setClaims(res.data.data || []);
      
      // Refresh stats
      const statsRes = await getAdminDashboardStats();
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
      alert('Action failed');
    }
  };

  if (loading) return <Loader text="Loading admin dashboard..." />;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">System overview and claim management.</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, color: 'text-indigo-400' },
            { label: 'Lost Items', value: stats.totalLostItems, color: 'text-red-400' },
            { label: 'Found Items', value: stats.totalFoundItems, color: 'text-teal-400' },
            { label: 'Pending Claims', value: stats.pendingClaims, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending Claims Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          Pending Claims
          <span className="bg-amber-500/20 text-amber-400 py-1 px-2.5 rounded-lg text-sm">
            {claims.length}
          </span>
        </h2>

        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              No pending claims to review.
            </div>
          ) : (
            claims.map(claim => (
              <div key={claim.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row gap-6 justify-between">
                  <div className="space-y-3 flex-1">
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-500 block mb-1">Claimant ID:</span> 
                      {claim.claimantId}
                    </p>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-500 block mb-1">Target Found Item ID:</span> 
                      <a href={`/items/found/${claim.foundItemId}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                        {claim.foundItemId} ↗
                      </a>
                    </p>
                    <p className="text-sm text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block mb-1">Proof Provided:</span> 
                      {claim.proofDescription}
                    </p>
                    {claim.proofImageUrl && (
                      <div>
                        <span className="text-slate-500 text-sm block mb-1">Proof Image:</span>
                        <img 
                          src={`http://localhost:8080${claim.proofImageUrl}`} 
                          alt="Proof" 
                          className="h-32 object-contain rounded-lg border border-slate-800"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => handleAction(claim.id, 'approve')}
                      className="flex-1 px-6 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(claim.id, 'reject')}
                      className="flex-1 px-6 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl transition-colors font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
