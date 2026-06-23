import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Shield, 
  GraduationCap, 
  BookOpen, 
  Lock, 
  User, 
  Languages, 
  HelpCircle, 
  Info, 
  Phone, 
  Mail, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const ROLES = [
  { 
    id: 'ADMIN', 
    icon: Shield, 
    descKey: 'login.role_admin_desc', 
    labelKey: 'login.admin', 
    credentialKey: 'login.username',
    colorClass: 'from-cyan-500 to-blue-500 shadow-cyan-500/25 ring-cyan-400/50',
    iconColor: 'text-cyan-400',
    themeGlow: 'shadow-[0_0_20px_rgba(34,211,238,0.25)]'
  },
  { 
    id: 'STUDENT', 
    icon: GraduationCap, 
    descKey: 'login.role_student_desc', 
    labelKey: 'login.student_parent', 
    credentialKey: 'login.student_id',
    colorClass: 'from-purple-500 to-indigo-500 shadow-purple-500/25 ring-purple-400/50',
    iconColor: 'text-purple-400',
    themeGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]'
  },
  { 
    id: 'TEACHER', 
    icon: BookOpen, 
    descKey: 'login.role_teacher_desc', 
    labelKey: 'login.teacher', 
    credentialKey: 'login.teacher_id',
    colorClass: 'from-emerald-500 to-teal-500 shadow-emerald-500/25 ring-emerald-400/50',
    iconColor: 'text-emerald-400',
    themeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]'
  },
];

