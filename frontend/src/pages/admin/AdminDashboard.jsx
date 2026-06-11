import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/axios';

// --- কাস্টম অ্যানিমেটেড সার্কুলার প্রোগ্রেস কম্পোনেন্ট ---
const CircularProgress = ({ percentage, color, icon }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
        {/* Animated Foreground Circle */}
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
      {/* Icon Inside Circle */}
      <div className="absolute text-2xl drop-shadow-sm">
        {icon}
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState({ 
    total_students: 0, total_teachers: 0, 
    students_present: 0, teachers_present: 0,
    student_percentage: 0, teacher_percentage: 0 
  });
  const [chartData, setChartData] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // লাইভ ঘড়ির জন্য স্টেট
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal States
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [todayTeacherDetails, setTodayTeacherDetails] = useState([]);
  const [isLoadingTeacherDetails, setIsLoadingTeacherDetails] = useState(false);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [todayStudentDetails, setTodayStudentDetails] = useState([]);
  const [isLoadingStudentDetails, setIsLoadingStudentDetails] = useState(false);

  // লাইভ ঘড়ির টিক টিক আপডেট
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        try {
          const res = await api.get('/dashboard-stats/');
          setStatsData({
            total_students: res.data.total_students || 0,
            total_teachers: res.data.total_teachers || 0,
            students_present: res.data.students_present || 0,
            teachers_present: res.data.teachers_present || 0,
            student_percentage: res.data.student_percentage || 0,
            teacher_percentage: res.data.teacher_percentage || 0
          });
          setChartData(res.data.chartData || []);
        } catch (e) { console.error("Stats not loaded"); }

        try {
          const histRes = await api.get('/teachers/class-history/');
          setHistoryList(histRes.data);
        } catch (e) { console.error("History not loaded"); }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // লোকাল ডেট বের করার ফাংশন (যাতে টাইমজোন সমস্যা না করে)
  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const openTeacherDetails = async () => {
    setIsTeacherModalOpen(true);
    setIsLoadingTeacherDetails(true);
    try {
      const res = await api.get('/teachers/teacher-attendance/');
      const localToday = getLocalDate();
      setTodayTeacherDetails(res.data.filter(item => item.date === localToday));
    } catch (error) {
      console.error("Failed to fetch teacher attendance details");
    } finally {
      setIsLoadingTeacherDetails(false);
    }
  };

  const openStudentDetails = async () => {
    setIsStudentModalOpen(true);
    setIsLoadingStudentDetails(true);
    try {
      const res = await api.get('/students/student-attendance/');
      const localToday = getLocalDate();
      setTodayStudentDetails(res.data.filter(item => item.date === localToday));
    } catch (error) {
      console.error("Failed to fetch student attendance details");
    } finally {
      setIsLoadingStudentDetails(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-brand-deepPlum font-semibold">Loading Dashboard Data...</div>;
  }

  // সময় এবং তারিখের ফরম্যাটিং
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
  const dateString = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 relative pb-10">
      
      {/* Welcome Header (Live Clock Added Here) */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-deepPlum mb-1">Welcome back, Admin! 👋</h1>
          <p className="text-gray-500 font-medium">Here is what's happening in your institution today.</p>
        </div>
        
        {/* Live Clock Section */}
        <div className="flex items-center gap-4 bg-brand-softLavender/10 px-6 py-3 rounded-xl border border-brand-softLavender/20">
          <div className="text-3xl animate-pulse">🕰️</div>
          <div>
            <p className="text-2xl font-bold text-brand-royalPurple tracking-wider">{timeString}</p>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{dateString}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards with Circular Animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Student Attendance Card */}
        <motion.div 
          onClick={openStudentDetails}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-tealCyan cursor-pointer transition-all group flex items-center gap-4 overflow-hidden relative"
        >
          <div className="absolute top-3 right-3 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">View List ↗</div>
          
          <CircularProgress percentage={statsData.student_percentage} color="#5DD9C1" icon="👨‍🎓" />
          
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Students</h3>
            <p className="text-2xl font-bold text-brand-deepPlum">
              {statsData.students_present} <span className="text-sm text-gray-400 font-medium">/ {statsData.total_students}</span>
            </p>
            <p className="text-xs font-bold text-[#0e5c3c] mt-1">{statsData.student_percentage}% Present</p>
          </div>
        </motion.div>

        {/* Teacher Attendance Card */}
        <motion.div 
          onClick={openTeacherDetails}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-softLavender cursor-pointer transition-all group flex items-center gap-4 overflow-hidden relative"
        >
          <div className="absolute top-3 right-3 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">View List ↗</div>
          
          <CircularProgress percentage={statsData.teacher_percentage} color="#9b87f5" icon="👩‍🏫" />
          
          <div>
            <h3 className="text-gray-500 text-sm font-semibold mb-1">Teachers</h3>
            <p className="text-2xl font-bold text-brand-deepPlum">
              {statsData.teachers_present} <span className="text-sm text-gray-400 font-medium">/ {statsData.total_teachers}</span>
            </p>
            <p className="text-xs font-bold text-brand-royalPurple mt-1">{statsData.teacher_percentage}% Present</p>
          </div>
        </motion.div>

        {/* Other Regular Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-brand-mintGreen/20 text-[#0e5c3c]">🏆</div></div>
          <h3 className="text-gray-500 text-sm font-semibold">A+ Achievers</h3>
          <p className="text-2xl font-bold text-brand-deepPlum mt-1">320+</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3"><div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-brand-royalPurple/20 text-brand-royalPurple">🏫</div></div>
          <h3 className="text-gray-500 text-sm font-semibold">Years of Legacy</h3>
          <p className="text-2xl font-bold text-brand-deepPlum mt-1">25+</p>
        </motion.div>
      </div>

      {/* Charts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-brand-deepPlum">Revenue Growth</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#5DD9C1" stopOpacity={0.8}/><stop offset="95%" stopColor="#5DD9C1" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val/1000}k`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#5DD9C1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-brand-deepPlum p-6 rounded-2xl shadow-sm text-white flex flex-col">
          <h2 className="text-xl font-bold mb-6 text-brand-softLavender border-b border-white/10 pb-4">Quick Actions</h2>
          <div className="space-y-4 flex-1">
            <button className="w-full bg-white/10 hover:bg-brand-tealCyan hover:text-brand-deepPlum transition-colors text-left px-5 py-4 rounded-xl font-semibold flex items-center justify-between group">
              <span className="flex items-center gap-3"><span className="text-xl">📝</span> Add New Notice</span><span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full bg-white/10 hover:bg-brand-tealCyan hover:text-brand-deepPlum transition-colors text-left px-5 py-4 rounded-xl font-semibold flex items-center justify-between group">
              <span className="flex items-center gap-3"><span className="text-xl">👨‍🎓</span> Register Student</span><span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Recent Teacher Presentations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F5F0FF]">
          <h2 className="text-xl font-bold text-brand-deepPlum">Recent Teacher Presentations</h2>
        </div>
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto p-4">
          {historyList.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-semibold">No class presentations found.</div>
          ) : (
            <div className="space-y-3">
              {historyList.map((record) => (
                <div key={record.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="bg-brand-tealCyan/20 text-brand-deepPlum p-3 rounded-xl text-center shrink-0 w-16">
                      <span className="block text-lg font-bold">{new Date(record.date).getDate()}</span>
                      <span className="block text-[10px] uppercase font-bold">{new Date(record.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-deepPlum text-base mb-1">
                        <span className="text-brand-royalPurple mr-2">{record.teacher_name}:</span> {record.topic_covered}
                      </h4>
                      <div className="text-xs text-gray-500 flex flex-wrap gap-2 items-center">
                        <span className="bg-gray-100 px-2 py-1 rounded font-semibold text-brand-deepPlum border">{record.class_level_name} - {record.section_name}</span>
                        <span className="font-bold text-brand-tealCyan">{record.subject_name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                     <span className="text-xs font-bold text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shrink-0 shadow-sm">
                       ⏱️ {record.start_time.substring(0,5)} - {record.end_time.substring(0,5)}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* --- Teacher Attendance Modal --- */}
      <AnimatePresence>
        {isTeacherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-deepPlum/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
              <div className="bg-brand-softLavender/20 p-6 flex justify-between items-center border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-brand-deepPlum">Today's Teacher Attendance</h3>
                  <p className="text-sm text-gray-500 font-medium">{dateString}</p>
                </div>
                <button onClick={() => setIsTeacherModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors font-bold">✕</button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {isLoadingTeacherDetails ? (
                  <p className="text-center text-gray-500 font-semibold py-10">Loading details...</p>
                ) : todayTeacherDetails.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 font-semibold"><span className="text-4xl block mb-2">🤷‍♂️</span>Attendance hasn't been recorded yet for today.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm">
                        <th className="p-3 font-semibold rounded-l-lg">Teacher Name</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold rounded-r-lg">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayTeacherDetails.map(record => (
                        <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="p-3 font-bold text-brand-deepPlum">{record.teacher_name}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              record.status === 'Present' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' :
                              record.status === 'Absent' ? 'bg-red-100 text-red-600' :
                              record.status === 'On-Leave' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                            }`}>{record.status}</span>
                          </td>
                          <td className="p-3 text-sm text-gray-500">{record.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Student Attendance Modal --- */}
      <AnimatePresence>
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-deepPlum/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
              <div className="bg-brand-tealCyan/20 p-6 flex justify-between items-center border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-brand-deepPlum">Today's Student Attendance</h3>
                  <p className="text-sm text-gray-600 font-medium">{dateString}</p>
                </div>
                <button onClick={() => setIsStudentModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors font-bold">✕</button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {isLoadingStudentDetails ? (
                  <p className="text-center text-gray-500 font-semibold py-10">Loading details...</p>
                ) : todayStudentDetails.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 font-semibold"><span className="text-4xl block mb-2">🤷‍♂️</span>Attendance hasn't been recorded yet for today.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-sm">
                        <th className="p-3 font-semibold rounded-l-lg">Student Name</th>
                        <th className="p-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayStudentDetails.map(record => (
                        <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                          <td className="p-3 font-bold text-brand-deepPlum">{record.student_name}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              record.status === 'Present' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' :
                              record.status === 'Absent' ? 'bg-red-100 text-red-600' :
                              record.status === 'Late' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-700'
                            }`}>{record.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}