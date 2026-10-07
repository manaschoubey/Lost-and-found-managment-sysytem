import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import { getAllLostItems, getAllFoundItems } from '../services/api';
import Loader from '../components/Loader';

export default function Home() {
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const [lostRes, foundRes] = await Promise.all([
          getAllLostItems(),
          getAllFoundItems(),
        ]);
        
        // Take just the latest 4 of each
        const lost = Array.isArray(lostRes.data.data) ? lostRes.data.data : [];
        const found = Array.isArray(foundRes.data.data) ? foundRes.data.data : [];
        
        setRecentLost(lost.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4));
        setRecentFound(found.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4));
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-16 lg:p-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Lost it? <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">We'll help you find it.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
            The smartest platform for reporting lost belongings and helping others find theirs. AI-powered matching brings your items back faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/report-lost" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25">
              I Lost Something
            </Link>
            <Link to="/report-found" className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-2xl hover:bg-slate-700 hover:text-white transition-all">
              I Found Something
            </Link>
          </div>
        </div>
      </section>

      {/* Lists Section */}
      {loading ? (
        <Loader text="Loading recent items..." />
      ) : (
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Recent Lost Items */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </span>
                Recently Lost
              </h2>
            </div>
            
            {recentLost.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                No lost items reported recently.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {recentLost.map(item => (
                  <ItemCard key={item.id} item={item} type="lost" />
                ))}
              </div>
            )}
          </section>

          {/* Recent Found Items */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                Recently Found
              </h2>
            </div>
            
            {recentFound.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
                No found items reported recently.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {recentFound.map(item => (
                  <ItemCard key={item.id} item={item} type="found" />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
