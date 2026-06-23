import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import api from '../api/axios';
import { Menu, X, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardLayout() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [displayRole, setDisplayRole] = useState('');
  const { userRole, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me/');
        setUserName(res.data.name);
        setDisplayRole(res.data.role || userRole);
      } catch (error) {
        console.error("Failed to fetch user info", error);
        const roleLabels = { ADMIN: 'Admin', TEACHER: 'Teacher', STUDENT: 'Student', PARENT: 'Parent' };
        setUserName(roleLabels[userRole] || 'User');
        setDisplayRole(roleLabels[userRole] || 'User');
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
      nameKey: 'sidebar.overview',
      items: [{ nameKey: 'sidebar.dashboard', path: '/admin/dashboard', icon: '📊' }],
    },
    {
      nameKey: 'sidebar.people_management',
      items: [
        { nameKey: 'sidebar.students', path: '/admin/students', icon: '👨‍🎓' },
        { nameKey: 'sidebar.teachers', path: '/admin/teachers', icon: '👩‍🏫' },
        { nameKey: 'sidebar.staffs', path: '/admin/staffs', icon: '👔' },
        { nameKey: 'sidebar.staff_setup', path: '/admin/staff-setup', icon: '⚙️' },
        { nameKey: 'sidebar.teacher_attendance', path: '/admin/teacher-attendance', icon: '✅' },
      ],
    },
    {
      nameKey: 'sidebar.hr_payroll',
      items: [
        { nameKey: 'sidebar.payroll', path: '/admin/payroll', icon: '💵' },
      ],
    },
    {
      nameKey: 'sidebar.fees_finance',
      items: [
        { nameKey: 'sidebar.fee_categories', path: '/admin/fee-categories', icon: '📋' },
        { nameKey: 'sidebar.collect_fee', path: '/admin/collect-fee', icon: '💰' },
        { nameKey: 'sidebar.fee_reports', path: '/admin/fee-reports', icon: '📈' },
        { nameKey: 'sidebar.accounts', path: '/admin/accounts', icon: '🏦' },
      ],
    },
    {
      nameKey: 'sidebar.examinations',
      items: [
        { nameKey: 'sidebar.manage_exams', path: '/admin/exams', icon: '📝' },
        { nameKey: 'sidebar.exam_routine', path: '/admin/exam-routine', icon: '📅' },
        { nameKey: 'sidebar.class_routine', path: '/admin/class-routine', icon: '🗓️' },
        { nameKey: 'sidebar.marks_entry', path: '/admin/marks-entry', icon: '✅' },
        { nameKey: 'sidebar.grades_setup', path: '/admin/grades-setup', icon: '⭐' },
        { nameKey: 'sidebar.result_sheet', path: '/admin/result-sheet', icon: '📊' },
        { nameKey: 'sidebar.class_tests', path: '/admin/class-tests', icon: '📝' },
        { nameKey: 'sidebar.admit_cards', path: '/admin/admit-cards', icon: '🎫' },
      ],
    },
    {
      nameKey: 'sidebar.communication',
      items: [{ nameKey: 'sidebar.sms_gateway', path: '/admin/sms-gateway', icon: '💬' }],
    },
    {
      nameKey: 'sidebar.attendance',
      items: [
        { nameKey: 'sidebar.attendance_mgmt', path: '/admin/attendance-management', icon: '📋' },
      ],
    },
    {
      nameKey: 'sidebar.security',
      items: [
        { nameKey: 'sidebar.password_mgmt', path: '/admin/password-management', icon: '🔐' },
      ],
    },
    {
      nameKey: 'sidebar.operations',
      items: [
        { nameKey: 'sidebar.inventory', path: '/admin/inventory', icon: '📦' },
        { nameKey: 'sidebar.recruitment', path: '/admin/recruitment', icon: '💼' },
      ],
    },
  ];

  const teacherMenuItems = [
    { nameKey: 'sidebar.my_classes', path: '/teacher/dashboard', icon: '📅' },
    { nameKey: 'sidebar.attendance_short', path: '/teacher/attendance', icon: '✅' },
    { nameKey: 'sidebar.results', path: '/teacher/results', icon: '📝' },
    { nameKey: 'sidebar.parent_messages', path: '/teacher/messages', icon: '💬' },
  ];

  const [viewMode, setViewMode] = useState('default');

  const studentMenuItems = [
    { nameKey: 'sidebar.my_routine', path: '/student/dashboard', icon: '📅' },
    { nameKey: 'sidebar.results', path: '/student/results', icon: '📋' },
  ];

  const parentMenuItems = [
    { nameKey: 'sidebar.dashboard', path: '/parent/dashboard', icon: '🏠' },
    { nameKey: 'sidebar.child_profile', path: '/parent/profile', icon: '👦' },
    { nameKey: 'sidebar.attendance_short', path: '/parent/attendance', icon: '📊' },
    { nameKey: 'sidebar.exam_results', path: '/parent/results', icon: '📝' },
    { nameKey: 'sidebar.fees_status', path: '/parent/fees', icon: '💳' },
    { nameKey: 'sidebar.messages', path: '/parent/messages', icon: '📬' },
  ];

  let menuCategories = [];
  let simpleMenu = [];
  if (userRole === 'ADMIN') {
    menuCategories = adminMenuCategories;
  } else if (userRole === 'TEACHER') {
    simpleMenu = teacherMenuItems;
  } else if (userRole === 'STUDENT') {
    if (viewMode === 'parent') {
      simpleMenu = parentMenuItems;
    } else {
      simpleMenu = studentMenuItems;
    }
  } else if (userRole === 'PARENT') {
    simpleMenu = parentMenuItems;
  }

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-20';

  const renderSidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-lg flex items-center justify-center">
            <span className="text-brand-deepPlum font-bold text-sm">DIA</span>
          </div>
          {isSidebarOpen && <span className="font-semibold text-md">{t('dashboard.ideal_academy')}</span>}
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
          menuCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              {isSidebarOpen && (
                <div className="text-[10px] uppercase tracking-wider text-gray-400 px-3 pt-2 pb-1 font-semibold">
                  {t(category.nameKey)}
                </div>
              )}
              {category.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.nameKey}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                    title={!isSidebarOpen ? t(item.nameKey) : ''}
                  >
                    <span className="text-base">{item.icon}</span>
                    {isSidebarOpen && <span>{t(item.nameKey)}</span>}
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
                  key={item.nameKey}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                  title={!isSidebarOpen ? t(item.nameKey) : ''}
                >
                  <span className="text-base">{item.icon}</span>
                  {isSidebarOpen && <span>{t(item.nameKey)}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {isSidebarOpen && (
        <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
          <p>{t('dashboard.developed')}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white shadow-md px-4 py-2 flex items-center justify-between">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-brand-deepPlum" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-lg flex items-center justify-center">
            <span className="text-brand-deepPlum font-bold text-xs">DIA</span>
          </div>
          <span className="font-medium text-brand-deepPlum text-sm">{t('dashboard.ideal_academy')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-700">{userName}</p>
            <p className="text-[10px] text-gray-400">{displayRole}</p>
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
                <span className="font-medium text-sm">{t('dashboard.ideal_academy')}</span>
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
                      {t(category.nameKey)}
                    </div>
                    {category.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.nameKey}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isActive
                              ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                              : 'text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span>{t(item.nameKey)}</span>
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
                        key={item.nameKey}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          isActive
                            ? 'bg-brand-tealCyan text-brand-deepPlum font-medium shadow-sm'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span>{t(item.nameKey)}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>
            <div className="p-4 border-t border-white/10 text-center text-xs text-gray-400">
              <p>{t('dashboard.developed')}</p>
            </div>
          </aside>
        </>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        <aside className={`${sidebarWidth} bg-brand-deepPlum text-white transition-all duration-300 flex flex-col shadow-md`}>
          {renderSidebarContent()}
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-12 bg-white shadow-sm flex items-center justify-between px-5 z-10 shrink-0 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-lg flex items-center justify-center">
                <span className="text-brand-deepPlum font-bold text-xs">DIA</span>
              </div>
              <span className="text-sm font-medium text-brand-deepPlum hidden md:inline">{t('dashboard.dashboard')}</span>
            </div>
            <div className="flex items-center gap-3">
              {userRole === 'STUDENT' && (
                <button
                  onClick={() => setViewMode(viewMode === 'parent' ? 'default' : 'parent')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    viewMode === 'parent'
                      ? 'bg-brand-royalPurple text-white'
                      : 'bg-brand-softLavender/20 text-brand-royalPurple border border-brand-royalPurple'
                  }`}
                >
                  {viewMode === 'parent' ? `👪 ${t('dashboard.parent_view')}` : `👪 ${t('dashboard.switch_to_parent')}`}
                </button>
              )}
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">{userName}</p>
                <p className="text-[10px] text-gray-400">{displayRole}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('dashboard.logout')}</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-5 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>

      <div className="lg:hidden">
        <main className="p-4 bg-gray-50 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}