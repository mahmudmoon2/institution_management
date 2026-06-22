import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AddTeacher() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const [subjects, setSubjects] = useState([]);

  // টেক্সট ডাটা
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', major_subject: '', 
    joining_date: '', gender: '', 
    present_address: '', permanent_address: '',
    basic_salary: '', house_rent: '', medical_allowance: '',
    transport_allowance: '', other_allowance: '',
    provident_fund_pct: '', tax_pct: '',
    bank_account_name: '', bank_account_number: '', routing_number: '',
    bank_name: '', branch_name: '',
  });

  // ফাইল ডাটা
  const [files, setFiles] = useState({
    photo: null,
    nid_image: null
  });

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/academics/subjects/');
        setSubjects(response.data);
      } catch (err) {
        console.error("Failed to load subjects.");
      }
    };
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const submitData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (formData[key] && formData[key] !== '') {
        submitData.append(key, formData[key]);
      }
    });

    if (files.photo) submitData.append('photo', files.photo);
    if (files.nid_image) submitData.append('nid_image', files.nid_image);

    try {
      await api.post('/teachers/', submitData);
      showToast("Teacher Registered Successfully!", "success");
      // Toast দেখানোর জন্য ১.৫ সেকেন্ড অপেক্ষা করে তারপর রিডাইরেক্ট করবে
      setTimeout(() => navigate('/admin/teachers'), 1500);
    } catch (err) {
      console.error(err);
      showToast("Failed to register teacher.", "error");
      const errData = err.response?.data;
      let errText = 'Unknown error';
      if (typeof errData === 'object' && errData !== null) {
        errText = Object.entries(errData).map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`).join(' | ');
      } else if (errData) {
        errText = String(errData);
      }
      setErrorMsg(`❌ ${errText}`);
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan text-sm transition-colors bg-gray-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-6 pb-10 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 right-6 z-[100] px-6 py-3 rounded-xl shadow-lg font-bold text-white flex items-center gap-3 ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#0e5c3c]'}`}
          >
            <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Register New Teacher</h1>
          <p className="text-gray-500 text-sm mt-1">Add a new faculty member with complete details.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/teachers')}
          className="text-gray-500 hover:text-brand-deepPlum font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to List
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-xl font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
        
        {/* Professional Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Major Subject *</label>
              <select name="major_subject" required value={formData.major_subject} onChange={handleChange} className={inputClass}>
                <option value="">Select Subject</option>
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Joining Date *</label>
              <input type="date" name="joining_date" required value={formData.joining_date} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Personal & Contact Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Personal & Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Full Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender *</label>
              <select name="gender" required value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className={labelClass}>Email Address *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Phone Number *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Present Address *</label>
              <textarea name="present_address" required value={formData.present_address} rows="2" onChange={handleChange} className={inputClass}></textarea>
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Permanent Address *</label>
              <textarea name="permanent_address" required value={formData.permanent_address} rows="2" onChange={handleChange} className={inputClass}></textarea>
            </div>
          </div>
        </div>

        {/* Documents Upload Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Documents & Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Teacher Passport Photo (Optional)</label>
              <input type="file" name="photo" accept="image/*" onChange={handleFileChange} className={`${inputClass} !py-2`} />
            </div>
            <div>
              <label className={labelClass}>NID Image / Scan (Mandetory)</label>
              <input type="file" name="nid_image" accept="image/*" onChange={handleFileChange} className={`${inputClass} !py-2`} />
            </div>
          </div>
        </div>

        {/* Salary & Bank Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Salary & Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Basic Salary (BDT)</label>
              <input type="number" name="basic_salary" value={formData.basic_salary} onChange={handleChange} className={inputClass} placeholder="e.g. 35000" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>House Rent</label>
              <input type="number" name="house_rent" value={formData.house_rent} onChange={handleChange} className={inputClass} placeholder="e.g. 12000" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>Medical Allowance</label>
              <input type="number" name="medical_allowance" value={formData.medical_allowance} onChange={handleChange} className={inputClass} placeholder="e.g. 3000" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>Transport Allowance</label>
              <input type="number" name="transport_allowance" value={formData.transport_allowance} onChange={handleChange} className={inputClass} placeholder="e.g. 2000" min="0" step="any" />
            </div>
            <div>
              <label className={labelClass}>Other Allowance</label>
              <input type="number" name="other_allowance" value={formData.other_allowance} onChange={handleChange} className={inputClass} placeholder="e.g. 0" min="0" step="any" />
            </div>
            <div></div>
            <div>
              <label className={labelClass}>PF Deduction (%)</label>
              <input type="number" name="provident_fund_pct" value={formData.provident_fund_pct} onChange={handleChange} className={inputClass} placeholder="e.g. 10" min="0" max="100" step="any" />
            </div>
            <div>
              <label className={labelClass}>Tax Deduction (%)</label>
              <input type="number" name="tax_pct" value={formData.tax_pct} onChange={handleChange} className={inputClass} placeholder="e.g. 5" min="0" max="100" step="any" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className={labelClass}>Bank Account Name</label>
              <input type="text" name="bank_account_name" value={formData.bank_account_name} onChange={handleChange} className={inputClass} placeholder="As per bank records" />
            </div>
            <div>
              <label className={labelClass}>Bank Account Number</label>
              <input type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} className={inputClass} placeholder="e.g. 1234567890" />
            </div>
            <div>
              <label className={labelClass}>Routing Number</label>
              <input type="text" name="routing_number" value={formData.routing_number} onChange={handleChange} className={inputClass} placeholder="e.g. ABC123" />
            </div>
            <div>
              <label className={labelClass}>Bank Name</label>
              <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className={inputClass} placeholder="e.g. Dutch Bangla Bank" />
            </div>
          </div>
        </div>

        {/* Submit Area */}
        <div className="flex justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <button type="button" onClick={() => navigate('/admin/teachers')} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className={`px-8 py-2.5 rounded-xl text-white font-bold transition-colors shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}>
            {isLoading ? 'Saving...' : 'Save Teacher Record'}
          </button>
        </div>

      </form>
    </motion.div>
  );
}