export default function Login() {
  const { t, i18n } = useTranslation();
  const [selectedRole, setSelectedRole] = useState(null);
  const [credentials, setCredentials] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(0);

  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  // Carousel timer for left column branding
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHighlight((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCredentials({ identifier: '', password: '' });
    setShowPassword(false);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await login(credentials.identifier, credentials.password, selectedRole.id);
    if (success) {
      if (selectedRole.id === 'STUDENT') {
        const { userRole } = useAuthStore.getState();
        if (userRole === 'PARENT') {
          navigate('/parent/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else if (selectedRole.id === 'TEACHER') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  const currentHighlight = [
    {
      title: t('login.highlight_1_title'),
      desc: t('login.highlight_1_desc'),
      icon: GraduationCap,
      accent: 'from-cyan-400 to-blue-500'
    },
    {
      title: t('login.highlight_2_title'),
      desc: t('login.highlight_2_desc'),
      icon: BookOpen,
      accent: 'from-emerald-400 to-teal-500'
    },
    {
      title: t('login.highlight_3_title'),
      desc: t('login.highlight_3_desc'),
      icon: Shield,
      accent: 'from-purple-400 to-indigo-500'
    }
  ][activeHighlight];

  return (
    <div className="min-h-screen flex text-white relative overflow-hidden bg-[#0c0a21]">
      
      {/* Background Animated Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/15 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-900/15 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[40%] left-[30%] w-[35vw] h-[35vw] bg-indigo-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* LEFT COLUMN: Premium Showcase Panel (hidden on mobile, visible on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5 z-10 bg-gradient-to-b from-[#0d0a27] via-[#09071c] to-[#04030e]">
        
        {/* Top school info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <span className="font-extrabold text-base tracking-wider text-white">DIA</span>
          </div>
          <div>
            <h2 className="font-black text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight uppercase tracking-wider">
              {t('dashboard.ideal_academy')}
            </h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{t('home.nurturing')}</p>
          </div>
        </div>

        {/* Dynamic Carousel Slide with custom animations */}
        <div className="my-auto max-w-md space-y-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-cyan-400 border border-cyan-400/20 shadow-inner">
              <Sparkles className="w-3.5 h-3.5" />
              {t('home.why_choose_dia')}
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent leading-tight">
              {t('about.subtitle')}
            </h1>
          </div>

          <div className="relative min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeHighlight}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-4"
              >
                <div className={`inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br ${currentHighlight.accent} text-white shadow-xl`}>
                  <currentHighlight.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{currentHighlight.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{currentHighlight.desc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Indicator Dots */}
          <div className="flex gap-2.5">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveHighlight(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeHighlight === idx ? 'w-8 bg-cyan-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              ></button>
            ))}
          </div>
        </div>

        {/* Live Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mt-auto">
          {[
            { value: '1200+', label: t('home.stats_students'), emoji: '🎒' },
            { value: '80+', label: t('home.stats_teachers'), emoji: '👨‍🏫' },
            { value: '25+', label: t('home.stats_legacy'), emoji: '🏫' },
            { value: '98%', label: t('home.stats_achievers'), emoji: '⭐' }
          ].map((stat, i) => (
            <div 
              key={i} 
              className="p-3 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 group"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/30 group-hover:scale-110 transition-transform">{stat.emoji}</span>
              </div>
              <div className="font-extrabold text-base text-white tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-white/40 leading-tight truncate">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive Login Portal Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 z-10 bg-gradient-to-b from-[#0b0821] via-[#070517] to-[#04030d]">
        
        {/* Container for login card */}
        <div className="w-full max-w-md">
          
          {/* Header Mobile Brand */}
          <div className="text-center lg:hidden mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-400 to-indigo-500 rounded-2xl mb-2 shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-lg">DIA</span>
            </div>
            <h1 className="text-2xl font-black text-white">{t('dashboard.ideal_academy')}</h1>
            <p className="text-white/40 text-xs tracking-wider">{t('login.welcome_back')}</p>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white/[0.03] backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            {/* Ambient inner card glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px] pointer-events-none"></div>

            {/* Top Bar Actions */}
            <div className="flex items-center justify-between mb-8 z-20 relative">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-semibold transition-all duration-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 hover:border-white/10"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t('nav.home')}
              </button>

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all duration-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 rounded-xl border border-cyan-500/20"
              >
                <Languages className="w-3.5 h-3.5" />
                {i18n.language === 'en' ? 'বাংলা' : 'English'}
              </button>
            </div>

            <div className="mb-6 relative">
              <h2 className="text-2xl font-black text-white tracking-tight">{t('login.title')}</h2>
              <p className="text-white/50 text-xs mt-1">{t('login.subtitle')}</p>
            </div>

            {/* Role Cards Selector */}
            <div className="space-y-2 mb-6">
              <label className="block text-[11px] font-bold text-white/40 uppercase tracking-widest mb-2">
                {t('login.select_role')}
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {ROLES.map((role) => {
                  const isSelected = selectedRole?.id === role.id;
                  const IconComponent = role.icon;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`
                        flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden group
                        ${isSelected
                          ? `bg-gradient-to-br ${role.colorClass} text-white shadow-xl scale-[1.03] ring-2 ${role.colorClass} ${role.themeGlow}`
                          : 'bg-white/[0.02] text-white/60 hover:bg-white/[0.06] hover:text-white border border-white/5 hover:border-white/10'
                        }
                      `}
                    >
                      {/* Active indicator overlay */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}

                      <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                        ${isSelected ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'}
                      `}>
                        <IconComponent className={`w-4.5 h-4.5 ${isSelected ? 'text-white' : `${role.iconColor} group-hover:scale-110 transition-transform`}`} />
                      </div>
                      <div className="text-center">
                        <span className={`font-bold text-[11px] leading-tight block ${isSelected ? 'text-white' : 'text-white/80'}`}>
                          {t(role.labelKey)}
                        </span>
                        <span className={`text-[8px] leading-tight block mt-0.5 ${isSelected ? 'text-white/70' : 'text-white/30 group-hover:text-white/50'}`}>
                          {t(role.descKey)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note about Parent/Student */}
            <p className="text-white/40 text-[10px] text-center mb-4 leading-relaxed italic bg-white/[0.02] border border-white/5 rounded-xl p-2.5">
              {t('login.student_parent_note')}
            </p>

            {/* Login Form Section with nice slide/fade transitions */}
            <AnimatePresence mode="wait">
              {selectedRole ? (
                <motion.form
                  key={selectedRole.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-4"
                >
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2"
                    >
                      <Info className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {/* Input Username/ID */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      {t(selectedRole.credentialKey)}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={credentials.identifier}
                        onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all text-sm shadow-inner"
                        placeholder={t(selectedRole.credentialKey)}
                      />
                    </div>
                  </div>

                  {/* Input Password */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {t('login.password')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowHelp(true)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        {t('login.forgot_password')}
                      </button>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={credentials.password}
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all text-sm shadow-inner"
                        placeholder={t('login.password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 select-none flex items-center justify-center relative overflow-hidden group/btn ${
                      isLoading
                        ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/5'
                        : `bg-gradient-to-r ${selectedRole.colorClass} text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 scale-100 hover:scale-[1.01] active:scale-[0.99]`
                    }`}
                  >
                    {/* Glowing effect inside button */}
                    {!isLoading && (
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    )}
                    
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2.5">
                        <span className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        {t('login.logging_in')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-xs">
                        {t('login.login_as')} {t(selectedRole.labelKey)}
                      </span>
                    )}
                  </button>

                  <p className="text-white/20 text-[9px] text-center">{t('login.stay_logged_in')}</p>
                </motion.form>
              ) : (
                <div className="py-8 text-center">
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 text-cyan-400 mb-3 border border-white/5"
                  >
                    <HelpCircle className="w-6 h-6" />
                  </motion.div>
                  <p className="text-white/40 text-sm font-medium">{t('login.select_role')}</p>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          <p className="text-white/20 text-[10px] text-center mt-6">
            {t('footer.developed')}
          </p>
        </div>
      </div>

      {/* DETAILED FORGOT PASSWORD HELPER DIALOG */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            ></motion.div>

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#110e2d]/95 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden z-10 text-white"
            >
              {/* Inner decorative light */}
              <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl"></div>

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
                    <HelpCircle className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-base text-white">{t('login.forgot_password')}</h3>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="p-1 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                <p className="font-medium bg-white/5 p-3 rounded-xl border border-white/5 text-cyan-400 flex gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t('login.forgot_password_info')}</span>
                </p>

                <div className="space-y-2 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-white/40" />
                    <span>info@dhakaideal.edu.bd</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-white/40" />
                    <span>+880 1712-345678</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-5 bg-white/5 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors text-xs"
              >
                {t('common.close')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
