import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // এই লাইনটি যোগ করা হয়েছে
import api from '../../api/axios';

export default function CollectFee() {
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();

  // মাল্টিপল ক্যাটাগরি সিলেক্ট করার জন্য নতুন স্টেট
  const [selectedCategories, setSelectedCategories] = useState([]);

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
      setRecentPayments(payRes.data.slice(0, 10)); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ক্যাটাগরি টগল (Select/Deselect) করার ফাংশন
  const toggleCategory = (category) => {
    const isSelected = selectedCategories.find(c => c.id === category.id);
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // টোটাল অ্যামাউন্ট হিসাব করা
  const totalAmount = selectedCategories.reduce((sum, cat) => sum + Number(cat.amount), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedCategories.length === 0) {
      setMsg({ type: 'error', text: 'Please select at least one fee category.' });
      return;
    }

    setIsLoading(true);
    setMsg({ type: '', text: '' });

    try {
      // Promise.all এর বদলে for...of লুপ ব্যবহার করা হলো
      // এতে পেমেন্টগুলো একটার পর একটা সেভ হবে এবং রিসিট নাম্বার ডুপ্লিকেট হবে না
      for (const cat of selectedCategories) {
        await api.post('/payments/', {
          student: formData.student,
          fee_category: cat.id,
          amount_paid: cat.amount,
          method: formData.method,
          month: formData.month,
          year: formData.year,
          notes: formData.notes
        });
      }

      setMsg({ type: 'success', text: `Successfully collected ৳${totalAmount} for ${selectedCategories.length} categories!` });
      
      // ফর্ম রিসেট করা
      setFormData({
        student: '', method: 'Cash', month: currentMonth, year: currentYear, notes: ''
      });
      setSelectedCategories([]);
      fetchInitialData(); 
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);

    } catch (error) {
      console.error(error);
      setMsg({ type: 'error', text: 'Failed to process payments. Check all inputs.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan text-sm transition-colors bg-gray-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="space-y-6 relative pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-brand-deepPlum">Collect Fee</h1>
        <p className="text-gray-500 text-sm mt-1">Process single or multiple fee payments at once.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Payment Form */}
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

            {/* --- মাল্টি-সিলেক্ট চেকবক্স লিস্ট --- */}
            <div>
              <label className={labelClass}>Select Fee Categories *</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50">
                {categories.length === 0 && <p className="text-xs text-gray-400 p-2">No categories found.</p>}
                {categories.map(c => (
                  <label key={c.id} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${selectedCategories.find(s => s.id === c.id) ? 'bg-brand-tealCyan/10 border-brand-tealCyan shadow-sm' : 'bg-white border-transparent hover:border-gray-200'}`}>
                    <input
                      type="checkbox"
                      checked={!!selectedCategories.find(s => s.id === c.id)}
                      onChange={() => toggleCategory(c)}
                      className="w-4 h-4 text-brand-tealCyan rounded border-gray-300 focus:ring-brand-tealCyan"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">{c.name}</span>
                      <span className="text-sm font-bold text-brand-tealCyan">৳ {c.amount}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* --- লাইভ টোটাল অ্যামাউন্ট বিল --- */}
            <div className="bg-[#F5F0FF] border border-brand-softLavender/30 p-4 rounded-xl flex justify-between items-center">
              <span className="font-bold text-brand-deepPlum">Total Payable:</span>
              <span className="text-2xl font-bold text-brand-royalPurple">৳ {totalAmount}</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className={labelClass}>Payment Method *</label>
                <select name="method" value={formData.method} onChange={handleChange} className={inputClass}>
                  <option value="Cash">Cash</option>
                  <option value="Online">Online / Mobile Banking</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
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

            <button type="submit" disabled={isLoading || selectedCategories.length === 0} className={`w-full py-3.5 rounded-xl text-brand-deepPlum font-bold transition-colors shadow-md mt-2 flex items-center justify-center gap-2 ${isLoading || selectedCategories.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab]'}`}>
              <span>{isLoading ? 'Processing...' : `Collect ৳${totalAmount}`}</span>
              {!isLoading && <span>💳</span>}
            </button>
          </form>
        </motion.div>

        {/* Right Column: Recent Transactions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-[#F5F0FF] flex justify-between items-center">
            <h2 className="text-lg font-bold text-brand-deepPlum">Recent Transactions</h2>
            <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-brand-royalPurple shadow-sm border border-gray-100">Live Updates</span>
          </div>
          
          <div className="overflow-x-auto p-4 max-h-[700px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="text-xs uppercase text-gray-500 border-b border-gray-100 tracking-wider">
                  <th className="p-3 font-semibold">Receipt No</th>
                  <th className="p-3 font-semibold">Student Name</th>
                  <th className="p-3 font-semibold">Fee Type</th>
                  <th className="p-3 font-semibold">Paid</th>
                  <th className="p-3 font-semibold">Method</th>
                  <th className="p-3 font-semibold text-right">Date</th>
                  <th className="p-3 font-semibold text-center print:hidden">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-10 text-gray-400 font-semibold">No recent transactions found.</td></tr>
                ) : (
                  recentPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-3 font-bold text-brand-royalPurple text-sm">{payment.receipt_number}</td>
                      <td className="p-3">
                        <p className="font-bold text-brand-deepPlum text-sm">{payment.student_name}</p>
                        <p className="text-xs text-gray-500 font-medium">{payment.student_id_str}</p>
                      </td>
                      <td className="p-3 text-sm font-semibold text-gray-600">
                        {payment.fee_category_name}
                        <span className="block text-[10px] text-gray-400">{payment.month}, {payment.year}</span>
                      </td>
                      <td className="p-3 font-bold text-[#0e5c3c]">৳ {payment.amount_paid}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${payment.method === 'Cash' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {payment.method}
                        </span>
                      </td>
                      <td className="p-3 text-right text-xs text-gray-500 font-medium">
                        {new Date(payment.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="p-3 text-center">
                        <Link to={`/admin/receipt/${payment.id}`} className="text-brand-tealCyan hover:text-[#4bc2ab] font-bold text-lg transition-colors p-1" title="Print Receipt">
                          🖨️
                        </Link>
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