import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader, DollarSign, Users, Building2, Receipt, Download, Edit, X } from 'lucide-react';
import api from '../../api/axios';

export default function PayrollManagement() {
  const [tab, setTab] = useState('salaries');
  const [profiles, setProfiles] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Generate salary form
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genBonus, setGenBonus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Edit salary modal
  const [editSalary, setEditSalary] = useState(null);
  const [editBonusVal, setEditBonusVal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Statement states
  const [stmtMonth, setStmtMonth] = useState('');
  const [stmtYear, setStmtYear] = useState('');

  // Filter states
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const fetchProfiles = async () => {
    try {
      const res = await api.get('/payroll/profiles/');
      setProfiles(res.data);
    } catch (err) {
      console.error("Error fetching profiles", err);
    }
  };

  const fetchSalaries = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/payroll/salaries/?month=${filterMonth}&year=${filterYear}`);
      setSalaries(res.data);
    } catch (err) {
      console.error("Error fetching salaries", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'profiles') fetchProfiles();
    if (tab === 'salaries') fetchSalaries();
  }, [tab, filterMonth, filterYear]);

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    setMsg({ type: '', text: '' });
    try {
      const payload = {
        month: genMonth,
        year: genYear,
        bonus: genBonus ? parseFloat(genBonus) : 0,
      };
      const res = await api.post('/payroll/generate-salary/', payload);
      setMsg({ type: 'success', text: res.data.message });
      setGenBonus('');
      setFilterMonth(genMonth);
      setFilterYear(genYear);
      setTab('salaries');
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to generate payroll. Please try again.' });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    }
  };

  const handleDownloadPayslip = async (salaryId) => {
    try {
      const res = await api.get(`/payroll/payslip/${salaryId}/pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      console.error("Error downloading payslip", err);
    }
  };

  const markAsPaid = async (salaryId) => {
    try {
      await api.patch(`/payroll/salaries/${salaryId}/`, { payment_status: 'Paid' });
      fetchSalaries();
    } catch (err) {
      console.error("Error updating payment status", err);
    }
  };

  const openEditModal = (salary) => {
    setEditSalary(salary);
    setEditBonusVal(salary.bonus ? parseFloat(salary.bonus).toString() : '');
  };

  const handleSaveBonus = async () => {
    if (!editSalary) return;
    setIsSaving(true);
    try {
      const bonusAmount = editBonusVal ? parseFloat(editBonusVal) : 0;
      const updated = {
        ...editSalary,
        bonus: bonusAmount.toString(),
      };
      const res = await api.patch(`/payroll/salaries/${editSalary.id}/`, { bonus: bonusAmount.toString() });
      fetchSalaries();
      setEditSalary(null);
      setEditBonusVal('');
      setMsg({ type: 'success', text: `Bonus updated for ${editSalary.employee_name}. Net payable: ${parseFloat(res.data.net_payable || 0).toFixed(2)}` });
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update bonus.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadCollectiveStmt = async () => {
    const params = new URLSearchParams();
    if (stmtMonth) params.append('month', stmtMonth);
    if (stmtYear) params.append('year', stmtYear);
    try {
      const res = await api.get(`/payroll/collective-statement/pdf/?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      console.error("Error downloading collective statement", err);
      alert("Failed to download statement PDF.");
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const inputClass = "px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";

  const totalPayable = salaries.reduce((sum, s) => sum + (parseFloat(s.net_payable) || 0), 0);
  const totalPaid = salaries.filter(s => s.payment_status === 'Paid').reduce((sum, s) => sum + (parseFloat(s.net_payable) || 0), 0);
  const totalUnpaid = salaries.filter(s => s.payment_status === 'Unpaid').reduce((sum, s) => sum + (parseFloat(s.net_payable) || 0), 0);

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] p-8 rounded-3xl shadow-lg border border-brand-royalPurple text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            HR & Finance
          </span>
          <h1 className="text-3xl font-bold mb-2">Payroll Management</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Generate monthly salaries, add bonuses, view payroll summaries, and download professional payslips.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">💵</span>
        </div>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-bold text-sm shadow-sm ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46] border border-[#34D399]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
        {[
          { key: 'salaries', label: 'Salary Records', icon: <Receipt className="w-3.5 h-3.5" /> },
          { key: 'generate', label: 'Generate Payroll', icon: <DollarSign className="w-3.5 h-3.5" /> },
          { key: 'profiles', label: 'Employee Profiles', icon: <Users className="w-3.5 h-3.5" /> },
          { key: 'statement', label: 'Salary Statement', icon: <FileText className="w-3.5 h-3.5" /> },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? 'bg-brand-tealCyan text-brand-deepPlum shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ───── Salary Records Tab ───── */}
      {tab === 'salaries' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[ 
              { label: 'Total Payable', value: `৳ ${totalPayable.toFixed(2)}`, color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <DollarSign className="w-5 h-5" /> },
              { label: 'Paid', value: `৳ ${totalPaid.toFixed(2)}`, color: 'bg-green-50 text-green-700 border-green-200', icon: <Building2 className="w-5 h-5" /> },
              { label: 'Unpaid', value: `৳ ${totalUnpaid.toFixed(2)}`, color: 'bg-red-50 text-red-600 border-red-200', icon: <Receipt className="w-5 h-5" /> },
            ].map((card, i) => (
              <div key={i} className={`${card.color} p-4 rounded-xl border flex items-center gap-3`}>
                {card.icon}
                <div>
                  <p className="text-xs font-semibold opacity-70">{card.label}</p>
                  <p className="text-lg font-bold">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className={inputClass}>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className={inputClass}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={fetchSalaries} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">Refresh</button>
          </div>

          {/* Salary Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[1000px]">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="p-3 font-semibold">Employee</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold text-center">Month/Year</th>
                    <th className="p-3 font-semibold text-right">Bonus</th>
                    <th className="p-3 font-semibold text-right">Gross Pay</th>
                    <th className="p-3 font-semibold text-right">Deductions</th>
                    <th className="p-3 font-semibold text-right">Net Payable</th>
                    <th className="p-3 font-semibold text-center">Status</th>
                    <th className="p-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="9" className="text-center py-10"><Loader className="w-5 h-5 animate-spin mx-auto text-gray-400" /></td></tr>
                  ) : salaries.length === 0 ? (
                    <tr><td colSpan="9" className="text-center py-10 text-gray-400">No salary records found for this period.</td></tr>
                  ) : (
                    salaries.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                        <td className="p-3 font-semibold text-gray-800">{s.employee_name}</td>
                        <td className="p-3 text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${s.employee_type === 'TEACHER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {s.employee_type}
                          </span>
                        </td>
                        <td className="p-3 text-center text-gray-600">{months[s.month - 1]} {s.year}</td>
                        <td className="p-3 text-right text-gray-700">{parseFloat(s.bonus || 0).toFixed(2)}</td>
                        <td className="p-3 text-right text-gray-700">{parseFloat(s.gross_pay || 0).toFixed(2)}</td>
                        <td className="p-3 text-right text-red-500">{parseFloat(s.total_deductions || 0).toFixed(2)}</td>
                        <td className="p-3 text-right font-bold text-brand-tealCyan">{parseFloat(s.net_payable || 0).toFixed(2)}</td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${s.payment_status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {s.payment_status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditModal(s)} className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100" title="Edit Bonus">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDownloadPayslip(s.id)} className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100" title="Download Payslip">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {s.payment_status === 'Unpaid' && (
                              <button onClick={() => markAsPaid(s.id)} className="text-[10px] font-bold px-2 py-1 rounded bg-green-50 text-green-600 hover:bg-green-100" title="Mark as Paid">Paid?</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* ───── Generate Payroll Tab ───── */}
      {tab === 'generate' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto text-center">
          <div className="w-16 h-16 bg-brand-tealCyan/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-brand-tealCyan" />
          </div>
          <h2 className="text-xl font-bold text-brand-deepPlum mb-2">Generate Monthly Payroll</h2>
          <p className="text-gray-500 text-sm mb-6">
            Auto-calculate salary records for all active employees. Optionally add a fixed bonus amount for all.
          </p>
          <div className="flex gap-3 justify-center mb-4">
            <select value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))} className={inputClass}>
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select value={genYear} onChange={(e) => setGenYear(Number(e.target.value))} className={inputClass}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">🎁 Festival Bonus (optional)</label>
            <input
              type="number"
              value={genBonus}
              onChange={(e) => setGenBonus(e.target.value)}
              placeholder="e.g. 5000 (0 = no bonus)"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm text-center bg-amber-50"
              min="0"
              step="any"
            />
            <p className="text-xs text-gray-400 mt-1">Leave 0 or empty for no bonus. Same amount will be added to all employees.</p>
          </div>
          <button onClick={handleGeneratePayroll} disabled={isGenerating} className={`w-full py-3 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2 ${isGenerating ? 'bg-gray-400 text-white' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}>
            {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            {isGenerating ? 'Generating...' : `Generate Payroll${genBonus && parseFloat(genBonus) > 0 ? ` with ৳${genBonus} Bonus` : ''}`}
          </button>
          <p className="text-xs text-gray-400 mt-3">Employees with existing salary for this month will be skipped.</p>
        </motion.div>
      )}

      {/* ───── Edit Bonus Modal ───── */}
      <AnimatePresence>
        {editSalary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-brand-deepPlum">Edit Bonus</h3>
                <button onClick={() => { setEditSalary(null); setEditBonusVal(''); }} className="text-gray-400 hover:text-red-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Employee:</strong> {editSalary.employee_name}</p>
                  <p><strong>Month:</strong> {months[editSalary.month - 1]} {editSalary.year}</p>
                  <p><strong>Current Gross:</strong> ৳ {parseFloat(editSalary.gross_pay || 0).toFixed(2)}</p>
                  <p><strong>Current Net:</strong> ৳ {parseFloat(editSalary.net_payable || 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">🎁 Bonus Amount (BDT)</label>
                  <input
                    type="number"
                    value={editBonusVal}
                    onChange={(e) => setEditBonusVal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm text-center bg-amber-50"
                    placeholder="e.g. 5000"
                    min="0"
                    step="any"
                  />
                </div>
                <button
                  onClick={handleSaveBonus}
                  disabled={isSaving}
                  className={`w-full py-3 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2 ${isSaving ? 'bg-gray-400 text-white' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}
                >
                  {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Bonus & Recalculate'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ───── Employee Profiles Tab ───── */}
      {tab === 'profiles' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[900px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="p-3 font-semibold">Employee</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold text-right">Basic Salary</th>
                  <th className="p-3 font-semibold text-right">House Rent</th>
                  <th className="p-3 font-semibold text-right">Medical</th>
                  <th className="p-3 font-semibold text-right">Transport</th>
                  <th className="p-3 font-semibold text-right">Total Allowances</th>
                  <th className="p-3 font-semibold text-center">PF%</th>
                  <th className="p-3 font-semibold text-center">Tax%</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 ? (
                  <tr><td colSpan="10" className="text-center py-10 text-gray-400">No payroll profiles found. Add profiles from Teachers or Staffs pages.</td></tr>
                ) : (
                  profiles.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-3 font-semibold text-gray-800">{p.employee_name}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${p.employee_type === 'TEACHER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                          {p.employee_type_display}
                        </span>
                      </td>
                      <td className="p-3 text-right">{parseFloat(p.basic_salary || 0).toFixed(2)}</td>
                      <td className="p-3 text-right">{parseFloat(p.house_rent || 0).toFixed(2)}</td>
                      <td className="p-3 text-right">{parseFloat(p.medical_allowance || 0).toFixed(2)}</td>
                      <td className="p-3 text-right">{parseFloat(p.transport_allowance || 0).toFixed(2)}</td>
                      <td className="p-3 text-right font-bold text-green-600">{parseFloat(p.total_allowances || 0).toFixed(2)}</td>
                      <td className="p-3 text-center">{parseFloat(p.provident_fund_pct || 0)}%</td>
                      <td className="p-3 text-center">{parseFloat(p.tax_pct || 0)}%</td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ───── Salary Statement Tab ───── */}
      {tab === 'statement' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-brand-deepPlum mb-4">Institution Salary Statement</h2>
          <p className="text-gray-500 text-sm mb-4">Generate a collective salary statement for all employees. Filter by month, year, or both.</p>
          
          <div className="flex gap-3 mb-4 flex-wrap items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Month (optional)</label>
              <select
                value={stmtMonth}
                onChange={(e) => setStmtMonth(e.target.value)}
                className={inputClass}
              >
                <option value="">All Months</option>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Year (optional)</label>
              <select
                value={stmtYear}
                onChange={(e) => setStmtYear(e.target.value)}
                className={inputClass}
              >
                <option value="">All Years</option>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              onClick={handleDownloadCollectiveStmt}
              className="px-4 py-2.5 rounded-xl bg-brand-royalPurple text-white hover:bg-brand-deepPlum transition-colors font-bold text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Institution Statement PDF
            </button>
          </div>
          <div className="p-6 bg-gray-50 rounded-xl text-center">
            <div className="w-16 h-16 bg-brand-tealCyan/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-brand-tealCyan" />
            </div>
            <p className="text-gray-600 text-sm">
              This will generate a comprehensive A3 landscape PDF containing:
            </p>
            <div className="flex justify-center gap-8 mt-3 text-xs text-gray-500">
              <span>✅ All Teachers & Staff</span>
              <span>✅ Full Salary Breakdown</span>
              <span>✅ Gross, Deductions & Net</span>
              <span>✅ Grand Total Summary</span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              {!stmtMonth && !stmtYear 
                ? 'Leave filters empty for ALL records, or select Month and/or Year.' 
                : `Statement: ${stmtMonth ? months[Number(stmtMonth)-1] : ''} ${stmtYear || ''}`}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}