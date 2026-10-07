import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportLostItem } from '../services/api';

export default function ReportLost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    categoryId: 'misc',
    date: ''
  });
  const [images, setImages] = useState([]);

  const handleChange = (e) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      // Append form fields as JSON string matching Spring's @RequestPart
      data.append('item', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      
      // Append images
      images.forEach(img => {
        data.append('images', img);
      });

      const res = await reportLostItem(data);
      if (res.data.success) {
        navigate(`/items/lost/${res.data.data.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <h2 className="text-3xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
          <span className="bg-red-500/20 text-red-400 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </span>
          Report Lost Item
        </h2>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Item Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
              placeholder="e.g. Black Leather Wallet"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none"
              placeholder="Provide detailed description (color, brand, identifying marks...)"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Location Lost</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                placeholder="e.g. Main Library, Floor 2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date & Time Lost (approx)</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Upload Images (Optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
            />
            {images.length > 0 && (
              <p className="mt-2 text-xs text-indigo-400">{images.length} file(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loading ? 'Submitting...' : 'Report Lost Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
