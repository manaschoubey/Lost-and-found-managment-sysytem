import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function ItemDetails() {
  const { type, id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [item, setItem] = useState(null);

  // Claim modal state
  const [showClaim, setShowClaim] = useState(false);
  const [proof, setProof] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/items/${type}/${id}`);
      setItem(r.data.data);
    } catch {
      toast.error('Failed to load item');
    }
  }, [type, id]);

  useEffect(() => { load(); }, [load]);

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const closeModal = () => {
    setShowClaim(false);
    setProof('');
    removeImage();
  };

  const submitClaim = async () => {
    if (!proof.trim()) {
      toast.error('Please describe your proof of ownership');
      return;
    }

    const data = new FormData();
    data.append('data', new Blob(
      [JSON.stringify({ foundItemId: item.id, proofDescription: proof })],
      { type: 'application/json' }
    ));
    if (imageFile) data.append('images', imageFile);

    try {
      await api.post('/claims', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Claim submitted');
      closeModal();
      nav('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    }
  };

  if (!item) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold">{item.itemName}</h1>
      <p className="text-gray-600 mt-1">{item.location}</p>
      <p className="mt-3">{item.description}</p>

      {item.imageUrls?.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {item.imageUrls.map((u, i) => (
            <img key={i} src={'http://localhost:8080' + u}
                 className="w-40 h-40 object-cover rounded"
                 alt={`item-${i}`} />
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
          className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Claim Item
        </button>
      )}

      {/* ============ CLAIM MODAL ============ */}
      {showClaim && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">

            <h2 className="text-lg font-bold mb-1">Submit Claim</h2>
            <p className="text-sm text-gray-500 mb-4">
              Provide proof that this item belongs to you
            </p>

            {/* Two-corner layout: image on left, writing on right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* ---------- LEFT CORNER: Image upload ---------- */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2 text-center">
                  📷 Proof Image
                </p>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      className="w-full h-44 object-cover rounded"
                      alt="proof preview"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-red-700"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    <label className="mt-2 block text-center text-xs text-indigo-600 cursor-pointer hover:underline">
                      Change image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-44 cursor-pointer text-gray-500 hover:text-indigo-600 transition">
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* ---------- RIGHT CORNER: Writing area ---------- */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2 text-center">
                  ✍️ Written Proof
                </p>

                <textarea
                  className="w-full h-44 border border-gray-300 p-3 rounded resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Explain how you can prove this item is yours. Include details like:
• Unique marks or scratches
• IMEI / serial number
• Purchase date and store
• Contents inside the item"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  maxLength={1000}
                />

                <div className="text-right text-xs text-gray-400 mt-1">
                  {proof.length}/1000
                </div>
              </div>
            </div>

            {/* ---------- Buttons ---------- */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border rounded hover:bg-gray-100">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitClaim}
                disabled={!proof.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}