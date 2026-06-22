import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export default function AdmitCards() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  
  const [students, setStudents] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams/');
      setExams(res.data);
    } catch (error) {
      console.error("Error fetching exams", error);
    }
  };

  const fetchExamDetails = async (examId) => {
    if (!examId) return;
    setIsLoading(true);
    try {
      const [stuRes, subExamRes] = await Promise.all([
        api.get('/students/'),
        api.get('/exams/subject-exams/')
      ]);
      
      const selectedExam = exams.find(e => e.id.toString() === examId.toString());
      
      const classStudents = stuRes.data.filter(s => s.class_level === selectedExam?.class_level);
      setStudents(classStudents);
      
      const examRoutine = subExamRes.data.filter(se => se.exam.toString() === examId.toString());
      examRoutine.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
      setRoutine(examRoutine);

    } catch (error) {
      console.error("Error fetching exam details", error);
      showToast("Failed to fetch data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamChange = (e) => {
    const val = e.target.value;
    setSelectedExamId(val);
    if (val) {
      fetchExamDetails(val);
    } else {
      setStudents([]);
      setRoutine([]);
    }
  };

  // --- NEW: Handle WeasyPrint PDF Generation ---
  const handlePrintAdmitCards = async () => {
    if (!selectedExamId) return;
    try {
      showToast("Generating Admit Cards... Please wait.", "success");
      const response = await api.get(`/exams/admit-cards/pdf/${selectedExamId}/`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF", error);
      showToast("Failed to generate Admit Cards PDF.", "error");
    }
  };

  return (
    <div className="space-y-6 pb-10 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-lg font-bold text-white flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#0e5c3c]'}`}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Generate Admit Cards</h1>
          <p className="text-gray-500 text-sm mt-1">Automatically generate admit cards with exam routines for all students.</p>
        </div>
        <button 
          onClick={handlePrintAdmitCards} 
          disabled={!selectedExamId || students.length === 0}
          className={`px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm ${(!selectedExamId || students.length === 0) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-tealCyan text-brand-deepPlum hover:bg-[#4bc2ab]'}`}
        >
          <span>🖨️</span> Download PDF
        </button>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Exam</label>
          <select 
            value={selectedExamId} 
            onChange={handleExamChange} 
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors"
          >
            <option value="">-- Choose Exam --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.class_level_name})</option>)}
          </select>
        </div>

        {isLoading && <div className="mt-6 text-brand-deepPlum font-bold">Loading Student Data...</div>}
        
        {!isLoading && selectedExamId && students.length > 0 && (
          <div className="mt-6 p-4 bg-[#F5F0FF] rounded-xl border border-brand-softLavender/30">
            <p className="font-bold text-brand-royalPurple">Ready to generate!</p>
            <p className="text-sm text-gray-600 mt-1">Found <strong>{students.length}</strong> students and <strong>{routine.length}</strong> subjects for this exam. Click the "Download PDF" button above to generate the admit cards.</p>
          </div>
        )}
      </div>

    </div>
  );
}