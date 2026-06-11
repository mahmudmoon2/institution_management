import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function MarksEntry() {
  const [exams, setExams] = useState([]);
  const [subjectExams, setSubjectExams] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // সিলেকশন স্টেট
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedSubjectExamId, setSelectedSubjectExamId] = useState('');
  
  // মার্কস এন্ট্রির জন্য স্টেট { student_id: marks_value }
  const [marksData, setMarksData] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [examRes, subExamRes, stuRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/exams/subject-exams/'),
        api.get('/students/')
      ]);
      setExams(examRes.data);
      setSubjectExams(subExamRes.data);
      setStudents(stuRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // নির্বাচিত পরীক্ষার উপর ভিত্তি করে সাবজেক্ট ফিল্টার করা
  const filteredSubjects = subjectExams.filter(se => se.exam.toString() === selectedExamId);
  
  // নির্বাচিত পরীক্ষার ক্লাসের উপর ভিত্তি করে স্টুডেন্ট ফিল্টার করা
  const selectedExamObj = exams.find(e => e.id.toString() === selectedExamId);
  const targetClassId = selectedExamObj ? selectedExamObj.class_level : null;
  const filteredStudents = students.filter(s => s.class_level === targetClassId);

  // মার্কস ইনপুট চেঞ্জ হ্যান্ডলার
  const handleMarksChange = (studentId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedExamId || !selectedSubjectExamId) {
      setMsg({ type: 'error', text: 'Please select both Exam and Subject.' });
      return;
    }

    const selectedSubExamObj = subjectExams.find(se => se.id.toString() === selectedSubjectExamId);
    if (!selectedSubExamObj) return;

    setIsLoading(true);
    setMsg({ type: '', text: '' });

    try {
      // যেসব স্টুডেন্টের মার্কস দেওয়া হয়েছে, শুধু তাদের ডেটাই পাঠাবো
      const studentIdsWithMarks = Object.keys(marksData).filter(id => marksData[id] !== '');
      
      if(studentIdsWithMarks.length === 0) {
        setMsg({ type: 'error', text: 'Please enter marks for at least one student.' });
        setIsLoading(false);
        return;
      }

      // লুপ চালিয়ে একটার পর একটা মার্কস সেভ করা
      for (const studentId of studentIdsWithMarks) {
        await api.post('/exams/results/', {
          student: studentId,
          exam: selectedExamId,
          subject: selectedSubExamObj.subject,
          marks_obtained: marksData[studentId]
        });
      }

      setMsg({ type: 'success', text: `Marks successfully saved for ${studentIdsWithMarks.length} students!` });
      setMarksData({}); // মার্কস ক্লিয়ার করে দেওয়া
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);

    } catch (error) {
      console.error(error);
      setMsg({ type: 'error', text: 'Failed to save marks. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Marks Entry</h1>
        <p className="text-gray-500 text-sm mt-1">Enter subject-wise marks for students. Grades will be computed automatically.</p>
      </motion.div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        
        {msg.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${msg.type === 'success' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-100 pb-8">
          <div>
            <label className={labelClass}>Select Exam *</label>
            <select 
              value={selectedExamId} 
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedSubjectExamId(''); // এক্সাম চেঞ্জ করলে সাবজেক্ট রিসেট হবে
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

        {/* Students Marks Entry Table */}
        {selectedExamId && selectedSubjectExamId && (
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-brand-deepPlum">Enter Marks</h3>
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
                          <input 
                            type="number" 
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={marksData[student.id] || ''}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            className="w-24 px-3 py-2 text-right rounded-lg border border-gray-200 focus:outline-none focus:border-brand-tealCyan font-bold text-brand-deepPlum bg-white shadow-sm"
                          />
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
                {isLoading ? 'Saving Marks...' : 'Save All Marks'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}