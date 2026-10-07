import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('found');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { load(); }, [tab, page]);

  const load = async () => {
    const res = await api.get(`/items/${tab}`, {
      params: { page, size: 6, keyword }
    });
    setItems(res.data.data.content);
    setTotalPages(res.data.data.totalPages || 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Search Items</h1>

      <div className="flex gap-2 mb-4">
        {['found', 'lost'].map(t => (
          <button key={t}
            onClick={() => { setTab(t); setPage(0); }}
            className={`px-4 py-2 rounded ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>
            {t.toUpperCase()}
          </button>
        ))}
        <input className="border p-2 rounded flex-1" placeholder="Search by name..."
          value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <button onClick={() => { setPage(0); load(); }}
          className="bg-gray-800 text-white px-4 rounded">Search</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.map(i => (
          <div key={i.id} className="bg-white p-4 rounded shadow">
            {i.imageUrls?.[0] && (
              <img src={'http://localhost:8080' + i.imageUrls[0]}
                   className="w-full h-40 object-cover rounded mb-2" />
            )}
            <h3 className="font-bold">{i.itemName}</h3>
            <p className="text-sm text-gray-600">{i.location}</p>
            <Link to={`/item/${tab}/${i.id}`}
              className="text-indigo-600 text-sm">View details →</Link>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2 mt-6">
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <span className="px-3 py-1">Page {page + 1} / {totalPages}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}