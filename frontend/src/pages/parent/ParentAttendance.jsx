import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function ParentAttendance() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try { const res = await api.get(`/parent/attendance/?year=${year}&month=${month}`); setData(res.data); }
      catch (err) { setError(err.response?.data?.error || 'Failed'); }
      finally { setIsLoading(false); }
    };
    fetchAttendance();
  }, [year, month]);

  const statusColors = { Present: 'bg-brand-mintGreen/20 text-[#0e5c3c] border-brand-mintGreen/30', Absent: 'bg-red-100 text-red-600 border-red-200', Late: 'bg-yellow-100 text-yellow-700 border-yellow-200', Holiday: 'bg-blue-100 text-blue-600 border-blue-200' };
  const statusIcons = { Present: '✅', Absent: '❌', Late: '⏰', Holiday: '🏖️' };

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple">
        <div className="relative z-10"><span className="inline-block px-3 py-1 bg-brand-softLavender/20 text-brand-softLavender font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-softLavender/30">{t('parent.attendance_report')}</span><h1 className="text-3xl md:text-4xl font-bold mb-2">{t('parent.monthly_attendance_title')}</h1></div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4"><span className="text-[200px]">📊</span></div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-wrap gap-4 items-center">
        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('common.date')}</label><select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold">{months.map((m,i)=><option key={i} value={i+1}>{m}</option>)}</select></div>
        <div><label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('common.time')}</label><select value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold">{[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}</select></div>
      </motion.div>

      {isLoading ? <div className="flex items-center justify-center py-20"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin"></div></div>
      : error ? <div className="text-center py-20"><span className="text-5xl">⚠️</span><p className="text-red-600 font-bold mt-3">{error}</p></div>
      : (<>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{label:t('teacher.present'),value:data?.present,color:'text-[#0e5c3c] bg-brand-mintGreen/10'},{label:t('teacher.absent'),value:data?.absent,color:'text-red-600 bg-red-50'},{label:t('teacher.late'),value:data?.late,color:'text-yellow-700 bg-yellow-50'},{label:t('teacher.holiday'),value:data?.holiday,color:'text-blue-600 bg-blue-50'}].map((s,i)=>(
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`${s.color} rounded-2xl p-5 text-center border`}><p className="text-xs font-bold uppercase tracking-wider">{s.label}</p><p className="text-3xl font-bold mt-1">{s.value||0}</p></motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-brand-deepPlum">{t('parent.attendance_percentage')}</h3><span className="text-2xl font-bold text-brand-mintGreen">{data?.percentage||0}%</span></div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${data?.percentage||0}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-brand-mintGreen to-brand-tealCyan rounded-full"/></div>
          <p className="text-xs text-gray-400 mt-2">{t('parent.days_out_of').replace('{present}',data?.present||0).replace('{total}',data?.total_recorded||0)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-brand-deepPlum">{t('parent.daily_breakdown')} — {data?.month_name} {data?.year}</h3></div>
          <div className="p-6">{data?.daily_data&&data.daily_data.length>0?<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">{data.daily_data.map((day)=><div key={day.date} className={`p-3 rounded-xl border text-center ${statusColors[day.status]||'bg-gray-50 border-gray-200'}`}><p className="text-xs font-bold text-gray-400">{day.day}</p><p className="text-lg mt-1">{statusIcons[day.status]||'❓'}</p><p className="text-[10px] font-bold mt-1 uppercase">{day.status}</p></div>)}</div>:<div className="text-center py-10 text-gray-400"><span className="text-4xl">📅</span><p className="mt-2 font-semibold">{t('parent.no_attendance_records')}</p></div>}</div>
        </motion.div>
      </>)}
    </div>
  );
}