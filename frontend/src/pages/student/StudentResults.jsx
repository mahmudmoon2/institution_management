import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import api from '../../api/axios';

export default function StudentResults() {
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  
  const [routine, setRoutine] = useState([]);
  const [results, setResults] = useState([]);
  const [grades, setGrades] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // ইউজারের ইনফো এবং স্টুডেন্ট প্রোফাইল ফেচ করা
      const userRes = await api.get('/me/');
      const stuRes = await api.get('/students/');
      
      // ডেমো পারপাসে লগড-ইন ইউজারের নামের সাথে স্টুডেন্টের নাম মিলিয়ে প্রোফাইল বের করা
      const myStudentProfile = stuRes.data.find(s => s.name === userRes.data.name) || stuRes.data[0]; 
      setStudent(myStudentProfile);

      const [examRes, gradeRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/exams/grades/')
      ]);
      
      // শুধুমাত্র স্টুডেন্টের ক্লাসের এক্সামগুলো ফিল্টার করা
      const myExams = examRes.data.filter(e => e.class_level === myStudentProfile?.class_level);
      setExams(myExams);
      setGrades(gradeRes.data.sort((a, b) => b.gpa_value - a.gpa_value));

    } catch (error) {
      console.error("Error fetching initial data", error);
    }
  };

  const fetchExamDetails = async (examId) => {
    if (!examId || !student) return;
    setIsLoading(true);
    try {
      const [subExamRes, resultRes] = await Promise.all([
        api.get('/exams/subject-exams/'),
        api.get('/exams/results/')
      ]);
      
      // রুটিন ফিল্টার করা
      const examRoutine = subExamRes.data.filter(se => se.exam.toString() === examId.toString());
      examRoutine.sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date));
      setRoutine(examRoutine);
      
      // নিজের রেজাল্ট ফিল্টার করা
      const myResults = resultRes.data.filter(r => r.exam.toString() === examId.toString() && r.student === student.id);
      setResults(myResults);

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
      setRoutine([]);
      setResults([]);
    }
  };

  const selectedExamObj = exams.find(e => e.id.toString() === selectedExamId);

  // সাবজেক্টের মার্কস খোঁজার ফাংশন
  const getSubjectResult = (subjectId) => {
    return results.find(r => r.subject === subjectId);
  };

  // ফাইনাল রেজাল্ট হিসাব করা
  const calculateFinal = () => {
    if (results.length === 0) return null;

    let totalMarks = 0;
    let totalGpa = 0;
    let hasFailed = false;

    results.forEach(r => {
      totalMarks += Number(r.marks_obtained);
      const gradeObj = grades.find(g => g.id === r.grade);
      const gpa = gradeObj ? Number(gradeObj.gpa_value) : 0;
      totalGpa += gpa;
      if (gpa === 0) hasFailed = true; 
    });

    if (results.length < routine.length) return { total: totalMarks, gpa: 0, grade: 'Incomplete' };
    if (hasFailed) return { total: totalMarks, gpa: 0, grade: 'F' };

    const avgGpa = (totalGpa / routine.length).toFixed(2);
    const finalGradeObj = grades.find(g => Number(g.gpa_value) <= Number(avgGpa)) || { name: 'F' };

    return { total: totalMarks, gpa: avgGpa, grade: finalGradeObj.name };
  };

  const finalRes = calculateFinal();

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header (Hidden on Print) */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">My Exams & Results</h1>
          <p className="text-gray-500 text-sm mt-1">Download admit cards and view your performance.</p>
        </div>
        
        {selectedExamId && routine.length > 0 && (
          <button onClick={() => window.print()} className="bg-brand-tealCyan text-brand-deepPlum font-bold px-6 py-2.5 rounded-xl hover:bg-[#4bc2ab] transition-colors flex items-center gap-2 shadow-sm">
            <span>🖨️</span> Print Admit Card
          </button>
        )}
      </motion.div>

      {/* Select Exam Dropdown (Hidden on Print) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 print:hidden">
        <div className="w-full md:w-1/3">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Examination</label>
          <select 
            value={selectedExamId} 
            onChange={handleExamChange} 
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors"
          >
            <option value="">-- Choose Exam --</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.academic_year})</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 font-bold text-gray-500 print:hidden">Loading your data...</div>
      ) : selectedExamId && routine.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:block print:space-y-0">
          
          {/* LEFT: Exam Routine & Admit Card Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-2 print:border-gray-800 print:rounded-none">
            
            {/* Admit Card Header (Visible beautifully on print) */}
            <div className="p-6 border-b-2 border-brand-deepPlum print:border-gray-800 bg-[#F5F0FF] print:bg-transparent text-center relative">
              <div className="absolute top-6 right-6 hidden print:block">
                <QRCode value={`Verify | ID: ${student?.student_id} | Exam: ${selectedExamObj?.name}`} size={60} level="L" />
              </div>
              <div className="w-12 h-12 bg-brand-royalPurple print:bg-white print:border-2 print:border-gray-800 print:text-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-2 shadow-sm">
                DIA
              </div>
              <h2 className="text-xl font-bold text-brand-deepPlum uppercase tracking-widest print:text-gray-900">Ideal Academy</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Admit Card</p>
              <h3 className="text-md font-bold text-brand-royalPurple print:text-gray-700">{selectedExamObj?.name}</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div><span className="text-gray-500 font-semibold block text-xs">Student Name</span><span className="font-bold text-gray-800">{student?.name}</span></div>
                <div><span className="text-gray-500 font-semibold block text-xs">Student ID</span><span className="font-bold text-gray-800">{student?.student_id}</span></div>
                <div><span className="text-gray-500 font-semibold block text-xs">Class & Section</span><span className="font-bold text-gray-800">{selectedExamObj?.class_level_name} - {student?.section_name || 'A'}</span></div>
                <div><span className="text-gray-500 font-semibold block text-xs">Roll Number</span><span className="font-bold text-brand-tealCyan">{student?.roll_number}</span></div>
              </div>

              <h4 className="font-bold text-brand-deepPlum mb-3 border-b pb-2 text-sm uppercase">Exam Schedule</h4>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600">
                    <th className="p-2 border border-gray-200">Date</th>
                    <th className="p-2 border border-gray-200">Subject</th>
                    <th className="p-2 border border-gray-200">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {routine.map((sub) => (
                    <tr key={sub.id}>
                      <td className="p-2 border border-gray-200 font-semibold">{new Date(sub.exam_date).toLocaleDateString('en-GB')}</td>
                      <td className="p-2 border border-gray-200 font-bold text-brand-deepPlum">{sub.subject_name}</td>
                      <td className="p-2 border border-gray-200 text-gray-600">{sub.exam_time.substring(0, 5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Print Only Signatures */}
              <div className="hidden print:flex justify-between items-end mt-16 pt-4">
                <div className="text-center w-32 border-t border-gray-800"><p className="text-[10px] font-bold mt-1">Class Teacher</p></div>
                <div className="text-center w-32 border-t border-gray-800"><p className="text-[10px] font-bold mt-1">Headmaster</p></div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Results / Transcript (Hidden on Print) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:hidden">
            <div className="p-6 border-b border-gray-100 bg-[#F5F0FF]">
              <h2 className="text-lg font-bold text-brand-deepPlum">Performance Transcript</h2>
            </div>
            <div className="p-6">
              {results.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl block mb-3">🕒</span>
                  <p className="text-gray-500 font-semibold">Results are not published yet.</p>
                </div>
              ) : (
                <>
                  <table className="w-full text-left border-collapse text-sm mb-6">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500">
                        <th className="p-3 border-b border-gray-200">Subject</th>
                        <th className="p-3 border-b border-gray-200 text-center">Marks</th>
                        <th className="p-3 border-b border-gray-200 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routine.map((sub) => {
                        const res = getSubjectResult(sub.subject);
                        const gradeObj = res ? grades.find(g => g.id === res.grade) : null;
                        return (
                          <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-3 font-bold text-gray-800">{sub.subject_name}</td>
                            <td className="p-3 text-center font-bold text-brand-deepPlum">{res ? res.marks_obtained : '-'}</td>
                            <td className="p-3 text-center font-bold text-brand-tealCyan">{gradeObj ? gradeObj.name : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {finalRes && (
                    <div className="bg-brand-deepPlum text-white p-4 rounded-xl flex justify-between items-center shadow-md">
                      <div>
                        <p className="text-xs text-brand-softLavender font-semibold uppercase tracking-wider mb-1">Final Result</p>
                        <p className="text-sm font-medium">Total Marks: <span className="font-bold">{finalRes.total}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-brand-softLavender font-semibold uppercase tracking-wider mb-1">GPA / Grade</p>
                        <p className="text-2xl font-bold text-brand-tealCyan">{finalRes.gpa} <span className="text-white text-lg">({finalRes.grade})</span></p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>

        </div>
      ) : selectedExamId ? (
        <div className="text-center py-10 font-bold text-gray-400 border rounded-xl bg-white print:hidden">No routine available for this exam yet.</div>
      ) : null}

    </div>
  );
}