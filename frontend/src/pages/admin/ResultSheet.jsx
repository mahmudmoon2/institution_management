import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

export default function ResultSheet() {
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  
  const [students, setStudents] = useState([]);
  const [subjectExams, setSubjectExams] = useState([]);
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [examRes, gradeRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/exams/grades/')
      ]);
      setExams(examRes.data);
      setGrades(gradeRes.data.sort((a, b) => b.gpa_value - a.gpa_value));
    } catch (error) {
      console.error("Error fetching initial data", error);
      showToast("Failed to load initial data.", "error");
    }
  };

  const fetchExamResults = async (examId) => {
    if (!examId) return;
    setIsLoading(true);
    try {
      const [stuRes, subExamRes, resultRes] = await Promise.all([
        api.get('/students/'),
        api.get('/exams/subject-exams/'),
        api.get('/exams/results/')
      ]);
      
      const selectedExam = exams.find(e => e.id.toString() === examId.toString());
      
      const classStudents = stuRes.data.filter(s => s.class_level === selectedExam?.class_level);
      setStudents(classStudents);
      
      const examSubjects = subExamRes.data.filter(se => se.exam.toString() === examId.toString());
      setSubjectExams(examSubjects);
      
      const examResults = resultRes.data.filter(r => r.exam.toString() === examId.toString());
      setResults(examResults);

    } catch (error) {
      console.error("Error fetching results", error);
      showToast("Failed to fetch exam results.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamChange = (e) => {
    const val = e.target.value;
    setSelectedExamId(val);
    if (val) {
      fetchExamResults(val);
    } else {
      setSubjectExams([]);
      setStudents([]);
      setResults([]);
    }
  };

  const getSubjectMarks = (studentId, subjectId) => {
    const res = results.find(r => r.student === studentId && r.subject === subjectId);
    return res ? { marks: res.marks_obtained, grade: res.grade_name } : { marks: '-', grade: '-' };
  };

  const calculateFinalResult = (studentId) => {
    const studentResults = results.filter(r => r.student === studentId);
    if (studentResults.length === 0) return { total: 0, gpa: 0, grade: 'N/A' };

    let totalMarks = 0;
    let totalGpa = 0;
    let hasFailed = false;

    studentResults.forEach(r => {
      totalMarks += Number(r.marks_obtained);
      const gradeObj = grades.find(g => g.id === r.grade);
      const gpa = gradeObj ? Number(gradeObj.gpa_value) : 0;
      totalGpa += gpa;
      if (gpa === 0) hasFailed = true;
    });

    if (studentResults.length < subjectExams.length) return { total: totalMarks, gpa: 0, grade: 'Incomplete' };
    if (hasFailed) return { total: totalMarks, gpa: 0, grade: 'F' };

    const avgGpa = (totalGpa / subjectExams.length).toFixed(2);
    const finalGradeObj = grades.find(g => Number(g.gpa_value) <= Number(avgGpa)) || { name: 'F' };

    return { total: totalMarks, gpa: avgGpa, grade: finalGradeObj.name };
  };

  // পুরো ক্লাসের ট্যাবুলেশন শিট প্রিন্ট
  const handlePrintSheet = async () => {
    if (!selectedExamId) {
      showToast("Please select an exam first.", "error");
      return;
    }
    try {
      showToast("Generating Tabulation Sheet...", "success");
      const response = await api.get(`/exams/tabulation/pdf/${selectedExamId}/`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF", error);
      showToast("Failed to generate Tabulation Sheet PDF.", "error");
    }
  };

  // --- NEW: ইন্ডিভিজুয়াল মার্কশিট পিডিএফ প্রিন্ট ---
  const handlePrintIndividualMarksheet = async (studentId) => {
    try {
      showToast("Generating Marksheet PDF...", "success");
      const response = await api.get(`/exams/marksheet/pdf/${selectedExamId}/${studentId}/`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF", error);
      showToast("Failed to generate Individual Marksheet PDF.", "error");
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

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Tabulation Sheet</h1>
          <p className="text-gray-500 text-sm mt-1">View comprehensive results and print individual marksheets.</p>
        </div>
        <button onClick={handlePrintSheet} className="bg-brand-softLavender/20 text-brand-royalPurple font-bold px-6 py-2.5 rounded-xl hover:bg-brand-softLavender/40 transition-colors flex items-center gap-2 border border-brand-softLavender/30">
          <span>🖨️</span> Print Master Sheet
        </button>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="mb-6 w-full md:w-1/3">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Exam to View Results</label>
          <select 
            value={selectedExamId} 
            onChange={handleExamChange} 
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors"
          >
            <option value="">-- Choose Exam --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.class_level_name})</option>)}
          </select>
        </div>

        {/* Tabulation Table */}
        {isLoading ? (
          <div className="text-center py-10 font-bold text-gray-500">Loading Results...</div>
        ) : selectedExamId && students.length > 0 && subjectExams.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-center border-collapse text-sm">
              <thead>
                <tr className="bg-brand-deepPlum text-white">
                  <th className="p-3 border border-white/20 text-left">Student Info</th>
                  {subjectExams.map(sub => (
                    <th key={sub.id} className="p-3 border border-white/20 whitespace-nowrap">
                      {sub.subject_name}
                      <span className="block text-[10px] font-normal opacity-70">Max: {Number(sub.full_marks)}</span>
                    </th>
                  ))}
                  <th className="p-3 border border-white/20 bg-brand-royalPurple">Total</th>
                  <th className="p-3 border border-white/20 bg-brand-royalPurple">GPA</th>
                  <th className="p-3 border border-white/20 bg-brand-royalPurple">Grade</th>
                  <th className="p-3 border border-white/20 bg-brand-royalPurple text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const finalRes = calculateFinalResult(student.id);
                  return (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                      <td className="p-3 border border-gray-200 text-left">
                        <p className="font-bold text-brand-deepPlum whitespace-nowrap">{student.name}</p>
                        <p className="text-xs text-gray-500">ID: {student.student_id} | Roll: {student.roll_number}</p>
                      </td>
                      
                      {subjectExams.map(sub => {
                        const { marks, grade } = getSubjectMarks(student.id, sub.subject);
                        return (
                          <td key={sub.id} className="p-3 border border-gray-200">
                            <span className="font-bold text-gray-700">{marks}</span>
                            {grade !== '-' && <span className="block text-[10px] font-bold text-brand-tealCyan">{grade}</span>}
                          </td>
                        );
                      })}

                      <td className="p-3 border border-gray-200 font-bold text-brand-deepPlum">{finalRes.total}</td>
                      <td className="p-3 border border-gray-200 font-bold text-[#0e5c3c]">{finalRes.gpa}</td>
                      <td className="p-3 border border-gray-200">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${finalRes.grade === 'F' || finalRes.grade === 'Incomplete' ? 'bg-red-100 text-red-600' : 'bg-brand-mintGreen/20 text-[#0e5c3c]'}`}>
                          {finalRes.grade}
                        </span>
                      </td>
                      
                      {/* Action Column with dual options */}
                      <td className="p-3 border border-gray-200 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Link 
                            to={`/admin/marksheet/${selectedExamId}/${student.id}`} 
                            title="View Detail"
                            className="bg-gray-100 hover:bg-brand-tealCyan/20 text-brand-deepPlum px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-block whitespace-nowrap border border-gray-200"
                          >
                            👁️ View
                          </Link>
                          <button 
                            onClick={() => handlePrintIndividualMarksheet(student.id)} 
                            title="Download PDF"
                            className="bg-brand-royalPurple hover:bg-brand-deepPlum text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-block whitespace-nowrap shadow-sm"
                          >
                            🖨️ PDF
                          </button>
                        </div>
                      </td>
                      
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : selectedExamId ? (
          <div className="text-center py-10 font-bold text-gray-400 border rounded-xl">No subjects or results found for this exam.</div>
        ) : null}

      </div>
    </div>
  );
}