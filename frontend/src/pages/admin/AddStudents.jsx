import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AddStudent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown-এর জন্য ডাটাবেসের ডাটা রাখার স্টেট
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [teachers, setTeachers] = useState([]); // গাইড টিচারের জন্য

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

  // পেজ লোড হওয়ার সাথে সাথে ড্রপডাউনের ডাটা ফেচ করা
// AddStudents.jsx এর ভেতরে (প্রায় ৩২ নম্বর লাইন)

useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [classRes, secRes, teachRes] = await Promise.all([
          api.get('/academics/classes/'),
          api.get('/academics/sections/'),
          
          // আগে ছিল '/teachers/list/', এখন হবে শুধু '/teachers/'
          api.get('/teachers/') 
        ]);
        setClasses(classRes.data);
        setSections(secRes.data);
        setTeachers(teachRes.data);
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

    // যেহেতু ফাইল আছে, তাই FormData ব্যবহার করতে হবে
    const submitData = new FormData();
    
    // টেক্সট ডাটাগুলো অ্যাপেন্ড করা
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitData.append(key, formData[key]);
      }
    });

    // ফাইলগুলো অ্যাপেন্ড করা
    if (files.photo) submitData.append('photo', files.photo);
    if (files.guardian_nid_image) submitData.append('guardian_nid_image', files.guardian_nid_image);

    try {
      // Content-Type 'multipart/form-data' অটোমেটিক সেট হয়ে যাবে
      await api.post('/students/', submitData);
      alert("Student Registered Successfully!");
      navigate('/admin/students');
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to register. Please check the inputs or required fields.");
    } finally {
      setIsLoading(false);
    }
  };

  // কমন স্টাইল
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan text-sm transition-colors bg-gray-50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-6 pb-10"
    >
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
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-xl font-medium text-sm">
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
                <option value="Science">Science</option>
                <option value="Arts">Arts</option>
                <option value="Commerce">Commerce</option>
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
            {/* Student Photo Upload */}
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
            {/* Guardian NID Upload */}
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