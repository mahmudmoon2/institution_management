import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// ডকুমেন্টে উল্লেখিত ৪টি রোল এবং তাদের আইকন 
const ROLES = [
  { id: 'ADMIN', label: 'Admin', icon: '🛡️', credentialLabel: 'Username' },
  { id: 'TEACHER', label: 'Teacher', icon: '👩‍🏫', credentialLabel: 'Teacher ID' },
  { id: 'PARENT', label: 'Parent', icon: '👨‍👩‍👧', credentialLabel: 'Student ID' },
  { id: 'STUDENT', label: 'Student', icon: '🎓', credentialLabel: 'Student ID' },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  
  // Zustand থেকে login, isLoading এবং error নিয়ে আসছি
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCredentials({ identifier: '', password: '' }); // রোল চেঞ্জ করলে ফিল্ড ক্লিয়ার হবে
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // আসল ডাটাবেস API কল
    const success = await login(credentials.identifier, credentials.password, selectedRole.id);
    
    // লগইন সফল হলে নির্দিষ্ট ড্যাশবোর্ডে রিডাইরেক্ট [cite: 109]
    if (success) {
      navigate(`/${selectedRole.id.toLowerCase()}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F0FF] p-4 relative overflow-hidden">
      {/* Subtle Floating Background Shapes [cite: 104] */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-brand-softLavender/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-brand-tealCyan/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-brand-deepPlum mb-2">Welcome Back</h1>
          <p className="text-gray-500">Please select your role to continue</p>
        </div>

        {/* Role Selection Grid  */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {ROLES.map((role) => {
            const isSelected = selectedRole?.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ease-out
                  hover:-translate-y-1 hover:shadow-lg
                  ${isSelected 
                    ? 'border-brand-tealCyan bg-brand-deepPlum text-white shadow-md' 
                    : 'border-gray-100 bg-gray-50 text-brand-deepPlum hover:border-brand-softLavender'
                  }
                `}
              >
                <span className="text-3xl mb-2">{role.icon}</span>
                <span className="font-semibold">{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Credential Form Animation  */}
        <AnimatePresence>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleLoginSubmit} className="space-y-5 border-t border-gray-100 pt-6">
                
                {/* API থেকে কোনো এরর আসলে এখানে দেখাবে */}
                {error && (
                  <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    {selectedRole.credentialLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={credentials.identifier}
                    onChange={(e) => setCredentials({...credentials, identifier: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan transition-colors"
                    placeholder={`Enter your ${selectedRole.credentialLabel}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan transition-colors"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-gray-600">
                    <input type="checkbox" className="mr-2 rounded text-brand-tealCyan focus:ring-brand-tealCyan" />
                    Remember me
                  </label>
                  <a href="#" className="text-sm font-semibold text-brand-royalPurple hover:text-brand-tealCyan transition-colors">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-royalPurple hover:bg-brand-deepPlum'}`}
                >
                  {isLoading ? 'Logging in...' : `Login as ${selectedRole.label}`}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}