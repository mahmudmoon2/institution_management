import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import api from '../api/axios';
import {
  Menu, X, LogOut, ChevronLeft, ChevronRight,
  LayoutDashboard, Users, GraduationCap,
  UserCog, Settings, Banknote, ClipboardList, Receipt,
  BarChart3, Landmark, FileText, CalendarDays, Calendar,
  CheckSquare, Star, ScrollText, Ticket, MessageSquare,
  ShieldCheck, Package, Briefcase, Bell, Clock,
  UserCheck, Users2, Sun, Moon
} from 'lucide-react';

/* ──────────────────────────────────────────────
   DARK MODE DESIGN TOKENS
   ────────────────────────────────────────────── */
const Dark = {
  rootBg: 'bg-[#0c0a21]',
  rootText: 'text-white',
  sidebarBg: 'bg-[#0d0a27]/70 backdrop-blur-xl',
  sidebarBorder: 'border-white/[0.06]',
  sidebarCategory: 'text-slate-500',
  sidebarFooter: 'text-slate-600',
  sidebarFooterBorder: 'border-white/[0.06]',
  sidebarDivider: 'border-white/[0.04]',
  sidebarChevron: 'hover:bg-white/[0.06] text-slate-500 hover:text-slate-300',
  navActive: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-semibold border border-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]',
  navInactive: 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent',
  navIconActive: 'text-cyan-400',
  navIconInactive: 'text-slate-500 group-hover:text-slate-300',
  navDot: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]',
  headerBg: 'bg-[#0d0a27]/60 backdrop-blur-xl',
  headerBorder: 'border-white/[0.06]',
  headerTitle: 'text-slate-300',
  headerGlow: true,
  mobileHeaderBg: 'bg-[#0d0a27]/80 backdrop-blur-xl',
  mobileHeaderBorder: 'border-white/[0.06]',
  mobileSidebarBg: 'bg-[#0d0a27]/98 backdrop-blur-2xl',
  mobileSidebarBorder: 'border-white/[0.06]',
  mainBg: 'bg-transparent',
  topFade: true,
  logoTitle: 'bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent',
  userNameColor: 'text-slate-300',
  userRoleColor: 'text-slate-500',
  logoutBtn: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-red-500/10 hover:border-red-500/20',
  menuBtn: 'hover:bg-white/[0.06] text-slate-400 hover:text-white',
  themeBtn: 'hover:bg-white/[0.08] text-amber-400',
  backdropBlobs: true,
  sidebarInnerGlow: true,
};

/* ──────────────────────────────────────────────
   LIGHT MODE DESIGN TOKENS
   ────────────────────────────────────────────── */
const Light = {
  rootBg: 'bg-[#F4F7FE]',
  rootText: 'text-gray-800',
  sidebarBg: 'bg-white',
  sidebarBorder: 'border-gray-200',
  sidebarCategory: 'text-gray-400',
  sidebarFooter: 'text-gray-400',
  sidebarFooterBorder: 'border-gray-200',
  sidebarDivider: 'border-gray-200',
  sidebarChevron: 'hover:bg-gray-100 text-gray-400 hover:text-gray-600',
  navActive: 'bg-brand-tealCyan text-brand-deepPlum font-semibold shadow-sm border border-brand-tealCyan/50',
  navInactive: 'text-gray-600 hover:bg-brand-tealCyan/10 hover:text-brand-deepPlum border border-transparent',
  navIconActive: 'text-brand-deepPlum',
  navIconInactive: 'text-gray-400 group-hover:text-brand-deepPlum',
  navDot: 'bg-brand-deepPlum',
  headerBg: 'bg-white',
  headerBorder: 'border-gray-200',
  headerTitle: 'text-gray-700',
  headerGlow: false,
  mobileHeaderBg: 'bg-white',
  mobileHeaderBorder: 'border-gray-200',
  mobileSidebarBg: 'bg-white',
  mobileSidebarBorder: 'border-gray-200',
  mainBg: 'bg-[#F4F7FE]',
  topFade: false,
  logoTitle: 'text-gray-800',
  userNameColor: 'text-gray-800',
  userRoleColor: 'text-gray-400',
  logoutBtn: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
  menuBtn: 'hover:bg-gray-100 text-gray-600',
  themeBtn: 'hover:bg-gray-100 text-gray-500 hover:text-gray-700',
  backdropBlobs: false,
  sidebarInnerGlow: false,
};

