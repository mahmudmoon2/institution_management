import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_MEDIA_BASE_URL}${path}`;
};

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#6366F1'];

const quotes = [
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Education is the most powerful weapon which you can use to change the world. – Nelson Mandela",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. – Gandhi",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. – Churchill",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
  "Strive not to be a success, but rather to be of value. – Albert Einstein",
  "It does not matter how slowly you go as long as you do not stop. – Confucius",
  "The only limit to our realization of tomorrow is our doubts of today. – Franklin D. Roosevelt",
  "Don't watch the clock; do what it does. Keep going. – Sam Levenson",
];

const getDailyQuote = () => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const oneDay = 86400000;
  const dayOfYear = Math.floor(diff / oneDay);
  return quotes[dayOfYear % quotes.length];
};

const AnalogClock = ({ time }) => {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = (minutes * 6);
  const secondDeg = (seconds * 6);

  const pendulumAngle = Math.sin(seconds * Math.PI / 30) * 12;

  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
        <circle cx="100" cy="100" r="96" fill="#F5F0DC" stroke="#D4AF37" strokeWidth="5" />
        <circle cx="100" cy="100" r="88" fill="#FFF8E7" stroke="#B8860B" strokeWidth="2" />
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const x1 = 100 + 72 * Math.sin(angle);
          const y1 = 100 - 72 * Math.cos(angle);
          const x2 = 100 + 82 * Math.sin(angle);
          const y2 = 100 - 82 * Math.cos(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#B8860B" strokeWidth="3" />;
        })}
        {[...Array(60)].map((_, i) => {
          if (i % 5 === 0) return null;
          const angle = (i * 6) * Math.PI / 180;
          const x1 = 100 + 76 * Math.sin(angle);
          const y1 = 100 - 76 * Math.cos(angle);
          const x2 = 100 + 82 * Math.sin(angle);
          const y2 = 100 - 82 * Math.cos(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4AF37" strokeWidth="1.5" />;
        })}
        <line
          x1="100" y1="100" x2={100 + 32 * Math.sin(hourDeg * Math.PI / 180)} y2={100 - 32 * Math.cos(hourDeg * Math.PI / 180)}
          stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round"
        />
        <line
          x1="100" y1="100" x2={100 + 50 * Math.sin(minuteDeg * Math.PI / 180)} y2={100 - 50 * Math.cos(minuteDeg * Math.PI / 180)}
          stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round"
        />
        <line
          x1="100" y1="100" x2={100 + 58 * Math.sin(secondDeg * Math.PI / 180)} y2={100 - 58 * Math.cos(secondDeg * Math.PI / 180)}
          stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="#D4AF37" />
        <circle cx="100" cy="100" r="2" fill="#8B5A2B" />
      </svg>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
        <svg width="20" height="26" viewBox="0 0 40 50" className="overflow-visible">
          <line
            x1="20" y1="0" x2="20" y2="30" stroke="#D4AF37" strokeWidth="2"
            style={{ transformOrigin: '20px 0px', transform: `rotate(${pendulumAngle}deg)`, transition: 'transform 0.2s linear' }}
          />
          <circle cx="20" cy="30" r="5" fill="#D4AF37" stroke="#B8860B" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({ totalStudents: 0, activeStudents: 0, newAdmissions: 0, totalTeachers: 0 });
  const [feeStats, setFeeStats] = useState({ billed: 0, collected: 0, due: 0 });
  const [classSummary, setClassSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allStudents, setAllStudents] = useState([]);

  const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentFilters, setStudentFilters] = useState({ classLevel: '', section: '' });
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoadingStudentList, setIsLoadingStudentList] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  const [isTeacherListModalOpen, setIsTeacherListModalOpen] = useState(false);
  const [teacherList, setTeacherList] = useState([]);
  const [isLoadingTeacherList, setIsLoadingTeacherList] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveClasses, setLiveClasses] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [classHistoryDate, setClassHistoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoadingClassHistory, setIsLoadingClassHistory] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchClassHistory = async (date) => {
    setIsLoadingClassHistory(true);
    try {
      const params = date ? { date } : {};
      const r = await api.get('/teachers/live-class-history/', { params });
      setLiveClasses(r.data);
    } catch (_) { }
    finally { setIsLoadingClassHistory(false); }
  };

  useEffect(() => {
    fetchClassHistory(classHistoryDate);
    const fetchAtt = async () => { try { const r = await api.get('/students/attendance-summary/'); setAttendanceSummary(r.data); } catch (_) {} };
    fetchAtt();
    const interval = setInterval(() => { fetchClassHistory(classHistoryDate); fetchAtt(); }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classHistoryDate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const meRes = await api.get('/me/');
        setAdminName(meRes.data.name || 'Admin');

        let totalStudents = 0, totalTeachers = 0;
        try {
          const dashRes = await api.get('/dashboard-stats/');
          totalStudents = dashRes.data.total_students || 0;
          totalTeachers = dashRes.data.total_teachers || 0;
          setChartData(dashRes.data.chartData || []);
        } catch (e) { console.warn("Dashboard stats not available"); }

        let students = [];
        try {
          const studentsRes = await api.get('/students/');
          students = studentsRes.data;
          setAllStudents(students);
        } catch (e) { console.warn("Students list not available"); }

        const activeCount = students.filter(s => s.is_active === true).length;
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newAdmissionsCount = students.filter(s => s.admission_date && new Date(s.admission_date) >= thirtyDaysAgo).length;

        try {
          const classRes = await api.get('/academics/class-summary/');
          setClassSummary(classRes.data);
          const pieData = classRes.data.map(cls => ({ name: cls.class_name, value: cls.student_count }));
          setChartData(pieData.length ? pieData : chartData);
        } catch (e) { console.warn("Class summary not available"); }

        try {
          const payRes = await api.get('/payments/');
          const payments = payRes.data;
          const billed = payments.reduce((sum, p) => sum + Number(p.total_amount || p.amount_paid + p.due_amount), 0);
          const collected = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
          const due = payments.reduce((sum, p) => sum + Number(p.due_amount), 0);
          setFeeStats({ billed, collected, due });
        } catch (e) { console.warn("Payments not available"); }

        setStats({ totalStudents, activeStudents: activeCount, newAdmissions: newAdmissionsCount, totalTeachers });
      } catch (err) { console.error("Dashboard data fetch error", err); } 
      finally { setIsLoading(false); }
    };
    fetchDashboardData();

    const fetchFilters = async () => {
      try {
        const classesRes = await api.get('/academics/classes/');
        setClassLevels(classesRes.data);
        if (classesRes.data.length) {
          const secRes = await api.get(`/academics/sections/?class=${classesRes.data[0].id}`);
          setSections(secRes.data);
        }
      } catch (e) { console.warn("Filter data not loaded"); }
    };
    fetchFilters();
  }, []);

  const handleClassChange = async (classId) => {
    setStudentFilters({ classLevel: classId, section: '' });
    if (classId) {
      try { const secRes = await api.get(`/academics/sections/?class=${classId}`); setSections(secRes.data); } 
      catch (e) { console.warn("Sections not loaded"); }
    } else { setSections([]); }
  };

  const openStudentListModal = async () => { setIsStudentListModalOpen(true); await fetchStudentList(); };
  const fetchStudentList = async () => {
    setIsLoadingStudentList(true);
    try {
      const params = {};
      if (studentFilters.classLevel) params.class_level = studentFilters.classLevel;
      if (studentFilters.section) params.section = studentFilters.section;
      const res = await api.get('/students/', { params });
      setStudentList(res.data);
    } catch (err) { console.error("Failed to fetch students", err); } 
    finally { setIsLoadingStudentList(false); }
  };

  const openTeacherListModal = async () => {
    setIsTeacherListModalOpen(true); setIsLoadingTeacherList(true);
    try { const res = await api.get('/teachers/'); setTeacherList(res.data); } 
    catch (err) { console.error("Failed to fetch teachers", err); } 
    finally { setIsLoadingTeacherList(false); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true); setSearchError(''); setSearchResult(null);
    try {
      let students = allStudents;
      if (students.length === 0) { const res = await api.get('/students/'); students = res.data; setAllStudents(students); }
      const queryLower = searchQuery.trim().toLowerCase();
      const found = students.find(s => s.name?.toLowerCase().includes(queryLower) || s.student_id?.toLowerCase().includes(queryLower) || s.roll_number?.toString().includes(queryLower));
      if (found) {
        const classLevel = classLevels.find(c => c.id === found.class_level);
        const section = sections.find(s => s.id === found.section);
        setSearchResult({ ...found, class_level_name: classLevel?.name || '', section_name: section?.name || '' });
      } else { setSearchError(t('admin.student_not_found')); }
    } catch (err) { setSearchError(t('admin.search_failed')); } 
    finally { setIsSearching(false); }
  };

  const handlePrintIdCard = async (studentId) => {
    try {
      const response = await api.get(`/students/id-card/${studentId}/pdf/`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) { alert("Failed to generate ID Card. Please check your permissions."); }
  };

  const dateString = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const weekday = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const greeting = (() => { const hour = currentTime.getHours(); if (hour < 12) return t('common.good_morning'); if (hour < 18) return t('common.good_afternoon'); return t('common.good_evening'); })();

  if (isLoading) return <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center text-brand-deepPlum font-bold text-xl">{t('admin.loading_dashboard')}</div>;

  const feeChartData = [
    { name: 'Total Billed', amount: feeStats.billed, fill: '#3B82F6' },
    { name: 'Collected', amount: feeStats.collected, fill: '#10B981' },
    { name: 'Due Amount', amount: feeStats.due, fill: '#EF4444' }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 sm:p-6 lg:p-8 space-y-8 font-sans pb-16">
      
      {/* ========== PREMIUM HEADER ========== */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-gradient-to-r from-brand-deepPlum via-[#2E1B4D] to-brand-royalPurple rounded-[2rem] p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        
        <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-brand-tealCyan opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex-1 w-full lg:w-auto text-white">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">{t('admin.welcome_back')}, {adminName}! 👋</h1>
          <p className="text-brand-softLavender font-medium italic mb-6 max-w-lg">"{getDailyQuote()}"</p>

          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-70">🔍</span>
            <input
              type="text"
              placeholder={t('admin.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-20 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:bg-white/25 focus:outline-none focus:border-brand-tealCyan transition-all shadow-inner backdrop-blur-md"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-tealCyan text-brand-deepPlum px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#4bc2ab] transition-transform active:scale-95"
            >
              {isSearching ? '...' : t('admin.search_button')}
            </button>
          </div>

          {searchResult && (
            <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} onClick={() => setSelectedStudentDetail(searchResult)} className="mt-4 p-3 bg-white text-gray-800 rounded-2xl flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all max-w-md">
              <div className="w-12 h-12 rounded-full bg-brand-tealCyan/20 flex items-center justify-center text-2xl overflow-hidden shrink-0 border border-gray-100">
                {searchResult.photo ? <img src={getImageUrl(searchResult.photo)} alt="" className="w-full h-full object-cover" /> : '👨‍🎓'}
              </div>
              <div className="leading-tight">
                <p className="font-bold text-brand-deepPlum text-sm">{searchResult.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('admin.id_label')}: {searchResult.student_id} | {t('common.roll')}: {searchResult.roll_number}</p>
                <p className="text-xs font-semibold text-brand-royalPurple mt-0.5">{searchResult.class_level_name} - {searchResult.section_name}</p>
              </div>
            </motion.div>
          )}
          {searchError && <p className="mt-3 text-red-300 text-sm font-medium bg-red-500/20 px-3 py-1 rounded-lg inline-block">{searchError}</p>}
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 p-5 rounded-3xl flex items-center gap-5 w-full lg:w-auto shadow-xl">
          <AnalogClock time={currentTime} />
          <div>
            <div className="text-lg font-bold text-white tracking-wide">{greeting}</div>
            <div className="text-sm font-medium text-brand-softLavender mt-1">{weekday}</div>
            <div className="text-sm font-medium text-white/80">{dateString}</div>
          </div>
        </div>
      </motion.div>

      {/* ========== STATS CARDS ========== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -5 }} onClick={openStudentListModal} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 cursor-pointer transition-all flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t('admin.total_students')}</p>
            <p className="text-3xl font-extrabold text-gray-800">{stats.totalStudents}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">👨‍🎓</div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 transition-all flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t('admin.active_students')}</p>
            <p className="text-3xl font-extrabold text-gray-800">{stats.activeStudents}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">✅</div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 transition-all flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t('admin.new_admissions')}</p>
            <p className="text-3xl font-extrabold text-gray-800">{stats.newAdmissions}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform">🆕</div>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} onClick={openTeacherListModal} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-gray-100 cursor-pointer transition-all flex items-center justify-between group">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{t('admin.total_teachers')}</p>
            <p className="text-3xl font-extrabold text-gray-800">{stats.totalTeachers}</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">👩‍🏫</div>
        </motion.div>
      </div>

      {/* ========== LIVE TEACHING & ATTENDANCE ========== */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              {classHistoryDate === new Date().toISOString().split('T')[0] ? (
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              ) : (
                <span className="text-lg">📚</span>
              )}
              {classHistoryDate === new Date().toISOString().split('T')[0]
                ? t('admin.live_teaching')
                : `${t('admin.classes_on')} ${new Date(classHistoryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
              }
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={classHistoryDate}
                onChange={(e) => setClassHistoryDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-brand-tealCyan cursor-pointer"
              />
              {classHistoryDate !== new Date().toISOString().split('T')[0] && (
                <button
                  onClick={() => setClassHistoryDate(new Date().toISOString().split('T')[0])}
                  className="text-xs font-bold px-3 py-2 rounded-xl bg-brand-tealCyan text-white hover:bg-[#4bc2ab] transition-colors shadow-sm flex items-center gap-1.5"
                >
                  🔄 {t('admin.today')}
                </button>
              )}
            </div>
          </div>
          {isLoadingClassHistory ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl mb-3 animate-pulse">⏳</span>
              <p>{t('admin.loading_class_history')}</p>
            </div>
          ) : liveClasses.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl mb-3">📡</span>
              <p>{t('admin.no_classes_recorded')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-gray-50 rounded-2xl border border-gray-100 flex-1">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="text-gray-500 uppercase text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3 font-bold">{t('admin.teacher_col')}</th>
                    <th className="p-3 font-bold">{t('admin.subject_col')}</th>
                    <th className="p-3 font-bold">{t('admin.class_col')}</th>
                    <th className="p-3 font-bold">{t('admin.time_col')}</th>
                    <th className="p-3 font-bold">{t('admin.topic_col')}</th>
                    <th className="p-3 font-bold text-center">{t('admin.status_col')}</th>
                  </tr>
                </thead>
                <tbody>
                  {liveClasses.map(cls => (
                    <tr key={cls.id} className="hover:bg-white border-b border-gray-100 transition-colors last:border-0">
                      <td className="p-3 font-bold text-gray-800">{cls.teacher_name}</td>
                      <td className="p-3 font-semibold text-brand-deepPlum">{cls.subject_name}</td>
                      <td className="p-3 text-gray-600">{cls.class_name} - {cls.section_name}</td>
                      <td className="p-3 text-gray-600 font-medium">
                        {cls.start_time} - {cls.end_time}
                      </td>
                      <td className="p-3 text-gray-500 max-w-[120px] truncate" title={cls.topic_covered}>
                        {cls.topic_covered || '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                          cls.status === 'Running' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {cls.status === 'Running' ? `🔴 ${t('admin.live_status')}` : `✓ ${t('admin.done_status')}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">📋 {t('admin.todays_attendance')}</h2>
            <button onClick={() => api.get('/students/attendance-report/pdf/', { responseType: 'blob' }).then(r => { const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' })); window.open(url, '_blank'); })} className="text-xs font-bold px-4 py-2.5 rounded-xl bg-brand-deepPlum text-white hover:bg-brand-royalPurple transition-colors shadow-md flex items-center gap-2">
              🖨️ {t('admin.pdf_report')}
            </button>
          </div>
          {!attendanceSummary ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-4xl mb-3">📅</span>
              <p>{t('admin.no_attendance_data')}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: t('admin.present'), value: attendanceSummary.present, color: 'bg-green-50 text-green-700', border: 'border-green-200', icon: '✅' },
                  { label: t('admin.absent'), value: attendanceSummary.absent, color: 'bg-red-50 text-red-600', border: 'border-red-200', icon: '❌' },
                  { label: t('admin.late'), value: attendanceSummary.late, color: 'bg-orange-50 text-orange-600', border: 'border-orange-200', icon: '⏰' },
                  { label: t('admin.unrecorded'), value: attendanceSummary.unrecorded, color: 'bg-gray-100 text-gray-500', border: 'border-gray-200', icon: '❓' },
                ].map((card, i) => (
                  <div key={i} className={`${card.color} ${card.border} p-4 rounded-2xl border flex flex-col items-center justify-center text-center shadow-sm`}>
                    <p className="text-2xl font-extrabold">{card.value}</p>
                    <p className="text-xs font-bold uppercase mt-1 opacity-80">{card.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-center text-gray-500 bg-gray-50 py-3 rounded-xl border border-gray-100 font-medium">
                {t('admin.total_active')}: <span className="text-gray-800 font-bold">{attendanceSummary.total_active_students}</span> | 
                {t('admin.recorded')}: <span className="text-brand-deepPlum font-bold">{attendanceSummary.recorded}</span>
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ========== CHARTS ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{t('admin.class_distribution')}</h2>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {chartData.length === 0 ? (
              <span className="text-gray-400">{t('common.no_data')}</span>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} students`, name]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t('admin.financial_overview')}</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">{t('admin.financial_desc')}</p>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {feeStats.billed === 0 && feeStats.collected === 0 && feeStats.due === 0 ? (
               <span className="text-gray-400">{t('admin.no_financial_data')}</span>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={feeChartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 13, fontWeight: 600}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} tickFormatter={(value) => `৳${value > 1000 ? (value/1000)+'k' : value}`} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.03)'}} formatter={(value) => [`৳ ${value}`, 'Amount']} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {feeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ========== QUICK ACTIONS ========== */}
      <div className="bg-gradient-to-br from-brand-deepPlum to-[#2E1B4D] p-6 sm:p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <h2 className="text-xl font-bold mb-6 relative z-10">⚡ {t('admin.quick_actions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <Link to="/admin/students/add" className="bg-white/10 backdrop-blur-md hover:bg-white hover:text-brand-deepPlum transition-all px-5 py-4 rounded-2xl font-bold flex justify-between items-center group border border-white/10 hover:border-white shadow-sm">
            <span className="flex items-center gap-3"><span className="text-2xl">👨‍🎓</span> {t('admin.register_student')}</span>
            <span className="group-hover:translate-x-1 transition text-xl">→</span>
          </Link>
          <Link to="/admin/fee-categories" className="bg-white/10 backdrop-blur-md hover:bg-white hover:text-brand-deepPlum transition-all px-5 py-4 rounded-2xl font-bold flex justify-between items-center group border border-white/10 hover:border-white shadow-sm">
            <span className="flex items-center gap-3"><span className="text-2xl">💰</span> {t('admin.manage_fees')}</span>
            <span className="group-hover:translate-x-1 transition text-xl">→</span>
          </Link>
          <Link to="/admin/notices/add" className="bg-white/10 backdrop-blur-md hover:bg-white hover:text-brand-deepPlum transition-all px-5 py-4 rounded-2xl font-bold flex justify-between items-center group border border-white/10 hover:border-white shadow-sm">
            <span className="flex items-center gap-3"><span className="text-2xl">📢</span> {t('admin.add_notice')}</span>
            <span className="group-hover:translate-x-1 transition text-xl">→</span>
          </Link>
          <Link to="/admin/events/add" className="bg-white/10 backdrop-blur-md hover:bg-white hover:text-brand-deepPlum transition-all px-5 py-4 rounded-2xl font-bold flex justify-between items-center group border border-white/10 hover:border-white shadow-sm">
            <span className="flex items-center gap-3"><span className="text-2xl">🗓️</span> {t('admin.add_event')}</span>
            <span className="group-hover:translate-x-1 transition text-xl">→</span>
          </Link>
        </div>
      </div>

      {/* ========== MODALS ========== */}
      <AnimatePresence>
        {isStudentListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-800">{t('admin.student_directory')}</h3>
                  <p className="text-sm text-gray-500 font-medium">{t('admin.filter_class_section')}</p>
                </div>
                <button onClick={() => setIsStudentListModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition shadow-sm text-lg flex items-center justify-center">✕</button>
              </div>
              <div className="p-5 border-b bg-white flex gap-4 flex-wrap items-center">
                <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-brand-tealCyan" value={studentFilters.classLevel} onChange={(e) => handleClassChange(e.target.value)}>
                  <option value="">{t('admin.all_classes')}</option>
                  {classLevels.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
                <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 outline-none focus:border-brand-tealCyan" value={studentFilters.section} onChange={(e) => setStudentFilters({ ...studentFilters, section: e.target.value })} disabled={!studentFilters.classLevel}>
                  <option value="">{t('admin.all_sections')}</option>
                  {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                </select>
                <button onClick={fetchStudentList} className="bg-brand-deepPlum text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-brand-royalPurple transition shadow-md">{t('admin.apply_filters')}</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
                {isLoadingStudentList ? (
                  <div className="flex justify-center py-20 text-brand-deepPlum font-bold">{t('admin.loading_directory')}</div>
                ) : studentList.length === 0 ? (
                  <div className="flex justify-center py-20 text-gray-500">{t('admin.no_students_found')}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {studentList.map(student => (
                      <div key={student.id} onClick={() => setSelectedStudentDetail(student)} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg cursor-pointer transition-all flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-2xl overflow-hidden shrink-0 group-hover:scale-105 transition">
                          {student.photo ? <img src={getImageUrl(student.photo)} alt="" className="w-full h-full object-cover" /> : '👨‍🎓'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-800 truncate">{student.name}</p>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">{t('admin.id_label')}: {student.student_id}</p>
                          <p className="text-[11px] font-bold text-brand-tealCyan mt-1 bg-brand-tealCyan/10 inline-block px-2 py-0.5 rounded-md truncate max-w-full">{student.class_level_name} - {student.section_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Detail Popup */}
      <AnimatePresence>
        {selectedStudentDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden">
              
              <div className="bg-gradient-to-r from-brand-deepPlum to-brand-royalPurple p-8 text-center relative">
                <button onClick={() => setSelectedStudentDetail(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white hover:bg-red-500 hover:text-white flex items-center justify-center transition backdrop-blur-sm">✕</button>
                <div className="w-28 h-28 mx-auto rounded-full bg-white p-1 shadow-xl mb-4 relative z-10">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-5xl overflow-hidden">
                    {selectedStudentDetail.photo ? <img src={getImageUrl(selectedStudentDetail.photo)} alt="" className="w-full h-full object-cover" /> : '👨‍🎓'}
                  </div>
                </div>
                <h3 className="text-2xl font-extrabold text-white">{selectedStudentDetail.name}</h3>
                <p className="text-brand-tealCyan font-semibold mt-1">{t('admin.id_label')}: {selectedStudentDetail.student_id}</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div><p className="text-gray-400 font-semibold mb-1">{t('admin.class_label')}</p><p className="font-bold text-gray-800">{selectedStudentDetail.class_level_name}</p></div>
                  <div><p className="text-gray-400 font-semibold mb-1">{t('common.section')}</p><p className="font-bold text-gray-800">{selectedStudentDetail.section_name}</p></div>
                  <div><p className="text-gray-400 font-semibold mb-1">{t('admin.roll_number')}</p><p className="font-bold text-gray-800">{selectedStudentDetail.roll_number}</p></div>
                  <div><p className="text-gray-400 font-semibold mb-1">{t('admin.date_of_birth')}</p><p className="font-bold text-gray-800">{selectedStudentDetail.date_of_birth || 'N/A'}</p></div>
                  <div className="col-span-2"><p className="text-gray-400 font-semibold mb-1">{t('admin.guardian_info')}</p><p className="font-bold text-gray-800">{selectedStudentDetail.guardian_name} • {selectedStudentDetail.guardian_phone}</p></div>
                </div>
                
                <div className="mt-8 flex gap-3">
                  <button onClick={() => setSelectedStudentDetail(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">{t('common.close')}</button>
                  <button onClick={() => handlePrintIdCard(selectedStudentDetail.student_id)} className="flex-[2] bg-brand-deepPlum text-white font-bold py-3.5 rounded-xl hover:bg-brand-royalPurple transition shadow-lg shadow-brand-deepPlum/30 flex items-center justify-center gap-2">
                    🖨️ {t('admin.print_id_card')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Teacher List Modal */}
      <AnimatePresence>
        {isTeacherListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-800">{t('admin.teacher_directory')}</h3>
                  <p className="text-sm text-gray-500 font-medium">{t('admin.all_teachers')}</p>
                </div>
                <button onClick={() => setIsTeacherListModalOpen(false)} className="w-10 h-10 rounded-full bg-white border border-gray-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition shadow-sm text-lg flex items-center justify-center">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
                {isLoadingTeacherList ? (
                  <div className="flex justify-center py-20 text-brand-deepPlum font-bold">{t('admin.loading_directory')}</div>
                ) : teacherList.length === 0 ? (
                  <div className="flex justify-center py-20 text-gray-500">{t('admin.no_teachers_found')}</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {teacherList.map(teacher => (
                      <div key={teacher.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg transition-all flex items-center gap-4 group cursor-default">
                        <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center text-2xl overflow-hidden shrink-0 group-hover:scale-105 transition">
                          {teacher.photo ? <img src={getImageUrl(teacher.photo)} alt="" className="w-full h-full object-cover" /> : '👩‍🏫'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-800 truncate">{teacher.name}</p>
                          <p className="text-xs font-semibold text-gray-500 mt-0.5">{t('admin.id_label')}: {teacher.teacher_id}</p>
                          <p className="text-[11px] font-bold text-purple-600 mt-1 bg-purple-50 inline-block px-2 py-0.5 rounded-md truncate max-w-full">{teacher.major_subject_name || t('admin.subject_na')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}