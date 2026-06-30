import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import { useThemeStore } from '../../store/useThemeStore';
import api from '../../api/axios';
import {
  Users, GraduationCap, TrendingUp, Clock,
  Search, Printer, X, ChevronRight, Calendar, BookOpen,
  Activity, UserCheck, Award, RefreshCw, Bell, Briefcase,
  MapPin, Phone, Mail, UserPlus, Star, DollarSign, FileText,
  Users2, Stethoscope, UserCog, CalendarCheck
} from 'lucide-react';

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_MEDIA_BASE_URL}${path}`;
};

const PIE_COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#14B8A6', '#3B82F6'];
const GENDER_COLORS = { Male: '#3B82F6', Female: '#EC4899', Other: '#8B5CF6' };

const quotes = [
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Education is the most powerful weapon which you can use to change the world. – Nelson Mandela",
  "Live as if you were to die tomorrow. Learn as if you were to live forever. – Gandhi",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. – Churchill",
  "Believe you can and you're halfway there. – Theodore Roosevelt",
];

const getDailyQuote = () => {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return quotes[dayOfYear % quotes.length];
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({ totalStudents: 0, activeStudents: 0, newAdmissions: 0, totalTeachers: 0, totalStaff: 0, totalParents: 0 });
  const [feeStats, setFeeStats] = useState({ billed: 0, collected: 0, due: 0 });
  const [chartData, setChartData] = useState([]);
  const [genderData, setGenderData] = useState([]);
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
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [recentRegistrations, setRecentRegistrations] = useState({ students: 0, teachers: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchClassHistory = async (date) => {
    setIsLoadingClassHistory(true);
    try {
      const r = await api.get('/teachers/live-class-history/', { params: date ? { date } : {} });
      setLiveClasses(r.data);
    } catch (_) {}
    finally { setIsLoadingClassHistory(false); }
  };

  useEffect(() => {
    fetchClassHistory(classHistoryDate);
    const fetchAtt = async () => {
      try { const r = await api.get('/students/attendance-summary/'); setAttendanceSummary(r.data); } catch (_) {}
    };
    fetchAtt();
    const interval = setInterval(() => { fetchClassHistory(classHistoryDate); }, 15000);
    return () => clearInterval(interval);
  }, [classHistoryDate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await api.get('/me/');
        setAdminName(meRes.data.name || 'Admin');
        let students = [], totalStudents = 0, totalTeachers = 0, totalStaff = 0;
        try { const d = await api.get('/dashboard-stats/'); totalStudents = d.data.total_students || 0; totalTeachers = d.data.total_teachers || 0; } catch (_) {}
        try { const r = await api.get('/students/'); students = r.data; setAllStudents(students); } catch (_) {}
        try { const r = await api.get('/staffs/'); totalStaff = r.data?.length || 0; } catch (_) {}
        const activeCount = students.filter(s => s.is_active === true).length;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
        const newAdmissionsCount = students.filter(s => s.admission_date && new Date(s.admission_date) >= thirtyDaysAgo).length;
        
        // Gender distribution
        const maleCount = students.filter(s => s.gender === 'Male').length;
        const femaleCount = students.filter(s => s.gender === 'Female').length;
        const otherCount = students.filter(s => s.gender === 'Other').length;
        setGenderData([
          { name: 'Male', value: maleCount || 1 },
          { name: 'Female', value: femaleCount || 1 },
          { name: 'Other', value: otherCount || 0 },
        ]);

        // Recent registrations (this week)
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        const newStudentsThisWeek = students.filter(s => s.admission_date && new Date(s.admission_date) >= weekAgo).length;
        setRecentRegistrations({ students: newStudentsThisWeek, teachers: 0 });

        try {
          const cRes = await api.get('/academics/class-summary/');
          setChartData(cRes.data.map(cls => ({ name: cls.class_name, value: cls.student_count })));
        } catch (_) {}
        
        try {
          const pRes = await api.get('/payments/');
          const payments = pRes.data;
          setFeeStats({
            billed: payments.reduce((s, p) => s + Number(p.total_amount || 0), 0),
            collected: payments.reduce((s, p) => s + Number(p.amount_paid || 0), 0),
            due: payments.reduce((s, p) => s + Number(p.due_amount || 0), 0),
          });
        } catch (_) {}

        // Notices & Events
        try { const r = await api.get('/cms/notices/'); setNotices(r.data.slice(0, 3)); } catch (_) {}
        try { const r = await api.get('/cms/events/'); setEvents(r.data.filter(e => new Date(e.date_time) > new Date()).slice(0, 3)); } catch (_) {}

        // Pending leave requests
        try { const r = await api.get('/payroll/leave-requests/'); setPendingLeaves(r.data.filter(l => l.status === 'Pending').length); } catch (_) {}

        // Update teacher count from staffs count
        try { const r = await api.get('/teachers/'); totalTeachers = r.data?.length || 0; } catch (_) {}

        setStats({ totalStudents, activeStudents: activeCount, newAdmissions: newAdmissionsCount, totalTeachers, totalStaff: totalStaff || 0, totalParents: 0 });
      } catch (_) {} finally { setIsLoading(false); }
    };
    loadData();
    const loadFilters = async () => {
      try {
        const c = await api.get('/academics/classes/');
        setClassLevels(c.data);
        if (c.data.length) {
          const s = await api.get(`/academics/sections/?class=${c.data[0].id}`);
          setSections(s.data);
        }
      } catch (_) {}
    };
    loadFilters();
  }, []);

  const handleClassChange = async (classId) => {
    setStudentFilters({ classLevel: classId, section: '' });
    if (classId) {
      try { const s = await api.get(`/academics/sections/?class=${classId}`); setSections(s.data); } catch (_) {}
    } else setSections([]);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true); setSearchError(''); setSearchResult(null);
    try {
      let students = allStudents;
      if (!students.length) { const r = await api.get('/students/'); students = r.data; setAllStudents(students); }
      const q = searchQuery.trim().toLowerCase();
      const found = students.find(s => s.name?.toLowerCase().includes(q) || s.student_id?.toLowerCase().includes(q) || s.roll_number?.toString().includes(q));
      if (found) {
        const cl = classLevels.find(c => c.id === found.class_level);
        const se = sections.find(s => s.id === found.section);
        setSearchResult({ ...found, class_level_name: cl?.name || '', section_name: se?.name || '' });
      } else setSearchError(t('admin.student_not_found'));
    } catch (_) { setSearchError(t('admin.search_failed')); }
    finally { setIsSearching(false); }
  };

  const handlePrintIdCard = async (studentId) => {
    try {
      const r = await api.get(`/students/id-card/${studentId}/pdf/`, { responseType: 'blob' });
      window.open(window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' })), '_blank');
    } catch (_) { alert("Failed to generate ID Card."); }
  };

  const dateStr = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const weekday = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const greeting = (() => { const h = currentTime.getHours(); if (h < 12) return t('common.good_morning'); if (h < 18) return t('common.good_afternoon'); return t('common.good_evening'); })();

  if (isLoading) return (
    <div className={`min-h-[60vh] flex items-center justify-center ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-semibold text-sm">{t('admin.loading_dashboard')}</p>
      </div>
    </div>
  );

  const feeChartData = [
    { name: 'Billed', amount: feeStats.billed, fill: '#6366F1' },
    { name: 'Collected', amount: feeStats.collected, fill: '#10B981' },
    { name: 'Due', amount: feeStats.due <= feeStats.billed ? feeStats.due : 0, fill: '#EF4444' },
  ];

  const statCards = [
    { key: 'students', label: 'Students', value: stats.totalStudents, icon: Users, color: 'from-indigo-500 to-purple-600', onClick: async () => { setIsStudentListModalOpen(true); setIsLoadingStudentList(true); try { const r = await api.get('/students/'); setStudentList(r.data); } catch (_) {} finally { setIsLoadingStudentList(false); } } },
    { key: 'active', label: 'Active', value: stats.activeStudents, icon: UserCheck, color: 'from-emerald-500 to-green-600' },
    { key: 'teachers', label: 'Teachers', value: stats.totalTeachers, icon: GraduationCap, color: 'from-purple-500 to-pink-600', onClick: async () => { setIsTeacherListModalOpen(true); setIsLoadingTeacherList(true); try { const r = await api.get('/teachers/'); setTeacherList(r.data); } catch (_) {} finally { setIsLoadingTeacherList(false); } } },
    { key: 'staff', label: 'Staff', value: stats.totalStaff, icon: Briefcase, color: 'from-orange-500 to-red-600' },
  ];

  // Additional insight cards for the second row
  const insightCards = [
    { key: 'new_week', label: 'New This Week', value: recentRegistrations.students, sub: 'Students', icon: UserPlus, color: isDark ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-50 text-cyan-600' },
    { key: 'leaves', label: 'Pending Leaves', value: pendingLeaves, sub: 'Requests', icon: CalendarCheck, color: isDark ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-600' },
    { key: 'parents', label: 'Parents', value: stats.totalParents || '—', sub: 'Registered', icon: Users2, color: isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-600' },
    { key: 'fees', label: 'Total Collected', value: `৳${(feeStats.collected / 1000).toFixed(0)}k`, sub: 'Revenue', icon: DollarSign, color: isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 pb-4">
      {/* ────── HEADER ────── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-2xl overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#1a1040] via-[#1e1145] to-[#12082e] border border-white/[0.06]' : 'bg-white border border-gray-100 shadow-sm'}`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                  👋
                </div>
                <div>
                  <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {t('admin.welcome_back')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">{adminName}</span>!
                  </h1>
                  <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{getDailyQuote()}</p>
                </div>
              </div>
              <div className="relative mt-4 max-w-md">
                <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                <input type="text" placeholder={t('admin.search_placeholder')} value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className={`w-full pl-10 pr-24 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                    isDark ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder-slate-500 focus:border-indigo-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400/20'
                  }`} />
                <button onClick={handleSearch} disabled={isSearching}
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isDark ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}>
                  {isSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : t('admin.search_button')}
                </button>
                {searchResult && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedStudentDetail(searchResult)}
                    className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-xl border cursor-pointer z-20 ${isDark ? 'bg-[#1a1040] border-white/[0.08]' : 'bg-white border-gray-200 shadow-lg'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg overflow-hidden shrink-0">
                        {searchResult.photo ? <img src={getImageUrl(searchResult.photo)} alt="" className="w-full h-full object-cover" /> : '👨‍🎓'}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchResult.name}</p>
                        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>ID: {searchResult.student_id} | Roll: {searchResult.roll_number}</p>
                        <p className="text-[11px] font-medium text-indigo-500 truncate">{searchResult.class_level_name} - {searchResult.section_name}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {searchError && <p className={`mt-2 text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-500'}`}>{searchError}</p>}
              </div>
            </div>
            <div className={`shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-gray-50 border-gray-100'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <Clock className={`w-5 h-5 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
              </div>
              <div className="text-right">
                <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{greeting}</p>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{weekday}, {dateStr}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ────── ROW 1: MAIN STATS ────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, i) => (
          <motion.button key={card.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={card.onClick}
            className={`relative p-4 sm:p-5 rounded-xl border text-left transition-all duration-200 group ${card.onClick ? 'cursor-pointer' : 'cursor-default'} ${
              isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]' : 'bg-white border-gray-100 hover:shadow-md hover:border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{card.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
              </div>
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg shrink-0 ml-2 group-hover:scale-110 transition-transform duration-200`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            {card.onClick && (
              <div className={`mt-2 flex items-center gap-1 text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                <span>View details</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* ────── ROW 2: INSIGHT CARDS (New This Week, Pending Leaves, Parents, Revenue) ────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {insightCards.map((card, i) => (
          <motion.div key={card.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className={`p-3 sm:p-4 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{card.label}</p>
                <p className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{card.sub}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ────── ROW 3: LIVE TEACHING + ATTENDANCE ────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <BookOpen className={`w-4.5 h-4.5 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
              </div>
              <div>
                <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {classHistoryDate === new Date().toISOString().split('T')[0] ? t('admin.live_teaching') : t('admin.classes_on')}
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{new Date(classHistoryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input type="date" value={classHistoryDate} onChange={e => setClassHistoryDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium outline-none ${isDark ? 'bg-white/[0.05] border-white/[0.08] text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`} />
              {classHistoryDate !== new Date().toISOString().split('T')[0] && (
                <button onClick={() => setClassHistoryDate(new Date().toISOString().split('T')[0])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-600'}`}>
                  <RefreshCw className="w-3 h-3" /> {t('admin.today')}
                </button>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-5">
            {isLoadingClassHistory ? (
              <div className="flex items-center justify-center py-12"><RefreshCw className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-400' : 'text-gray-400'}`} /></div>
            ) : liveClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12" style={{color: isDark ? '#94a3b8' : '#9ca3af'}}>
                <BookOpen className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">{t('admin.no_classes_recorded')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[480px] sm:min-w-0">
                  <table className="w-full text-left">
                    <thead><tr className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                      <th className="pb-2 pr-3 font-semibold">Teacher</th>
                      <th className="pb-2 pr-3 font-semibold">Subject</th>
                      <th className="pb-2 pr-3 font-semibold hidden sm:table-cell">Class</th>
                      <th className="pb-2 pr-3 font-semibold">Time</th>
                      <th className="pb-2 text-center font-semibold">Status</th>
                    </tr></thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/[0.04]' : 'divide-gray-50'}`}>
                      {liveClasses.map(cls => (
                        <tr key={cls.id} className={`${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'} transition-colors`}>
                          <td className={`py-2.5 pr-3 text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{cls.teacher_name}</td>
                          <td className={`py-2.5 pr-3 text-sm ${isDark ? 'text-indigo-300' : 'text-indigo-600'} font-medium`}>{cls.subject_name}</td>
                          <td className={`py-2.5 pr-3 text-sm hidden sm:table-cell ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{cls.class_name} - {cls.section_name}</td>
                          <td className={`py-2.5 pr-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{cls.start_time?.substring(0,5)} - {cls.end_time?.substring(0,5)}</td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full ${
                              cls.status === 'Running' ? (isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-white/[0.04] text-slate-400' : 'bg-gray-100 text-gray-500')
                            }`}>
                              {cls.status === 'Running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                              {cls.status === 'Running' ? 'Live' : 'Done'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`rounded-xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <Activity className={`w-4.5 h-4.5 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
              </div>
              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('admin.todays_attendance')}</h3>
            </div>
            <button onClick={() => api.get('/students/attendance-report/pdf/', { responseType: 'blob' }).then(r => window.open(window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' })), '_blank'))}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isDark ? 'bg-white/[0.05] text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
              <Printer className="w-3.5 h-3.5" /> PDF
            </button>
          </div>
          <div className="p-4 sm:p-5">
            {!attendanceSummary ? (
              <div className="flex flex-col items-center justify-center py-12" style={{color: isDark ? '#94a3b8' : '#9ca3af'}}>
                <Calendar className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">{t('admin.no_attendance_data')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: t('admin.present'), value: attendanceSummary.present, color: isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { label: t('admin.absent'), value: attendanceSummary.absent, color: isDark ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200' },
                    { label: t('admin.late'), value: attendanceSummary.late, color: isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200' },
                    { label: t('admin.unrecorded'), value: attendanceSummary.unrecorded, color: isDark ? 'bg-slate-500/10 text-slate-300 border-slate-500/20' : 'bg-gray-100 text-gray-600 border-gray-200' },
                  ].map((card, i) => (
                    <div key={i} className={`p-3 rounded-xl border ${card.color} text-center`}>
                      <p className="text-xl sm:text-2xl font-bold">{card.value}</p>
                      <p className="text-[10px] font-semibold uppercase mt-0.5 opacity-80">{card.label}</p>
                    </div>
                  ))}
                </div>
                <div className={`flex items-center justify-center gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  <span><span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{attendanceSummary.total_active_students}</span> Active</span>
                  <span className="opacity-40">|</span>
                  <span><span className="font-semibold text-indigo-500">{attendanceSummary.recorded}</span> Recorded</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ────── ROW 4: NOTICES + EVENTS + GENDER PIE ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Recent Notices */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2.5">
              <Bell className={`w-4 h-4 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Notices</h3>
            </div>
            <Link to="/admin/notices/add" className={`text-[10px] font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>+ Add</Link>
          </div>
          <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
            {notices.length === 0 ? (
              <p className={`text-xs text-center py-6 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>No notices yet</p>
            ) : notices.map(n => (
              <div key={n.id} className={`p-2.5 rounded-lg border ${isDark ? 'border-white/[0.04] bg-white/[0.02]' : 'border-gray-50 bg-gray-50/50'}`}>
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${n.category === 'Academic' ? 'bg-blue-50 text-blue-600' : n.category === 'Exam' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>{n.category}</span>
                  <span className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{new Date(n.date).toLocaleDateString('en-GB')}</span>
                </div>
                <p className={`text-xs font-semibold mt-1 truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{n.title_en || n.title_bn}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`rounded-xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2.5">
              <Calendar className={`w-4 h-4 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} />
              <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Upcoming Events</h3>
            </div>
            <Link to="/admin/events/add" className={`text-[10px] font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>+ Add</Link>
          </div>
          <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
            {events.length === 0 ? (
              <p className={`text-xs text-center py-6 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>No upcoming events</p>
            ) : events.map(e => (
              <div key={e.id} className={`p-2.5 rounded-lg border ${isDark ? 'border-white/[0.04] bg-white/[0.02]' : 'border-gray-50 bg-gray-50/50'}`}>
                <div className="flex justify-between items-start gap-2">
                  <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{e.title_en || e.title_bn}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{new Date(e.date_time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  {e.venue && <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>• {e.venue}</span>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Gender Distribution + Pending Leaves combo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className={`rounded-xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <div className={`p-4 border-b flex items-center gap-2.5 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <Users className={`w-4 h-4 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Gender Distribution</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-center min-h-[120px]">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={3} dataKey="value" nameKey="name">
                    {genderData.map((entry, index) => <Cell key={`g-${index}`} fill={GENDER_COLORS[entry.name] || '#6366F1'} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {genderData.filter(d => d.value > 0).map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GENDER_COLORS[d.name] || '#6366F1' }} />
                  <span className={`text-[10px] font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Quick link to payroll */}
          {pendingLeaves > 0 && (
            <Link to="/admin/payroll"
              className={`mx-4 mb-4 p-2.5 rounded-lg border flex items-center justify-between text-xs font-semibold ${
                isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
              <span>📋 {pendingLeaves} pending leave request{pendingLeaves > 1 ? 's' : ''}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </motion.div>
      </div>

      {/* ────── ROW 5: CHARTS (Pie + Bar) ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-4 sm:p-5 ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('admin.class_distribution')}</h3>
          <p className={`text-[11px] mb-3 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>Students per class</p>
          <div className="flex items-center justify-center min-h-[180px]">
            {chartData.length === 0 ? (
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{t('common.no_data')}</span>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={44} outerRadius={70} paddingAngle={3} dataKey="value" nameKey="name">
                    {chartData.map((_, i) => <Cell key={`c-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`lg:col-span-2 rounded-xl border p-4 sm:p-5 ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100 shadow-sm'}`}>
          <h3 className={`font-semibold text-sm mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('admin.financial_overview')}</h3>
          <p className={`text-[11px] mb-3 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{t('admin.financial_desc')}</p>
          <div className="flex items-center justify-center min-h-[180px]">
            {feeStats.billed === 0 && feeStats.collected === 0 && feeStats.due === 0 ? (
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{t('admin.no_financial_data')}</span>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={feeChartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#ffffff0a' : '#f0f0f0'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#9ca3af', fontSize: 11, fontWeight: 600 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#9ca3af', fontSize: 11 }} tickFormatter={v => `৳${v > 999 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip cursor={{ fill: isDark ? '#ffffff08' : '#f9fafb' }} formatter={v => [`৳ ${Number(v).toLocaleString()}`, 'Amount']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {feeChartData.map((entry, i) => <Cell key={`b-${i}`} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* ────── QUICK ACTIONS ────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gradient-to-br from-[#1a1040] to-[#12082e] border-white/[0.06]' : 'bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-700 border-transparent'}`}>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2.5 mb-4">
            <Award className={`w-4.5 h-4.5 ${isDark ? 'text-indigo-300' : 'text-white'}`} />
            <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-white'}`}>⚡ {t('admin.quick_actions')}</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { to: '/admin/students/add', icon: '👨‍🎓', label: 'Register Student' },
              { to: '/admin/fee-categories', icon: '💰', label: 'Manage Fees' },
              { to: '/admin/notices/add', icon: '📢', label: 'Add Notice' },
              { to: '/admin/events/add', icon: '🗓️', label: 'Add Event' },
            ].map((action, i) => (
              <Link key={i} to={action.to}
                className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all group ${
                  isDark ? 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.06]' : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                }`}>
                <span className="flex items-center gap-2.5">
                  <span className="text-lg">{action.icon}</span>
                  <span className="truncate">{action.label}</span>
                </span>
                <ChevronRight className={`w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition-transform ${isDark ? 'text-slate-400' : 'text-white/70'}`} />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ────── MODALS ────── */}
      <AnimatePresence>
        {isStudentListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className={`rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border ${isDark ? 'bg-[#0c0a21] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 sm:p-5 flex justify-between items-center border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('admin.student_directory')}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('admin.filter_class_section')}</p>
                </div>
                <button onClick={() => setIsStudentListModalOpen(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/[0.06] text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className={`p-3 sm:p-4 border-b flex flex-wrap gap-2 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                <select value={studentFilters.classLevel} onChange={e => handleClassChange(e.target.value)}
                  className={`px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium outline-none ${isDark ? 'bg-white/[0.05] border-white/[0.08] text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <option value="">{t('admin.all_classes')}</option>
                  {classLevels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={studentFilters.section} onChange={e => setStudentFilters({ ...studentFilters, section: e.target.value })} disabled={!studentFilters.classLevel}
                  className={`px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium outline-none ${isDark ? 'bg-white/[0.05] border-white/[0.08] text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <option value="">{t('admin.all_sections')}</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button onClick={() => { setIsLoadingStudentList(true); api.get('/students/', { params: { class_level: studentFilters.classLevel || undefined, section: studentFilters.section || undefined } }).then(r => setStudentList(r.data)).finally(() => setIsLoadingStudentList(false)); }}
                  className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">{t('admin.apply_filters')}</button>
              </div>
              <div className={`flex-1 overflow-y-auto p-3 sm:p-4 ${isDark ? 'bg-black/20' : 'bg-gray-50/50'}`}>
                {isLoadingStudentList ? (
                  <div className="flex justify-center py-16"><RefreshCw className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-400' : 'text-gray-400'}`} /></div>
                ) : studentList.length === 0 ? (
                  <div className={`flex justify-center py-16 text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{t('admin.no_students_found')}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {studentList.map(student => (
                      <div key={student.id} onClick={() => setSelectedStudentDetail(student)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md ${isDark ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-lg overflow-hidden shrink-0">
                            {student.photo ? <img src={getImageUrl(student.photo)} alt="" className="w-full h-full object-cover" /> : '👨‍🎓'}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>ID: {student.student_id}</p>
                            <p className="text-[10px] font-medium text-indigo-500 truncate">{student.class_level_name} - {student.section_name}</p>
                          </div>
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

      <AnimatePresence>
        {selectedStudentDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 12 }}
              className={`rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border ${isDark ? 'bg-[#0c0a21] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-7 text-center relative">
                <button onClick={() => setSelectedStudentDetail(null)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 text-white hover:bg-black/40 flex items-center justify-center transition">
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white p-1 shadow-lg mb-3">
                  <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-4xl overflow-hidden">
                    {selectedStudentDetail.photo ? <img src={getImageUrl(selectedStudentDetail.photo)} alt="" className="w-full h-full object-cover" /> : '👨‍🎓'}
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">{selectedStudentDetail.name}</h3>
                <p className="text-indigo-200 text-xs sm:text-sm font-medium mt-0.5">ID: {selectedStudentDetail.student_id}</p>
              </div>
              <div className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: t('admin.class_label'), value: selectedStudentDetail.class_level_name },
                    { label: t('common.section'), value: selectedStudentDetail.section_name },
                    { label: t('admin.roll_number'), value: selectedStudentDetail.roll_number },
                    { label: 'DOB', value: selectedStudentDetail.date_of_birth || 'N/A' },
                  ].map((item, i) => (
                    <div key={i} className={`p-2.5 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                      <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{item.label}</p>
                      <p className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className={`p-2.5 rounded-lg ${isDark ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{t('admin.guardian_info')}</p>
                  <p className={`text-sm font-semibold mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedStudentDetail.guardian_name} • {selectedStudentDetail.guardian_phone}</p>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setSelectedStudentDetail(null)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isDark ? 'bg-white/[0.05] text-slate-300' : 'bg-gray-100 text-gray-600'}`}>{t('common.close')}</button>
                  <button onClick={() => handlePrintIdCard(selectedStudentDetail.student_id)}
                    className="flex-[2] py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <Printer className="w-3.5 h-3.5" /> 🖨️ {t('admin.print_id_card')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isTeacherListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className={`rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border ${isDark ? 'bg-[#0c0a21] border-white/[0.06]' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 sm:p-5 flex justify-between items-center border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('admin.teacher_directory')}</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('admin.all_teachers')}</p>
                </div>
                <button onClick={() => setIsTeacherListModalOpen(false)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'hover:bg-white/[0.06] text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className={`flex-1 overflow-y-auto p-3 sm:p-4 ${isDark ? 'bg-black/20' : 'bg-gray-50/50'}`}>
                {isLoadingTeacherList ? (
                  <div className="flex justify-center py-16"><RefreshCw className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-400' : 'text-gray-400'}`} /></div>
                ) : teacherList.length === 0 ? (
                  <div className={`flex justify-center py-16 text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{t('admin.no_teachers_found')}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teacherList.map(teacher => (
                      <div key={teacher.id} className={`p-3 rounded-xl border ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-lg overflow-hidden shrink-0">
                            {teacher.photo ? <img src={getImageUrl(teacher.photo)} alt="" className="w-full h-full object-cover" /> : '👩‍🏫'}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{teacher.name}</p>
                            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>ID: {teacher.teacher_id}</p>
                            <p className="text-[10px] font-medium text-purple-500 truncate">{teacher.major_subject_name || t('admin.subject_na')}</p>
                          </div>
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