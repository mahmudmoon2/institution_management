import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import api from '../../api/axios';

export default function AddStaff() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: '',
    date_of_birth: '',
    gender: 'Male',
    blood_group: '',
    religion: '',
    present_address: '',
    permanent_address: '',
    nid_number: '',
    joining_date: '',
    salary: '',
    status: 'Active',
    notes: '',
    basic_salary: '', house_rent: '', medical_allowance: '',
    transport_allowance: '', other_allowance: '',
    provident_fund_pct: '', tax_pct: '',
    bank_account_name: '', bank_account_number: '', routing_number: '',
    bank_name: '', branch_name: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/staffs/departments/');
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments", error);
    }
  };

  useEffect(() => {
    if (formData.department) {
      fetchDesignations(formData.department);
    } else {
      setDesignations([]);
      setFormData(prev => ({ ...prev, designation: '' }));
    }
  }, [formData.department]);

  const fetchDesignations = async (deptId) => {
    try {
      const res = await api.get(`/staffs/designations/?department=${deptId}`);
      setDesignations(res.data.filter(d => d.department === deptId));
    } catch (error) {
      setDesignations([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
      };

      const res = await api.post('/staffs/', payload);
      setMsg({ type: 'success', text: `Staff "${res.data.name}" added successfully! Staff ID: ${res.data.staff_id}` });
      setTimeout(() => navigate('/admin/staffs'), 1500);
    } catch (error) {
      console.error("Error adding staff", error);
      const errMsg = error.response?.data 
        ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
        : 'Failed to add staff. Please try again.';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] p-8 rounded-3xl shadow-lg border border-brand-royalPurple text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-mintGreen/20 text-brand-mintGreen font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-mintGreen/30">
            New Hire
          </span>
          <h1 className="text-3xl font-bold mb-2">Add New Staff</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Fill in the staff member's details below. An appointment letter can be generated after saving.
          </p>
        </div>
        <div className="relative z-10">
          <button
            onClick={() => navigate('/admin/staffs')}
            className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Staff List
          </button>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">🧑‍💼</span>
        </div>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-bold text-sm shadow-sm ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46] border border-[#34D399]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-tealCyan" /> Personal Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Md. Karim Uddin" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} placeholder="staff@example.com" />
                </div>
                <div>
                  <label className={labelClass}>Phone *</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className={inputClass} placeholder="01711XXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <input type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClass} placeholder="e.g. B+" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Religion</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputClass} placeholder="e.g. Islam" />
                </div>
                <div>
                  <label className={labelClass}>NID Number</label>
                  <input type="text" name="nid_number" value={formData.nid_number} onChange={handleChange} className={inputClass} placeholder="e.g. 1234567890" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Present Address *</label>
                <textarea name="present_address" required rows="2" value={formData.present_address} onChange={handleChange} className={inputClass} placeholder="Current address..."></textarea>
              </div>
              <div>
                <label className={labelClass}>Permanent Address *</label>
                <textarea name="permanent_address" required rows="2" value={formData.permanent_address} onChange={handleChange} className={inputClass} placeholder="Permanent address..."></textarea>
              </div>
            </div>
          </motion.div>

          {/* Employment Information */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2 flex items-center gap-2">
              <Save className="w-5 h-5 text-brand-tealCyan" /> Employment Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Department *</label>
                <select name="department" required value={formData.department} onChange={handleChange} className={inputClass}>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Designation *</label>
                <select name="designation" required value={formData.designation} onChange={handleChange} className={inputClass} disabled={!formData.department}>
                  <option value="">Select Designation</option>
                  {designations.map(des => (
                    <option key={des.id} value={des.id}>{des.title}</option>
                  ))}
                </select>
                {!formData.department && <p className="text-xs text-gray-400 mt-1">Please select a department first</p>}
              </div>
              <div>
                <label className={labelClass}>Joining Date *</label>
                <input type="date" name="joining_date" required value={formData.joining_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On-Leave">On-Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} className={inputClass} placeholder="Any additional notes..."></textarea>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Salary & Bank Information */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2">Salary & Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Basic Salary (BDT)</label>
              <input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleChange} className={inputClass} placeholder="e.g. 25000" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>House Rent</label>
              <input type="number" name="house_rent" value={formData.house_rent} onChange={handleChange} className={inputClass} placeholder="e.g. 7000" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>Medical Allowance</label>
              <input type="number" name="medical_allowance" value={formData.medical_allowance} onChange={handleChange} className={inputClass} placeholder="e.g. 1500" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>Transport Allowance</label>
              <input type="number" name="transport_allowance" value={formData.transport_allowance} onChange={handleChange} className={inputClass} placeholder="e.g. 1000" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>Other Allowance</label>
              <input type="number" name="other_allowance" value={formData.other_allowance} onChange={handleChange} className={inputClass} placeholder="e.g. 0" min="0" step="any" />
            </div>
            <div></div>
            <div>
              <label className={labelClass}>PF Deduction (%)</label>
              <input type="number" name="provident_fund_pct" value={formData.provident_fund_pct} onChange={handleChange} className={inputClass} placeholder="e.g. 8" min="0" max="100" step="any" />
            </div>
            <div>
              <label className={labelClass}>Tax Deduction (%)</label>
              <input type="number" name="tax_pct" value={formData.tax_pct} onChange={handleChange} className={inputClass} placeholder="e.g. 3" min="0" max="100" step="any" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className={labelClass}>Bank Account Name</label>
              <input type="text" name="bank_account_name" value={formData.bank_account_name} onChange={handleChange} className={inputClass} placeholder="As per bank records" />
            </div>
            <div>
              <label className={labelClass}>Bank Account Number</label>
              <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} className={inputClass} placeholder="e.g. 0987654321" />
            </div>
            <div>
              <label className={labelClass}>Routing Number</label>
              <input type="text" name="routing_number" value={formData.routing_number} onChange={handleChange} className={inputClass} placeholder="e.g. XYZ789" />
            </div>
            <div>
              <label className={labelClass}>Bank Name</label>
              <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className={inputClass} placeholder="e.g. City Bank" />
            </div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/staffs')}
            className="px-6 py-3 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 rounded-xl font-bold transition-colors shadow-md flex items-center gap-2 ${isLoading ? 'bg-gray-400 text-white' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}
          >
            {isLoading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Staff</>}
          </button>
        </motion.div>
      </form>
    </div>
  );
}