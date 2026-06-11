import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function ClassTests() {
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    subject: '', class_level: '', section: '', teacher: '',
    date: '', max_marks: 20, topic: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [testRes, subRes, clsRes, secRes, teacherRes] = await Promise.all([
        api.get('/exams/class-tests/'),
        api.get('/academics/subjects/'),
        api.get('/academics/classes/'),
        api.get('/academics/sections/'),
        api.get('/teachers/')
      ]);
      setTests(testRes.data);
      setSubjects(subRes.data);
      setClasses(clsRes.data);
      setSections(secRes.data);
      setTeachers(teacherRes.data);
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
      await api.post('/exams/class-tests/', formData);
      setMsg({ type: 'success', text: 'Class test scheduled successfully!' });
      setFormData({ ...formData, topic: '', date: '' }); // Reset partial form
      fetchInitialData();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to schedule class test.' });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTest = async (id) => {
    if(!window.confirm("Are you sure you want to delete this class test?")) return;
    try {
      await api.delete(`/exams/class-tests/${id}/`);
      fetchInitialData();
    } catch (error) {
      alert("Cannot delete this test.");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Class Tests</h1>
        <p className="text-gray-500 text-sm mt-1">Schedule regular class assessments and track topics.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Schedule a Test</h2>
          
          {msg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${msg.type === 'success' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Topic / Chapter *</label>
              <input type="text" name="topic" required placeholder="e.g. Chapter 3: Geometry" value={formData.topic} onChange={handleChange} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Class *</label>
                <select name="class_level" required value={formData.class_level} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Section *</label>
                <select name="section" required value={formData.section} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Subject *</label>
                <select name="subject" required value={formData.subject} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Teacher *</label>
                <select name="teacher" required value={formData.teacher} onChange={handleChange} className={inputClass}>
                  <option value="">Select...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.employee_id}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date *</label>
                <input type="date" name="date" required value={formData.date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Max Marks *</label>
                <input type="number" name="max_marks" required value={formData.max_marks} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md mt-2 ${isLoading ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>
              {isLoading ? 'Saving...' : 'Schedule Test'}
            </button>
          </form>
        </motion.div>

        {/* Right Column: List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF]">
            <h2 className="text-lg font-bold text-brand-deepPlum">Recent Class Tests</h2>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="p-3 font-semibold">Topic / Subject</th>
                  <th className="p-3 font-semibold">Class & Sec</th>
                  <th className="p-3 font-semibold text-center">Marks</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {tests.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-semibold">No class tests scheduled yet.</td></tr>
                ) : (
                  tests.map(test => (
                    <tr key={test.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-brand-deepPlum">{test.topic}</p>
                        <p className="text-xs font-semibold text-brand-tealCyan">{test.subject_name}</p>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-gray-700">{test.class_level_name}</span>
                        <span className="block text-xs text-gray-500">Sec: {test.section_name}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-gray-600">{Number(test.max_marks)}</td>
                      <td className="p-3 text-sm text-gray-600 font-medium">
                        {new Date(test.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => deleteTest(test.id)} className="text-red-400 hover:text-red-600 transition-colors p-2" title="Delete">🗑️</button>
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