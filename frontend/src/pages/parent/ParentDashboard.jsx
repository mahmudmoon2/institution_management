import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function ParentDashboard() {
  const [childInfo, setChildInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        // ডেমো পারপাসে সিস্টেম থেকে প্রথম স্টুডেন্টকে 'চাইল্ড' হিসেবে ফেচ করা হচ্ছে।
        // (রিয়েল অ্যাপে লগড-ইন প্যারেন্টের সাথে লিংক করা স্টুডেন্টের আইডি দিয়ে ফেচ হবে)
        const res = await api.get('/students/');
        if (res.data.length > 0) {
          setChildInfo(res.data[0]);
        }
      } catch (error) {
        console.error("Error fetching child info", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChildData();
  }, []);

  // ডেমো ডেটা: যেহেতু পেমেন্ট এবং নোটিশের স্পেসিফিক API এখনো প্যারেন্টদের জন্য ফিল্টার করা নেই
  const dueFees = 2500;
  const recentPayments = [
    { id: 1, month: 'June 2026', amount: 2500, status: 'Due', date: '-' },
    { id: 2, month: 'May 2026', amount: 2500, status: 'Paid', date: '05 May 2026' },
  ];
  
  const notices = [
    { id: 1, title: 'Parent-Teacher Meeting Scheduled', date: '2026-06-18', type: 'Event' },
    { id: 2, title: 'Summer Vacation Notice', date: '2026-06-20', type: 'Holiday' },
  ];

  if (isLoading) return <div className="p-10 text-center font-bold text-brand-deepPlum">Loading parent portal...</div>;

  return (
    <div className="space-y-6 pb-10">
      
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full">
          <span className="inline-block px-3 py-1 bg-brand-softLavender/20 text-brand-softLavender font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-softLavender/30">
            Parent Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome, Parent! 👋</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Keep track of <span className="font-bold text-brand-tealCyan">{childInfo?.name || 'your child'}</span>'s academic progress, daily attendance, and fee status all in one place.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">👨‍👩‍👦</span>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-mintGreen/20 text-[#0e5c3c] rounded-2xl flex items-center justify-center text-2xl">📈</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Attendance</p>
            <p className="text-2xl font-bold text-brand-deepPlum">95%</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl">💰</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Due Fees</p>
            <p className="text-2xl font-bold text-brand-deepPlum">৳{dueFees}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-softLavender/20 text-brand-royalPurple rounded-2xl flex items-center justify-center text-2xl">🏆</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Last Exam Grade</p>
            <p className="text-2xl font-bold text-brand-deepPlum">A+</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Child Profile Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="bg-[#F5F0FF] p-6 text-center border-b border-gray-100">
            <div className="w-24 h-24 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-md border-4 border-white">
              {childInfo?.name ? childInfo.name.charAt(0) : 'S'}
            </div>
            <h2 className="text-xl font-bold text-brand-deepPlum">{childInfo?.name || 'Student Name'}</h2>
            <p className="text-sm font-semibold text-brand-tealCyan mt-1">ID: {childInfo?.student_id || 'N/A'}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-sm font-semibold text-gray-500">Class</span>
              <span className="text-sm font-bold text-gray-800">{childInfo?.class_level_name || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-sm font-semibold text-gray-500">Section</span>
              <span className="text-sm font-bold text-gray-800">{childInfo?.section_name || 'A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-sm font-semibold text-gray-500">Roll Number</span>
              <span className="text-sm font-bold text-gray-800">{childInfo?.roll_number || '-'}</span>
            </div>
            <button className="w-full mt-4 py-2.5 rounded-xl border border-brand-tealCyan text-brand-tealCyan font-bold hover:bg-brand-tealCyan hover:text-white transition-colors">
              View Full Profile
            </button>
          </div>
        </motion.div>

        {/* Fees & Notices */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Fee Status */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-brand-deepPlum">Recent Fee Status</h2>
              <button className="text-xs font-bold text-brand-tealCyan bg-brand-tealCyan/10 px-3 py-1.5 rounded-lg">Pay Now 💳</button>
            </div>
            <div className="p-0">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="p-4 font-semibold border-b border-gray-100">Month/Details</th>
                    <th className="p-4 font-semibold border-b border-gray-100 text-center">Amount</th>
                    <th className="p-4 font-semibold border-b border-gray-100 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((fee) => (
                    <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-700">{fee.month}</td>
                      <td className="p-4 text-center font-bold text-brand-deepPlum">৳{fee.amount}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${fee.status === 'Paid' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-100 text-red-600'}`}>
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* School Notices */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-brand-deepPlum">School Notices & Messages</h2>
            </div>
            <div className="p-6 space-y-3">
              {notices.map((notice) => (
                <div key={notice.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-[10px] font-bold text-brand-royalPurple bg-brand-softLavender/20 px-2 py-1 rounded mb-1 inline-block uppercase tracking-wider">{notice.type}</span>
                    <h3 className="font-bold text-gray-800">{notice.title}</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-semibold">{new Date(notice.date).toLocaleDateString('en-GB')}</span>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}