import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export default function MarksEntry() {
  const [exams, setExams] = useState([]);
  const [subjectExams, setSubjectExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]); // নতুন স্টেট: ডাটাবেসের রেজাল্ট রাখার জন্য
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Toast State (বিরক্তিকর Alert এর বদলে)
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // সিলেকশন স্টেট
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectExamId, setSelectedSubjectExamId] = useState('');
  
  // মার্কস এন্ট্রির জন্য স্টেট 
  const [marksData, setMarksData] = useState({});
  // কোন স্টুডেন্টের রেজাল্ট আগে থেকেই আছে তার ট্র্যাকিং ম্যাপ { student_id: result_id }
  const [existingResultsMap, setExistingResultsMap] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [examRes, subExamRes, stuRes, resultRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/exams/subject-exams/'),
        api.get('/students/'),
        api.get('/exams/results/') // রেজাল্টগুলোও নিয়ে আসলাম
      ]);
      setExams(examRes.data);
      setSubjectExams(subExamRes.data);
      setStudents(stuRes.data);
      setResults(resultRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Failed to fetch initial data.", "error");
    }
  };

  // যখন এক্সাম বা সাবজেক্ট চেঞ্জ হবে, তখন আগের মার্কসগুলো ইনপুট বক্সে বসিয়ে দেওয়া হবে
  useEffect(() => {
    if (selectedExamId && selectedSubjectExamId) {
      const selectedSubExam = subjectExams.find(se => se.id.toString() === selectedSubjectExamId);
      if (selectedSubExam) {
        const filteredRes = results.filter(r => 
          r.exam.toString() === selectedExamId && 
          r.subject === selectedSubExam.subject
        );
        
        const initialMarks = {};
        const existMap = {};
        
        filteredRes.forEach(r => {
          initialMarks[r.student] = r.marks_obtained;
          existMap[r.student] = r.id; // রেজাল্ট আইডি সেভ করে রাখছি আপডেটের জন্য
        });
        
        setMarksData(initialMarks);
        setExistingResultsMap(existMap);
      }
    } else {
      setMarksData({});
      setExistingResultsMap({});
    }
  }, [selectedExamId, selectedSubjectExamId, results, subjectExams]);

  const filteredSubjects = subjectExams.filter(se => se.exam.toString() === selectedExamId);
  const selectedExamObj = exams.find(e => e.id.toString() === selectedExamId);
  const targetClassId = selectedExamObj ? selectedExamObj.class_level : null;
  const filteredStudents = students.filter(s => s.class_level === targetClassId);

  const handleMarksChange = (studentId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExamId || !selectedSubjectExamId) {
      showToast('Please select both Exam and Subject.', 'error');
      return;
    }

    const selectedSubExamObj = subjectExams.find(se => se.id.toString() === selectedSubjectExamId);
    if (!selectedSubExamObj) return;

    setIsLoading(true);

    try {
      const studentIdsWithMarks = Object.keys(marksData).filter(id => marksData[id] !== '');
      
      if(studentIdsWithMarks.length === 0) {
        showToast('Please enter marks for at least one student.', 'error');
        setIsLoading(false);
        return;
      }

      // லুপ চালিয়ে চেক করা হচ্ছে যে নতুন ক্রিয়েট করবে নাকি আগেরটা আপডেট করবে
      for (const studentId of studentIdsWithMarks) {
        const val = marksData[studentId];
        const existingResultId = existingResultsMap[studentId];

        if (existingResultId) {
          // আগে থেকে থাকলে শুধু PATCH (Update) করবে
          await api.patch(`/exams/results/${existingResultId}/`, {
            marks_obtained: val
          });
        } else {
          // না থাকলে নতুন করে POST (Create) করবে
          await api.post('/exams/results/', {
            student: studentId,
            exam: selectedExamId,
            subject: selectedSubExamObj.subject,
            marks_obtained: val
          });
        }
      }

      showToast(`Marks successfully saved/updated for ${studentIdsWithMarks.length} students!`, 'success');
      
      // ব্যাকএন্ড থেকে নতুন রেজাল্ট রিফ্রেশ করা
      const updatedResultsRes = await api.get('/exams/results/');
      setResults(updatedResultsRes.data);

    } catch (error) {
      console.error(error);
      showToast('Failed to save marks. Please check your inputs.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

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

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Marks Entry</h1>
        <p className="text-gray-500 text-sm mt-1">Enter or update subject-wise marks. Pre-saved marks will load automatically.</p>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-100 pb-8">
          <div>
            <label className={labelClass}>Select Exam *</label>
            <select 
              value={selectedExamId} 
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedSubjectExamId(''); 
                setMarksData({});
              }} 
              className={inputClass}
            >
              <option value="">-- Choose Exam --</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name} ({e.class_level_name})</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Select Subject *</label>
            <select 
              value={selectedSubjectExamId} 
              onChange={(e) => setSelectedSubjectExamId(e.target.value)} 
              className={inputClass}
              disabled={!selectedExamId}
            >
              <option value="">-- Choose Subject --</option>
              {filteredSubjects.map(se => (
                <option key={se.id} value={se.id}>
                  {se.subject_name} (Max: {Number(se.full_marks)})
                </option>
              ))}
            </select>
            {!selectedExamId && <p className="text-xs text-gray-400 mt-1">Select an exam first to see subjects.</p>}
          </div>
        </div>

        {selectedExamId && selectedSubjectExamId && (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-brand-deepPlum">Enter / Edit Marks</h3>
              <span className="bg-[#F5F0FF] text-brand-royalPurple px-3 py-1 rounded-lg text-xs font-bold border border-brand-softLavender/30">
                Total Students: {filteredStudents.length}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="p-4 font-semibold w-24">Roll No</th>
                    <th className="p-4 font-semibold">Student ID & Name</th>
                    <th className="p-4 font-semibold w-48 text-right">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr><td colSpan="3" className="text-center py-10 text-gray-400 font-semibold">No students found in this class.</td></tr>
                  ) : (
                    filteredStudents.map(student => (
                      <tr key={student.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-500">{student.roll_number}</td>
                        <td className="p-4">
                          <p className="font-bold text-brand-deepPlum">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.student_id}</p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="relative inline-block">
                            <input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              value={marksData[student.id] !== undefined ? marksData[student.id] : ''}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className={`w-28 px-3 py-2 text-right rounded-lg border focus:outline-none focus:border-brand-tealCyan font-bold bg-white shadow-sm ${existingResultsMap[student.id] ? 'border-brand-tealCyan text-[#0e5c3c]' : 'border-gray-200 text-brand-deepPlum'}`}
                            />
                            {/* যদি আগে থেকে ডাটাবেসে সেভ থাকে তবে একটি ছোট টিক চিহ্ন দেখাবে */}
                            {existingResultsMap[student.id] && (
                               <span className="absolute -left-5 top-2.5 text-[#0e5c3c] text-sm" title="Already Saved (You can edit it)">✅</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-right">
              <button 
                type="submit" 
                disabled={isLoading || filteredStudents.length === 0} 
                className={`px-8 py-3 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md ${isLoading || filteredStudents.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}
              >
                {isLoading ? 'Processing...' : 'Save / Update Marks'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}