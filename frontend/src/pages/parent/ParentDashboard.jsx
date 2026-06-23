import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export default function ParentDashboard() {
  const { t } = useTranslation();
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

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="font-bold text-brand-deepPlum">{t('common.loading')}</p></div></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center bg-red-50 p-8 rounded-2xl border border-red-200 max-w-md"><span className="text-4xl">⚠️</span><h2 className="text-xl font-bold text-red-600 mt-3">{t('common.error')}</h2><p className="text-gray-600 mt-2">{error}</p></div></div>;

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
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1*(i+1) }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center text-2xl`}>{card.icon}</div>
            <div><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">{card.label}</p><p className="text-2xl font-bold text-brand-deepPlum">{card.value}</p>{card.sub&&<p className="text-xs text-gray-400">{card.sub}</p>}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="bg-[#F5F0FF] p-6 text-center border-b border-gray-100">
            {child?.photo?<img src={child.photo} alt={child.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-4 shadow-md border-4 border-white"/>:<div className="w-24 h-24 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-md border-4 border-white">{child?.name?.charAt(0)||'S'}</div>}
            <h2 className="text-xl font-bold text-brand-deepPlum">{child?.name||'Student'}</h2>
            <p className="text-sm font-semibold text-brand-tealCyan mt-1">{t('common.id')}: {child?.student_id||'N/A'}</p>
          </div>
          <div className="p-6 space-y-4">
            {[{k:'common.class',v:child?.class_name},{k:'common.section',v:child?.section_name},{k:'admin.roll_number',v:child?.roll_number},{k:'common.type',v:child?.group_name},{k:'common.name',v:child?.gender},{k:'common.type',v:child?.blood_group}].map((r,i)=>(r.v&&<div key={i} className="flex justify-between border-b border-gray-50 pb-2"><span className="text-sm font-semibold text-gray-500">{t(r.k)}</span><span className="text-sm font-bold text-gray-800">{r.v}</span></div>))}
            <Link to="/parent/profile" className="block w-full mt-4 py-2.5 rounded-xl border border-brand-tealCyan text-brand-tealCyan font-bold hover:bg-brand-tealCyan hover:text-white transition-colors text-center">{t('parent.view_full_profile')}</Link>
          </div>
        </motion.div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-lg font-bold text-brand-deepPlum">{t('parent.recent_fee_status')}</h2><Link to="/parent/fees" className="text-xs font-bold text-brand-tealCyan bg-brand-tealCyan/10 px-3 py-1.5 rounded-lg hover:bg-brand-tealCyan hover:text-white transition-colors">{t('parent.view_all_fees')}</Link></div>
            <div className="p-0">{recent_payments&&recent_payments.length>0?<table className="w-full text-left border-collapse text-sm"><thead><tr className="bg-gray-50 text-gray-500"><th className="p-4 font-semibold border-b border-gray-100">{t('common.date')}</th><th className="p-4 font-semibold border-b border-gray-100 text-center">{t('common.amount')}</th><th className="p-4 font-semibold border-b border-gray-100 text-center">{t('common.status')}</th></tr></thead><tbody>{recent_payments.map((fee,idx)=><tr key={fee.id||idx} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="p-4 font-bold text-gray-700">{fee.month}</td><td className="p-4 text-center font-bold text-brand-deepPlum">৳{fee.amount_paid}</td><td className="p-4 text-center"><span className={`px-2 py-1 rounded-md text-xs font-bold ${fee.status==='Paid'?'bg-brand-mintGreen/20 text-[#0e5c3c]':'bg-red-100 text-red-600'}`}>{fee.status}</span></td></tr>)}</tbody></table>:<div className="p-10 text-center text-gray-400"><span className="text-4xl">💰</span><p className="mt-2 font-semibold">{t('parent.no_payment_records')}</p></div>}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-brand-deepPlum">{t('parent.school_notices')}</h2></div>
            <div className="p-6 space-y-3">{notices&&notices.length>0?notices.map((notice)=><div key={notice.id} className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between"><div><span className="text-[10px] font-bold text-brand-royalPurple bg-brand-softLavender/20 px-2 py-1 rounded mb-1 inline-block uppercase tracking-wider">{notice.category}</span><h3 className="font-bold text-gray-800">{notice.title}</h3></div><span className="text-xs text-gray-400 font-semibold">{notice.date}</span></div>):<div className="p-6 text-center text-gray-400"><span className="text-4xl">📢</span><p className="mt-2 font-semibold">{t('parent.no_notices_available')}</p></div>}</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}