import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function EditStudent() {
  const { id } = useParams(); // URL থেকে স্টুডেন্টের ID নেওয়া হচ্ছে
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({
    name: '', class_level: '', section: '', roll_number: '', group: '',
    date_of_birth: '', gender: '', religion: '', blood_group: '',
    present_address: '', permanent_address: '',
    guardian_name: '', guardian_phone: '', admission_date: ''
  });

  // পেজ লোড হওয়ার পর ড্রপডাউনের ডেটা এবং নির্দিষ্ট স্টুডেন্টের ডেটা ফেচ করা
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, secRes, studentRes] = await Promise.all([
          api.get('/academics/classes/'),
          api.get('/academics/sections/'),
          api.get(`/students/${id}/`) // নির্দিষ্ট স্টুডেন্টের ডেটা
        ]);

        setClasses(classRes.data);
        setSections(secRes.data);
        
        // ফর্মে স্টুডেন্টের আগের ডেটাগুলো বসিয়ে দেওয়া (null থাকলে ফাঁকা স্ট্রিং)
        const stData = studentRes.data;
        setFormData({
          name: stData.name || '',
          class_level: stData.class_level || '',
          section: stData.section || '',
          roll_number: stData.roll_number || '',
          group: stData.group || '',
          date_of_birth: stData.date_of_birth || '',
          gender: stData.gender || '',
          religion: stData.religion || '',
          blood_group: stData.blood_group || '',
          present_address: stData.present_address || '',
          permanent_address: stData.permanent_address || '',
          guardian_name: stData.guardian_name || '',
          guardian_phone: stData.guardian_phone || '',
          admission_date: stData.admission_date || '',
        });
      } catch (err) {
        console.error("Failed to load data.", err);
        setErrorMsg("Failed to load student data.");
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const dataToSend = { ...formData };
    if (!dataToSend.group) delete dataToSend.group;

    try {
      // ডেটা আপডেট করার জন্য PUT রিকোয়েস্ট
      await api.put(`/students/${id}/`, dataToSend);
      alert("Student Record Updated Successfully!");
      navigate('/admin/students');
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update. Please check the inputs.");
    } finally {
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
      className="max-w-5xl mx-auto space-y-6 pb-10"
    >
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Edit Student Record</h1>
          <p className="text-gray-500 text-sm mt-1">Update the information below.</p>
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
              <label className={labelClass}>Roll Number *</label>
              <input type="number" name="roll_number" required value={formData.roll_number} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Admission Date *</label>
              <input type="date" name="admission_date" required value={formData.admission_date} onChange={handleChange} className={inputClass} />
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
              <label className={labelClass}>Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClass}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="O-">O-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
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
            <div>
              <label className={labelClass}>Present Address *</label>
              <textarea name="present_address" required value={formData.present_address} rows="2" onChange={handleChange} className={inputClass}></textarea>
            </div>
            <div>
              <label className={labelClass}>Permanent Address *</label>
              <textarea name="permanent_address" required value={formData.permanent_address} rows="2" onChange={handleChange} className={inputClass}></textarea>
            </div>
          </div>
        </div>

        {/* Submit Area */}
        <div className="flex justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <button 
            type="button"
            onClick={() => navigate('/admin/students')}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className={`px-8 py-2.5 rounded-xl text-white font-bold transition-colors shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}
          >
            {isLoading ? 'Updating...' : 'Update Student Record'}
          </button>
        </div>

      </form>
    </motion.div>
  );
}