import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function FeeReports() {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [showOnlyDues, setShowOnlyDues] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/');
        setPayments(res.data);
      } catch (error) {
        console.error("Failed to fetch payments", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth ? payment.month === filterMonth : true;
    const matchesDues = showOnlyDues ? Number(payment.due_amount) > 0 : true;
    
    return matchesSearch && matchesMonth && matchesDues;
  });

  const totalBilled = filteredPayments.reduce((sum, p) => sum + Number(p.total_amount || p.amount_paid + p.due_amount), 0);
  const totalCollected = filteredPayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const totalDues = filteredPayments.reduce((sum, p) => sum + Number(p.due_amount), 0);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6 relative pb-10">
      
      {/* Header & Stats */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Fee Reports & Dues</h1>
          <p className="text-gray-500 text-sm mt-1">Track total collections, payment history, and pending dues.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-100 text-center flex-1 md:flex-none">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Total Billed</p>
            <p className="text-2xl font-bold text-blue-700">৳ {totalBilled}</p>
          </div>
          <div className="bg-brand-mintGreen/20 px-6 py-3 rounded-xl border border-brand-mintGreen/30 text-center flex-1 md:flex-none">
            <p className="text-xs font-bold text-[#0e5c3c] uppercase tracking-wider mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-[#0e5c3c]">৳ {totalCollected}</p>
          </div>
          <div className="bg-red-50 px-6 py-3 rounded-xl border border-red-100 text-center flex-1 md:flex-none">
            <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Total Dues</p>
            <p className="text-2xl font-bold text-red-600">৳ {totalDues}</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input type="text" placeholder="Search by receipt or student name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white" />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
        
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white w-full md:w-48">
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <label className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border w-full md:w-auto shrink-0 transition-colors ${showOnlyDues ? 'bg-red-50 border-red-200' : 'bg-brand-softLavender/10 border-brand-softLavender/20'}`}>
          <input type="checkbox" checked={showOnlyDues} onChange={() => setShowOnlyDues(!showOnlyDues)} className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-600" />
          <span className={`text-sm font-bold ${showOnlyDues ? 'text-red-700' : 'text-brand-deepPlum'}`}>Show Only Dues</span>
        </label>
      </motion.div>

      {/* Data Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto p-4 min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 tracking-wider bg-gray-50/50">
                <th className="p-4 font-semibold rounded-tl-xl">Receipt No</th>
                <th className="p-4 font-semibold">Student Name</th>
                <th className="p-4 font-semibold">Fee Type</th>
                <th className="p-4 font-semibold">Total Bill</th>
                <th className="p-4 font-semibold">Amount Paid</th>
                <th className="p-4 font-semibold">Due Amount</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-center rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="text-center py-10 text-gray-400 font-semibold">Loading reports...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-gray-400 font-semibold">No records found matching your filters.</td></tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td className="p-4 font-bold text-brand-royalPurple text-sm">{payment.receipt_number}</td>
                    <td className="p-4">
                      <p className="font-bold text-brand-deepPlum text-sm">{payment.student_name}</p>
                      <p className="text-xs text-gray-500 font-medium">{payment.student_id_str}</p>
                    </td>
                    <td className="p-4 text-sm font-semibold text-gray-600">
                      {payment.fee_category_name}
                      <span className="block text-[10px] text-gray-400">{payment.month}, {payment.year}</span>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">৳ {payment.total_amount || payment.amount_paid}</td>
                    <td className="p-4 font-bold text-[#0e5c3c]">৳ {payment.amount_paid}</td>
                    <td className="p-4">
                      {Number(payment.due_amount) > 0 ? (
                        <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase">৳ {payment.due_amount}</span>
                      ) : (
                        <span className="text-gray-400 font-bold">-</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500 font-medium">
                      {new Date(payment.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="p-4 text-center flex justify-center gap-2">
                        <a href={`${import.meta.env.VITE_API_BASE_URL}/payments/receipt/${payment.receipt_number}/pdf/`} target="_blank" rel="noopener noreferrer" className="text-brand-tealCyan hover:text-[#4bc2ab] font-bold text-lg transition-colors p-2 inline-block bg-white shadow-sm border border-gray-100 rounded-lg hover:shadow-md" title="Print Receipt">
                          🖨️
                        </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}