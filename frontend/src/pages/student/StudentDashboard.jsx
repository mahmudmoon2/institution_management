import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/useThemeStore';
import api from '../../api/axios';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_BENGALI = {
  'Saturday': 'শনিবার', 'Sunday': 'রবিবার', 'Monday': 'সোমবার',
  'Tuesday': 'মঙ্গলবার', 'Wednesday': 'বুধবার', 'Thursday': 'বৃহস্পতিবার', 'Friday': 'শুক্রবার'
};

export default function StudentDashboard() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [notices, setNotices] = useState([]);
  const [weeklyRoutine, setWeeklyRoutine] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userRes = await api.get('/me/');
        setStudentInfo(userRes.data);
        try {
          const stuRes = await api.get('/students/');
          const myProfile = stuRes.data.find(s => s.name === userRes.data.name) || stuRes.data[0];
          setStudentProfile(myProfile);
          try { const routineRes = await api.get('/academics/my-routine/weekly/'); setWeeklyRoutine(routineRes.data); } catch (_) {}
          try { const attRes = await api.get(`/students/monthly-attendance/?student=${myProfile.id}`); if (attRes.data.length > 0) { const latest = attRes.data[0]; setAttendanceStats({ percentage: latest.attendance_percentage, present: latest.present_days, total: latest.total_days }); } } catch (_) {}
          try { const examRes = await api.get('/exams/'); const myExams = examRes.data.filter(e => e.class_level === myProfile.class_level); setUpcomingExams(myExams.filter(e => new Date(e.start_date) > new Date()).length); } catch (_) {}
        } catch (_) {}
        try { const noticeRes = await api.get('/cms/notices/'); setNotices(noticeRes.data.slice(0, 4)); } catch (_) {}
      } catch (_) {} finally { setIsLoading(false); }
    };
    fetchAllData();
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateString = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const todayDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });

  if (isLoading) return <div className={`p-10 text-center font-bold ${isDark ? 'text-slate-300' : 'text-brand-deepPlum'}`}>{t('common.loading')}</div>;

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-deepPlum rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            {t('student.portal')}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('student.hello')}, {studentInfo?.name || 'Student'}! 🎓</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            {t('common.class')}: {studentProfile?.class_level_name || 'N/A'} | {t('common.section')}: {studentProfile?.section_name || 'N/A'} | {t('common.roll')}: {studentProfile?.roll_number || 'N/A'}
          </p>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 shrink-0">
          <div className="text-4xl animate-pulse">⏰</div>
          <div>
            <p className="text-2xl font-bold text-brand-tealCyan tracking-wider">{timeString}</p>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">{dateString}</p>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4"><span className="text-[250px]">📚</span></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-6 rounded-2xl shadow-sm flex items-center gap-4 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-100'}`}>
          <div className="w-14 h-14 bg-brand-mintGreen/20 text-[#0e5c3c] rounded-2xl flex items-center justify-center text-2xl">✅</div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('student.attendance')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{attendanceStats ? `${attendanceStats.percentage}%` : 'N/A'}</p>
            {attendanceStats && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{attendanceStats.present}/{attendanceStats.total} {t('student.days')}</p>}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`p-6 rounded-2xl shadow-sm flex items-center gap-4 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-100'}`}>
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl">📝</div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('student.upcoming_exams')}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{upcomingExams}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF] flex justify-between items-center">
            <h2 className="text-lg font-bold text-brand-deepPlum">📅 {t('student.weekly_routine')}</h2>
            <span className="text-sm text-brand-royalPurple font-bold">{weeklyRoutine?.class_level || studentProfile?.class_level_name} - {weeklyRoutine?.section || studentProfile?.section_name}</span>
          </div>
          <div className="p-6">
            {!weeklyRoutine || Object.values(weeklyRoutine.weekly_routine || {}).every(arr => arr.length === 0) ? (
              <div className="text-center py-10 text-gray-400"><span className="text-4xl block mb-3">📅</span><p className="font-semibold">{t('student.no_routine')}</p></div>
            ) : (
              <div className="space-y-6">
                {DAYS.map(day => {
                  const periods = weeklyRoutine.weekly_routine[day] || [];
                  const isToday = day === todayDay;
                  return (
                    <div key={day} className={`rounded-xl border ${isToday ? 'border-brand-tealCyan bg-brand-tealCyan/5 ring-1 ring-brand-tealCyan/20' : 'border-gray-100 bg-gray-50'}`}>
                      <div className={`px-4 py-2 rounded-t-xl flex items-center gap-2 ${isToday ? 'bg-brand-tealCyan text-white' : 'bg-gray-100 text-gray-700'}`}>
                        <span className="font-bold text-sm">{day}</span>
                        <span className="text-xs opacity-75">{DAY_BENGALI[day]}</span>
                        {isToday && <span className="ml-auto text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{t('student.today')}</span>}
                      </div>
                      <div className="p-3">
                        {periods.length === 0 ? (
                          <p className="text-xs text-gray-400 py-2 text-center">{t('student.no_classes')}</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {periods.map((period, idx) => (
                              <div key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                                <div className="bg-brand-tealCyan/20 text-brand-deepPlum font-bold p-1.5 rounded-lg text-[10px] w-8 h-8 flex items-center justify-center shrink-0">P{period.period}</div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-800 text-xs truncate">{period.subject_name}</p>
                                  <p className="text-[10px] text-gray-500">{period.start_time} - {period.end_time}{period.teacher_name ? ` | ${period.teacher_name}` : ' | TBA'}{period.room_number ? ` | Rm ${period.room_number}` : ''}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-brand-deepPlum">{t('student.recent_notices')}</h2>
            <span className="text-xl">📢</span>
          </div>
          <div className="p-6 space-y-4">
            {notices.length === 0 ? (
              <div className="text-center py-8 text-gray-400"><span className="text-4xl block mb-3">📢</span><p className="font-semibold">{t('student.no_notices')}</p></div>
            ) : (
              notices.map((notice) => (
                <div key={notice.id} className="p-4 border border-gray-100 rounded-xl hover:bg-brand-softLavender/5 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                      notice.category === 'Academic' ? 'bg-blue-50 text-blue-600' : notice.category === 'Exam' ? 'bg-orange-50 text-orange-600' : notice.category === 'Event' ? 'bg-purple-50 text-purple-600' : notice.category === 'Holiday' ? 'bg-red-50 text-red-600' : 'bg-brand-mintGreen/20 text-[#0e5c3c]'}`}>
                      {notice.category}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{new Date(notice.date).toLocaleDateString('en-GB')}</span>
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-brand-royalPurple transition-colors">{notice.title_en}</h3>
                  {notice.description_en && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.description_en}</p>}
                </div>
              ))
            )}
            {notices.length > 0 && <button className="w-full py-3 mt-2 rounded-xl border-2 border-brand-royalPurple/20 text-brand-royalPurple font-bold hover:bg-brand-royalPurple/5 transition-colors">{t('student.view_all_notices')}</button>}
          </div>
        </motion.div>
      </div>
    </div>
  );
}