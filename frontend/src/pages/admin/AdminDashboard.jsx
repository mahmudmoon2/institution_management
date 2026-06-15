import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

// --- Helper: Circular Progress (unchanged) ---
const CircularProgress = ({ percentage, color, icon }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
        <motion.circle
          cx="48" cy="48" r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-2xl drop-shadow-sm">{icon}</div>
    </div>
  );
};

// --- Helper: image URL ---
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_MEDIA_BASE_URL}${path}`;
};

// --- Predefined colors for pie chart slices ---
const PIE_COLORS = ['#5DD9C1', '#B084CC', '#665687', '#ACFCD9', '#190933', '#F59E0B', '#EF4444', '#3B82F6'];

// --- Daily quote list ---
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

// --- Gold Analog Clock Component ---
const AnalogClock = ({ time }) => {
  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = (hours * 30) + (minutes * 0.5);
  const minuteDeg = (minutes * 6);
  const secondDeg = (seconds * 6);

  const pendulumAngle = Math.sin(seconds * Math.PI / 30) * 12;

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md">
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
          x1="100" y1="100"
          x2={100 + 32 * Math.sin(hourDeg * Math.PI / 180)}
          y2={100 - 32 * Math.cos(hourDeg * Math.PI / 180)}
          stroke="#8B5A2B" strokeWidth="5" strokeLinecap="round"
        />
        <line
          x1="100" y1="100"
          x2={100 + 50 * Math.sin(minuteDeg * Math.PI / 180)}
          y2={100 - 50 * Math.cos(minuteDeg * Math.PI / 180)}
          stroke="#8B5A2B" strokeWidth="3" strokeLinecap="round"
        />
        <line
          x1="100" y1="100"
          x2={100 + 58 * Math.sin(secondDeg * Math.PI / 180)}
          y2={100 - 58 * Math.cos(secondDeg * Math.PI / 180)}
          stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="5" fill="#D4AF37" />
        <circle cx="100" cy="100" r="2" fill="#8B5A2B" />
      </svg>
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <svg width="24" height="30" viewBox="0 0 40 50" className="overflow-visible">
          <line
            x1="20" y1="0" x2="20" y2="30"
            stroke="#D4AF37" strokeWidth="2"
            style={{ transformOrigin: '20px 0px', transform: `rotate(${pendulumAngle}deg)`, transition: 'transform 0.2s linear' }}
          />
          <circle cx="20" cy="30" r="6" fill="#D4AF37" stroke="#B8860B" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newAdmissions: 0,
    totalTeachers: 0,
  });
  const [classSummary, setClassSummary] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [allStudents, setAllStudents] = useState([]);

  // Modal states for students list
  const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [studentFilters, setStudentFilters] = useState({ classLevel: '', section: '' });
  const [classLevels, setClassLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const [isLoadingStudentList, setIsLoadingStudentList] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Modal states for teachers list
  const [isTeacherListModalOpen, setIsTeacherListModalOpen] = useState(false);
  const [teacherList, setTeacherList] = useState([]);
  const [isLoadingTeacherList, setIsLoadingTeacherList] = useState(false);

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const meRes = await api.get('/me/');
        setAdminName(meRes.data.name || 'Admin');

        // 1. Fetch total students & total teachers from /dashboard-stats/
        let totalStudents = 0, totalTeachers = 0;
        try {
          const dashRes = await api.get('/dashboard-stats/');
          totalStudents = dashRes.data.total_students || 0;
          totalTeachers = dashRes.data.total_teachers || 0;
          setChartData(dashRes.data.chartData || []);
        } catch (e) { console.warn("Dashboard stats not available"); }

        // 2. Fetch all students (for active count & new admissions)
        let students = [];
        try {
          const studentsRes = await api.get('/students/');
          students = studentsRes.data;
          setAllStudents(students);
        } catch (e) { console.warn("Students list not available"); }

        // 3. Compute active students and new admissions (last 30 days)
        const activeCount = students.filter(s => s.is_active === true).length;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newAdmissionsCount = students.filter(s => {
          if (!s.admission_date) return false;
          return new Date(s.admission_date) >= thirtyDaysAgo;
        }).length;

        // 4. Fetch class summary (if endpoint exists)
        try {
          const classRes = await api.get('/academics/class-summary/');
          setClassSummary(classRes.data);
          const pieData = classRes.data.map(cls => ({ name: cls.class_name, value: cls.student_count }));
          setChartData(pieData.length ? pieData : chartData);
        } catch (e) { console.warn("Class summary not available"); }

        // 5. Teacher presentation history
        try {
          const histRes = await api.get('/teachers/class-history/');
          setHistoryList(histRes.data);
        } catch (e) { console.warn("History not available"); }

        // Set stats
        setStats({
          totalStudents,
          activeStudents: activeCount,
          newAdmissions: newAdmissionsCount,
          totalTeachers,
        });
      } catch (err) {
        console.error("Dashboard data fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();

    // Load class levels and sections for filter dropdowns
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

  // Student list modal handlers
  const handleClassChange = async (classId) => {
    setStudentFilters({ classLevel: classId, section: '' });
    if (classId) {
      try {
        const secRes = await api.get(`/academics/sections/?class=${classId}`);
        setSections(secRes.data);
      } catch (e) { console.warn("Sections not loaded"); }
    } else {
      setSections([]);
    }
  };

  const openStudentListModal = async () => {
    setIsStudentListModalOpen(true);
    await fetchStudentList();
  };

  const fetchStudentList = async () => {
    setIsLoadingStudentList(true);
    try {
      const params = {};
      if (studentFilters.classLevel) params.class_level = studentFilters.classLevel;
      if (studentFilters.section) params.section = studentFilters.section;
      const res = await api.get('/students/', { params });
      setStudentList(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setIsLoadingStudentList(false);
    }
  };

  const openTeacherListModal = async () => {
    setIsTeacherListModalOpen(true);
    setIsLoadingTeacherList(true);
    try {
      const res = await api.get('/teachers/');
      setTeacherList(res.data);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setIsLoadingTeacherList(false);
    }
  };

  // Search (client-side)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      let students = allStudents;
      if (students.length === 0) {
        const res = await api.get('/students/');
        students = res.data;
        setAllStudents(students);
      }
      const queryLower = searchQuery.trim().toLowerCase();
      const found = students.find(student =>
        student.name?.toLowerCase().includes(queryLower) ||
        student.student_id?.toLowerCase().includes(queryLower) ||
        student.roll_number?.toString().includes(queryLower)
      );
      if (found) {
        const classLevel = classLevels.find(c => c.id === found.class_level);
        const section = sections.find(s => s.id === found.section);
        setSearchResult({
          ...found,
          class_level_name: classLevel?.name || '',
          section_name: section?.name || '',
        });
      } else {
        setSearchError('Student not found');
      }
    } catch (err) {
      setSearchError('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const dateString = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const weekday = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
  const greeting = (() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  })();

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-brand-deepPlum font-semibold">Loading Dashboard...</div>;
  }

  const maxPerClass = 50;

  return (
    <div className="space-y-6 relative pb-10">
      {/* Welcome Header with Search Bar & Gold Analog Clock + Quote */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-brand-deepPlum mb-1">Welcome back, {adminName}! 👋</h1>
            <p className="text-gray-500 font-medium">Your full Overview here</p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <AnalogClock time={currentTime} />
            <div>
              <div className="text-sm font-semibold text-brand-deepPlum">{greeting}</div>
              <div className="text-xs text-gray-500">{weekday}, {dateString}</div>
              <div className="text-xs italic text-brand-royalPurple mt-1 max-w-[200px] sm:max-w-[300px]">{getDailyQuote()}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="🔍 Find student (by name, ID or roll number)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-brand-tealCyan focus:outline-none bg-gray-50"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-deepPlum text-white px-5 py-1.5 rounded-lg text-sm font-semibold hover:bg-brand-royalPurple transition"
            >
              {isSearching ? 'Searching...' : 'Go'}
            </button>
          </div>
        </div>

        {searchResult && (
          <div
            onClick={() => setSelectedStudentDetail(searchResult)}
            className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-4 cursor-pointer hover:bg-green-100 transition"
          >
            <div className="w-12 h-12 rounded-full bg-brand-tealCyan/20 flex items-center justify-center text-2xl">
              {searchResult.photo ? <img src={getImageUrl(searchResult.photo)} alt="" className="w-full h-full rounded-full object-cover" /> : '👨‍🎓'}
            </div>
            <div>
              <p className="font-bold text-brand-deepPlum">{searchResult.name}</p>
              <p className="text-sm text-gray-600">ID: {searchResult.student_id} | Roll: {searchResult.roll_number}</p>
              <p className="text-sm text-gray-500">Class: {searchResult.class_level_name} - {searchResult.section_name}</p>
            </div>
          </div>
        )}
        {searchError && <p className="mt-2 text-red-500 text-sm">{searchError}</p>}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ scale: 1.02 }} onClick={openStudentListModal} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2"><span className="text-2xl">👨‍🎓</span><span className="text-xs text-gray-400">Total</span></div>
          <p className="text-2xl font-bold text-brand-deepPlum">{stats.totalStudents}</p>
          <p className="text-xs text-gray-500 mt-1">Total Students</p>
        </motion.div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2"><span className="text-2xl">✅</span><span className="text-xs text-gray-400">Active</span></div>
          <p className="text-2xl font-bold text-brand-deepPlum">{stats.activeStudents}</p>
          <p className="text-xs text-gray-500 mt-1">Active Students</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2"><span className="text-2xl">🆕</span><span className="text-xs text-gray-400">Last 30d</span></div>
          <p className="text-2xl font-bold text-brand-deepPlum">{stats.newAdmissions}</p>
          <p className="text-xs text-gray-500 mt-1">New Admissions</p>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} onClick={openTeacherListModal} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2"><span className="text-2xl">👩‍🏫</span><span className="text-xs text-gray-400">Total</span></div>
          <p className="text-2xl font-bold text-brand-deepPlum">{stats.totalTeachers}</p>
          <p className="text-xs text-gray-500 mt-1">Total Teachers</p>
        </motion.div>
      </div>

      {/* Class Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-brand-deepPlum mb-4">Class Summary</h2>
        {classSummary.length === 0 ? (
          <p className="text-gray-500">No class data available.</p>
        ) : (
          <div className="space-y-4">
            {classSummary.map((cls) => (
              <div key={cls.class_name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-brand-deepPlum">{cls.class_name}</span>
                  <span className="text-gray-500">{cls.student_count} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-brand-tealCyan h-2.5 rounded-full" style={{ width: `${(cls.student_count / maxPerClass) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pie Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-brand-deepPlum mb-4">Student Distribution by Class</h2>
          {chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} students`, name]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-brand-deepPlum p-6 rounded-2xl text-white">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/students/add" className="w-full bg-white/10 hover:bg-brand-tealCyan hover:text-brand-deepPlum transition px-4 py-3 rounded-xl font-semibold flex justify-between items-center group">
              <span>👨‍🎓 Register Student</span><span className="group-hover:translate-x-1 transition">→</span>
            </Link>
            <Link to="/admin/fee-categories" className="w-full bg-white/10 hover:bg-brand-tealCyan hover:text-brand-deepPlum transition px-4 py-3 rounded-xl font-semibold flex justify-between items-center group">
              <span>💰 Manage Fees</span><span className="group-hover:translate-x-1 transition">→</span>
            </Link>
            <Link to="/admin/notices/add" className="w-full bg-white/10 hover:bg-brand-tealCyan hover:text-brand-deepPlum transition px-4 py-3 rounded-xl font-semibold flex justify-between items-center group">
              <span>📢 Add Notice</span><span className="group-hover:translate-x-1 transition">→</span>
            </Link>
            <Link to="/admin/events/add" className="w-full bg-white/10 hover:bg-brand-tealCyan hover:text-brand-deepPlum transition px-4 py-3 rounded-xl font-semibold flex justify-between items-center group">
              <span>🗓️ Add Event</span><span className="group-hover:translate-x-1 transition">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Teacher Presentations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-[#F5F0FF]">
          <h2 className="text-xl font-bold text-brand-deepPlum">Recent Teacher Presentations</h2>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {historyList.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No presentations found.</p>
          ) : (
            <div className="space-y-3">
              {historyList.map(record => (
                <div key={record.id} className="p-4 border rounded-xl hover:bg-gray-50">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <p className="font-bold text-brand-deepPlum">{record.topic_covered}</p>
                      <p className="text-sm text-gray-500">{record.teacher_name} | {record.class_level_name} - {record.section_name} | {record.subject_name}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">{record.start_time.substring(0,5)} - {record.end_time.substring(0,5)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== STUDENT LIST MODAL (with class/section filters) ========== */}
      <AnimatePresence>
        {isStudentListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h3 className="text-xl font-bold text-brand-deepPlum">All Students</h3>
                  <p className="text-sm text-gray-500">Filter by class and section</p>
                </div>
                <button onClick={() => setIsStudentListModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-red-100 transition">✕</button>
              </div>
              <div className="p-6 border-b flex gap-4 flex-wrap">
                <select
                  className="px-4 py-2 border rounded-xl"
                  value={studentFilters.classLevel}
                  onChange={(e) => handleClassChange(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {classLevels.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
                <select
                  className="px-4 py-2 border rounded-xl"
                  value={studentFilters.section}
                  onChange={(e) => setStudentFilters({ ...studentFilters, section: e.target.value })}
                  disabled={!studentFilters.classLevel}
                >
                  <option value="">All Sections</option>
                  {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                </select>
                <button onClick={fetchStudentList} className="bg-brand-tealCyan text-brand-deepPlum font-bold px-5 py-2 rounded-xl">Apply Filter</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingStudentList ? (
                  <p className="text-center py-10">Loading...</p>
                ) : studentList.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">No students found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentList.map(student => (
                      <div
                        key={student.id}
                        onClick={() => setSelectedStudentDetail(student)}
                        className="border rounded-xl p-4 hover:shadow-md cursor-pointer transition flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-brand-softLavender/20 flex items-center justify-center text-xl">
                          {student.photo ? <img src={getImageUrl(student.photo)} alt="" className="w-full h-full rounded-full object-cover" /> : '👨‍🎓'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-deepPlum">{student.name}</p>
                          <p className="text-sm text-gray-500">ID: {student.student_id} | Roll: {student.roll_number}</p>
                          <p className="text-xs text-gray-400">{student.class_level_name} - {student.section_name}</p>
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

      {/* ========== STUDENT DETAIL POPUP ========== */}
      <AnimatePresence>
        {selectedStudentDetail && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-brand-deepPlum">Student Details</h3>
                <button onClick={() => setSelectedStudentDetail(null)} className="text-gray-400 hover:text-red-500 text-2xl">✕</button>
              </div>
              <div className="flex gap-5 items-start">
                <div className="w-24 h-24 rounded-full bg-brand-royalPurple/20 flex items-center justify-center text-4xl overflow-hidden">
                  {selectedStudentDetail.photo ? <img src={getImageUrl(selectedStudentDetail.photo)} alt="" className="w-full h-full object-cover" /> : '👨‍🎓'}
                </div>
                <div className="flex-1">
                  <p><strong>Name:</strong> {selectedStudentDetail.name}</p>
                  <p><strong>ID:</strong> {selectedStudentDetail.student_id}</p>
                  <p><strong>Roll:</strong> {selectedStudentDetail.roll_number}</p>
                  <p><strong>Class:</strong> {selectedStudentDetail.class_level_name} - {selectedStudentDetail.section_name}</p>
                  <p><strong>Date of Birth:</strong> {selectedStudentDetail.date_of_birth}</p>
                  <p><strong>Gender:</strong> {selectedStudentDetail.gender}</p>
                  <p><strong>Guardian:</strong> {selectedStudentDetail.guardian_name} ({selectedStudentDetail.guardian_phone})</p>
                  <p><strong>Address:</strong> {selectedStudentDetail.present_address}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="mt-6 w-full bg-brand-deepPlum text-white py-2 rounded-xl">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========== TEACHER LIST MODAL ========== */}
      <AnimatePresence>
        {isTeacherListModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-brand-deepPlum">All Teachers</h3>
                <button onClick={() => setIsTeacherListModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-200 hover:bg-red-100 transition">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {isLoadingTeacherList ? (
                  <p className="text-center py-10">Loading...</p>
                ) : teacherList.length === 0 ? (
                  <p className="text-center py-10 text-gray-500">No teachers found.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teacherList.map(teacher => (
                      <div key={teacher.id} className="border rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-softLavender/20 flex items-center justify-center text-xl">
                          {teacher.photo ? <img src={getImageUrl(teacher.photo)} alt="" className="w-full h-full rounded-full object-cover" /> : '👩‍🏫'}
                        </div>
                        <div>
                          <p className="font-bold text-brand-deepPlum">{teacher.name}</p>
                          <p className="text-sm text-gray-500">ID: {teacher.teacher_id} | {teacher.major_subject_name}</p>
                          <p className="text-xs text-gray-400">{teacher.email}</p>
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