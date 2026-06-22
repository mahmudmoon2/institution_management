import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/imageHelper';
import { ToggleLeft, ToggleRight, IdCard, FileText } from 'lucide-react';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

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

  useEffect(() => {
    fetchTeachers();
  }, []);

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacher_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (teacher, e) => {
    e.stopPropagation();
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

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

  const handleToggleActive = async (teacher, e) => {
    e.stopPropagation();
    try {
      const res = await api.patch(`/teachers/${teacher.id}/`, {
        is_active: !teacher.is_active,
      });
      setTeachers(teachers.map(t => t.id === teacher.id ? { ...t, is_active: res.data.is_active } : t));
    } catch (error) {
      console.error("Error toggling status", error);
      alert("Failed to toggle teacher status.");
    }
  };

  const handleIdCard = async (teacher, e) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/teachers/id-card/${teacher.id}/pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error generating ID card", error);
      alert("Failed to generate ID card.");
    }
  };

  const handleAppointmentLetter = async (teacher, e) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/teachers/appointment-letter/${teacher.id}/pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error generating appointment letter", error);
      alert("Failed to generate appointment letter.");
    }
  };

  const openDetailModal = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setSelectedTeacher(null);
    setIsDetailModalOpen(false);
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-brand-deepPlum">Teacher Directory</h1>
            <p className="text-gray-500 text-sm mt-1">Manage all teaching staff and their profiles.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
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
            <Link
              to="/admin/teachers/add"
              className="bg-brand-royalPurple hover:bg-brand-deepPlum text-white px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm shrink-0"
            >
              <span>➕</span>
              <span className="hidden sm:inline">Add Teacher</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                  <th className="py-4 px-6 font-semibold">Teacher ID</th>
                  <th className="py-4 px-6 font-semibold">Name</th>
                  <th className="py-4 px-6 font-semibold">Subject</th>
                  <th className="py-4 px-6 font-semibold">Phone</th>
                  <th className="py-4 px-6 font-semibold text-center">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading teachers...</td></tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-gray-500">No teachers found matching your search.</td></tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr
                      key={teacher.id}
                      onClick={() => openDetailModal(teacher)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-brand-royalPurple">{teacher.teacher_id}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-brand-deepPlum">{teacher.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{teacher.major_subject_name || 'N/A'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{teacher.phone}</td>
                      <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleToggleActive(teacher, e)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                            teacher.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                          title={teacher.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                        >
                          {teacher.is_active ? (
                            <><ToggleRight className="w-3.5 h-3.5" /> Active</>
                          ) : (
                            <><ToggleLeft className="w-3.5 h-3.5" /> Inactive</>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleIdCard(teacher, e)}
                          className="text-gray-400 hover:text-brand-royalPurple transition-colors p-2 inline-block"
                          title="Generate ID Card"
                        >
                          <IdCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleAppointmentLetter(teacher, e)}
                          className="text-gray-400 hover:text-blue-500 transition-colors p-2 inline-block"
                          title="Print Appointment Letter"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/admin/teachers/edit/${teacher.id}`}
                          className="text-gray-400 hover:text-brand-tealCyan transition-colors p-2 inline-block"
                          title="Edit Teacher"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={(e) => handleDeleteClick(teacher, e)}
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

      {/* Teacher Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b p-5 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-brand-deepPlum">Teacher Details</h2>
                <button onClick={closeDetailModal} className="text-gray-400 hover:text-red-500 text-2xl leading-none">✕</button>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-100 border-4 border-brand-tealCyan shadow-md">
                      {selectedTeacher.photo ? (
                        <img src={getImageUrl(selectedTeacher.photo)} alt={selectedTeacher.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-brand-softLavender/20">👩‍🏫</div>
                      )}
                    </div>
                  </div>

                  {/* Information Grid */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-semibold text-gray-700">Full Name:</span> <span className="text-gray-900">{selectedTeacher.name}</span></div>
                    <div><span className="font-semibold text-gray-700">Teacher ID:</span> <span className="text-gray-900">{selectedTeacher.teacher_id}</span></div>
                    <div><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-900">{selectedTeacher.email}</span></div>
                    <div><span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-900">{selectedTeacher.phone}</span></div>
                    <div><span className="font-semibold text-gray-700">Major Subject:</span> <span className="text-gray-900">{selectedTeacher.major_subject_name || 'N/A'}</span></div>
                    <div><span className="font-semibold text-gray-700">Joining Date:</span> <span className="text-gray-900">{selectedTeacher.joining_date}</span></div>
                    <div><span className="font-semibold text-gray-700">Gender:</span> <span className="text-gray-900">{selectedTeacher.gender}</span></div>
                    <div><span className="font-semibold text-gray-700">Status:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(selectedTeacher, e).then(() => {
                            setSelectedTeacher(prev => prev ? { ...prev, is_active: !prev.is_active } : null);
                          });
                        }}
                        className={`ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          selectedTeacher.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {selectedTeacher.is_active ? <><ToggleRight className="w-3 h-3" /> Active</> : <><ToggleLeft className="w-3 h-3" /> Inactive</>}
                      </button>
                    </div>
                    <div className="md:col-span-2"><span className="font-semibold text-gray-700">Present Address:</span> <span className="text-gray-900">{selectedTeacher.present_address}</span></div>
                    <div className="md:col-span-2"><span className="font-semibold text-gray-700">Permanent Address:</span> <span className="text-gray-900">{selectedTeacher.permanent_address}</span></div>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 p-4 text-right border-t flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => handleIdCard(selectedTeacher, e)}
                    className="px-4 py-2 bg-brand-royalPurple text-white rounded-xl hover:bg-brand-deepPlum transition flex items-center gap-2"
                  >
                    <IdCard className="w-4 h-4" /> Generate ID Card
                  </button>
                  <button
                    onClick={(e) => handleAppointmentLetter(selectedTeacher, e)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Appointment Letter
                  </button>
                </div>
                <button onClick={closeDetailModal} className="px-6 py-2 bg-brand-deepPlum text-white rounded-xl hover:bg-brand-royalPurple transition">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Teacher?</h3>
                <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <strong>{teacherToDelete?.name}</strong>'s record? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => { setIsDeleteModalOpen(false); setTeacherToDelete(null); }} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600">Yes, Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}