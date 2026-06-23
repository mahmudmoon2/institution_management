import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

export default function ParentFees() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { const f=async()=>{try{const r=await api.get('/parent/fees/');setData(r.data);}catch(e){setError(e.response?.data?.error||'Failed');}finally{setIsLoading(false);}};f();},[]);
  if(isLoading)return<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin"></div></div>;
  if(error)return<div className="text-center py-20"><span className="text-5xl">⚠️</span><p className="text-red-600 font-bold mt-4">{error}</p></div>;

  const payments = data?.payments || [];
  const totalDue = data?.total_due || 0;

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-brand-royalPurple">
        <div className="relative z-10"><span className="inline-block px-3 py-1 bg-brand-softLavender/20 text-brand-softLavender font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-softLavender/30">{t('parent.fee_status')}</span><h1 className="text-3xl md:text-4xl font-bold mb-2">{t('parent.payment_history')}</h1></div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4"><span className="text-[200px]">💳</span></div>
      </motion.div>

      {totalDue > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
          <span className="text-3xl">⚠️</span>
          <div><h3 className="font-bold text-red-700">{t('parent.outstanding_dues')}</h3><p className="text-2xl font-bold text-red-600 mt-1">৳{totalDue}</p><p className="text-sm text-red-500 mt-1">{t('parent.clear_dues')}</p></div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h2 className="text-lg font-bold text-brand-deepPlum">{t('parent.payment_records')}</h2><span className="text-sm text-gray-400">{payments.length} {payments.length === 1 ? 'record' : 'records'}</span></div>
        <div className="p-0">
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead><tr className="bg-gray-50 text-gray-500"><th className="p-4 font-semibold border-b border-gray-100">{t('parent.receipt_no')}</th><th className="p-4 font-semibold border-b border-gray-100">{t('common.date')}</th><th className="p-4 font-semibold border-b border-gray-100 text-center">{t('common.amount')}</th><th className="p-4 font-semibold border-b border-gray-100 text-center">{t('common.due')}</th><th className="p-4 font-semibold border-b border-gray-100">{t('parent.method')}</th></tr></thead>
                <tbody>{payments.map((p, idx) => (
                  <motion.tr key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer">
                    <td className="p-4"><span className="font-mono text-xs font-bold text-brand-tealCyan bg-brand-tealCyan/10 px-2 py-1 rounded">{p.receipt_number}</span></td>
                    <td className="p-4 font-medium text-gray-700">{p.date}</td>
                    <td className="p-4 text-center font-bold text-brand-deepPlum">৳{p.amount_paid}</td>
                    <td className="p-4 text-center">{p.due_amount > 0 ? <span className="text-red-600 font-bold">৳{p.due_amount}</span> : <span className="text-brand-mintGreen font-bold">{t('common.paid')}</span>}</td>
                    <td className="p-4 text-gray-600 font-medium">{p.method}</td>
                  </motion.tr>
                ))}</tbody>
              </table>
            </div>
          ) : (<div className="p-16 text-center text-gray-400"><span className="text-5xl">💰</span><p className="mt-3 font-semibold">{t('parent.no_payment_records')}</p></div>)}
        </div>
      </motion.div>

      <div className="space-y-4">{payments.map((p, idx) => (
        p.items && p.items.length > 0 && (
          <motion.div key={p.id + '-items'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50"><h3 className="font-bold text-brand-deepPlum text-sm">{t('parent.receipt_no')} {p.receipt_number} — {p.date}</h3></div>
            <div className="p-4"><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{p.items.map((item, iIdx) => <div key={iIdx} className="bg-gray-50 p-3 rounded-xl border border-gray-100"><p className="font-semibold text-gray-800 text-sm">{item.category_name}</p><p className="text-lg font-bold text-brand-deepPlum mt-1">৳{item.amount}</p>{item.month && <p className="text-xs text-gray-400 mt-0.5">{item.month}/{item.year}</p>}</div>)}</div></div>
          </motion.div>
        )
      ))}</div>
    </div>
  );
}