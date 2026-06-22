import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AddStudent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Dropdown-এর জন্য ডাটাবেসের ডাটা রাখার স্টেট
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]); 
  const [groups, setGroups] = useState([]);

  // টেক্সট ডাটার জন্য স্টেট
  const [formData, setFormData] = useState({
    name: '', class_level: '', section: '', roll_number: '', group: '',
    date_of_birth: '', gender: '', religion: '', blood_group: '',
    present_address: '', permanent_address: '',
    guardian_name: '', guardian_phone: '', guardian_email: '', 
    admission_date: '', guide_teacher: ''
  });

  // ফাইলের জন্য আলাদা স্টেট
  const [files, setFiles] = useState({
    photo: null,
    guardian_nid_image: null
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [classRes, secRes, teachRes, grpRes] = await Promise.all([
          api.get('/academics/classes/'),
          api.get('/academics/sections/'),
          api.get('/teachers/'),
          api.get('/academics/groups/').catch(() => ({ data: [] })) 
        ]);
        setClasses(classRes.data);
        setSections(secRes.data);
        setTeachers(teachRes.data);
        setGroups(grpRes.data);
      } catch (err) {
        console.error("Failed to load dropdown data.");
      }
    };
    fetchDropdownData();
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
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    if (files.photo) submitData.append('photo', files.photo);
    if (files.guardian_nid_image) submitData.append('guardian_nid_image', files.guardian_nid_image);

    try {
      await api.post('/students/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showToast("Student Registered Successfully!", "success");
      // Toast দেখানোর জন্য ১.৫ সেকেন্ড অপেক্ষা করে তারপর রিডাইরেক্ট করবে
      setTimeout(() => navigate('/admin/students'), 1500);
    } catch (err) {
      const errorData = err.response?.data;
      console.error("Server Validation Error:", errorData);
      
      showToast("Failed to register. Please check the inputs.", "error");

      if (errorData && typeof errorData === 'object') {
        const messages = Object.entries(errorData)
          .map(([field, msg]) => `${field.toUpperCase()}: ${msg}`)
          .join(' | ');
        setErrorMsg(`Validation Error - ${messages}`);
      } else {
        setErrorMsg("Failed to register. Please check the inputs or required fields.");
      }
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
          <h1 className="text-2xl font-bold text-brand-deepPlum">Register New Student</h1>
          <p className="text-gray-500 text-sm mt-1">Fill up the comprehensive information below.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/students')}
          className="text-gray-500 hover:text-brand-deepPlum font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Back to List
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Academic Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Class Level *</label>
              <select name="class_level" required value={formData.class_level} onChange={handleChange} className={inputClass}>
                <option value="">Select Class</option>
                {classes.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Section *</label>
              <select name="section" required value={formData.section} onChange={handleChange} className={inputClass}>
                <option value="">Select Section</option>
                {sections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Group (Optional)</label>
              <select name="group" value={formData.group} onChange={handleChange} className={inputClass}>
                <option value="">None</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Roll Number *</label>
              <input type="number" name="roll_number" required value={formData.roll_number} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Admission Date *</label>
              <input type="date" name="admission_date" required value={formData.admission_date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Guide Teacher (Optional)</label>
              <select name="guide_teacher" value={formData.guide_teacher} onChange={handleChange} className={inputClass}>
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Full Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth *</label>
              <input type="date" name="date_of_birth" required value={formData.date_of_birth} onChange={handleChange} className={inputClass} />
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
            <div>
              <label className={labelClass}>Religion</label>
              <input type="text" name="religion" value={formData.religion} onChange={handleChange} className={inputClass} placeholder="e.g. Islam" />
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClass}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className={labelClass}>Student Passport Photo (Optional)</label>
              <input type="file" name="photo" accept="image/*" onChange={handleFileChange} className={`${inputClass} !py-2`} />
            </div>
          </div>
        </div>

        {/* Guardian & Contact Information */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-royalPurple mb-4 border-b pb-2">Guardian & Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Guardian Name *</label>
              <input type="text" name="guardian_name" required value={formData.guardian_name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Guardian Phone *</label>
              <input type="tel" name="guardian_phone" required value={formData.guardian_phone} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Guardian Email (Optional)</label>
              <input type="email" name="guardian_email" value={formData.guardian_email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Present Address *</label>
              <textarea name="present_address" required value={formData.present_address} rows="2" onChange={handleChange} className={inputClass}></textarea>
            </div>
            <div>
              <label className={labelClass}>Permanent Address *</label>
              <textarea name="permanent_address" required value={formData.permanent_address} rows="2" onChange={handleChange} className={inputClass}></textarea>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Guardian NID Image (Mandatory)</label>
              <input type="file" name="guardian_nid_image" accept="image/*" onChange={handleFileChange} className={`${inputClass} !py-2`} />
            </div>
          </div>
        </div>

        {/* Submit Area */}
        <div className="flex justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <button type="button" onClick={() => navigate('/admin/students')} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className={`px-8 py-2.5 rounded-xl text-white font-bold transition-colors shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}>
            {isLoading ? 'Saving...' : 'Save Student Record'}
          </button>
        </div>

      </form>
    </motion.div>
  );
}