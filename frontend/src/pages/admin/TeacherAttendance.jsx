import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function TeacherAttendance() {
  const [teachers, setTeachers] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  
  // হাজিরার স্ট্যাটাস এবং নোট ট্র্যাক করার জন্য: { teacher_id: { status: 'Present', note: '' } }
  const [attendanceData, setAttendanceData] = useState({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // টিচার লিস্ট আনা
  const handleFetchTeachers = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    setTeachers([]);

    try {
      // সব টিচারদের লিস্ট নিয়ে আসা
      const res = await api.get('/teachers/');
      const fetchedTeachers = res.data;
      setTeachers(fetchedTeachers);

      // সবার জন্য ডিফল্ট স্ট্যাটাস 'Present' এবং ফাঁকা নোট সেট করা
      const initialAttendance = {};
      fetchedTeachers.forEach(teacher => {
        initialAttendance[teacher.id] = { status: 'Present', note: '' };
      });
      setAttendanceData(initialAttendance);

      if (fetchedTeachers.length === 0) {
        setMsg({ type: 'error', text: 'No teachers found in the system.' });
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to fetch teachers. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // স্ট্যাটাস বা নোট পরিবর্তন হ্যান্ডেল করা
  const handleAttendanceChange = (teacherId, field, value) => {
    setAttendanceData({
      ...attendanceData,
      [teacherId]: {
        ...attendanceData[teacherId],
        [field]: value
      }
    });
  };

  // হাজিরা সেভ করা
  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const promises = teachers.map(teacher => {
        return api.post('/teachers/teacher-attendance/', {
          teacher: teacher.id,
          date: filterDate,
          status: attendanceData[teacher.id].status,
          note: attendanceData[teacher.id].note
        });
      });

      await Promise.all(promises);
      setMsg({ type: 'success', text: 'Teacher attendance saved successfully!' });
      
      setTimeout(() => {
        setTeachers([]);
        setMsg({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error(error);
      setMsg({ type: 'error', text: 'Failed to save! Attendance for this date might already exist.' });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Teacher Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Record daily attendance for faculty members.</p>
      </motion.div>

      {/* Filter Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleFetchTeachers} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Date</label>
            <input type="date" required value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" disabled={isLoading} className="px-8 py-2.5 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors h-[42px] whitespace-nowrap">
            {isLoading ? 'Loading...' : 'Fetch Teachers'}
          </button>
        </form>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-semibold text-sm ${msg.type === 'success' ? 'bg-brand-mintGreen/30 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Teachers List & Form */}
      {teachers.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#F5F0FF] text-brand-deepPlum">
                  <th className="p-4 border-b border-gray-100 font-bold w-1/4">Teacher Name</th>
                  <th className="p-4 border-b border-gray-100 font-bold w-1/2">Attendance Status</th>
                  <th className="p-4 border-b border-gray-100 font-bold w-1/4">Note (Optional)</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-gray-700">{teacher.name}</p>
                      <p className="text-xs text-brand-tealCyan font-semibold">{teacher.teacher_id}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {['Present', 'Absent', 'Late', 'On-Leave'].map((status) => (
                          <label key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                            attendanceData[teacher.id]?.status === status 
                            ? (status === 'Present' ? 'bg-brand-mintGreen/30 border-brand-mintGreen text-[#0e5c3c]' : 
                               status === 'Absent' ? 'bg-red-100 border-red-300 text-red-700' :
                               status === 'On-Leave' ? 'bg-purple-100 border-purple-300 text-purple-700' :
                               'bg-orange-100 border-orange-300 text-orange-700')
                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}>
                            <input 
                              type="radio" 
                              name={`status-${teacher.id}`} 
                              value={status} 
                              checked={attendanceData[teacher.id]?.status === status} 
                              onChange={() => handleAttendanceChange(teacher.id, 'status', status)}
                              className="hidden"
                            />
                            <span className="text-sm font-semibold">{status}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <input 
                        type="text" 
                        placeholder={attendanceData[teacher.id]?.status === 'On-Leave' ? 'Reason for leave...' : 'Any note...'}
                        value={attendanceData[teacher.id]?.note}
                        onChange={(e) => handleAttendanceChange(teacher.id, 'note', e.target.value)}
                        className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:border-brand-tealCyan focus:outline-none bg-gray-50"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
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