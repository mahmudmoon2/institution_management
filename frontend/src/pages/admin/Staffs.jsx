import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, Edit } from 'lucide-react';
import api from '../../api/axios';

export default function Staffs() {
  const [staffs, setStaffs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaffs = async () => {
    try {
      const res = await api.get('/staffs/');
      setStaffs(res.data);
    } catch (error) {
      console.error("Error fetching staffs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/staffs/departments/');
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments", error);
    }
  };

  useEffect(() => {
    fetchStaffs();
    fetchDepartments();
  }, []);

  const handleGenerateLetter = async (staffId) => {
    try {
      const res = await api.get(`/staffs/appointment-letter/${staffId}/pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      console.error("Error generating letter", error);
    }
  };

  const filteredStaffs = staffs.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(search.toLowerCase()) ||
                          staff.staff_id.toLowerCase().includes(search.toLowerCase()) ||
                          (staff.designation_title && staff.designation_title.toLowerCase().includes(search.toLowerCase()));
    const matchesDept = !filterDept || (staff.department && staff.department === filterDept);
    return matchesSearch && matchesDept;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-700',
      'Inactive': 'bg-gray-100 text-gray-500',
      'On-Leave': 'bg-yellow-100 text-yellow-700',
      'Terminated': 'bg-red-100 text-red-600',
    };
    return colors[status] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] p-8 rounded-3xl shadow-lg border border-brand-royalPurple text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            People Management
          </span>
          <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Manage non-teaching staff members. Add new staff, view details, and generate appointment letters.
          </p>
        </div>
        <div className="relative z-10 flex gap-3">
          <Link
            to="/admin/staffs/add"
            className="inline-flex items-center gap-2 bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </Link>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">👥</span>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-white"
          />
        </div>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-white min-w-[180px]"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Staff Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[900px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4 font-semibold">Staff ID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Designation</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Joining Date</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" className="text-center py-10 text-gray-400">Loading staff data...</td></tr>
              ) : filteredStaffs.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-10 text-gray-400">No staff members found.</td></tr>
              ) : (
                filteredStaffs.map(staff => (
                  <tr key={staff.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-brand-tealCyan font-bold">{staff.staff_id}</td>
                    <td className="p-4 font-semibold text-gray-800">{staff.name}</td>
                    <td className="p-4 text-gray-600">{staff.designation_title || '-'}</td>
                    <td className="p-4 text-gray-600">{staff.department_name || '-'}</td>
                    <td className="p-4 text-gray-600">{staff.phone}</td>
                    <td className="p-4 text-gray-600 text-xs">{staff.joining_date}</td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${getStatusColor(staff.status)}`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/admin/staffs/edit/${staff.id}`}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleGenerateLetter(staff.id)}
                          className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                          title="Generate Appointment Letter"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}