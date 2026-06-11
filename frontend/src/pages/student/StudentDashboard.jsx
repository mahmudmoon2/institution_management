import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState(null);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // লাইভ ঘড়ির জন্য স্টেট
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // ইউজারের প্রোফাইল ফেচ করা
        const userRes = await api.get('/me/');
        setStudentInfo(userRes.data);

        // ডেমো হিসেবে নোটিশ ফেচ করা (আপনার CMS API থাকলে সেটি বসবে)
        // const noticeRes = await api.get('/cms/notices/');
        // setNotices(noticeRes.data.slice(0, 3)); 

        // আপাতত স্ট্যাটিক নোটিশ দেখাচ্ছি ডিজাইন সুন্দর রাখার জন্য
        setNotices([
          { id: 1, title: 'Mid-Term Exam Routine Published', date: '2026-06-15', type: 'Academic' },
          { id: 2, title: 'School Closed for Summer Vacation', date: '2026-06-20', type: 'Holiday' },
          { id: 3, title: 'Inter-School Football Tournament', date: '2026-06-25', type: 'Sports' }
        ]);

      } catch (error) {
        console.error("Error fetching student data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateString = currentTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (isLoading) return <div className="p-10 text-center font-bold text-brand-deepPlum">Loading your dashboard...</div>;

  return (
    <div className="space-y-6 pb-10">
      
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-deepPlum rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            Student Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Hello, {studentInfo?.name || 'Student'}! 🎓</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Ready to learn? Check your daily routine, upcoming exams, and latest school notices here.
          </p>
        </div>
        
        {/* Live Clock Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-4 shrink-0">
          <div className="text-4xl animate-pulse">⏰</div>
          <div>
            <p className="text-2xl font-bold text-brand-tealCyan tracking-wider">{timeString}</p>
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">{dateString}</p>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[250px]">📚</span>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-mintGreen/20 text-[#0e5c3c] rounded-2xl flex items-center justify-center text-2xl">✅</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Attendance</p>
            <p className="text-2xl font-bold text-brand-deepPlum">92%</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl">📝</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Upcoming Exams</p>
            <p className="text-2xl font-bold text-brand-deepPlum">3</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-softLavender/20 text-brand-royalPurple rounded-2xl flex items-center justify-center text-2xl">💳</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Fees Due</p>
            <p className="text-2xl font-bold text-red-500">৳0.00</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Routine Placeholder */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF] flex justify-between items-center">
            <h2 className="text-lg font-bold text-brand-deepPlum">Today's Classes</h2>
            <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-brand-royalPurple border border-brand-softLavender/30">View Full Routine</span>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex gap-4 items-center">
                <div className="bg-brand-tealCyan/20 text-brand-deepPlum font-bold p-2 rounded-lg text-xs w-16 text-center">09:00 AM</div>
                <div>
                  <p className="font-bold text-gray-800">Mathematics</p>
                  <p className="text-xs text-gray-500">Mr. Rahman | Room 101</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex gap-4 items-center">
                <div className="bg-brand-tealCyan/20 text-brand-deepPlum font-bold p-2 rounded-lg text-xs w-16 text-center">10:00 AM</div>
                <div>
                  <p className="font-bold text-gray-800">English Literature</p>
                  <p className="text-xs text-gray-500">Ms. Sarah | Room 105</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex gap-4 items-center">
                <div className="bg-brand-tealCyan/20 text-brand-deepPlum font-bold p-2 rounded-lg text-xs w-16 text-center">11:30 AM</div>
                <div>
                  <p className="font-bold text-gray-800">Physics Lab</p>
                  <p className="text-xs text-gray-500">Dr. Ahmed | Lab 2</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notice Board */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-brand-deepPlum">Recent Notices</h2>
            <span className="text-xl">📢</span>
          </div>
          <div className="p-6 space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className="p-4 border border-gray-100 rounded-xl hover:bg-brand-softLavender/5 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${
                    notice.type === 'Academic' ? 'bg-blue-50 text-blue-600' :
                    notice.type === 'Holiday' ? 'bg-red-50 text-red-600' : 'bg-brand-mintGreen/20 text-[#0e5c3c]'
                  }`}>
                    {notice.type}
                  </span>
                  <span className="text-xs text-gray-400 font-semibold">{new Date(notice.date).toLocaleDateString('en-GB')}</span>
                </div>
                <h3 className="font-bold text-gray-800 group-hover:text-brand-royalPurple transition-colors">{notice.title}</h3>
              </div>
            ))}
            <button className="w-full py-3 mt-2 rounded-xl border-2 border-brand-royalPurple/20 text-brand-royalPurple font-bold hover:bg-brand-royalPurple/5 transition-colors">
              View All Notices
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}