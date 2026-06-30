import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/useThemeStore';
import api from '../../api/axios';

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], class_level: '', section: '', subject: '', start_time: '', end_time: '', topic_covered: '' });

  useEffect(() => {
    const fetchData = async () => {
      try { const clsRes = await api.get('/academics/classes/'); setClasses(clsRes.data); } catch (_) {}
      try { const secRes = await api.get('/academics/sections/'); setSections(secRes.data); } catch (_) {}
      try { const subRes = await api.get('/academics/subjects/'); setSubjects(subRes.data); } catch (_) {}
      try { const histRes = await api.get('/teachers/class-history/'); setHistoryList(histRes.data); } catch (_) {}
    };
    fetchData();
  }, []);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };
  const handleEditChange = (e) => { setEditFormData({ ...editFormData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const response = await api.post('/teachers/class-history/', formData);
      setHistoryList([response.data, ...historyList]);
      setSuccessMsg(t('teacher.added_success'));
      setFormData({ ...formData, start_time: '', end_time: '', topic_covered: '' });
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (_) { setErrorMsg(t('teacher.add_failed')); }
    finally { setIsLoading(false); }
  };

  const handleRowClick = (record) => { setSelectedRecord(record); setEditFormData(record); setIsEditing(false); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await api.put(`/teachers/class-history/${selectedRecord.id}/`, editFormData);
      setHistoryList(historyList.map(item => item.id === selectedRecord.id ? response.data : item));
      setSelectedRecord(null);
      setSuccessMsg(t('teacher.updated_success'));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (_) { alert(t('teacher.update_failed')); }
    finally { setIsUpdating(false); }
  };

  const inputClass = `w-full px-3 sm:px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan ${isDark ? 'bg-white/[0.05] border-white/10 text-slate-200 placeholder-slate-500 focus:bg-white/[0.08]' : 'bg-gray-50 border-gray-200 text-gray-700 focus:bg-white'}`;
  const labelClass = `block text-xs sm:text-sm font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;

  return (
    <div className="space-y-3 sm:space-y-6 relative pb-4 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`p-4 sm:p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
        <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('teacher.my_classes')}</h1>
        <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('teacher.class_desc')}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={`lg:col-span-1 p-4 sm:p-6 rounded-2xl shadow-sm border h-fit ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-base sm:text-lg font-bold mb-4 border-b pb-2 ${isDark ? 'text-cyan-400 border-white/[0.06]' : 'text-brand-royalPurple'}`}>{t('teacher.add_record')}</h2>
          {successMsg && <div className="bg-brand-mintGreen/30 text-[#0e5c3c] px-4 py-2 rounded-lg text-xs sm:text-sm mb-4 font-semibold">{successMsg}</div>}
          {errorMsg && <div className={`px-4 py-2 rounded-lg text-xs sm:text-sm mb-4 font-semibold ${isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'}`}>{errorMsg}</div>}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div><label className={labelClass}>{t('teacher.date_label')} *</label><input type="date" name="date" required value={formData.date} onChange={handleChange} className={inputClass} /></div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div><label className={labelClass}>{t('teacher.class_label')} *</label><select name="class_level" required value={formData.class_level} onChange={handleChange} className={inputClass}><option value="">{t('teacher.select_class')}</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className={labelClass}>{t('teacher.section_label')} *</label><select name="section" required value={formData.section} onChange={handleChange} className={inputClass}><option value="">{t('teacher.select_section')}</option>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            </div>
            <div><label className={labelClass}>{t('teacher.subject_label')} *</label><select name="subject" required value={formData.subject} onChange={handleChange} className={inputClass}><option value="">{t('teacher.select_subject')}</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div><label className={labelClass}>{t('teacher.start_time')} *</label><input type="time" name="start_time" required value={formData.start_time} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>{t('teacher.end_time')} *</label><input type="time" name="end_time" required value={formData.end_time} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>{t('teacher.topic_covered')} *</label><textarea name="topic_covered" required value={formData.topic_covered} onChange={handleChange} rows="2" placeholder={t('teacher.topic_placeholder')} className={inputClass}></textarea></div>
            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl text-white font-bold transition-colors shadow-sm mt-2 text-sm ${isLoading ? 'bg-gray-400' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}>
              {isLoading ? t('teacher.saving') : t('teacher.save_record')}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`lg:col-span-2 rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
          <div className={`p-4 sm:p-6 border-b flex justify-between items-center ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <h2 className={`text-base sm:text-lg font-bold ${isDark ? 'text-cyan-400' : 'text-brand-royalPurple'}`}>{t('teacher.class_history')}</h2>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto p-2 sm:p-2">
            {historyList.length === 0 ? (
              <div className={`text-center py-8 sm:py-10 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}><span className="text-3xl sm:text-4xl block mb-2">📋</span><span className="text-sm">{t('teacher.no_records')}</span></div>
            ) : (
              <div className="space-y-2 sm:space-y-3 p-2 sm:p-4">
                {historyList.map((record) => (
                  <div key={record.id} onClick={() => handleRowClick(record)} className={`p-3 sm:p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between group ${
                    isDark ? 'border-white/[0.06] hover:bg-white/[0.05] hover:border-cyan-500/30' : 'border-gray-100 hover:bg-gray-50 hover:border-brand-tealCyan/50'
                  }`}>
                    <div className="flex gap-3 items-start w-full sm:w-auto">
                      <div className={`p-2 sm:p-3 rounded-xl text-center shrink-0 w-12 sm:w-16 transition-colors ${
                        isDark ? 'bg-purple-500/15 text-purple-300 group-hover:bg-cyan-500/15' : 'bg-brand-softLavender/20 text-brand-royalPurple group-hover:bg-brand-tealCyan/20'
                      }`}>
                        <span className="block text-base sm:text-lg font-bold">{new Date(record.date).getDate()}</span>
                        <span className="block text-[9px] sm:text-[10px] uppercase font-bold">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-bold text-sm sm:text-base mb-1 transition-colors truncate ${
                          isDark ? 'text-slate-200 group-hover:text-cyan-400' : 'text-brand-deepPlum group-hover:text-brand-tealCyan'
                        }`}>{record.topic_covered}</h4>
                        <div className="text-[11px] sm:text-xs flex flex-wrap gap-1.5 items-center">
                          <span className={`px-2 py-1 rounded font-medium ${
                            isDark ? 'bg-white/[0.05] text-slate-300' : 'bg-gray-100 text-gray-500'
                          }`}>{record.class_level_name} - {record.section_name}</span>
                          <span className="font-medium text-brand-tealCyan">{record.subject_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      <span className={`text-[11px] sm:text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-lg inline-block ${
                        isDark ? 'bg-white/[0.04] border border-white/[0.08] text-slate-300' : 'text-gray-500 bg-white border border-gray-100'
                      }`}>⏱️ {record.start_time.substring(0,5)} - {record.end_time.substring(0,5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-deepPlum/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border mx-auto ${
              isDark ? 'bg-[#0d0a27] border-white/[0.06] text-white' : 'bg-white border-gray-100'
            }`}>
              <div className={`p-4 sm:p-6 flex justify-between items-center border-b ${
                isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-[#F5F0FF] border-gray-100'
              }`}>
                <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{isEditing ? t('teacher.edit_record') : t('teacher.class_details')}</h3>
                <button onClick={() => setSelectedRecord(null)} className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors font-bold shrink-0 ${
                  isDark ? 'bg-white/[0.04] text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-white text-gray-500 hover:text-red-500 hover:bg-red-50'
                }`}>✕</button>
              </div>
              <div className="p-4 sm:p-6">
                {!isEditing ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div className={`px-3 sm:px-4 py-3 rounded-xl border ${
                      isDark ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-brand-mintGreen/20 border-brand-mintGreen/40'
                    }`}>
                      <p className={`text-xs sm:text-sm font-semibold mb-1 ${isDark ? 'text-cyan-300' : 'text-[#0e5c3c]'}`}>{t('teacher.topic_covered')}</p>
                      <p className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{selectedRecord.topic_covered}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className={`p-2 sm:p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}><p className={`text-[10px] sm:text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('teacher.date_label')}</p><p className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{selectedRecord.date}</p></div>
                      <div className={`p-2 sm:p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}><p className={`text-[10px] sm:text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('common.time')}</p><p className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{selectedRecord.start_time.substring(0,5)} - {selectedRecord.end_time.substring(0,5)}</p></div>
                      <div className={`p-2 sm:p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}><p className={`text-[10px] sm:text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('teacher.class_label')} & {t('teacher.section_label')}</p><p className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{selectedRecord.class_level_name} - {selectedRecord.section_name}</p></div>
                      <div className={`p-2 sm:p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}><p className={`text-[10px] sm:text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('teacher.subject_label')}</p><p className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{selectedRecord.subject_name}</p></div>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="w-full mt-4 py-3 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors text-sm">{t('teacher.edit')}</button>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate} className="space-y-3 sm:space-y-4">
                    <div><label className={labelClass}>{t('teacher.date_label')}</label><input type="date" name="date" required value={editFormData.date} onChange={handleEditChange} className={inputClass} /></div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div><label className={labelClass}>{t('teacher.class_label')}</label><select name="class_level" required value={editFormData.class_level} onChange={handleEditChange} className={inputClass}>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                      <div><label className={labelClass}>{t('teacher.section_label')}</label><select name="section" required value={editFormData.section} onChange={handleEditChange} className={inputClass}>{sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    </div>
                    <div><label className={labelClass}>{t('teacher.subject_label')}</label><select name="subject" required value={editFormData.subject} onChange={handleEditChange} className={inputClass}>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div><label className={labelClass}>{t('teacher.start_time')}</label><input type="time" name="start_time" required value={editFormData.start_time} onChange={handleEditChange} className={inputClass} /></div>
                      <div><label className={labelClass}>{t('teacher.end_time')}</label><input type="time" name="end_time" required value={editFormData.end_time} onChange={handleEditChange} className={inputClass} /></div>
                    </div>
                    <div><label className={labelClass}>{t('teacher.topic_covered')}</label><textarea name="topic_covered" required value={editFormData.topic_covered} onChange={handleEditChange} rows="2" className={inputClass}></textarea></div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setIsEditing(false)} className={`flex-1 py-3 rounded-xl font-bold transition-colors text-sm ${
                        isDark ? 'bg-white/[0.05] hover:bg-white/[0.08] text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}>{t('common.cancel')}</button>
                      <button type="submit" disabled={isUpdating} className={`flex-1 py-3 rounded-xl text-white font-bold transition-colors text-sm ${
                        isUpdating ? 'bg-gray-400' : 'bg-brand-tealCyan text-brand-deepPlum'
                      }`}>{isUpdating ? t('teacher.saving') : t('teacher.save_changes')}</button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}