export default function DashboardLayout() {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [displayRole, setDisplayRole] = useState('');
  const { userRole, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isDark = theme === 'dark';
  const T = isDark ? Dark : Light;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me/');
        setUserName(res.data.name);
        setDisplayRole(res.data.role || userRole);
      } catch {
        const roleLabels = { ADMIN: 'Admin', TEACHER: 'Teacher', STUDENT: 'Student', PARENT: 'Parent' };
        setUserName(roleLabels[userRole] || 'User');
        setDisplayRole(roleLabels[userRole] || 'User');
      }
    };
    fetchUser();
  }, [userRole]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminMenuCategories = [
    { nameKey: 'sidebar.overview', items: [{ nameKey: 'sidebar.dashboard', path: '/admin/dashboard', icon: LayoutDashboard }] },
    { nameKey: 'sidebar.people_management', items: [
      { nameKey: 'sidebar.students', path: '/admin/students', icon: Users },
      { nameKey: 'sidebar.teachers', path: '/admin/teachers', icon: GraduationCap },
      { nameKey: 'sidebar.staffs', path: '/admin/staffs', icon: UserCog },
      { nameKey: 'sidebar.staff_setup', path: '/admin/staff-setup', icon: Settings },
      { nameKey: 'sidebar.teacher_attendance', path: '/admin/teacher-attendance', icon: UserCheck },
    ]},
    { nameKey: 'sidebar.hr_payroll', items: [{ nameKey: 'sidebar.payroll', path: '/admin/payroll', icon: Banknote }] },
    { nameKey: 'sidebar.fees_finance', items: [
      { nameKey: 'sidebar.fee_categories', path: '/admin/fee-categories', icon: ClipboardList },
      { nameKey: 'sidebar.collect_fee', path: '/admin/collect-fee', icon: Receipt },
      { nameKey: 'sidebar.fee_reports', path: '/admin/fee-reports', icon: BarChart3 },
      { nameKey: 'sidebar.accounts', path: '/admin/accounts', icon: Landmark },
    ]},
    { nameKey: 'sidebar.examinations', items: [
      { nameKey: 'sidebar.manage_exams', path: '/admin/exams', icon: FileText },
      { nameKey: 'sidebar.exam_routine', path: '/admin/exam-routine', icon: CalendarDays },
      { nameKey: 'sidebar.class_routine', path: '/admin/class-routine', icon: Calendar },
      { nameKey: 'sidebar.marks_entry', path: '/admin/marks-entry', icon: CheckSquare },
      { nameKey: 'sidebar.grades_setup', path: '/admin/grades-setup', icon: Star },
      { nameKey: 'sidebar.result_sheet', path: '/admin/result-sheet', icon: BarChart3 },
      { nameKey: 'sidebar.class_tests', path: '/admin/class-tests', icon: ScrollText },
      { nameKey: 'sidebar.admit_cards', path: '/admin/admit-cards', icon: Ticket },
    ]},
    { nameKey: 'sidebar.communication', items: [{ nameKey: 'sidebar.sms_gateway', path: '/admin/sms-gateway', icon: MessageSquare }] },
    { nameKey: 'sidebar.attendance', items: [{ nameKey: 'sidebar.attendance_mgmt', path: '/admin/attendance-management', icon: Clock }] },
    { nameKey: 'sidebar.security', items: [{ nameKey: 'sidebar.password_mgmt', path: '/admin/password-management', icon: ShieldCheck }] },
    { nameKey: 'sidebar.operations', items: [
      { nameKey: 'sidebar.inventory', path: '/admin/inventory', icon: Package },
      { nameKey: 'sidebar.recruitment', path: '/admin/recruitment', icon: Briefcase },
    ]},
  ];

  const teacherMenuItems = [
    { nameKey: 'sidebar.my_classes', path: '/teacher/dashboard', icon: Calendar },
    { nameKey: 'sidebar.attendance_short', path: '/teacher/attendance', icon: CheckSquare },
    { nameKey: 'sidebar.results', path: '/teacher/results', icon: FileText },
    { nameKey: 'sidebar.parent_messages', path: '/teacher/messages', icon: MessageSquare },
  ];

  const [viewMode, setViewMode] = useState('default');
  const studentMenuItems = [
    { nameKey: 'sidebar.my_routine', path: '/student/dashboard', icon: Calendar },
    { nameKey: 'sidebar.results', path: '/student/results', icon: ClipboardList },
  ];
  const parentMenuItems = [
    { nameKey: 'sidebar.dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
    { nameKey: 'sidebar.child_profile', path: '/parent/profile', icon: Users2 },
    { nameKey: 'sidebar.attendance_short', path: '/parent/attendance', icon: BarChart3 },
    { nameKey: 'sidebar.exam_results', path: '/parent/results', icon: FileText },
    { nameKey: 'sidebar.fees_status', path: '/parent/fees', icon: Receipt },
    { nameKey: 'sidebar.messages', path: '/parent/messages', icon: Bell },
  ];

  let menuCategories = [];
  let simpleMenu = [];
  if (userRole === 'ADMIN') menuCategories = adminMenuCategories;
  else if (userRole === 'TEACHER') simpleMenu = teacherMenuItems;
  else if (userRole === 'STUDENT') simpleMenu = viewMode === 'parent' ? parentMenuItems : studentMenuItems;
  else if (userRole === 'PARENT') simpleMenu = parentMenuItems;

  const previousPathname = useRef(location.pathname);
  useEffect(() => {
    if (previousPathname.current !== location.pathname) {
      setIsMobileMenuOpen(false);
      previousPathname.current = location.pathname;
    }
  }, [location.pathname]);

  const sidebarWidth = isSidebarOpen ? 'w-64' : 'w-20';

  /* ─── Nav Link ─── */
  const renderNavLink = (item) => {
    const isActive = location.pathname === item.path;
    const IconComponent = item.icon;
    return (
      <Link
        key={item.nameKey}
        to={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group relative ${isActive ? T.navActive : T.navInactive}`}
        title={!isSidebarOpen ? t(item.nameKey) : ''}
      >
        <IconComponent className={`w-4.5 h-4.5 shrink-0 transition-colors ${isActive ? T.navIconActive : T.navIconInactive}`} />
        {isSidebarOpen && <span className="truncate">{t(item.nameKey)}</span>}
        {isActive && isSidebarOpen && (
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${T.navDot}`}></span>
        )}
      </Link>
    );
  };

  /* ─── Shared Sidebar Content ─── */
  const renderSidebarContent = (
    <>
      {/* Logo */}
      <div className={`flex items-center justify-between p-4 border-b ${T.sidebarBorder}`}>
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/30 transition-shadow">
            <span className="font-extrabold text-sm tracking-wider text-white">DIA</span>
          </div>
          {isSidebarOpen && (
            <span className={`font-bold text-sm tracking-wide ${T.logoTitle}`}>
              {t('dashboard.ideal_academy')}
            </span>
          )}
        </Link>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-1.5 rounded-lg transition-all ${T.sidebarChevron}`}>
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
        {menuCategories.length > 0 ? (
          menuCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              {isSidebarOpen && (
                <div className={`text-[10px] uppercase tracking-[0.15em] px-3 pt-1 pb-2 font-bold select-none ${T.sidebarCategory}`}>
                  {t(category.nameKey)}
                </div>
              )}
              {!isSidebarOpen && category.items.length > 0 && (
                <div className={`mx-2 my-2 border-t ${T.sidebarDivider}`}></div>
              )}
              {category.items.map((item) => renderNavLink(item))}
            </div>
          ))
        ) : (
          <div className="space-y-1">{simpleMenu.map((item) => renderNavLink(item))}</div>
        )}
      </nav>

      {/* Footer */}
      {isSidebarOpen && (
        <div className={`p-4 border-t text-center text-[10px] font-medium tracking-wide ${T.sidebarFooterBorder} ${T.sidebarFooter}`}>
          <p>{t('dashboard.developed')}</p>
        </div>
      )}
    </>
  );

  return (
    <div className={`min-h-screen flex relative overflow-hidden transition-colors duration-500 ${T.rootBg} ${T.rootText}`}>
      {/* Dark ambient blobs */}
      {T.backdropBlobs && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-15%] left-[-8%] w-[55vw] h-[55vw] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
          <div className="absolute bottom-[-8%] right-[-8%] w-[45vw] h-[45vw] bg-cyan-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '14s' }}></div>
          <div className="absolute top-[35%] left-[25%] w-[30vw] h-[30vw] bg-indigo-900/8 rounded-full blur-[100px]"></div>
        </div>
      )}

      {/* ═══ MOBILE HEADER ═══ */}
      <div className={`lg:hidden sticky top-0 z-30 border-b px-4 py-2.5 flex items-center justify-between transition-colors duration-300 shadow-sm ${T.mobileHeaderBg} ${T.mobileHeaderBorder}`}>
        <button onClick={() => setIsMobileMenuOpen(true)} className={`p-1.5 rounded-lg transition ${T.menuBtn}`}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <span className="text-white font-bold text-[10px]">DIA</span>
          </div>
          <span className={`font-semibold text-sm ${isDark ? 'bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent' : 'text-gray-800'}`}>
            {t('dashboard.ideal_academy')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className={`p-1.5 rounded-lg transition ${T.themeBtn}`}>
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="text-right leading-tight">
            <p className={`text-xs font-medium ${T.userNameColor}`}>{userName}</p>
            <p className={`text-[10px] ${T.userRoleColor}`}>{displayRole}</p>
          </div>
          <button onClick={handleLogout} className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-500'}`}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ═══ MOBILE SIDEBAR DRAWER ═══ */}
      {isMobileMenuOpen && (
        <>
          <div className={`fixed inset-0 z-40 lg:hidden ${isDark ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/40'}`} onClick={() => setIsMobileMenuOpen(false)} />
          <aside className={`fixed top-0 left-0 h-full w-64 z-50 shadow-2xl flex flex-col border-r transition-colors duration-300 ${T.mobileSidebarBg} ${T.rootText} ${T.mobileSidebarBorder}`}>
            <div className={`flex items-center justify-between p-4 border-b ${T.sidebarBorder}`}>
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <span className="text-white font-bold text-sm">DIA</span>
                </div>
                <span className={`font-bold text-sm ${T.logoTitle}`}>{t('dashboard.ideal_academy')}</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className={`p-1.5 rounded-lg transition ${T.sidebarChevron}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 custom-scrollbar">
              {menuCategories.length > 0 ? (
                menuCategories.map((category, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className={`text-[10px] uppercase tracking-[0.15em] px-3 pt-1 pb-2 font-bold ${T.sidebarCategory}`}>{t(category.nameKey)}</div>
                    {category.items.map((item) => renderNavLink(item))}
                  </div>
                ))
              ) : (
                <div className="space-y-1">{simpleMenu.map((item) => renderNavLink(item))}</div>
              )}
            </nav>
            <div className={`p-4 border-t text-center text-[10px] font-medium ${T.sidebarFooterBorder} ${T.sidebarFooter}`}>
              <p>{t('dashboard.developed')}</p>
            </div>
          </aside>
        </>
      )}

      {/* ═══ DESKTOP ═══ */}
      <div className="hidden lg:flex h-screen overflow-hidden w-full">
        {/* Sidebar */}
        <aside className={`${sidebarWidth} flex flex-col border-r z-20 shrink-0 relative transition-all duration-300 ${T.sidebarBg} ${T.sidebarBorder} ${T.rootText}`}>
          {T.sidebarInnerGlow && (
            <>
              <div className="absolute top-0 right-0 w-32 h-64 bg-cyan-500/[0.03] rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-64 bg-purple-500/[0.03] rounded-full blur-[80px] pointer-events-none"></div>
            </>
          )}
          {renderSidebarContent}
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Header */}
          <header className={`h-12 flex items-center justify-between px-5 z-20 shrink-0 relative border-b transition-colors duration-300 ${T.headerBg} ${T.headerBorder}`}>
            {T.headerGlow && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] via-transparent to-purple-500/[0.02] pointer-events-none"></div>
            )}
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-md shadow-cyan-500/20">
                <span className="text-white font-bold text-[10px]">DIA</span>
              </div>
              <span className={`text-sm font-semibold hidden md:inline tracking-wide ${T.headerTitle}`}>
                {t('dashboard.dashboard')}
              </span>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              {userRole === 'STUDENT' && (
                <button
                  onClick={() => setViewMode(viewMode === 'parent' ? 'default' : 'parent')}
                  className={`text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 ${
                    viewMode === 'parent'
                      ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                      : isDark ? 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:border-purple-500/30 hover:text-purple-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
                  }`}
                >
                  {viewMode === 'parent' ? `👪 ${t('dashboard.parent_view')}` : `👪 ${t('dashboard.switch_to_parent')}`}
                </button>
              )}

              {/* Theme Toggle */}
              <button onClick={toggleTheme} className={`p-1.5 rounded-lg transition-all duration-300 ${T.themeBtn}`} title={isDark ? 'Light Mode' : 'Dark Mode'}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="text-right leading-tight hidden sm:block">
                <p className={`text-xs font-semibold ${T.userNameColor}`}>{userName}</p>
                <p className={`text-[10px] tracking-wide ${T.userRoleColor}`}>{displayRole}</p>
              </div>

              <button onClick={handleLogout} className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-300 border ${T.logoutBtn}`}>
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('dashboard.logout')}</span>
              </button>
            </div>
          </header>

          {/* Content */}
          <main className={`flex-1 overflow-x-hidden overflow-y-auto p-5 relative transition-colors duration-300 ${T.mainBg}`}>
            {T.topFade && (
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0c0a21]/80 to-transparent pointer-events-none z-10"></div>
            )}
            <div className="relative z-0"><Outlet /></div>
          </main>
        </div>
      </div>

      {/* ═══ MOBILE CONTENT ═══ */}
      <div className="lg:hidden w-full z-10">
        <main className={`p-4 min-h-screen transition-colors duration-300 ${T.mainBg}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}