import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

// --- Toast Notification Component ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-20 right-4 z-50 ${bgColor} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[250px]`}
    >
      <span>{type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span className="flex-1 text-sm">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">✕</button>
    </motion.div>
  );
};

export default function NoticeManagement() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null); // { message, type }
  const [formData, setFormData] = useState({
    title_en: '',
    title_bn: '',
    description_en: '',
    description_bn: '',
    category: 'General',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all notices
  const fetchNotices = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/cms/notices/');
      setNotices(res.data);
    } catch (err) {
      console.error('Failed to fetch notices', err);
      showToast('Failed to load notices', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (editingNotice) {
        await api.put(`/cms/notices/${editingNotice.id}/`, formData);
        showToast('Notice updated successfully!', 'success');
      } else {
        await api.post('/cms/notices/', formData);
        showToast('Notice added successfully!', 'success');
      }
      resetForm();
      fetchNotices();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save notice';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title_en: notice.title_en || '',
      title_bn: notice.title_bn || '',
      description_en: notice.description_en || '',
      description_bn: notice.description_bn || '',
      category: notice.category || 'General',
      is_active: notice.is_active !== undefined ? notice.is_active : true,
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingNotice(null);
    setFormData({
      title_en: '',
      title_bn: '',
      description_en: '',
      description_bn: '',
      category: 'General',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/cms/notices/${id}/`);
      showToast('Notice deleted successfully!', 'success');
      fetchNotices();
    } catch (err) {
      showToast('Failed to delete notice', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const resetForm = () => {
    setEditingNotice(null);
    setIsModalOpen(false);
    setError('');
  };

  return (
    <>
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-brand-deepPlum">Notice Management</h1>
            <button
              onClick={handleAddNew}
              className="bg-brand-tealCyan hover:bg-brand-mintGreen text-brand-deepPlum font-bold px-5 py-2 rounded-xl transition flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add New Notice
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No notices found. Click "Add New Notice" to create one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                    <th className="py-3 px-4 font-semibold">Title</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-brand-deepPlum">{notice.title_en}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className="px-2 py-1 rounded-full text-xs bg-brand-softLavender/20 text-brand-royalPurple">
                          {notice.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(notice.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${notice.is_active ? 'bg-brand-mintGreen/30 text-[#0e5c3c]' : 'bg-gray-200 text-gray-600'}`}>
                          {notice.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(notice)}
                          className="text-gray-400 hover:text-brand-tealCyan transition-colors p-1"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(notice)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal (unchanged except we removed inner alerts) */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-brand-deepPlum">
                    {editingNotice ? 'Edit Notice' : 'Add New Notice'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-red-500 text-2xl leading-none">
                    ✕
                  </button>
                </div>
                <div className="p-6">
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
                      <textarea name="description_en" rows="4" required value={formData.description_en} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Bengali)</label>
                      <textarea name="description_bn" rows="4" value={formData.description_bn} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none">
                        <option value="Academic">Academic</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Exam">Exam</option>
                        <option value="Event">Event</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4" />
                      <label className="text-sm text-gray-700">Publish immediately (Active)</label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" disabled={isSubmitting} className="bg-brand-tealCyan hover:bg-brand-mintGreen text-brand-deepPlum font-bold px-6 py-2 rounded-xl transition disabled:opacity-50">
                        {isSubmitting ? 'Saving...' : editingNotice ? 'Update Notice' : 'Save Notice'}
                      </button>
                      <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal (unchanged) */}
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <h3 className="text-xl font-bold text-brand-deepPlum mb-2">Delete Notice?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "<strong>{deleteConfirm.title_en}</strong>"? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(deleteConfirm.id)} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition">
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}