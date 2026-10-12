import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function ReportFound() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    itemName: '', description: '', categoryId: '', location: '', date: '', contactInfo: ''
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('data', new Blob([JSON.stringify(form)], { type: 'application/json' }));
    if (file) data.append('images', file);

    try {
      await api.post('/items/found', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Found item reported');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Report Found Item</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Item name"
          value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required />
        <textarea className="w-full border p-2 rounded" placeholder="Description"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Category ID (optional)"
          value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Location"
          value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input type="date" className="w-full border p-2 rounded"
          value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <input className="w-full border p-2 rounded" placeholder="Contact info"
          value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} />

        <input type="file" accept="image/*" onChange={onFile} />
        {preview && <img src={preview} className="w-40 h-40 object-cover rounded" />}

        <button className="w-full bg-indigo-600 text-white py-2 rounded">Submit</button>
      </form>
    </div>
  );
}
