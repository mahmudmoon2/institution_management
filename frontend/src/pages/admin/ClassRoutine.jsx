import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ClassRoutine() {
  const [routines, setRoutines] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterDay, setFilterDay] = useState('');

  // Form state for add/edit
  const [showForm, setShowForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [formData, setFormData] = useState({
    class_level: '',
    section: '',
    day: '',
    period: '',
    subject: '',
    teacher: '',
    room_number: '',
    start_time: '',
    end_time: '',
    is_active: true
  });
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        api.get('/academics/classes/'),
        api.get('/academics/subjects/'),
        api.get('/teachers/')
      ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (err) { console.error('Failed to load initial data', err); }
  };

  const fetchRoutines = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterClass) params.class_level = filterClass;
      if (filterSection) params.section = filterSection;
      if (filterDay) params.day = filterDay;
      const res = await api.get('/academics/routines/', { params });
      setRoutines(res.data);
    } catch (err) { console.error('Failed to load routines', err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [filterClass, filterSection, filterDay]);

  const handleClassChange = async (classId) => {
    setFilterClass(classId);
    setFilterSection('');
    setFormData(prev => ({ ...prev, class_level: classId, section: '' }));
    if (classId) {
      try {
        const secRes = await api.get(`/academics/sections/?class=${classId}`);
        setSections(secRes.data);
      } catch (e) { console.error('Failed to load sections', e); }
    } else {
      setSections([]);
    }
  };

  const getFilteredSections = () => {
    if (filterClass) return sections;
    return [];
  };

  const openAddForm = () => {
    setEditingRoutine(null);
    setFormData({
      class_level: filterClass || '',
      section: filterSection || '',
      day: filterDay || '',
      period: '',
      subject: '',
      teacher: '',
      room_number: '',
      start_time: '09:00',
      end_time: '09:45',
      is_active: true
    });
    setFormError('');
    setShowForm(true);
    if (filterClass) handleClassChange(filterClass);
  };

  const openEditForm = (routine) => {
    setEditingRoutine(routine);
    setFormData({
      class_level: routine.class_level,
      section: routine.section,
      day: routine.day,
      period: routine.period,
      subject: routine.subject,
      teacher: routine.teacher || '',
      room_number: routine.room_number || '',
      start_time: routine.start_time,
      end_time: routine.end_time,
      is_active: routine.is_active
    });
    setFormError('');
    setShowForm(true);
    if (routine.class_level) handleClassChange(routine.class_level);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'class_level') {
      handleClassChange(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.class_level || !formData.section || !formData.day || !formData.period || !formData.subject || !formData.start_time || !formData.end_time) {
      setFormError('Please fill all required fields.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingRoutine) {
        await api.put(`/academics/routines/${editingRoutine.id}/`, formData);
      } else {
        await api.post('/academics/routines/', formData);
      }
      setShowForm(false);
      fetchRoutines();
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : 'Failed to save routine.';
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this routine entry?')) return;
    try {
      await api.delete(`/academics/routines/${id}/`);
      fetchRoutines();
    } catch (e) {
      alert('Failed to delete routine entry.');
    }
  };

  const getClassName = (id) => classes.find(c => c.id === id)?.name || '';
  const getSectionName = (id) => getFilteredSections().find(s => s.id === id)?.name || '';

  // Group routines by day for display
  const groupedRoutines = DAYS.reduce((acc, day) => {
    acc[day] = routines.filter(r => r.day === day).sort((a, b) => a.period - b.period);
    return acc;
  }, {});

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Weekly Class Routine</h1>
          <p className="text-gray-500 text-sm mt-1">Manage class-wise weekly schedules. Routines auto-appear on student dashboards.</p>
        </div>
        <button onClick={openAddForm} className="bg-brand-deepPlum text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand-royalPurple transition-colors flex items-center gap-2 shadow-sm">
          <span>+</span> Add Period
        </button>
      </motion.div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <select value={filterClass} onChange={(e) => handleClassChange(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-brand-tealCyan min-w-[180px]">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-brand-tealCyan min-w-[180px]" disabled={!filterClass}>
          <option value="">All Sections</option>
          {getFilteredSections().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-brand-tealCyan min-w-[150px]">
          <option value="">All Days</option>
          {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Routine Table */}
      {isLoading ? (
        <div className="text-center py-10 font-bold text-gray-500">Loading routines...</div>
      ) : routines.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <span className="text-5xl block mb-4">📅</span>
          <p className="text-gray-500 font-semibold">No routine entries found. Add the first one!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {DAYS.map(day => {
            const dayRoutines = groupedRoutines[day];
            if (dayRoutines.length === 0) return null;
            return (
              <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-3 bg-[#F5F0FF] border-b border-gray-100 font-bold text-brand-deepPlum">{day}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                      <tr>
                        <th className="p-3">Period</th>
                        <th className="p-3">Subject</th>
                        <th className="p-3">Teacher</th>
                        <th className="p-3">Time</th>
                        <th className="p-3">Room</th>
                        <th className="p-3">Class</th>
                        <th className="p-3 text-center">Active</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayRoutines.map(r => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-bold text-brand-deepPlum">{r.period}</td>
                          <td className="p-3 font-bold text-gray-800">{r.subject_name}</td>
                          <td className="p-3 text-gray-700">{r.teacher_name || 'Not Assigned'}</td>
                          <td className="p-3 text-gray-600">{r.start_time} - {r.end_time}</td>
                          <td className="p-3 text-gray-600">{r.room_number || '-'}</td>
                          <td className="p-3 text-gray-600">{r.class_level_name} - {r.section_name}</td>
                          <td className="p-3 text-center">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                              {r.is_active ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => openEditForm(r)} className="text-blue-600 hover:underline font-bold text-xs mr-3">✏️ Edit</button>
                            <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:underline font-bold text-xs">🗑️ Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-extrabold text-gray-800">{editingRoutine ? 'Edit Period' : 'Add New Period'}</h3>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Class *</label>
                  <select name="class_level" value={formData.class_level} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" required>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Section *</label>
                  <select name="section" value={formData.section} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" required disabled={!formData.class_level}>
                    <option value="">Select Section</option>
                    {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Day *</label>
                  <select name="day" value={formData.day} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" required>
                    <option value="">Select Day</option>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Period # *</label>
                  <input type="number" name="period" value={formData.period} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" min="1" max="12" required placeholder="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Subject *</label>
                  <select name="subject" value={formData.subject} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" required>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher</label>
                  <select name="teacher" value={formData.teacher} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50">
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
                  <input type="time" name="start_time" value={formData.start_time} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Time *</label>
                  <input type="time" name="end_time" value={formData.end_time} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Room No.</label>
                  <input type="text" name="room_number" value={formData.room_number} onChange={handleFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50" placeholder="101" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleFormChange} className="w-4 h-4 rounded" />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-[2] bg-brand-deepPlum text-white font-bold py-3 rounded-xl hover:bg-brand-royalPurple transition shadow-md disabled:opacity-50">
                  {isSaving ? 'Saving...' : editingRoutine ? 'Update Period' : 'Save Period'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}