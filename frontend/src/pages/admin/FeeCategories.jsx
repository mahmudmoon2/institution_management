import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function FeeCategories() {
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    class_level: '', // ফাঁকা থাকলে All Classes
    frequency: 'Monthly'
  });

  // পেজ লোড হলে ক্যাটাগরি এবং ক্লাস লিস্ট আনবে
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, classRes] = await Promise.all([
        api.get('/payments/fee-categories/'),
        api.get('/academics/classes/')
      ]);
      setCategories(catRes.data);
      setClasses(classRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });

    const dataToSend = { ...formData };
    if (!dataToSend.class_level) delete dataToSend.class_level; // ফাঁকা থাকলে ডিলিট করে দেবে

    try {
      await api.post('/payments/fee-categories/', dataToSend);
      setMsg({ type: 'success', text: 'Fee Category added successfully!' });
      setFormData({ name: '', amount: '', class_level: '', frequency: 'Monthly' });
      fetchData(); // লিস্ট আপডেট
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to add category. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    if(!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/payments/fee-categories/${id}/`);
      fetchData();
    } catch (error) {
      alert("Cannot delete category because it is linked to existing payments.");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Fee Categories</h1>
        <p className="text-gray-500 text-sm mt-1">Manage different types of fees collected by the institution.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Add New Fee</h2>
          
          {msg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${msg.type === 'success' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Fee Name *</label>
              <input type="text" name="name" required placeholder="e.g. Tuition Fee" value={formData.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amount (৳) *</label>
              <input type="number" name="amount" required placeholder="e.g. 1500" value={formData.amount} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Frequency *</label>
              <select name="frequency" required value={formData.frequency} onChange={handleChange} className={inputClass}>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
                <option value="One-time">One-time</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Applicable Class (Optional)</label>
              <select name="class_level" value={formData.class_level} onChange={handleChange} className={inputClass}>
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Leave empty if applicable to all students.</p>
            </div>
            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md mt-2 ${isLoading ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>
              {isLoading ? 'Saving...' : 'Add Fee Category'}
            </button>
          </form>
        </motion.div>

        {/* Right Column: List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF]">
            <h2 className="text-lg font-bold text-brand-deepPlum">Current Fee Structures</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-100">
                  <th className="p-3 font-semibold">Fee Name</th>
                  <th className="p-3 font-semibold">Amount</th>
                  <th className="p-3 font-semibold">Frequency</th>
                  <th className="p-3 font-semibold">Class</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-semibold">No fee categories found.</td></tr>
                ) : (
                  categories.map(cat => (
                    <tr key={cat.id} className="hover:bg-gray-50 border-b border-gray-50">
                      <td className="p-3 font-bold text-brand-deepPlum">{cat.name}</td>
                      <td className="p-3 font-bold text-brand-tealCyan">৳ {cat.amount}</td>
                      <td className="p-3"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">{cat.frequency}</span></td>
                      <td className="p-3 text-sm font-medium text-gray-600">{cat.class_level_name || 'All Classes'}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteCategory(cat.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}