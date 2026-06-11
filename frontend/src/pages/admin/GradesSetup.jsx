import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function GradesSetup() {
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    min_percentage: '',
    max_percentage: '',
    gpa_value: '',
    remarks: 'Excellent'
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const res = await api.get('/exams/grades/');
      // GPA এর ভিত্তিতে বড় থেকে ছোট সাজানো
      const sortedGrades = res.data.sort((a, b) => b.gpa_value - a.gpa_value);
      setGrades(sortedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await api.post('/exams/grades/', formData);
      setMsg({ type: 'success', text: 'Grade scale added successfully!' });
      setFormData({ name: '', min_percentage: '', max_percentage: '', gpa_value: '', remarks: '' });
      fetchGrades();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to add grade scale. Check inputs.' });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGrade = async (id) => {
    if(!window.confirm("Are you sure? This might affect computed results.")) return;
    try {
      await api.delete(`/exams/grades/${id}/`);
      fetchGrades();
    } catch (error) {
      alert("Cannot delete this grade as it is already assigned to student results.");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Grade & GPA Setup</h1>
        <p className="text-gray-500 text-sm mt-1">Define the grading scale for automatic result computation.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Add Grade Scale</h2>
          
          {msg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${msg.type === 'success' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Grade Name *</label>
                <input type="text" name="name" required placeholder="e.g. A+" value={formData.name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>GPA Value *</label>
                <input type="number" step="0.01" name="gpa_value" required placeholder="e.g. 5.00" value={formData.gpa_value} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Min Percent (%) *</label>
                <input type="number" step="0.01" name="min_percentage" required placeholder="80" value={formData.min_percentage} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Max Percent (%) *</label>
                <input type="number" step="0.01" name="max_percentage" required placeholder="100" value={formData.max_percentage} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Remarks (Optional)</label>
              <input type="text" name="remarks" placeholder="e.g. Excellent, Good, Fail" value={formData.remarks} onChange={handleChange} className={inputClass} />
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md mt-2 ${isLoading ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>
              {isLoading ? 'Saving...' : 'Add Grade'}
            </button>
          </form>
        </motion.div>

        {/* Right Column: List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF]">
            <h2 className="text-lg font-bold text-brand-deepPlum">Current Grading System</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="p-3 font-semibold">Grade</th>
                  <th className="p-3 font-semibold">GPA</th>
                  <th className="p-3 font-semibold">Percentage Range</th>
                  <th className="p-3 font-semibold">Remarks</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {grades.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-semibold">No grades configured yet.</td></tr>
                ) : (
                  grades.map(grade => (
                    <tr key={grade.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-3 font-bold text-brand-deepPlum text-lg">{grade.name}</td>
                      <td className="p-3 font-bold text-[#0e5c3c]">{Number(grade.gpa_value).toFixed(2)}</td>
                      <td className="p-3 text-sm font-semibold text-gray-600">
                        {Number(grade.min_percentage)}% - {Number(grade.max_percentage)}%
                      </td>
                      <td className="p-3 text-sm text-gray-500">{grade.remarks}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteGrade(grade.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">🗑️</button>
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