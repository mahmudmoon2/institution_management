import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import api from '../api/axios';
import {
  Menu, X, LogOut, LayoutDashboard, Users, GraduationCap,
  UserCog, Settings, Banknote, ClipboardList, Receipt,
  BarChart3, Landmark, FileText, CalendarDays, Calendar,
  CheckSquare, Star, ScrollText, Ticket, MessageSquare,
  ShieldCheck, Package, Briefcase, Bell, Clock,
  UserCheck, Users2, Sun, Moon, ChevronDown
} from 'lucide-react';

/* ──────────────────────────────────────────────
   DARK MODE
   ────────────────────────────────────────────── */
const Dark = {
  rootBg: 'bg-[#0c0a21]',
  rootText: 'text-white',
  sidebarBg: 'bg-[#0d0a27]/98 backdrop-blur-2xl',
  sidebarBorder: 'border-white/[0.06]',
  sidebarCategory: 'text-slate-500',
  navActive: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-semibold border border-cyan-500/20',
  navInactive: 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent',
  navIconActive: 'text-cyan-400',
  navIconInactive: 'text-slate-500',
  navDot: 'bg-cyan-400',
  headerBg: 'bg-[#0d0a27]/80 backdrop-blur-xl',
  headerBorder: 'border-white/[0.06]',
  headerTitle: 'text-slate-300',
  mobileHeaderBg: 'bg-[#0d0a27]/95 backdrop-blur-xl',
  mobileHeaderBorder: 'border-white/[0.06]',
  mainBg: 'bg-transparent',
  logoutBtn: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
  backdropBlobs: true,
};

/* ──────────────────────────────────────────────
   LIGHT MODE
   ────────────────────────────────────────────── */
const Light = {
  rootBg: 'bg-[#F4F7FE]',
  rootText: 'text-gray-800',
  sidebarBg: 'bg-white',
  sidebarBorder: 'border-gray-200',
  sidebarCategory: 'text-gray-400',
  navActive: 'bg-brand-tealCyan text-brand-deepPlum font-semibold shadow-sm border border-brand-tealCyan/50',
  navInactive: 'text-gray-600 hover:bg-brand-tealCyan/10 hover:text-brand-deepPlum border border-transparent',
  navIconActive: 'text-brand-deepPlum',
  navIconInactive: 'text-gray-400',
  navDot: 'bg-brand-deepPlum',
  headerBg: 'bg-white',
  headerBorder: 'border-gray-200',
  headerTitle: 'text-gray-700',
  mobileHeaderBg: 'bg-white',
  mobileHeaderBorder: 'border-gray-200',
  mainBg: 'bg-[#F4F7FE]',
  logoutBtn: 'bg-red-50 text-red-600 hover:bg-red-100',
  backdropBlobs: false,
};

