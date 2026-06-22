import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Lock, KeyRound, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

export default function PasswordManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Password change form
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (searchRole) params.append('role', searchRole);
      const res = await api.get(`/admin/search-users/?${params.toString()}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error searching users", err);
      setMsg({ type: 'error', text: 'Failed to search users.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    if (!newPassword || newPassword.length < 4) {
      setMsg({ type: 'error', text: 'Password must be at least 4 characters.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return;
    }

    setIsChanging(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await api.post('/admin/change-password/', {
        user_id: selectedUser.id,
        new_password: newPassword,
      });
      setMsg({ type: 'success', text: res.data.message });
      setSelectedUser(null);
      setNewPassword('');
      setConfirmPassword('');
      handleSearch(); // Refresh list
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      const detail = err.response?.data?.error || 'Failed to change password.';
      setMsg({ type: 'error', text: detail });
      setTimeout(() => setMsg({ type: '', text: '' }), 4000);
    } finally {
      setIsChanging(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  const getRoleBadge = (role) => {
    const colors = {
      'ADMIN': 'bg-red-100 text-red-700',
      'TEACHER': 'bg-blue-100 text-blue-700',
      'STUDENT': 'bg-green-100 text-green-700',
      'PARENT': 'bg-purple-100 text-purple-700',
      'STAFF': 'bg-orange-100 text-orange-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-500';
  };

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] p-8 rounded-3xl shadow-lg border border-brand-royalPurple text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            Security
          </span>
          <h1 className="text-3xl font-bold mb-2">Password Management</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Reset passwords for teachers, students, and staff. Search by username or role, then set a new password.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">🔐</span>
        </div>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-bold text-sm shadow-sm flex items-center gap-2 ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46] border border-[#34D399]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2 flex items-center gap-2">
            <Search className="w-5 h-5 text-brand-tealCyan" /> Search Users
          </h2>
          
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <label className={labelClass}>Search by Username</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. TCH-XXXX or STU-XXXX"
                className={inputClass}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="min-w-[140px]">
              <label className={labelClass}>Role</label>
              <select value={searchRole} onChange={(e) => setSearchRole(e.target.value)} className={inputClass}>
                <option value="">All Roles</option>
                <option value="TEACHER">Teacher</option>
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-6 py-2.5 rounded-xl bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum font-bold text-sm transition-colors flex items-center gap-2"
              >
                {isSearching ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                <tr>
                  <th className="p-3 font-semibold">Username</th>
                  <th className="p-3 font-semibold">Full Name</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold text-center">Active</th>
                  <th className="p-3 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-400 text-sm">
                    {isSearching ? 'Searching...' : 'Click Search to find users.'}
                  </td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className={`hover:bg-gray-50 border-b border-gray-50 transition-colors ${selectedUser?.id === u.id ? 'bg-brand-tealCyan/5 border-l-4 border-l-brand-tealCyan' : ''}`}>
                      <td className="p-3 font-mono text-xs text-brand-royalPurple font-bold">{u.username}</td>
                      <td className="p-3 font-semibold text-gray-800">{u.display_name}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleBadge(u.role)}`}>
                          {u.role_display}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-bold ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>
                          {u.is_active ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => { setSelectedUser(u); setNewPassword(''); setConfirmPassword(''); }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand-royalPurple text-white hover:bg-brand-deepPlum transition-colors flex items-center gap-1 mx-auto"
                        >
                          <KeyRound className="w-3 h-3" /> Reset
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Change Password Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-tealCyan" /> Set New Password
          </h2>
          
          {selectedUser ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl text-sm">
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Name:</strong> {selectedUser.display_name}</p>
                <p>
                  <strong>Role:</strong>
                  <span className={`ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getRoleBadge(selectedUser.role)}`}>
                    {selectedUser.role_display}
                  </span>
                </p>
              </div>

              <div>
                <label className={labelClass}>New Password *</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Min 4 characters"
                />
              </div>
              <div>
                <label className={labelClass}>Confirm Password *</label>
                <input
                  type="text"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Re-type password"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={isChanging}
                className={`w-full py-3 rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2 ${isChanging ? 'bg-gray-400 text-white' : 'bg-brand-royalPurple hover:bg-brand-deepPlum text-white'}`}
              >
                {isChanging ? <Loader className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isChanging ? 'Changing...' : 'Change Password'}
              </button>

              <button
                onClick={() => { setSelectedUser(null); setNewPassword(''); setConfirmPassword(''); }}
                className="w-full py-2 rounded-xl text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <KeyRound className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a user from the list to reset their password.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}