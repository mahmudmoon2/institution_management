import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../../store/useThemeStore';
import api from '../../api/axios';

export default function ParentDashboard() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try { const res = await api.get('/parent/dashboard/'); setData(res.data); }
      catch (err) { setError(err.response?.data?.error || 'Failed to load dashboard'); }
      finally { setIsLoading(false); }
    };
    fetchDashboard();
  }, []);

  const cardClass = `p-6 rounded-2xl shadow-sm flex items-center gap-4 ${isDark ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white border border-gray-100'}`;

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className={`font-bold ${isDark ? 'text-slate-300' : 'text-brand-deepPlum'}`}>{t('common.loading')}</p></div></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className={`text-center p-8 rounded-2xl border max-w-md ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}><span className="text-4xl">⚠️</span><h2 className={`text-xl font-bold mt-3 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{t('common.error')}</h2><p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{error}</p></div></div>;

  const { child, attendance_summary, latest_grade, latest_gpa, total_due, recent_payments, notices, unread_messages } = data;

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full">
          <span className="inline-block px-3 py-1 bg-brand-softLavender/20 text-brand-softLavender font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-softLavender/30">{t('parent.portal')}</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('parent.welcome')}! 👋</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">{t('parent.welcome_banner').replace('{child}', child?.name || t('parent.your_child'))}</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4"><span className="text-[200px]">👨‍👩‍👦</span></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{icon:'📈',color:'bg-brand-mintGreen/20 text-[#0e5c3c]',label:t('parent.attendance_pct'),value:`${attendance_summary?.percentage || 0}%`},{icon:'💰',color:'bg-red-50 text-red-600',label:t('parent.total_due_fees'),value:`৳${total_due || 0}`},{icon:'🏆',color:'bg-brand-softLavender/20 text-brand-royalPurple',label:t('parent.last_exam_grade'),value:latest_grade||'N/A',sub:latest_gpa?`GPA: ${latest_gpa}`:null},{icon:'📬',color:'bg-blue-50 text-blue-600',label:t('parent.messages_unread'),value:unread_messages||0,sub:t('parent.unread')}].map((card,i)=>(
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1*(i+1) }} className={cardClass}>
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-2xl`}>{card.icon}</div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{card.label}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{card.value}</p>
              {card.sub && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{card.sub}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className={`lg:col-span-1 rounded-2xl shadow-sm border overflow-hidden h-fit ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
          <div className={`p-6 text-center border-b ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-[#F5F0FF] border-gray-100'}`}>
            {child?.photo ? <img src={child.photo} alt={child.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-md border-4 border-white"/> : <div className="w-24 h-24 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-md border-4 border-white">{child?.name?.charAt(0)||'S'}</div>}
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{child?.name || 'Student'}</h2>
            <p className="text-sm font-semibold text-brand-tealCyan mt-1">{t('common.id')}: {child?.student_id||'N/A'}</p>
          </div>
          <div className="p-6 space-y-4">
            {[{k:'common.class',v:child?.class_name},{k:'common.section',v:child?.section_name},{k:'admin.roll_number',v:child?.roll_number},{k:'common.type',v:child?.group_name},{k:'common.name',v:child?.gender},{k:'common.type',v:child?.blood_group}].map((r,i)=>(r.v&&<div key={i} className={`flex justify-between pb-2 ${isDark ? 'border-white/[0.04]' : 'border-gray-50'} border-b`}><span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t(r.k)}</span><span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{r.v}</span></div>))}
            <Link to="/parent/profile" className="block w-full mt-4 py-2.5 rounded-xl border border-brand-tealCyan text-brand-tealCyan font-bold hover:bg-brand-tealCyan hover:text-white transition-colors text-center">{t('parent.view_full_profile')}</Link>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
            <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}><h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('parent.recent_fee_status')}</h2><Link to="/parent/fees" className="text-xs font-bold text-brand-tealCyan bg-brand-tealCyan/10 px-3 py-1.5 rounded-lg hover:bg-brand-tealCyan hover:text-white transition-colors">{t('parent.view_all_fees')}</Link></div>
            <div className="p-0">{recent_payments && recent_payments.length>0 ? <table className="w-full text-left border-collapse text-sm">
              <thead><tr className={`border-b ${isDark ? 'bg-white/[0.02] text-slate-400' : 'bg-gray-50 text-gray-500'} ${isDark ? 'border-white/[0.04]' : 'border-gray-100'}`}><th className={`p-4 font-semibold border-b ${isDark ? 'border-white/[0.04]' : 'border-gray-100'}`}>{t('common.date')}</th><th className={`p-4 font-semibold border-b text-center ${isDark ? 'border-white/[0.04]' : 'border-gray-100'}`}>{t('common.amount')}</th><th className={`p-4 font-semibold border-b text-center ${isDark ? 'border-white/[0.04]' : 'border-gray-100'}`}>{t('common.status')}</th></tr></thead>
              <tbody>{recent_payments.map((fee, idx) => <tr key={fee.id || idx} className={`border-b transition-colors ${isDark ? 'border-white/[0.03] hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50/50'}`}><td className={`p-4 font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{fee.month}</td><td className={`p-4 text-center font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>৳{fee.amount_paid}</td><td className="p-4 text-center"><span className={`px-2 py-1 rounded-md text-xs font-bold ${fee.status==='Paid'?'bg-brand-mintGreen/20 text-[#0e5c3c]':'bg-red-100 text-red-600'}`}>{fee.status}</span></td></tr>)}</tbody>
            </table>:<div className={`p-10 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}><span className="text-4xl">💰</span><p className="mt-2 font-semibold">{t('parent.no_payment_records')}</p></div>}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className={`rounded-2xl shadow-sm border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
            <div className={`p-6 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}><h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('parent.school_notices')}</h2></div>
            <div className="p-6 space-y-3">{notices && notices.length>0 ? notices.map((notice) => <div key={notice.id} className={`p-4 border rounded-xl transition-colors flex items-center justify-between ${isDark ? 'border-white/[0.06] hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-gray-50'}`}><div><span className="text-[10px] font-bold text-brand-royalPurple bg-brand-softLavender/20 px-2 py-1 rounded mb-1 inline-block uppercase tracking-wider">{notice.category}</span><h3 className={`font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{notice.title}</h3></div><span className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{notice.date}</span></div>):<div className={`p-6 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}><span className="text-4xl">📢</span><p className="mt-2 font-semibold">{t('parent.no_notices_available')}</p></div>}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}