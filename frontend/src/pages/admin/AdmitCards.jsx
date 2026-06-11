import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import api from '../../api/axios';

export default function AdmitCards() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  
  const [students, setStudents] = useState([]);
  const [routine, setRoutine] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      
      // ওই পরীক্ষার ক্লাসের স্টুডেন্টদের ফিল্টার করা
      const classStudents = stuRes.data.filter(s => s.class_level === selectedExam?.class_level);
      setStudents(classStudents);
      
      // ওই পরীক্ষার রুটিন (Subject Exams) ফিল্টার করা
      const examRoutine = subExamRes.data.filter(se => se.exam.toString() === examId.toString());
      // তারিখ অনুযায়ী রুটিন সাজানো
      examRoutine.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
      setRoutine(examRoutine);

    } catch (error) {
      console.error("Error fetching exam details", error);
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

  const selectedExamObj = exams.find(e => e.id.toString() === selectedExamId);

  return (
    <div className="space-y-6 pb-10">
      {/* Top Controls (Hidden on Print) */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Generate Admit Cards</h1>
          <p className="text-gray-500 text-sm mt-1">Automatically generate admit cards with exam routines for all students.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          disabled={!selectedExamId || students.length === 0}
          className={`px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm ${(!selectedExamId || students.length === 0) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-tealCyan text-brand-deepPlum hover:bg-[#4bc2ab]'}`}
        >
          <span>🖨️</span> Print All Admit Cards
        </button>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
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
            <p className="font-bold text-brand-royalPurple">Ready to print!</p>
            <p className="text-sm text-gray-600 mt-1">Found <strong>{students.length}</strong> students and <strong>{routine.length}</strong> subjects for this exam. Click the "Print All" button above to generate the PDF.</p>
          </div>
        )}
      </div>

      {/* Printable Area - Only visible when printing */}
      <div className="hidden print:block space-y-10">
        {students.map((student, index) => (
          <div key={student.id} className="border-2 border-gray-800 p-8 rounded-xl bg-white relative" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'always' }}>
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white border-2 border-gray-800 rounded-full flex items-center justify-center font-bold text-2xl text-gray-800">
                  DIA
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">Ideal Academy</h1>
                  <h2 className="text-lg font-bold text-gray-600 mt-1 uppercase">{selectedExamObj?.name} - {selectedExamObj?.academic_year}</h2>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-gray-800 text-white px-4 py-1.5 rounded-md text-sm font-bold tracking-widest uppercase mb-2 inline-block">
                  Admit Card
                </div>
                <p className="text-xs font-bold text-gray-500">Student ID: {student.student_id}</p>
              </div>
            </div>

            {/* Student Info */}
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-3 w-3/4">
                <div className="flex border-b border-gray-300 pb-1">
                  <span className="font-bold text-gray-600 w-32">Name of Student:</span>
                  <span className="font-bold text-gray-900 text-lg uppercase">{student.name}</span>
                </div>
                <div className="flex border-b border-gray-300 pb-1">
                  <span className="font-bold text-gray-600 w-32">Class & Section:</span>
                  <span className="font-bold text-gray-900">{selectedExamObj?.class_level_name} (Sec: {student.section_name || 'A'})</span>
                </div>
                <div className="flex border-b border-gray-300 pb-1">
                  <span className="font-bold text-gray-600 w-32">Roll Number:</span>
                  <span className="font-bold text-gray-900">{student.roll_number}</span>
                </div>
              </div>
              
              {/* Photo Placeholder / QR Code */}
              <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center p-2 bg-gray-50">
                <QRCode value={`Admit Card | ID: ${student.student_id} | Exam: ${selectedExamObj?.name}`} size={80} level="L" />
              </div>
            </div>

            {/* Exam Routine Table */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-800 mb-2 uppercase text-sm border-l-4 border-gray-800 pl-2">Exam Schedule</h3>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-800">
                    <th className="p-2 border border-gray-400 w-12 text-center">SL</th>
                    <th className="p-2 border border-gray-400">Subject Name</th>
                    <th className="p-2 border border-gray-400 text-center w-32">Date</th>
                    <th className="p-2 border border-gray-400 text-center w-32">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {routine.length === 0 ? (
                    <tr><td colSpan="4" className="p-2 text-center border border-gray-400">Routine not published yet.</td></tr>
                  ) : (
                    routine.map((sub, idx) => (
                      <tr key={sub.id}>
                        <td className="p-2 border border-gray-400 text-center font-bold">{idx + 1}</td>
                        <td className="p-2 border border-gray-400 font-bold">{sub.subject_name}</td>
                        <td className="p-2 border border-gray-400 text-center">{new Date(sub.exam_date).toLocaleDateString('en-GB')}</td>
                        <td className="p-2 border border-gray-400 text-center">{sub.exam_time.substring(0, 5)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Rules & Signatures */}
            <div className="mt-12 flex justify-between items-end">
              <div className="w-1/2">
                <h4 className="font-bold text-[10px] text-gray-800 uppercase mb-1">Important Instructions:</h4>
                <ul className="text-[9px] text-gray-600 list-disc pl-3 space-y-0.5">
                  <li>Students must bring this admit card to the examination hall.</li>
                  <li>Mobile phones or any electronic devices are strictly prohibited.</li>
                  <li>Students must arrive at least 15 minutes before the exam starts.</li>
                </ul>
              </div>
              <div className="text-center w-48">
                <div className="border-t border-gray-800 w-full mb-1"></div>
                <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Controller of Exams</p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}