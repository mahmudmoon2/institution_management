import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

export default function CollectFee() {
  // Tabs State
  const [activeTab, setActiveTab] = useState('collect'); // 'collect' | 'all'

  // Data States
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Search & Edit States
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [payingAmount, setPayingAmount] = useState(''); // নতুন স্টেট: বর্তমানে কত টাকা দিচ্ছে
  
  const [formData, setFormData] = useState({
    student: '',
    method: 'Cash',
    month: currentMonth,
    year: currentYear,
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [stuRes, catRes, payRes] = await Promise.all([
        api.get('/students/'),
        api.get('/payments/fee-categories/'),
        api.get('/payments/')
      ]);
      setStudents(stuRes.data);
      setCategories(catRes.data);
      setAllPayments(payRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // --- Collect Fee Logic ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (category) => {
    const isSelected = selectedCategories.find(c => c.id === category.id);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const totalBill = selectedCategories.reduce((sum, cat) => sum + Number(cat.amount), 0);

  // ক্যাটাগরি সিলেক্ট করলে অটোমেটিক্যালি Paying Amount আপডেট হবে
  useEffect(() => {
    setPayingAmount(totalBill);
  }, [totalBill]);

  const dueAmount = totalBill - Number(payingAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      setMsg({ type: 'error', text: 'Please select at least one fee category.' });
      return;
    }
    if (Number(payingAmount) < 0 || Number(payingAmount) > totalBill) {
      setMsg({ type: 'error', text: 'Invalid paying amount.' });
      return;
    }

    setIsLoading(true);
    setMsg({ type: '', text: '' });
    
    try {
      const payload = {
        student: formData.student,
        method: formData.method,
        month: formData.month,
        year: formData.year,
        notes: formData.notes,
        total_bill: totalBill,
        amount_paid: Number(payingAmount),
        due_amount: dueAmount,
        categories: selectedCategories.map(c => ({ id: c.id, amount: c.amount }))
      };

      await api.post('/payments/bulk-collect/', payload);
      
      setMsg({ type: 'success', text: `Successfully collected ৳${payingAmount}! ${dueAmount > 0 ? `(Due: ৳${dueAmount})` : ''}` });
      setFormData({ student: '', method: 'Cash', month: currentMonth, year: currentYear, notes: '' });
      setSelectedCategories([]);
      setPayingAmount('');
      fetchInitialData();
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    } catch (error) {
      console.error(error);
      setMsg({ type: 'error', text: 'Failed to process payments. Check all inputs.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- All Receipts Logic ---
  const filteredPayments = allPayments.filter(p => 
    p.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (payment) => {
    setEditData(payment);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/payments/${editData.id}/`, {
        amount_paid: editData.amount_paid,
        due_amount: editData.due_amount,
        method: editData.method,
        month: editData.month,
        year: editData.year,
        notes: editData.notes
      });
      setIsEditModalOpen(false);
      fetchInitialData(); 
      alert("Receipt updated successfully!");
    } catch (error) {
      console.error("Failed to update receipt", error);
      alert("Failed to update receipt. Please try again.");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan text-sm transition-colors bg-gray-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6 relative pb-10">
      
      {/* Header & Tabs */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Fee Management</h1>
          <p className="text-gray-500 text-sm mt-1">Process payments, partial dues, and manage receipts.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('collect')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'collect' ? 'bg-white text-brand-royalPurple shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Collect Fee
          </button>
          <button onClick={() => setActiveTab('all')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'all' ? 'bg-white text-brand-royalPurple shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            All Receipts
          </button>
        </div>
      </motion.div>

      {/* ----------- TAB 1: COLLECT FEE ----------- */}
      {activeTab === 'collect' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
            <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Payment Details</h2>
            {msg.text && (
              <div className={`p-3 rounded-xl mb-4 text-sm font-bold ${msg.type === 'success' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-50 text-red-600'}`}>
                {msg.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={labelClass}>Search & Select Student *</label>
                <select name="student" required value={formData.student} onChange={handleChange} className={inputClass}>
                  <option value="">-- Select Student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.student_id} - {s.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className={labelClass}>Select Fee Categories *</label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50">
                  {categories.length === 0 && <p className="text-xs text-gray-400 p-2">No categories found.</p>}
                  {categories.map(c => (
                    <label key={c.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedCategories.find(s => s.id === c.id) ? 'bg-brand-tealCyan/10 border-brand-tealCyan shadow-sm' : 'bg-white border-transparent hover:border-gray-200'}`}>
                      <input type="checkbox" checked={!!selectedCategories.find(s => s.id === c.id)} onChange={() => toggleCategory(c)} className="w-4 h-4 text-brand-tealCyan rounded border-gray-300 focus:ring-brand-tealCyan" />
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">{c.name}</span>
                        <span className="text-sm font-bold text-brand-tealCyan">৳ {c.amount}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Partial Payment Calculation Box */}
              <div className="bg-[#F5F0FF] border border-brand-softLavender/30 p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-brand-deepPlum">Total Bill:</span>
                  <span className="text-lg font-bold text-gray-700">৳ {totalBill}</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-brand-softLavender/50">
                  <span className="font-bold text-[#0e5c3c] text-sm">Paying Now:</span>
                  <input 
                    type="number" 
                    value={payingAmount} 
                    onChange={(e) => setPayingAmount(e.target.value)} 
                    className="w-28 text-right font-bold text-lg text-[#0e5c3c] border-b border-gray-200 focus:outline-none focus:border-brand-tealCyan" 
                    max={totalBill}
                    min={0}
                    required
                  />
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-brand-softLavender/40">
                  <span className="font-bold text-red-600">Due Amount:</span>
                  <span className="text-lg font-bold text-red-600">৳ {dueAmount > 0 ? dueAmount : 0}</span>
                </div>
              </div>

              <div>
                <label className={labelClass}>Payment Method *</label>
                <select name="method" value={formData.method} onChange={handleChange} className={inputClass}>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / Mobile Banking</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>For Month</label>
                  <select name="month" value={formData.month} onChange={handleChange} className={inputClass}>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Year</label>
                  <input type="number" name="year" value={formData.year} onChange={handleChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Additional Notes (Optional)</label>
                <textarea name="notes" rows="2" value={formData.notes} onChange={handleChange} className={inputClass} placeholder="Transaction IDs or notes..."></textarea>
              </div>
              
              <button type="submit" disabled={isLoading || selectedCategories.length === 0} className={`w-full py-3.5 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md flex items-center justify-center gap-2 ${isLoading || selectedCategories.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>
                <span>{isLoading ? 'Processing...' : `Collect ৳${payingAmount}`}</span>
                {!isLoading && <span>💳</span>}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-[#F5F0FF] flex justify-between items-center">
              <h2 className="text-lg font-bold text-brand-deepPlum">Recent Transactions</h2>
              <button onClick={() => setActiveTab('all')} className="text-xs font-bold bg-white px-3 py-1 rounded-full text-brand-royalPurple shadow-sm border border-gray-100 hover:bg-gray-50 transition">View All ➡️</button>
            </div>
            <div className="overflow-x-auto p-4 max-h-[700px] overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 tracking-wider">
                    <th className="p-3 font-semibold">Receipt No</th>
                    <th className="p-3 font-semibold">Student Name</th>
                    <th className="p-3 font-semibold">Bill / Paid</th>
                    <th className="p-3 font-semibold">Due</th>
                    <th className="p-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.slice(0, 10).map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-3 font-bold text-brand-royalPurple text-sm">{payment.receipt_number}</td>
                      <td className="p-3">
                        <p className="font-bold text-brand-deepPlum text-sm">{payment.student_name}</p>
                      </td>
                      <td className="p-3 text-sm font-semibold">
                        <span className="text-gray-600 block">Bill: ৳{payment.total_amount || payment.amount_paid}</span>
                        <span className="text-[#0e5c3c]">Paid: ৳{payment.amount_paid}</span>
                      </td>
                      <td className="p-3 font-bold text-red-600">
                         {Number(payment.due_amount) > 0 ? `৳${payment.due_amount}` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <a href={`${import.meta.env.VITE_API_BASE_URL}/payments/receipt/${payment.receipt_number}/pdf/`} target="_blank" rel="noopener noreferrer" className="text-brand-tealCyan hover:text-[#4bc2ab] font-bold text-lg">🖨️</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* ----------- TAB 2: ALL RECEIPTS ----------- */}
      {activeTab === 'all' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b pb-4">
            <h2 className="text-xl font-bold text-brand-deepPlum">All Receipts History</h2>
            <input type="text" placeholder="🔍 Search by Receipt No or Student Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-96 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-royalPurple focus:ring-1 focus:ring-brand-royalPurple text-sm bg-gray-50" />
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-200 tracking-wider">
                  <th className="p-3 font-semibold">Receipt No</th>
                  <th className="p-3 font-semibold">Student Name</th>
                  <th className="p-3 font-semibold">Total Bill</th>
                  <th className="p-3 font-semibold">Paid</th>
                  <th className="p-3 font-semibold">Due</th>
                  <th className="p-3 font-semibold text-right">Date</th>
                  <th className="p-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-semibold">No receipts found matching "{searchTerm}".</td></tr>
                ) : (
                  filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                      <td className="p-3 font-bold text-brand-royalPurple text-sm">{payment.receipt_number}</td>
                      <td className="p-3">
                        <p className="font-bold text-brand-deepPlum text-sm">{payment.student_name}</p>
                        <p className="text-xs text-gray-500">{payment.student_id_str}</p>
                      </td>
                      <td className="p-3 font-semibold text-gray-700">৳ {payment.total_amount || payment.amount_paid}</td>
                      <td className="p-3 font-bold text-[#0e5c3c]">৳ {payment.amount_paid}</td>
                      <td className="p-3 font-bold text-red-600">
                        {Number(payment.due_amount) > 0 ? (
                            <span className="bg-red-100 px-2 py-1 rounded">৳ {payment.due_amount}</span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-right text-xs text-gray-500 font-medium">
                        {new Date(payment.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 text-center flex justify-center gap-3">
                        <button onClick={() => handleEditClick(payment)} className="text-blue-500 hover:text-blue-700 text-sm font-bold">✏️ Edit</button>
                        <a href={`${import.meta.env.VITE_API_BASE_URL}/payments/receipt/${payment.receipt_number}/pdf/`} target="_blank" rel="noopener noreferrer" className="text-brand-tealCyan hover:text-[#4bc2ab] font-bold text-lg">🖨️</a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ----------- EDIT MODAL ----------- */}
      <AnimatePresence>
        {isEditModalOpen && editData && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4 border-b pb-3">
                <h2 className="text-xl font-bold text-brand-deepPlum">Update Receipt: {editData.receipt_number}</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
              </div>
              <form onSubmit={handleUpdatePayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Amount Paid (৳)</label>
                    <input type="number" name="amount_paid" value={editData.amount_paid} onChange={handleEditChange} className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Due Amount (৳)</label>
                    <input type="number" name="due_amount" value={editData.due_amount} onChange={handleEditChange} className={inputClass} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Month</label>
                    <select name="month" value={editData.month} onChange={handleEditChange} className={inputClass}>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input type="number" name="year" value={editData.year} onChange={handleEditChange} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Payment Method</label>
                  <select name="method" value={editData.method} onChange={handleEditChange} className={inputClass}>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online / Mobile Banking</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea name="notes" rows="2" value={editData.notes || ''} onChange={handleEditChange} className={inputClass}></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-1/2 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="w-1/2 py-2.5 rounded-xl bg-brand-royalPurple text-white font-bold hover:bg-opacity-90">Update Receipt</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}