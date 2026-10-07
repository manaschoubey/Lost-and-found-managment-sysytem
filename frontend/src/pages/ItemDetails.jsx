import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLostItem, getFoundItem, submitClaim } from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';

export default function ItemDetails() {
  const { type, id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Claim modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimDesc, setClaimDesc] = useState('');
  const [claimImage, setClaimImage] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = type === 'lost' ? await getLostItem(id) : await getFoundItem(id);
        setItem(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [type, id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaiming(true);
    setClaimError('');

    try {
      const formData = new FormData();
      formData.append('claim', new Blob([JSON.stringify({
        foundItemId: item.id,
        proofDescription: claimDesc
      })], { type: 'application/json' }));
      
      if (claimImage) {
        formData.append('proofImage', claimImage);
      }

      await submitClaim(formData);
      setClaimSuccess(true);
      setTimeout(() => {
        setIsClaimModalOpen(false);
      }, 2000);
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <Loader />;
  if (!item) return <div className="text-center text-white">Item not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Images Grid */}
        {item.imageUrls && item.imageUrls.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 bg-slate-950 p-1">
            {item.imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={`http://localhost:8080${url}`}
                alt="Item"
                className="w-full h-64 object-cover rounded-xl"
              />
            ))}
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  type === 'lost' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                }`}>
                  {type === 'lost' ? 'Lost' : 'Found'}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-slate-500/20 text-slate-400 border-slate-500/30">
                  {item.status}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">{item.title}</h1>
            </div>
            
            {type === 'found' && item.status === 'OPEN' && (
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Claim This Item
              </button>
            )}
          </div>

          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            {item.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-6 p-6 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <p className="text-sm text-slate-500 mb-1">Location</p>
              <p className="text-white font-medium">{item.location || item.locationFound}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Date</p>
              <p className="text-white font-medium">
                {new Date(item.dateLost || item.dateFound || item.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => !claiming && setIsClaimModalOpen(false)}
        title="Claim Item"
      >
        {claimSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Claim Submitted!</h3>
            <p className="text-slate-400">The admin will review your claim shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-5">
            {claimError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                {claimError}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Proof Description</label>
              <textarea
                required
                rows="4"
                value={claimDesc}
                onChange={e => setClaimDesc(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 resize-none"
                placeholder="Describe specific details only the owner would know..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Proof Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setClaimImage(e.target.files[0])}
                className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setIsClaimModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={claiming}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                {claiming ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
