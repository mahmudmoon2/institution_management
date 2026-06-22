import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Loader, CheckCircle, XCircle, Clock, Edit, Save, X } from 'lucide-react';
import api from '../../api/axios';

export default function AttendanceManagement() {
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Filters
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterClass, setFilterClass] = useState('');

  // Edit mode
  const [editingRecord, setEditingRecord] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get('/academics/classes/');
        setClasses(res.data);
      } catch (e) { console.warn("Failed to load classes"); }
    };
    fetchClasses();
  }, []);

  const fetchAttendance = async () => {
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const params = { date: filterDate };
      const res = await api.get('/students/student-attendance/', { params });
      let records = res.data;
      if (filterClass) {
        records = records.filter(r => r.student_class_id === filterClass);
      }
      setAttendanceRecords(records);
      if (records.length === 0) {
        setMsg({ type: 'error', text: 'No attendance records found for this date.' });
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to fetch attendance.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStart = (record) => {
    setEditingRecord(record);
    setEditStatus(record.status);
  };

  const handleEditSave = async () => {
    if (!editingRecord) return;
    try {
      await api.patch(`/students/student-attendance/${editingRecord.id}/`, {
        status: editStatus
      });
      setAttendanceRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...r, status: editStatus } : r));
      setEditingRecord(null);
      setMsg({ type: 'success', text: 'Attendance updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to update attendance.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const handleDownloadPDF = async () => {
    const params = new URLSearchParams();
    if (filterDate) params.append('date', filterDate);
    if (filterClass) params.append('class_level', filterClass);
    try {
      const res = await api.get(`/students/attendance-report/pdf/?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (e) { alert('Failed to download PDF.'); }
  };

  const statusConfig = {
    'Present': { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-green-600 bg-green-50', badge: 'bg-green-100 text-green-700' },
    'Absent': { icon: <XCircle className="w-3.5 h-3.5" />, color: 'text-red-600 bg-red-50', badge: 'bg-red-100 text-red-600' },
    'Late': { icon: <Clock className="w-3.5 h-3.5" />, color: 'text-orange-600 bg-orange-50', badge: 'bg-orange-100 text-orange-700' },
    'Holiday': { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-blue-600 bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
  };

  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'Present').length,
    absent: attendanceRecords.filter(r => r.status === 'Absent').length,
    late: attendanceRecords.filter(r => r.status === 'Late').length,
  };

  const inputClass = "px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] p-8 rounded-3xl shadow-lg border border-brand-royalPurple text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            Attendance
          </span>
          <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            View, edit and download student attendance records for any date and class.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">📋</span>
        </div>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-bold text-sm shadow-sm ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46] border border-[#34D399]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date *</label>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Class (optional)</label>
            <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className={inputClass}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={fetchAttendance} disabled={isLoading} className="px-6 py-2.5 rounded-xl bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum font-bold text-sm transition-colors flex items-center gap-2">
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isLoading ? 'Loading...' : 'View Attendance'}
          </button>
          <button onClick={handleDownloadPDF} className="px-4 py-2.5 rounded-xl bg-brand-royalPurple text-white hover:bg-brand-deepPlum transition-colors font-bold text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> PDF Report
          </button>
        </div>
      </div>

      {/* Summary */}
      {attendanceRecords.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'bg-gray-100 text-gray-700' },
            { label: 'Present', value: stats.present, color: 'bg-green-100 text-green-700' },
            { label: 'Absent', value: stats.absent, color: 'bg-red-100 text-red-600' },
            { label: 'Late', value: stats.late, color: 'bg-orange-100 text-orange-700' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} p-3 rounded-xl border text-center`}>
              <p className="text-xs font-semibold">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Table */}
      {attendanceRecords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-3 font-semibold">Roll</th>
                  <th className="p-3 font-semibold">Student Name</th>
                  <th className="p-3 font-semibold">Class</th>
                  <th className="p-3 font-semibold">Section</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                  <th className="p-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td className="p-3 font-semibold text-brand-tealCyan">{record.student_roll || '-'}</td>
                    <td className="p-3 font-bold text-gray-800">{record.student_name}</td>
                    <td className="p-3 text-gray-600">{record.student_class_name || '-'}</td>
                    <td className="p-3 text-gray-600">{record.student_section_name || '-'}</td>
                    <td className="p-3 text-center">
                      {editingRecord?.id === record.id ? (
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="px-2 py-1 rounded-lg border text-xs font-bold">
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                          <option value="Holiday">Holiday</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusConfig[record.status]?.badge || 'bg-gray-100 text-gray-500'}`}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {editingRecord?.id === record.id ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={handleEditSave} className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200" title="Save">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingRecord(null)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200" title="Cancel">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEditStart(record)} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100" title="Edit">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}