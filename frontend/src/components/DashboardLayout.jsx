import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { Menu, X, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Categorized menu items for ADMIN
  const adminMenuCategories = [
    {
      name: 'Overview',
      items: [{ name: 'Dashboard', path: '/admin/dashboard', icon: '📊' }],
    },
    {
      name: 'People Management',
      items: [
        { name: 'Students', path: '/admin/students', icon: '👨‍🎓' },
        { name: 'Teachers', path: '/admin/teachers', icon: '👩‍🏫' },
        { name: 'Teacher Attendance', path: '/admin/teacher-attendance', icon: '✅' },
      ],
    },
    {
      name: 'Fees & Finance',
      items: [
        { name: 'Fee Categories', path: '/admin/fee-categories', icon: '📋' },
        { name: 'Collect Fee', path: '/admin/collect-fee', icon: '💰' },
        { name: 'Fee Reports', path: '/admin/fee-reports', icon: '📈' },
        { name: 'Accounts', path: '/admin/accounts', icon: '🏦' },
      ],
    },
    {
      name: 'Examinations',
      items: [
        { name: 'Manage Exams', path: '/admin/exams', icon: '📝' },
        { name: 'Exam Routine', path: '/admin/exam-routine', icon: '📅' },
        { name: 'Marks Entry', path: '/admin/marks-entry', icon: '✅' },
        { name: 'Grades Setup', path: '/admin/grades-setup', icon: '⭐' },
        { name: 'Result Sheet', path: '/admin/result-sheet', icon: '📊' },
        { name: 'Class Tests', path: '/admin/class-tests', icon: '📝' },
        { name: 'Admit Cards', path: '/admin/admit-cards', icon: '🎫' },
      ],
    },
    {
      name: 'Communication',
      items: [{ name: 'SMS Gateway', path: '/admin/sms-gateway', icon: '💬' }],
    },
    {
      name: 'Operations',
      items: [
        { name: 'Inventory', path: '/admin/inventory', icon: '📦' },
        { name: 'Recruitment', path: '/admin/recruitment', icon: '💼' },
      ],
    },
  ];

  const teacherMenuItems = [
    { name: 'My Classes', path: '/teacher/dashboard', icon: '📅' },
    { name: 'Attendance', path: '/teacher/attendance', icon: '✅' },
    { name: 'Results', path: '/teacher/results', icon: '📝' },
  ];

  const studentMenuItems = [
    { name: 'My Routine', path: '/student/dashboard', icon: '📅' },
    { name: 'Results', path: '/student/results', icon: '📋' },
  ];

  const parentMenuItems = [
    { name: 'Child Profile', path: '/parent/dashboard', icon: '👦' },
    { name: 'Fees Status', path: '/parent/fees', icon: '💳' },
  ];

  // Determine which menu to render
  let menuCategories = [];
  let simpleMenu = [];
  if (userRole === 'ADMIN') {
    menuCategories = adminMenuCategories;
  } else if (userRole === 'TEACHER') {
    simpleMenu = teacherMenuItems;
  } else if (userRole === 'STUDENT') {
    simpleMenu = studentMenuItems;
  } else if (userRole === 'PARENT') {
    simpleMenu = parentMenuItems;
  }

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-20';

  // Render sidebar content (shared between desktop and mobile drawer)
  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-lg flex items-center justify-center">
            <span className="text-brand-deepPlum font-bold text-sm">DIA</span>
          </div>
          {isSidebarOpen && <span className="font-semibold text-md">Ideal Academy</span>}
        </Link>
        {isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-full hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-1 rounded-full hover:bg-white/10">
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {menuCategories.length > 0 ? (
          // Admin categorized menu
          menuCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              {isSidebarOpen && (
                <div className="text-[10px] uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1 font-semibold">
                  {category.name}
                </div>
              )}
              {category.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                    title={!isSidebarOpen ? item.name : ''}
                  >
                    <span className="text-base">{item.icon}</span>
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))
        ) : (
          // Non-admin simple menu
          <div className="space-y-1">
            {simpleMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={!isSidebarOpen ? item.name : ''}
                >
                  <span className="text-base">{item.icon}</span>
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {isSidebarOpen && (
        <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
          <p>Developed by Mahmudul Hasan Moon</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header (visible only on mobile) */}
      <div className="lg:hidden sticky top-0 z-30 bg-white shadow-md px-4 py-2 flex items-center justify-between">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-brand-deepPlum" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-lg flex items-center justify-center">
            <span className="text-brand-deepPlum font-bold text-xs">DIA</span>
          </div>
          <span className="font-medium text-brand-deepPlum text-sm">Ideal Academy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-700">{userName}</p>
            <p className="text-[10px] text-gray-400">{userRole}</p>
          </div>
          <button onClick={handleLogout} className="p-1 rounded-lg hover:bg-red-50">
            <LogOut className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-64 bg-brand-deepPlum text-white z-50 shadow-xl flex flex-col transform transition-transform duration-300">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-lg flex items-center justify-center">
                  <span className="text-brand-deepPlum font-bold text-sm">DIA</span>
                </div>
                <span className="font-medium text-sm">Ideal Academy</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
              {menuCategories.length > 0 ? (
                menuCategories.map((category, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1 font-semibold">
                      {category.name}
                    </div>
                    {category.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="space-y-1">
                  {simpleMenu.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>
            <div className="p-4 border-t border-white/10 text-center text-xs text-gray-400">
              <p>Developed by Mahmudul Hasan Moon</p>
            </div>
          </aside>
        </>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`${sidebarWidth} bg-brand-deepPlum text-white transition-all duration-300 flex flex-col shadow-md`}>
          {renderSidebarContent()}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-12 bg-white shadow-sm flex items-center justify-between px-5 z-10 shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-lg flex items-center justify-center">
                <span className="text-brand-deepPlum font-bold text-xs">DIA</span>
              </div>
              <span className="text-sm font-medium text-brand-deepPlum hidden md:inline">Dashboard</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">{userName}</p>
                <p className="text-[10px] text-gray-400">{userRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-5 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Fallback for mobile (already handled above, but keep for safety) */}
      <div className="lg:hidden">
        <main className="p-4 bg-gray-50 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}