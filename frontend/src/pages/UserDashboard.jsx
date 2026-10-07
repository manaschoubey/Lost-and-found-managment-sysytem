import { useState, useEffect } from 'react';
import { getMyLostItems, getMyFoundItems, getMyClaims } from '../services/api';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

export default function UserDashboard() {
  const [lost, setLost] = useState([]);
  const [found, setFound] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost', 'found', 'claims'

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [lostRes, foundRes, claimsRes] = await Promise.all([
          getMyLostItems(),
          getMyFoundItems(),
          getMyClaims()
        ]);
        setLost(lostRes.data.data || []);
        setFound(foundRes.data.data || []);
        setClaims(claimsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return <Loader text="Loading your dashboard..." />;

  const tabs = [
    { id: 'lost', label: `My Lost Items (${lost.length})` },
    { id: 'found', label: `My Found Items (${found.length})` },
    { id: 'claims', label: `My Claims (${claims.length})` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
        <p className="text-slate-400">Manage your reported items and claims.</p>
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 min-h-[400px]">
        {activeTab === 'lost' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lost.length === 0 ? (
              <p className="text-slate-500 col-span-full text-center py-10">You haven't reported any lost items.</p>
            ) : (
              lost.map(item => <ItemCard key={item.id} item={item} type="lost" />)
            )}
          </div>
        )}

        {activeTab === 'found' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {found.length === 0 ? (
              <p className="text-slate-500 col-span-full text-center py-10">You haven't reported any found items.</p>
            ) : (
              found.map(item => <ItemCard key={item.id} item={item} type="found" />)
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-4">
            {claims.length === 0 ? (
              <p className="text-slate-500 text-center py-10">You haven't submitted any claims.</p>
            ) : (
              claims.map(claim => (
                <div key={claim.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                  <div>
                    <div className="flex gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        claim.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                        claim.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      }`}>
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">
                      <span className="text-slate-500">Proof:</span> {claim.proofDescription}
                    </p>
                    {claim.adminNotes && (
                      <p className="text-sm text-slate-300 mt-2">
                        <span className="text-slate-500">Admin Note:</span> {claim.adminNotes}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 shrink-0">
                    {new Date(claim.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
