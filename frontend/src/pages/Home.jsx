import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ItemCard from '../components/ItemCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('found');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/items/${tab}`, {
        params: { page, size: 6, keyword }
      });
      setItems(res.data.data.content);
      setTotalPages(res.data.data.totalPages || 1);
    } catch {
      console.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [tab, page, keyword]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => { setPage(0); load(); };

  const isEmpty = !loading && items.length === 0;

  return (
    <div>
      {/* Hero header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Search Items</h1>
        <p className="text-gray-500 mt-1">
          Find lost items or browse what others have found
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col md:flex-row gap-2 mb-6">
        <div className="flex gap-1 bg-white p-1 rounded-lg border border-gray-200">
          {['found', 'lost'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setPage(0); }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                tab === t
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t === 'found' ? '📦 Found' : '🔍 Lost'}
            </button>
          ))}
        </div>

        <input
          className="flex-1 border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          placeholder="Search by item name..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <button
          onClick={handleSearch}
          className="bg-gray-800 hover:bg-gray-900 text-white px-5 rounded-lg font-medium transition"
        >
          Search
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        }

        {!loading && items.map((item) => (
          <ItemCard key={item.id} item={item} tab={tab} />
        ))}

        {isEmpty && (
          <EmptyState
            icon={tab === 'lost' ? '🔍' : '📦'}
            title={`No ${tab} items found`}
            message={
              keyword
                ? `We couldn't find anything matching "${keyword}". Try a different search.`
                : `Be the first to report a ${tab} item!`
            }
            actionLabel={`Report ${tab === 'lost' ? 'Lost' : 'Found'} Item`}
            actionTo={tab === 'lost' ? '/report-lost' : '/report-found'}
          />
        )}
      </div>

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            ← Prev
          </button>

          <span className="px-4 py-2 text-sm text-gray-600">
            Page <span className="font-semibold">{page + 1}</span> of {totalPages}
          </span>

          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}