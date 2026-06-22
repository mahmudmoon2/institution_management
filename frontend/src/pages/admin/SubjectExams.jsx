import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function SubjectExams() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectExams, setSubjectExams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // State for Print Routine Dropdown
  const [printExamId, setPrintExamId] = useState('');

  const [formData, setFormData] = useState({
    exam: '',
    subject: '',
    full_marks: 100,
    pass_marks: 33,
    exam_date: '',
    exam_time: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examRes, subRes, subExamRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/academics/subjects/'),
        api.get('/exams/subject-exams/')
      ]);
      setExams(examRes.data);
      setSubjects(subRes.data);
      setSubjectExams(subExamRes.data);
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
      await api.post('/exams/subject-exams/', formData);
      setMsg({ type: 'success', text: 'Subject routine added successfully!' });
      
      setFormData({
        ...formData, subject: '', exam_date: '', exam_time: ''
      });
      fetchData(); 
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to add routine. Check your inputs.' });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubjectExam = async (id) => {
    if(!window.confirm("Are you sure you want to delete this routine?")) return;
    try {
      await api.delete(`/exams/subject-exams/${id}/`);
      fetchData();
    } catch (error) {
      alert("Cannot delete. It might be linked to existing results.");
    }
  };

  // --- NEW: Print Routine Logic ---
  const handlePrintRoutine = async () => {
    try {
      const url = printExamId ? `/exams/routine/pdf/?exam_id=${printExamId}` : '/exams/routine/pdf/';
      const response = await api.get(url, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate routine PDF.");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Exam Routine Setup</h1>
          <p className="text-gray-500 text-sm mt-1">Assign subjects, marks, dates, and times to specific exams.</p>
        </div>
        
        {/* --- NEW: Print Routine Section --- */}
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={printExamId} 
            onChange={(e) => setPrintExamId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-tealCyan bg-gray-50"
          >
            <option value="">All Routines</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <button 
            onClick={handlePrintRoutine}
            className="px-4 py-2 bg-brand-royalPurple hover:bg-brand-deepPlum text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2 text-sm"
          >
            <span>🖨️</span> Print Routine
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Add Subject to Exam</h2>
          
          {msg.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm font-bold ${msg.type === 'success' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Select Exam *</label>
              <select name="exam" required value={formData.exam} onChange={handleChange} className={inputClass}>
                <option value="">-- Select Exam --</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.class_level_name})</option>)}
              </select>
            </div>
            
            <div>
              <label className={labelClass}>Select Subject *</label>
              <select name="subject" required value={formData.subject} onChange={handleChange} className={inputClass}>
                <option value="">-- Select Subject --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Marks *</label>
                <input type="number" name="full_marks" required value={formData.full_marks} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pass Marks *</label>
                <input type="number" name="pass_marks" required value={formData.pass_marks} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Date *</label>
                <input type="date" name="exam_date" required value={formData.exam_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Time *</label>
                <input type="time" name="exam_time" required value={formData.exam_time} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md mt-2 ${isLoading ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>
              {isLoading ? 'Saving...' : 'Save Routine'}
            </button>
          </form>
        </motion.div>

        {/* Right Column: List */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF]">
            <h2 className="text-lg font-bold text-brand-deepPlum">Current Subject Routines</h2>
          </div>
          <div className="overflow-x-auto p-4 max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="p-3 font-semibold">Subject</th>
                  <th className="p-3 font-semibold">Marks (Pass/Full)</th>
                  <th className="p-3 font-semibold">Date & Time</th>
                  <th className="p-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {subjectExams.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-400 font-semibold">No subjects added to any exam yet.</td></tr>
                ) : (
                  subjectExams.map(item => {
                    const parentExam = exams.find(e => e.id === item.exam);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-50">
                        <td className="p-3">
                          <p className="font-bold text-brand-deepPlum">{item.subject_name}</p>
                          <p className="text-[10px] font-bold text-brand-royalPurple uppercase">{parentExam?.name}</p>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-[#0e5c3c]">{Number(item.pass_marks)}</span>
                          <span className="text-gray-400 mx-1">/</span>
                          <span className="font-bold text-gray-600">{Number(item.full_marks)}</span>
                        </td>
                        <td className="p-3">
                          <p className="text-sm font-semibold text-gray-700">{new Date(item.exam_date).toLocaleDateString('en-GB')}</p>
                          <p className="text-xs text-gray-500 font-medium">⏱️ {item.exam_time.substring(0, 5)}</p>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => deleteSubjectExam(item.id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">🗑️</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}