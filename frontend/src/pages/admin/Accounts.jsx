import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export default function Accounts() {
  // --- Security & Lock State ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [lockError, setLockError] = useState('');
  
  // আপনার ফাইন্যান্স পেজের সিক্রেট পাসওয়ার্ড
  const SECRET_PASSWORD = "admin1234";

  // --- Accounts Data States ---
  const [transactions, setTransactions] = useState([]);
  const [heads, setHeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  // ফিনান্সিয়াল সামারি
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });

  // ট্রানজেকশন ফর্ম স্টেট
  const [formData, setFormData] = useState({
    head: '',
    transaction_type: 'Income',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference_number: ''
  });

  // নতুন Head অ্যাড করার স্টেট
  const [headData, setHeadData] = useState({ name: '', head_type: 'Income', description: '' });

  // Report Generation States
  const [reportDates, setReportDates] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // মাসের প্রথম দিন
    end_date: new Date().toISOString().split('T')[0] // আজকের দিন
  });

  // --- Functions ---
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === SECRET_PASSWORD) {
      setIsUnlocked(true);
      fetchData();
    } else {
      setLockError('Incorrect Password! Access Denied.');
      setTimeout(() => setLockError(''), 3000);
    }
  };

  const fetchData = async () => {
    try {
      const [transRes, headsRes, paymentsRes] = await Promise.all([
        api.get('/accounts/transactions/'),
        api.get('/accounts/heads/'),
        api.get('/payments/').catch(() => ({ data: [] }))
      ]);
      
      const transData = transRes.data;
      setHeads(headsRes.data);

      const feeTransactions = paymentsRes.data.map(payment => ({
        id: `fee-${payment.id}`,
        date: payment.created_at || payment.payment_date,
        head_name: 'Student Fee Collection',
        transaction_type: 'Income',
        amount: payment.amount_paid,
        reference_number: payment.receipt_number,
        description: `Fee collected from ${payment.student_name} (${payment.student_id_str})`
      }));

      const combinedTransactions = [...transData, ...feeTransactions].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setTransactions(combinedTransactions);

      let totalIncome = 0;
      let totalExpense = 0;
      
      combinedTransactions.forEach(t => {
        if (t.transaction_type === 'Income') {
          totalIncome += Number(t.amount);
        } else {
          totalExpense += Number(t.amount);
        }
      });
      
      setSummary({ 
        income: totalIncome, 
        expense: totalExpense, 
        balance: totalIncome - totalExpense 
      });

    } catch (error) {
      console.error("Error fetching accounts data", error);
      showToast('Failed to load financial data.', 'error');
    }
  };

  const handleTransactionChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleHeadChange = (e) => setHeadData({ ...headData, [e.target.name]: e.target.value });
  const handleReportDateChange = (e) => setReportDates({ ...reportDates, [e.target.name]: e.target.value });

  const submitHead = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts/heads/', headData);
      showToast('Account Head added successfully!', 'success');
      setHeadData({ name: '', head_type: 'Income', description: '' });
      fetchData();
    } catch (error) {
      showToast('Failed to add Account Head.', 'error');
    }
  };

  const submitTransaction = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/accounts/transactions/', formData);
      showToast('Transaction recorded successfully!', 'success');
      setFormData({ ...formData, amount: '', description: '', reference_number: '' });
      fetchData();
    } catch (error) {
      showToast('Failed to record transaction.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      showToast("Generating report... Please wait.", "success");
      const response = await api.get('/accounts/report/pdf/', {
        params: { start_date: reportDates.start_date, end_date: reportDates.end_date },
        responseType: 'blob'
      });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Failed to generate report", error);
      showToast("Failed to generate report. Please check the dates.", "error");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  // ==========================================
  // VIEW 1: LOCK SCREEN
  // ==========================================
  if (!isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-brand-softLavender/20 text-brand-royalPurple rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-brand-deepPlum mb-2">Restricted Area</h2>
          <p className="text-sm text-gray-500 mb-6">Please enter the finance password to access accounts.</p>
          <form onSubmit={handleUnlock}>
            <input 
              type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan text-center text-lg tracking-widest mb-4 outline-none bg-gray-50 transition"
              autoFocus
            />
            {lockError && <p className="text-red-500 text-xs font-bold mb-4">{lockError}</p>}
            <button type="submit" className="w-full bg-brand-deepPlum hover:bg-brand-royalPurple text-white font-bold py-3 rounded-xl transition-colors shadow-md">Unlock Accounts</button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: MAIN ACCOUNTS DASHBOARD
  // ==========================================
  return (
    <div className="space-y-6 pb-10 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-lg font-bold text-white flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#0e5c3c]'}`}>
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Accounts & Finance</h1>
          <p className="text-gray-500 text-sm mt-1">Manage institutional income, expenses, and ledgers.</p>
        </div>
        <button onClick={() => {setIsUnlocked(false); setPassword('');}} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold transition text-sm flex items-center gap-2">
          <span>🔒</span> Lock Session
        </button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-mintGreen/20 text-[#0e5c3c] rounded-2xl flex items-center justify-center text-2xl">💰</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Income</p>
            <p className="text-2xl font-bold text-brand-deepPlum">৳{summary.income.toLocaleString()}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl">📉</div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Total Expense</p>
            <p className="text-2xl font-bold text-brand-deepPlum">৳{summary.expense.toLocaleString()}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-brand-deepPlum p-6 rounded-2xl shadow-sm flex items-center gap-4 text-white">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">🏦</div>
          <div>
            <p className="text-xs font-bold text-brand-softLavender uppercase tracking-wider mb-0.5">Net Balance</p>
            <p className="text-2xl font-bold text-brand-tealCyan">৳{summary.balance.toLocaleString()}</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-1 space-y-6">

          {/* Generate Report Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-brand-deepPlum p-6 rounded-2xl shadow-sm text-white">
            <h2 className="text-md font-bold mb-4 flex items-center gap-2"><span>📊</span> Generate Report</h2>
            <form onSubmit={handleGenerateReport} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-softLavender mb-1">From Date</label>
                  <input type="date" name="start_date" required value={reportDates.start_date} onChange={handleReportDateChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-softLavender mb-1">To Date</label>
                  <input type="date" name="end_date" required value={reportDates.end_date} onChange={handleReportDateChange} className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum font-bold transition-colors text-sm mt-2 flex justify-center items-center gap-2">
                <span>🖨️</span> Download PDF Report
              </button>
            </form>
          </motion.div>
          
          {/* Add Transaction Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Record Transaction</h2>
            <form onSubmit={submitTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Type *</label>
                  <select name="transaction_type" value={formData.transaction_type} onChange={handleTransactionChange} className={inputClass}>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Date *</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleTransactionChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Account Head *</label>
                <select name="head" required value={formData.head} onChange={handleTransactionChange} className={inputClass}>
                  <option value="">Select Head...</option>
                  {heads.filter(h => h.head_type === formData.transaction_type).map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount (৳) *</label>
                <input type="number" name="amount" required min="0" step="0.01" value={formData.amount} onChange={handleTransactionChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ref / Voucher Number</label>
                <input type="text" name="reference_number" value={formData.reference_number} onChange={handleTransactionChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea name="description" rows="2" value={formData.description} onChange={handleTransactionChange} className={inputClass}></textarea>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum font-bold transition-colors shadow-md mt-2">
                {isLoading ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </motion.div>

          {/* Add Account Head Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[#F5F0FF] p-6 rounded-2xl shadow-sm border border-brand-softLavender/30">
            <h2 className="text-md font-bold text-brand-deepPlum mb-4">Create New Account Head</h2>
            <form onSubmit={submitHead} className="space-y-3">
              <div>
                <input type="text" name="name" required placeholder="Head Name (e.g. Lab Equipment)" value={headData.name} onChange={handleHeadChange} className={inputClass} />
              </div>
              <div className="flex gap-3">
                <select name="head_type" value={headData.head_type} onChange={handleHeadChange} className={inputClass}>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
                <button type="submit" className="px-6 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors shadow-sm">Add</button>
              </div>
            </form>
          </motion.div>

        </div>

        {/* Right Column: Transaction Ledger */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-brand-deepPlum">Ledger Book</h2>
              <p className="text-xs text-gray-500 mt-1">Includes manual transactions & automatic fee collections</p>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[850px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[600px]">
              <thead className="bg-white sticky top-0 shadow-sm z-10">
                <tr className="text-gray-500">
                  <th className="p-4 border-b border-gray-100 font-semibold">Date</th>
                  <th className="p-4 border-b border-gray-100 font-semibold">Account Head & Details</th>
                  <th className="p-4 border-b border-gray-100 font-semibold">Ref/Voucher</th>
                  <th className="p-4 border-b border-gray-100 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-semibold">No transactions recorded yet.</td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-4 font-semibold text-gray-600 whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-brand-deepPlum block">{t.head_name}</span>
                        {t.description && <span className="text-xs text-gray-500 mt-0.5 block">{t.description}</span>}
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs">{t.reference_number || '-'}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <span className={`font-bold px-3 py-1 rounded-lg ${t.transaction_type === 'Income' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
                          {t.transaction_type === 'Income' ? '+' : '-'} ৳{Number(t.amount).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}