import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function AddEvent() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    venue: '',
    date_time: '',
    status: 'Upcoming',
    registration_link: '',
    cover_image: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'cover_image') {
      setFormData(prev => ({ ...prev, cover_image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      }
      await api.post('/cms/events/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Event added successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-brand-deepPlum mb-6">Add New Event</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title (English) *</label>
            <input type="text" name="title_en" required value={formData.title_en} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title (Bengali)</label>
            <input type="text" name="title_bn" value={formData.title_bn} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (English) *</label>
            <textarea name="description_en" rows="3" required value={formData.description_en} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Bengali)</label>
            <textarea name="description_bn" rows="3" value={formData.description_bn} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Venue *</label>
              <input type="text" name="venue" required value={formData.venue} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date & Time *</label>
              <input type="datetime-local" name="date_time" required value={formData.date_time} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none">
                <option value="Upcoming">Upcoming</option>
                <option value="Past">Past</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Link (URL)</label>
              <input type="url" name="registration_link" value={formData.registration_link} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image *</label>
            <input type="file" name="cover_image" accept="image/*" onChange={handleChange} className="w-full" required />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={isSubmitting} className="bg-brand-tealCyan hover:bg-brand-mintGreen text-brand-deepPlum font-bold px-6 py-2 rounded-xl transition disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}