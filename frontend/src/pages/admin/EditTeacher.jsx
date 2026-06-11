import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';

export default function EditTeacher() {
  const { id } = useParams(); // URL থেকে টিচারের ID নেওয়া হচ্ছে
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', major_subject: '', 
    joining_date: '', gender: '', 
    present_address: '', permanent_address: ''
  });

  // পেজ লোড হওয়ার পর ড্রপডাউনের ডেটা এবং নির্দিষ্ট টিচারের ডেটা ফেচ করা
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, teacherRes] = await Promise.all([
          api.get('/academics/subjects/'),
          api.get(`/teachers/${id}/`) // নির্দিষ্ট টিচারের ডেটা
        ]);

        setSubjects(subRes.data);
        
        // ফর্মে টিচারের আগের ডেটাগুলো বসিয়ে দেওয়া
        const tData = teacherRes.data;
        setFormData({
          name: tData.name || '',
          email: tData.email || '',
          phone: tData.phone || '',
          major_subject: tData.major_subject || '',
          joining_date: tData.joining_date || '',
          gender: tData.gender || '',
          present_address: tData.present_address || '',
          permanent_address: tData.permanent_address || ''
        });
      } catch (err) {
        console.error("Failed to load data.", err);
        setErrorMsg("Failed to load teacher data.");
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
    if (!dataToSend.major_subject) delete dataToSend.major_subject;

    try {
      // ডেটা আপডেট করার জন্য PUT রিকোয়েস্ট
      await api.put(`/teachers/${id}/`, dataToSend);
      alert("Teacher Record Updated Successfully!");
      navigate('/admin/teachers');
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
          <h1 className="text-2xl font-bold text-brand-deepPlum">Edit Teacher Record</h1>
          <p className="text-gray-500 text-sm mt-1">Update the information below.</p>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        
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

        {/* Submit Area */}
        <div className="flex justify-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <button 
            type="button"
            onClick={() => navigate('/admin/teachers')}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className={`px-8 py-2.5 rounded-xl text-white font-bold transition-colors shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}
          >
            {isLoading ? 'Updating...' : 'Update Teacher Record'}
          </button>
        </div>

      </form>
    </motion.div>
  );
}