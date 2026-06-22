import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Umbrella, Save, Users, Loader } from 'lucide-react';
import api from '../../api/axios';

export default function StudentAttendance() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [filter, setFilter] = useState({
    date: new Date().toISOString().split('T')[0],
    class_level: '',
    section: ''
  });

  const [attendanceData, setAttendanceData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Quick stats
  const quickStats = {
    present: Object.values(attendanceData).filter(s => s === 'Present').length,
    absent: Object.values(attendanceData).filter(s => s === 'Absent').length,
    late: Object.values(attendanceData).filter(s => s === 'Late').length,
    holiday: Object.values(attendanceData).filter(s => s === 'Holiday').length,
    total: students.length,
  };

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

  const handleFetchStudents = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    setStudents([]);

    try {
      const res = await api.get('/students/', {
        params: { class_level: filter.class_level, section: filter.section }
      });

      const fetchedStudents = res.data;
      setStudents(fetchedStudents);

      // 1. Check if attendance already exists for this date
      let existingAttendance = {};
      try {
        const attRes = await api.get('/students/student-attendance/', {
          params: { date: filter.date }
        });
        attRes.data.forEach(record => {
          existingAttendance[record.student] = record.status;
        });
      } catch (e) { /* no existing attendance */ }

      const hasExisting = Object.keys(existingAttendance).length > 0;

      const initialAttendance = {};
      fetchedStudents.forEach(student => {
        initialAttendance[student.id] = existingAttendance[student.id] || 'Present';
      });
      setAttendanceData(initialAttendance);

      if (fetchedStudents.length === 0) {
        setMsg({ type: 'error', text: 'No students found for this class and section.' });
      } else if (hasExisting) {
        setMsg({ type: 'success', text: `Loaded existing attendance for ${filter.date}. You can edit and re-save.` });
        setTimeout(() => setMsg({ type: '', text: '' }), 4000);
      }
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to fetch students. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData({ ...attendanceData, [studentId]: status });
  };

  // Bulk action: Mark all as Present / Absent
  const handleBulkStatus = (status) => {
    const updated = {};
    Object.keys(attendanceData).forEach(id => {
      updated[id] = status;
    });
    setAttendanceData(updated);
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const promises = students.map(student => {
        return api.post('/students/student-attendance/', {
          student: student.id,
          date: filter.date,
          status: attendanceData[student.id]
        });
      });

      await Promise.all(promises);
      setMsg({ type: 'success', text: `Attendance saved for ${students.length} students! Summary: Present ${quickStats.present}, Absent ${quickStats.absent}, Late ${quickStats.late}` });

      setTimeout(() => {
        setStudents([]);
        setMsg({ type: '', text: '' });
      }, 4000);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to save! Attendance for this date might already exist.' });
    } finally {
      setIsSaving(false);
    }
  };

  const statusConfig = {
    'Present': { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-100 text-green-700 border-green-300', dot: 'bg-green-500' },
    'Absent': { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-700 border-red-300', dot: 'bg-red-500' },
    'Late': { icon: <Clock className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700 border-orange-300', dot: 'bg-orange-500' },
    'Holiday': { icon: <Umbrella className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700 border-blue-300', dot: 'bg-blue-500' },
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white";

  return (
    <div className="space-y-4 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-deepPlum">Student Attendance</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Record daily attendance by class & section.</p>
      </motion.div>

      {/* Filter Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleFetchStudents} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
            <input type="date" name="date" required value={filter.date} onChange={handleFilterChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Class</label>
            <select name="class_level" required value={filter.class_level} onChange={handleFilterChange} className={inputClass}>
              <option value="">Select</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Section</label>
            <select name="section" required value={filter.section} onChange={handleFilterChange} className={inputClass}>
              <option value="">Select</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
              {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              {isLoading ? 'Loading...' : 'Fetch Students'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Quick Stats Bar (visible when students are loaded) */}
      {students.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(statusConfig).map(([status, cfg]) => (
            <div key={status} className={`${cfg.color} p-3 rounded-xl border text-center`}>
              <div className="flex items-center justify-center gap-1 mb-1">{cfg.icon}<span className="text-xs font-bold">{status}</span></div>
              <p className="text-lg font-bold">{quickStats[status.toLowerCase()]}</p>
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      {msg.text && (
        <div className={`p-3 sm:p-4 rounded-xl font-semibold text-xs sm:text-sm ${msg.type === 'success' ? 'bg-brand-mintGreen/30 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Students List — Mobile Cards + Desktop Table */}
      {students.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Bulk Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-end">
            <button onClick={() => handleBulkStatus('Present')} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-green-100 text-green-700 border border-green-300">All Present</button>
            <button onClick={() => handleBulkStatus('Absent')} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-100 text-red-700 border border-red-300">All Absent</button>
          </div>

          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F0FF] text-brand-deepPlum">
                    <th className="p-3 border-b font-bold text-sm">Roll</th>
                    <th className="p-3 border-b font-bold text-sm">Student Name</th>
                    <th className="p-3 border-b font-bold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-brand-tealCyan text-sm">{student.roll_number}</td>
                      <td className="p-3 font-bold text-gray-700 text-sm">{student.name}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(statusConfig).map(([status, cfg]) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                attendanceData[student.id] === status ? cfg.color : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                              }`}
                            >
                              {cfg.icon} {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards (shown only on mobile) */}
          <div className="sm:hidden space-y-2">
            {students.map((student) => {
              const currentStatus = attendanceData[student.id] || 'Present';
              return (
                <div key={student.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">Roll: {student.roll_number}</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${statusConfig[currentStatus]?.dot || 'bg-gray-400'}`}></span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {Object.entries(statusConfig).map(([status, cfg]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                          currentStatus === status ? cfg.color : 'bg-white border-gray-150 text-gray-400'
                        }`}
                      >
                        {cfg.icon} {status}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl font-bold text-brand-deepPlum shadow-md transition-colors flex items-center gap-2 ${isSaving ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}
            >
              {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}