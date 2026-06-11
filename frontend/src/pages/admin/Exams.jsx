import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const currentYear = new Date().getFullYear().toString();

  const [formData, setFormData] = useState({
    name: '',
    class_level: '',
    academic_year: currentYear,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examRes, classRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/academics/classes/')
      ]);
      setExams(examRes.data);
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

    try {
      await api.post('/exams/', formData);
      setMsg({ type: 'success', text: 'Exam created successfully!' });
      setFormData({
        name: '', class_level: '', academic_year: currentYear, start_date: '', end_date: ''
      });
      fetchData(); // লিস্ট আপডেট
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to create exam. Please check your inputs.' });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteExam = async (id) => {
    if(!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await api.delete(`/exams/${id}/`);
      fetchData();
    } catch (error) {
      alert("Cannot delete this exam as it might have associated results.");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Manage Exams</h1>
        <p className="text-gray-500 text-sm mt-1">Create and manage institutional examinations across all classes.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Create New Exam</h2>
          
          {msg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${msg.type === 'success' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Exam Name *</label>
              <input type="text" name="name" required placeholder="e.g. Mid-term Examination" value={formData.name} onChange={handleChange} className={inputClass} />
            </div>
            
            <div>
              <label className={labelClass}>Class Level *</label>
              <select name="class_level" required value={formData.class_level} onChange={handleChange} className={inputClass}>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className={labelClass}>Academic Year *</label>
              <input type="number" name="academic_year" required value={formData.academic_year} onChange={handleChange} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date *</label>
                <input type="date" name="start_date" required value={formData.start_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date *</label>
                <input type="date" name="end_date" required value={formData.end_date} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md mt-2 ${isLoading ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>
              {isLoading ? 'Creating...' : 'Create Exam'}
            </button>
          </form>
        </motion.div>

        {/* Right Column: List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF]">
            <h2 className="text-lg font-bold text-brand-deepPlum">Exam List</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm text-gray-500 border-b border-gray-100">
                  <th className="p-3 font-semibold">Exam Name</th>
                  <th className="p-3 font-semibold">Class</th>
                  <th className="p-3 font-semibold">Year</th>
                  <th className="p-3 font-semibold">Timeline</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-semibold">No exams created yet.</td></tr>
                ) : (
                  exams.map(exam => (
                    <tr key={exam.id} className="hover:bg-gray-50 border-b border-gray-50">
                      <td className="p-3 font-bold text-brand-deepPlum">{exam.name}</td>
                      <td className="p-3 font-semibold text-brand-royalPurple">{exam.class_level_name}</td>
                      <td className="p-3 text-sm text-gray-600">{exam.academic_year}</td>
                      <td className="p-3">
                        <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md block w-max">
                          {new Date(exam.start_date).toLocaleDateString('en-GB')} - {new Date(exam.end_date).toLocaleDateString('en-GB')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteExam(exam.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">🗑️</button>
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