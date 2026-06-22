import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, Briefcase, Plus, Trash2 } from 'lucide-react';
import api from '../../api/axios';

export default function StaffSetup() {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Department form
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });

  // Designation form
  const [desigForm, setDesigForm] = useState({ title: '', department: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        api.get('/staffs/departments/'),
        api.get('/staffs/designations/')
      ]);
      setDepartments(deptRes.data);
      setDesignations(desigRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // ───── Department handlers ─────
  const handleDeptChange = (e) => {
    setDeptForm({ ...deptForm, [e.target.name]: e.target.value });
  };

  const addDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/staffs/departments/', deptForm);
      setMsg({ type: 'success', text: 'Department added successfully!' });
      setDeptForm({ name: '', description: '' });
      fetchData();
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to add department. It might already exist.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const deleteDepartment = async (id) => {
    if (!window.confirm("Delete this department? Existing staff in this department will be unlinked.")) return;
    try {
      await api.delete(`/staffs/departments/${id}/`);
      fetchData();
    } catch (error) {
      alert("Cannot delete this department. It may be linked to designations.");
    }
  };

  // ───── Designation handlers ─────
  const handleDesigChange = (e) => {
    setDesigForm({ ...desigForm, [e.target.name]: e.target.value });
  };

  const addDesignation = async (e) => {
    e.preventDefault();
    if (!desigForm.title.trim() || !desigForm.department) return;
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post('/staffs/designations/', desigForm);
      setMsg({ type: 'success', text: 'Designation added successfully!' });
      setDesigForm({ title: '', department: '' });
      fetchData();
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to add designation. It might already exist.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const deleteDesignation = async (id) => {
    if (!window.confirm("Delete this designation?")) return;
    try {
      await api.delete(`/staffs/designations/${id}/`);
      fetchData();
    } catch (error) {
      alert("Cannot delete this designation. It may be linked to staff members.");
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] p-8 rounded-3xl shadow-lg border border-brand-royalPurple text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            People Management
          </span>
          <h1 className="text-3xl font-bold mb-2">Staff Setup</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Manage departments and designations for non-teaching staff. Add departments first, then assign designations to each.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">⚙️</span>
        </div>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-bold text-sm shadow-sm ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46] border border-[#34D399]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ───── Departments Section ───── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2 flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-tealCyan" /> Departments
          </h2>

          {/* Add Department Form */}
          <form onSubmit={addDepartment} className="space-y-3 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className={labelClass}>Department Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Administration, Accounts, Library"
                value={deptForm.name}
                onChange={handleDeptChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description (optional)</label>
              <textarea
                name="description"
                rows="2"
                placeholder="Brief description..."
                value={deptForm.description}
                onChange={handleDeptChange}
                className={inputClass}
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${isLoading ? 'bg-gray-400 text-white' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </form>

          {/* Department List */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {departments.length === 0 ? (
              <p className="text-center py-6 text-gray-400 text-sm">No departments added yet.</p>
            ) : (
              departments.map(dept => (
                <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-tealCyan/30 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{dept.name}</p>
                    {dept.description && <p className="text-xs text-gray-400 mt-0.5">{dept.description}</p>}
                  </div>
                  <button
                    onClick={() => deleteDepartment(dept.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* ───── Designations Section ───── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-tealCyan" /> Designations
          </h2>

          {/* Add Designation Form */}
          <form onSubmit={addDesignation} className="space-y-3 mb-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className={labelClass}>Designation Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Accountant, Librarian, Office Assistant"
                value={desigForm.title}
                onChange={handleDesigChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Department *</label>
              <select
                name="department"
                required
                value={desigForm.department}
                onChange={handleDesigChange}
                className={inputClass}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {departments.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">Please add a department first (left panel).</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || departments.length === 0}
              className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${(isLoading || departments.length === 0) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}
            >
              <Plus className="w-4 h-4" /> Add Designation
            </button>
          </form>

          {/* Designation List */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {designations.length === 0 ? (
              <p className="text-center py-6 text-gray-400 text-sm">No designations added yet.</p>
            ) : (
              designations.map(des => (
                <div key={des.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-brand-tealCyan/30 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{des.title}</p>
                    <p className="text-xs text-brand-tealCyan font-medium mt-0.5">{des.department_name}</p>
                  </div>
                  <button
                    onClick={() => deleteDesignation(des.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}