export default function DashboardLayout() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [displayRole, setDisplayRole] = useState('');
  const { userRole, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState(null);

  const isDark = theme === 'dark';
  const T = isDark ? Dark : Light;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me/');
        setUserName(res.data.name);
        setDisplayRole(res.data.role || userRole);
      } catch {
        const labels = { ADMIN: 'Admin', TEACHER: 'Teacher', STUDENT: 'Student', PARENT: 'Parent' };
        setUserName(labels[userRole] || 'User');
        setDisplayRole(labels[userRole] || 'User');
      }
    };
    fetchUser();
  }, [userRole]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminMenu = [
    { cat: 'sidebar.overview', items: [{ key: 'sidebar.dashboard', path: '/admin/dashboard', icon: LayoutDashboard }] },
    { cat: 'sidebar.people_management', items: [
      { key: 'sidebar.students', path: '/admin/students', icon: Users },
      { key: 'sidebar.teachers', path: '/admin/teachers', icon: GraduationCap },
      { key: 'sidebar.staffs', path: '/admin/staffs', icon: UserCog },
      { key: 'sidebar.staff_setup', path: '/admin/staff-setup', icon: Settings },
      { key: 'sidebar.teacher_attendance', path: '/admin/teacher-attendance', icon: UserCheck },
    ]},
    { cat: 'sidebar.hr_payroll', items: [{ key: 'sidebar.payroll', path: '/admin/payroll', icon: Banknote }] },
    { cat: 'sidebar.fees_finance', items: [
      { key: 'sidebar.fee_categories', path: '/admin/fee-categories', icon: ClipboardList },
      { key: 'sidebar.collect_fee', path: '/admin/collect-fee', icon: Receipt },
      { key: 'sidebar.fee_reports', path: '/admin/fee-reports', icon: BarChart3 },
      { key: 'sidebar.accounts', path: '/admin/accounts', icon: Landmark },
    ]},
    { cat: 'sidebar.examinations', items: [
      { key: 'sidebar.manage_exams', path: '/admin/exams', icon: FileText },
      { key: 'sidebar.exam_routine', path: '/admin/exam-routine', icon: CalendarDays },
      { key: 'sidebar.class_routine', path: '/admin/class-routine', icon: Calendar },
      { key: 'sidebar.marks_entry', path: '/admin/marks-entry', icon: CheckSquare },
      { key: 'sidebar.grades_setup', path: '/admin/grades-setup', icon: Star },
      { key: 'sidebar.result_sheet', path: '/admin/result-sheet', icon: BarChart3 },
      { key: 'sidebar.class_tests', path: '/admin/class-tests', icon: ScrollText },
      { key: 'sidebar.admit_cards', path: '/admin/admit-cards', icon: Ticket },
    ]},
    { cat: 'sidebar.communication', items: [{ key: 'sidebar.sms_gateway', path: '/admin/sms-gateway', icon: MessageSquare }] },
    { cat: 'sidebar.attendance', items: [{ key: 'sidebar.attendance_mgmt', path: '/admin/attendance-management', icon: Clock }] },
    { cat: 'sidebar.security', items: [{ key: 'sidebar.password_mgmt', path: '/admin/password-management', icon: ShieldCheck }] },
    { cat: 'sidebar.operations', items: [
      { key: 'sidebar.inventory', path: '/admin/inventory', icon: Package },
      { key: 'sidebar.recruitment', path: '/admin/recruitment', icon: Briefcase },
    ]},
  ];

  const teacherMenu = [
    { key: 'sidebar.my_classes', path: '/teacher/dashboard', icon: Calendar },
    { key: 'sidebar.attendance_short', path: '/teacher/attendance', icon: CheckSquare },
    { key: 'sidebar.results', path: '/teacher/results', icon: FileText },
    { key: 'sidebar.parent_messages', path: '/teacher/messages', icon: MessageSquare },
  ];

  const studentMenu = [
    { key: 'sidebar.my_routine', path: '/student/dashboard', icon: Calendar },
    { key: 'sidebar.results', path: '/student/results', icon: ClipboardList },
  ];

  const parentMenu = [
    { key: 'sidebar.dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    { key: 'sidebar.child_profile', path: '/parent/profile', icon: Users2 },
    { key: 'sidebar.attendance_short', path: '/parent/attendance', icon: BarChart3 },
    { key: 'sidebar.exam_results', path: '/parent/results', icon: FileText },
    { key: 'sidebar.fees_status', path: '/parent/fees', icon: Receipt },
    { key: 'sidebar.messages', path: '/parent/messages', icon: Bell },
  ];

  let categories = [];
  let flatItems = [];
  if (userRole === 'ADMIN') categories = adminMenu;
  else if (userRole === 'TEACHER') flatItems = teacherMenu;
  else if (userRole === 'STUDENT') flatItems = studentMenu;
  else if (userRole === 'PARENT') flatItems = parentMenu;

  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setIsMobileMenuOpen(false);
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const renderNavItem = (item, collapsed = false) => (
    <Link
      key={item.key}
      to={item.path}
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
        isActive(item.path) ? T.navActive : T.navInactive
      } ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <item.icon className={`w-4.5 h-4.5 shrink-0 ${isActive(item.path) ? T.navIconActive : T.navIconInactive}`} />
      {!collapsed && <span className="truncate">{t(item.key)}</span>}
      {isActive(item.path) && !collapsed && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${T.navDot}`} />}
    </Link>
  );

  const renderCategoryNav = (collapsed = false) => (
    <>
      {categories.length > 0 && categories.map((cat, idx) => (
        <div key={idx} className="space-y-0.5">
          {!collapsed && (
            <div className={`text-[10px] uppercase tracking-[0.15em] px-3 pt-2 pb-1 font-semibold select-none ${T.sidebarCategory}`}>
              {t(cat.cat)}
            </div>
          )}
          {cat.items.map(item => renderNavItem(item, collapsed))}
        </div>
      ))}
      {flatItems.length > 0 && flatItems.map(item => renderNavItem(item, collapsed))}
    </>
  );

  return (
    <div className={`min-h-screen ${T.rootBg} ${T.rootText}`}>
      {/* ═══ MOBILE HEADER ═══ */}
      <div className={`lg:hidden sticky top-0 z-30 border-b ${T.mobileHeaderBg} ${T.mobileHeaderBorder}`}>
        <div className="flex items-center justify-between px-3 h-12">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-md shrink-0">
              <span className="text-white font-bold text-[10px]">DIA</span>
            </div>
            <span className="font-semibold text-sm truncate max-w-[80px]">{t('dashboard.ideal_academy')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 min-h-[40px] min-w-[40px] flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className={`absolute top-0 left-0 h-full w-72 shadow-2xl flex flex-col border-r ${T.sidebarBg} ${T.rootText} ${T.sidebarBorder}`}>
            <div className={`flex items-center justify-between p-4 border-b ${T.sidebarBorder}`}>
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-white font-bold text-sm">DIA</span>
                </div>
                <span className="font-bold text-sm">{t('dashboard.ideal_academy')}</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white min-h-[40px] min-w-[40px] flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
              {renderCategoryNav(false)}
            </nav>
            <div className={`p-4 border-t text-center text-[10px] ${T.sidebarBorder} text-slate-500`}>
              <p>{t('dashboard.developed')}</p>
            </div>
          </aside>
        </div>
      )}

      {/* ═══ MOBILE CONTENT ═══ */}
      <div className="lg:hidden">
        {/* User info bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-brand-tealCyan/20 text-brand-deepPlum'}`}>
              {userName.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{userName || 'User'}</p>
              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{displayRole}</p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-semibold shrink-0 ${isDark ? 'bg-white/[0.05] text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
            {displayRole}
          </span>
        </div>

        {/* Page content - mobile outlet */}
        <main className="min-h-[calc(100vh-7rem)]">
          <Outlet />
        </main>
      </div>

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden lg:flex h-screen overflow-hidden">
        {/* Ambient blobs */}
        {T.backdropBlobs && (
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-15%] left-[-8%] w-[55vw] h-[55vw] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
            <div className="absolute bottom-[-8%] right-[-8%] w-[45vw] h-[45vw] bg-cyan-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '14s' }}></div>
          </div>
        )}

        {/* Sidebar */}
        <aside className={`w-64 flex flex-col border-r z-10 shrink-0 relative ${T.sidebarBg} ${T.sidebarBorder} ${T.rootText}`}>
          <div className={`flex items-center gap-2.5 p-4 border-b ${T.sidebarBorder}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shrink-0">
              <span className="font-extrabold text-sm tracking-wider text-white">DIA</span>
            </div>
            <span className="font-bold text-sm tracking-wide truncate">{t('dashboard.ideal_academy')}</span>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {renderCategoryNav(false)}
          </nav>
          <div className={`p-4 border-t text-center text-[10px] ${T.sidebarBorder} text-slate-500`}>
            <p>{t('dashboard.developed')}</p>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <header className={`h-12 flex items-center justify-between px-5 shrink-0 border-b ${T.headerBg} ${T.headerBorder}`}>
            <span className={`text-sm font-semibold tracking-wide ${T.headerTitle}`}>{t('dashboard.dashboard')}</span>
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-gray-800'}`}>{userName}</p>
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{displayRole}</p>
              </div>
              <button onClick={toggleTheme} className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/[0.08] text-amber-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={handleLogout} className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-semibold border ${T.logoutBtn}`}>
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('dashboard.logout')}</span>
              </button>
            </div>
          </header>
          <main className={`flex-1 overflow-x-hidden overflow-y-auto p-5 relative ${T.mainBg}`}>
            <div className="relative z-0"><Outlet /></div>
          </main>
        </div>
      </div>
    </div>
  );
}