import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // লাইভ সার্চের জন্য স্টেট

  // কাস্টম পপআপের জন্য স্টেট
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get('/teachers/');
        setTeachers(response.data);
      } catch (error) {
        console.error("Failed to fetch teachers", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  // সার্চ টার্ম অনুযায়ী টিচার ফিল্টার করা
  const filteredTeachers = teachers.filter(teacher => 
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacher_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ডিলিট বাটনে ক্লিক করলে পপআপ ওপেন করার ফাংশন
  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  // পপআপ থেকে কনফার্ম করলে আসল ডিলিট হওয়ার ফাংশন
  const confirmDelete = async () => {
    if (!teacherToDelete) return;
    
    try {
      await api.delete(`/teachers/${teacherToDelete.id}/`);
      setTeachers(teachers.filter(t => t.id !== teacherToDelete.id));
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
    } catch (error) {
      console.error("Error deleting teacher", error);
      alert("Failed to delete teacher. Please try again.");
    }
  };

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* হেডার এবং অ্যাকশন বাটন */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-brand-deepPlum">Teacher Directory</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all teaching staff and their profiles.</p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {/* সার্চ বার */}
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Search by name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
            
            {/* Add Teacher বাটন */}
            <Link 
              to="/admin/teachers/add" 
              className="bg-brand-royalPurple hover:bg-brand-deepPlum text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm shrink-0"
            >
              <span>➕</span>
              <span className="hidden sm:inline">Add Teacher</span>
            </Link>
          </div>
        </div>

        {/* টিচার ডাটা টেবিল */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="py-4 px-6 font-semibold">Teacher ID</th>
                  <th className="py-4 px-6 font-semibold">Name</th>
                  <th className="py-4 px-6 font-semibold">Subject</th>
                  <th className="py-4 px-6 font-semibold">Phone</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">Loading teachers...</td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">No teachers found matching your search.</td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="py-4 px-6 text-sm font-medium text-brand-royalPurple">
                        {teacher.teacher_id}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-brand-deepPlum">
                        {teacher.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {teacher.major_subject_name || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {teacher.phone}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          teacher.is_active 
                          ? 'bg-brand-mintGreen/30 text-[#0e5c3c]' 
                          : 'bg-red-50 text-red-600'
                        }`}>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {/* Edit Button */}
                        <Link 
                          to={`/admin/teachers/edit/${teacher.id}`} 
                          className="text-gray-400 hover:text-brand-tealCyan transition-colors p-2 inline-block"
                          title="Edit Teacher"
                        >
                          ✏️
                        </Link>
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDeleteClick(teacher)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          title="Delete Teacher"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* কাস্টম ডিলিট কনফার্মেশন পপআপ (Modal) */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto mb-4">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Teacher?</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Are you sure you want to delete <strong>{teacherToDelete?.name}</strong>'s record? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setTeacherToDelete(null);
                    }}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}