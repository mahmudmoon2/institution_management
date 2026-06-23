import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export default function ParentResults() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);

  useEffect(() => { const f=async()=>{try{const r=await api.get('/parent/results/');setData(r.data);}catch(e){setError(e.response?.data?.error||'Failed');}finally{setIsLoading(false);}};f();},[]);
  if(isLoading)return<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin"></div></div>;
  if(error)return<div className="text-center py-20"><span className="text-5xl">⚠️</span><p className="text-red-600 font-bold mt-4">{error}</p></div>;

  const results = data?.results || [];

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple">
        <div className="relative z-10"><span className="inline-block px-3 py-1 bg-brand-softLavender/20 text-brand-softLavender font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-softLavender/30">{t('parent.exam_results')}</span><h1 className="text-3xl md:text-4xl font-bold mb-2">{t('parent.academic_performance')}</h1></div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4"><span className="text-[200px]">📝</span></div>
      </motion.div>

      {results.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center"><span className="text-6xl">📋</span><h3 className="text-xl font-bold text-gray-500 mt-4">{t('parent.no_exam_results')}</h3><p className="text-gray-400 mt-2">{t('parent.no_exam_results_desc')}</p></motion.div>
      ) : results.map((exam, idx) => (
        <motion.div key={exam.exam_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div onClick={() => setExpandedExam(expandedExam === exam.exam_id ? null : exam.exam_id)} className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
            <div><h3 className="text-lg font-bold text-brand-deepPlum">{exam.exam_name}</h3><div className="flex gap-4 mt-2 text-sm text-gray-500"><span>📅 {exam.start_date}</span><span>📚 {t('common.date')}: {exam.academic_year}</span></div></div>
            <div className="flex items-center gap-4">
              <div className="text-right"><p className="text-2xl font-bold text-brand-royalPurple">{exam.average_gpa||'N/A'}</p><p className="text-xs text-gray-400">GPA</p></div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${exam.result_status==='Passed'?'bg-brand-mintGreen/20 text-[#0e5c3c]':'bg-red-100 text-red-600'}`}>{exam.result_status}</span>
              <span className="text-gray-400 transform transition-transform duration-300" style={{ transform: expandedExam === exam.exam_id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>
          </div>
          <AnimatePresence>{expandedExam === exam.exam_id && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead><tr className="border-b border-gray-200"><th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('common.subject')}</th><th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">{t('common.amount')}</th><th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">{t('common.type')}</th><th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">GPA</th></tr></thead>
                    <tbody>{exam.subjects.map((sub, sIdx) => (<tr key={sIdx} className="border-b border-gray-100 hover:bg-white/60 transition-colors"><td className="p-3 font-semibold text-gray-800">{sub.subject_name}</td><td className="p-3 text-center font-bold text-brand-deepPlum">{sub.marks_obtained}</td><td className="p-3 text-center"><span className="px-2 py-1 rounded-md text-xs font-bold bg-brand-softLavender/20 text-brand-royalPurple">{sub.grade_name}</span></td><td className="p-3 text-center font-bold text-brand-tealCyan">{sub.gpa}</td></tr>))}</tbody>
                    <tfoot><tr className="bg-white"><td className="p-3 font-bold text-gray-700">{t('common.total')}</td><td className="p-3 text-center font-bold text-brand-deepPlum">{exam.total_marks}</td><td className="p-3 text-center"></td><td className="p-3 text-center font-bold text-brand-tealCyan">{exam.average_gpa}</td></tr></tfoot>
                  </table>
                </div>
              </div>
            </motion.div>
          )}</AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}