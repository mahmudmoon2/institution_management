import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export default function ParentProfile() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => { const f=async()=>{try{const r=await api.get('/parent/child-profile/');setData(r.data);}catch(e){setError(e.response?.data?.error||'Failed');}finally{setIsLoading(false);}};f();},[]);
  if(isLoading)return<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin"></div></div>;
  if(error)return<div className="text-center py-20"><span className="text-5xl">⚠️</span><h2 className="text-xl font-bold text-red-600 mt-4">{error}</h2></div>;
  const{child,attendance_summary,latest_grade,latest_gpa,total_due,recent_payments}=data;
  return(<div className="space-y-6 pb-10">
    <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="bg-[#190933] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple">
      <div className="relative z-10"><span className="inline-block px-3 py-1 bg-brand-softLavender/20 text-brand-softLavender font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-softLavender/30">{t('parent.child_profile')}</span><h1 className="text-3xl md:text-4xl font-bold mb-2">{child?.name}</h1><p className="text-gray-300 text-sm">{child?.class_name} • {t('common.section')} {child?.section_name} • {t('common.roll')} {child?.roll_number}</p></div>
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4"><span className="text-[200px]">👦</span></div>
    </motion.div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.2}} className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
        <div className="bg-[#F5F0FF] p-8 text-center border-b border-gray-100">{child?.photo?<img src={child.photo} alt={child?.name} className="w-28 h-28 rounded-2xl object-cover mx-auto mb-4 shadow-lg border-4 border-white"/>:<div className="w-28 h-28 bg-brand-royalPurple rounded-2xl flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4 shadow-lg border-4 border-white">{child?.name?.charAt(0)||'S'}</div>}<h2 className="text-xl font-bold text-brand-deepPlum">{child?.name}</h2><p className="text-sm font-semibold text-brand-tealCyan mt-1">{t('common.id')}: {child?.student_id}</p></div>
        <div className="p-6 space-y-3">{[{l:t('common.class'),v:child?.class_name},{l:t('common.section'),v:child?.section_name},{l:t('admin.roll_number'),v:child?.roll_number},{l:t('common.type'),v:child?.group_name},{l:t('admin.date_of_birth'),v:child?.date_of_birth},{l:t('common.name'),v:child?.gender},{l:'Blood Group',v:child?.blood_group},{l:'Guardian Name',v:child?.guardian_name},{l:'Guardian Phone',v:child?.guardian_phone}].map((r,i)=>(r.v&&<div key={i} className="flex justify-between border-b border-gray-50 pb-2"><span className="text-sm font-semibold text-gray-500">{r.l}</span><span className="text-sm font-bold text-gray-800">{r.v}</span></div>))}</div>
      </motion.div>
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('parent.monthly_attendance')}</p><p className="text-3xl font-bold text-brand-mintGreen">{attendance_summary?.percentage||0}%</p><p className="text-xs text-gray-400 mt-1">{attendance_summary?.present||0}/{attendance_summary?.total_days||0} {t('parent.days_present')}</p></motion.div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('parent.latest_grade')}</p><p className="text-3xl font-bold text-brand-royalPurple">{latest_grade||'N/A'}</p>{latest_gpa&&<p className="text-xs text-gray-400 mt-1">GPA: {latest_gpa}</p>}</motion.div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center"><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('parent.total_due')}</p><p className="text-3xl font-bold text-red-500">৳{total_due||0}</p><p className="text-xs text-gray-400 mt-1">{t('parent.fees_outstanding')}</p></motion.div>
        </div>
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.6}} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-bold text-brand-deepPlum">{t('parent.recent_payments')}</h2></div>
          <div className="p-0">{recent_payments&&recent_payments.length>0?<table className="w-full text-left border-collapse text-sm"><thead><tr className="bg-gray-50 text-gray-500"><th className="p-4 font-semibold border-b border-gray-100">{t('common.date')}</th><th className="p-4 font-semibold border-b border-gray-100">{t('common.amount')}</th><th className="p-4 font-semibold border-b border-gray-100">{t('parent.method')}</th><th className="p-4 font-semibold border-b border-gray-100 text-center">{t('common.status')}</th></tr></thead><tbody>{recent_payments.map((p)=><tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50"><td className="p-4 font-medium text-gray-700">{p.date}</td><td className="p-4 font-bold text-brand-deepPlum">৳{p.amount_paid}</td><td className="p-4 text-gray-600">{p.method}</td><td className="p-4 text-center"><span className={`px-2 py-1 rounded-md text-xs font-bold ${p.status==='Paid'?'bg-brand-mintGreen/20 text-[#0e5c3c]':'bg-red-100 text-red-600'}`}>{p.status}</span></td></tr>)}</tbody></table>:<div className="p-10 text-center text-gray-400">{t('parent.no_payment_records_short')}</div>}</div>
        </motion.div>
      </div>
    </div>
  </div>);
}