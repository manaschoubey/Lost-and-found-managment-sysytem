import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ItemDetails() {
  const { type, id } = useParams();       // type = "lost" | "found"
  const { user } = useAuth();
  const nav = useNavigate();
  const [item, setItem] = useState(null);
  const [showClaim, setShowClaim] = useState(false);
  const [proof, setProof] = useState('');

  useEffect(() => {
    api.get(`/items/${type}/${id}`).then(r => setItem(r.data.data));
  }, [type, id]);

  const submitClaim = async () => {
    const data = new FormData();
    data.append('data', new Blob([JSON.stringify({
      foundItemId: item.id,
      proofDescription: proof
    })], { type: 'application/json' }));

    try {
      await api.post('/claims', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Claim submitted');
      setShowClaim(false);
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (!item) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold">{item.itemName}</h1>
      <p className="text-gray-600 mt-1">{item.location}</p>
      <p className="mt-3">{item.description}</p>

      {item.imageUrls?.length > 0 && (
        <div className="flex gap-2 mt-3">
          {item.imageUrls.map((u, i) => (
            <img key={i} src={'http://localhost:8080' + u}
                 className="w-40 h-40 object-cover rounded" />
          ))}
        </div>
      )}

      {user && (
        <p className="mt-4 text-sm text-gray-500">
          Contact info is hidden until a claim is approved.
        </p>
      )}

      {type === 'found' && user && (
        <button onClick={() => setShowClaim(true)}
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
          Claim Item
        </button>
      )}

      {showClaim && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-3">Submit Claim</h2>
            <textarea className="w-full border p-2 rounded mb-3" rows={4}
              placeholder="Explain proof of ownership"
              value={proof} onChange={(e) => setProof(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowClaim(false)}
                className="px-3 py-1 border rounded">Cancel</button>
              <button onClick={submitClaim}
                className="px-3 py-1 bg-indigo-600 text-white rounded">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}