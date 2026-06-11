import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('');
  const { userRole, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me/');
        setUserName(res.data.name);
      } catch (error) {
        console.error("Failed to fetch user info", error);
        if (userRole === 'ADMIN') setUserName('System Admin');
        else if (userRole === 'TEACHER') setUserName('Teacher Profile');
        else if (userRole === 'STUDENT') setUserName('Student Profile');
        else if (userRole === 'PARENT') setUserName('Parent Profile');
        else setUserName('User Profile');
      }
    };
    fetchUser();
  }, [userRole]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = {
    ADMIN: [
      { name: 'Overview', path: '/admin/dashboard', icon: '📊' },
      { name: 'Students', path: '/admin/students', icon: '👨‍🎓' },
      { name: 'Teachers', path: '/admin/teachers', icon: '👩‍🏫' },
      { name: 'SMS Gateway', path: '/admin/sms-gateway', icon: '💬' },
      { name: 'Teacher Attendance', path: '/admin/teacher-attendance', icon: '✅' }, 
      { name: 'Fee Categories', path: '/admin/fee-categories', icon: '📋' },
      { name: 'Collect Fee', path: '/admin/collect-fee', icon: '💰' },
      { name: 'Fee Reports', path: '/admin/fee-reports', icon: '📈' },
      { name: 'Admit Cards', path: '/admin/admit-cards', icon: '🎫' },
      { name: 'Manage Exams', path: '/admin/exams', icon: '📝' },
      { name: 'Exam Routine', path: '/admin/exam-routine', icon: '📅' },
      { name: 'Marks Entry', path: '/admin/marks-entry', icon: '✅' },
      { name: 'Grades Setup', path: '/admin/grades-setup', icon: '⭐' },
      { name: 'Result Sheet', path: '/admin/result-sheet', icon: '📊' },
      { name: 'Class Tests', path: '/admin/class-tests', icon: '📝' },
      { name: 'Accounts', path: '/admin/accounts', icon: '🏦' }, 
      { name: 'Inventory', path: '/admin/inventory', icon: '📦' },
      { name: 'Recruitment', path: '/admin/recruitment', icon: '💼' },
    ],
    TEACHER: [
      { name: 'My Classes', path: '/teacher/dashboard', icon: '📅' },
      { name: 'Attendance', path: '/teacher/attendance', icon: '✅' },
      { name: 'Results', path: '/teacher/results', icon: '📝' },
    ],
    STUDENT: [
      { name: 'My Routine', path: '/student/dashboard', icon: '📅' },
      { name: 'Results', path: '/student/results', icon: '📋' },
    ],
    PARENT: [
      { name: 'Child Profile', path: '/parent/dashboard', icon: '👦' },
      { name: 'Fees Status', path: '/parent/fees', icon: '💳' },
    ],
  };

  const currentMenu = menuItems[userRole] || [];

  return (
    <div className="flex h-screen bg-[#F5F0FF] overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-brand-deepPlum text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="h-16 flex items-center justify-center border-b border-white/10 px-2">
          <Link to="/" title="Go to Home Page" className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
            <div className="w-10 h-10 bg-brand-royalPurple rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-brand-tealCyan shadow-md shrink-0">
              DIA
            </div>
            {isSidebarOpen && <span className="text-lg font-bold tracking-wide truncate">Ideal Academy</span>}
          </Link>
        </div>
        
        <nav className="flex-1 py-6 overflow-y-auto space-y-2">
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 mx-3 rounded-lg transition-colors ${
                  isActive 
                  ? 'bg-brand-tealCyan text-brand-deepPlum font-semibold shadow-md' 
                  : 'hover:bg-white/10 text-gray-300 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {isSidebarOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {isSidebarOpen && (
          <div className="p-4 border-t border-white/10 text-xs text-center text-gray-400">
            <p>Developed by Mahmudul Hasan Moon</p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-500 hover:text-brand-deepPlum focus:outline-none transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
               <p className="text-sm font-bold text-brand-deepPlum">{userName}</p>
               <p className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-full">{userRole}</p>
            </div>
            <button onClick={handleLogout} className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-semibold transition-colors">
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}