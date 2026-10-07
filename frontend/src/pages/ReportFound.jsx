import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportFoundItem } from '../services/api';

export default function ReportFound() {
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
      data.append('item', new Blob([JSON.stringify(formData)], { type: 'application/json' }));
      
      images.forEach(img => {
        data.append('images', img);
      });

      const res = await reportFoundItem(data);
      if (res.data.success) {
        navigate(`/items/found/${res.data.data.id}`);
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
        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <h2 className="text-3xl font-bold text-white mb-6 relative z-10 flex items-center gap-3">
          <span className="bg-teal-500/20 text-teal-400 p-2 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
          Report Found Item
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
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
              placeholder="e.g. Set of Keys with blue keychain"
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
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all resize-none"
              placeholder="Provide detailed description..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Location Found</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                placeholder="e.g. Park bench near fountain"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date & Time Found</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {loading ? 'Submitting...' : 'Report Found Item'}
          </button>
        </form>
      </div>
    </div>
  );
}
