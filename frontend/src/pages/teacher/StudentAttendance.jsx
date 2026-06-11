import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function StudentAttendance() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  
  // ফিল্টার স্টেট
  const [filter, setFilter] = useState({
    date: new Date().toISOString().split('T')[0],
    class_level: '',
    section: ''
  });

  // স্টুডেন্টদের হাজিরার স্ট্যাটাস ট্র্যাক করার জন্য (যেমন: { "student_id_1": "Present", "student_id_2": "Absent" })
  const [attendanceData, setAttendanceData] = useState({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // পেজ লোড হলে ক্লাস ও সেকশন আনবে
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const clsRes = await api.get('/academics/classes/');
        setClasses(clsRes.data);
        const secRes = await api.get('/academics/sections/');
        setSections(secRes.data);
      } catch (error) {
        console.error("Failed to fetch options", error);
      }
    };
    fetchOptions();
  }, []);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // স্টুডেন্ট লিস্ট আনা
  const handleFetchStudents = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    setStudents([]);

    try {
      // ক্লাস এবং সেকশন দিয়ে স্টুডেন্ট ফিল্টার করে আনা
      const res = await api.get('/students/', {
        params: { class_level: filter.class_level, section: filter.section }
      });
      
      const fetchedStudents = res.data;
      setStudents(fetchedStudents);

      // সবার জন্য ডিফল্ট স্ট্যাটাস 'Present' করে দেওয়া, যাতে টিচারদের সময় বাঁচে
      const initialAttendance = {};
      fetchedStudents.forEach(student => {
        initialAttendance[student.id] = 'Present';
      });
      setAttendanceData(initialAttendance);

      if (fetchedStudents.length === 0) {
        setMsg({ type: 'error', text: 'No students found for this class and section.' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to fetch students. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // রেডিও বাটনে ক্লিক করলে স্ট্যাটাস আপডেট হবে
  const handleStatusChange = (studentId, status) => {
    setAttendanceData({
      ...attendanceData,
      [studentId]: status
    });
  };

  // হাজিরা ডাটাবেসে সেভ করা
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setMsg({ type: '', text: '' });

    try {
      // প্রতিটি স্টুডেন্টের জন্য আলাদা করে API রিকোয়েস্ট তৈরি করা
      const promises = students.map(student => {
        return api.post('/students/student-attendance/', {
          student: student.id,
          date: filter.date,
          status: attendanceData[student.id]
        });
      });

      // সবগুলো রিকোয়েস্ট একসাথে পাঠানো
      await Promise.all(promises);
      setMsg({ type: 'success', text: 'Attendance saved successfully for the selected date!' });
      
      // সেভ হওয়ার পর স্টুডেন্ট লিস্ট ক্লিয়ার করে দেওয়া
      setTimeout(() => {
        setStudents([]);
        setMsg({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error(error);
      // যদি ডাটাবেসে ওই দিনের হাজিরা আগে থেকেই থাকে, তবে এরর দিতে পারে (unique_together এর কারণে)
      setMsg({ type: 'error', text: 'Failed to save! Attendance for this date might already exist.' });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Student Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Select class and date to record daily attendance.</p>
      </motion.div>

      {/* Filter Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleFetchStudents} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
            <input type="date" name="date" required value={filter.date} onChange={handleFilterChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class</label>
            <select name="class_level" required value={filter.class_level} onChange={handleFilterChange} className={inputClass}>
              <option value="">Select Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section</label>
            <select name="section" required value={filter.section} onChange={handleFilterChange} className={inputClass}>
              <option value="">Select Section</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors h-[42px]">
            {isLoading ? 'Loading...' : 'Fetch Students'}
          </button>
        </form>
      </motion.div>

      {/* Messages */}
      {msg.text && (
        <div className={`p-4 rounded-xl font-semibold text-sm ${msg.type === 'success' ? 'bg-brand-mintGreen/30 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Students List & Attendance Form */}
      {students.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F0FF] text-brand-deepPlum">
                  <th className="p-4 border-b border-gray-100 font-bold">Roll</th>
                  <th className="p-4 border-b border-gray-100 font-bold">Student Name</th>
                  <th className="p-4 border-b border-gray-100 font-bold">Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-brand-tealCyan">{student.roll_number}</td>
                    <td className="p-4 font-bold text-gray-700">{student.name}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-3">
                        {['Present', 'Absent', 'Late', 'Holiday'].map((status) => (
                          <label key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            attendanceData[student.id] === status 
                            ? (status === 'Present' ? 'bg-brand-mintGreen/30 border-brand-mintGreen text-[#0e5c3c]' : 
                               status === 'Absent' ? 'bg-red-100 border-red-300 text-red-700' :
                               'bg-orange-100 border-orange-300 text-orange-700')
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}>
                            <input 
                              type="radio" 
                              name={`status-${student.id}`} 
                              value={status} 
                              checked={attendanceData[student.id] === status} 
                              onChange={() => handleStatusChange(student.id, status)}
                              className="hidden"
                            />
                            <span className="text-sm font-semibold">{status}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Save Button */}
          <div className="p-6 border-t border-gray-100 flex justify-end">
            <button 
              onClick={handleSaveAttendance} 
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl font-bold text-brand-deepPlum shadow-md transition-colors ${isSaving ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}
            >
              {isSaving ? 'Saving Records...' : 'Save Attendance'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}