import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { 
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube,
  FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaClock, FaPaperPlane
} from 'react-icons/fa';

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { userRole, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const token = localStorage.getItem('access_token');
  const role = userRole || localStorage.getItem('user_role');
  const isLoggedIn = !!token;

  const handleLogout = () => {
    if (logout) logout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/');
    window.location.reload();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  // All navbar links – added Careers here
  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.about_us', 'About Us'), path: '/about-us' },
    { name: t('nav.notice_board', 'Notice Board'), path: '/notice-board' },
    { name: t('nav.events', 'Events'), path: '/events' },
    { name: t('nav.teachers_corner', 'Teachers Corner'), path: '/teachers-corner' },
    { name: t('nav.blogs', 'Blogs'), path: '/blogs' },
    { name: t('nav.careers', 'Careers'), path: '/careers' }, // <--- New Career Route
    { name: t('nav.contact_us', 'Contact Us'), path: '/contact-us' },
  ];

  const socialLinks = [
    { icon: FaFacebookF, href: 'https://facebook.com', color: '#1877F2' },
    { icon: FaTwitter, href: 'https://twitter.com', color: '#1DA1F2' },
    { icon: FaInstagram, href: 'https://instagram.com', color: '#E4405F' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', color: '#0A66C2' },
    { icon: FaYoutube, href: 'https://youtube.com', color: '#FF0000' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Bar - hides completely on scroll */}
      <div className={`bg-brand-deepPlum text-white/90 text-xs py-2 px-6 flex flex-col sm:flex-row justify-between items-center gap-2 transition-all duration-500 ${scrolled ? 'opacity-0 -translate-y-full absolute invisible' : 'opacity-100 translate-y-0 relative'}`}>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link to="/staffs" className="hover:text-brand-tealCyan transition-colors duration-200">{t('topbar.staffs', 'Staffs')}</Link>
          <Link to="/alumni" className="hover:text-brand-tealCyan transition-colors duration-200">{t('topbar.alumni', 'Alumni')}</Link>
          <Link to="/faculty" className="hover:text-brand-tealCyan transition-colors duration-200">{t('topbar.faculty', 'Faculty')}</Link>
          <Link to="/board" className="hover:text-brand-tealCyan transition-colors duration-200">{t('topbar.managing_board', 'Managing Board')}</Link>
        </div>
        <div className="flex gap-4 items-center flex-wrap justify-center">
          {isLoggedIn ? (
            <>
              <Link to={`/${role ? role.toLowerCase() : 'student'}/dashboard`} className="text-brand-mintGreen hover:text-brand-tealCyan transition-colors font-bold tracking-wide">
                {t('topbar.my_dashboard', 'My Dashboard')}
              </Link>
              <span className="text-gray-500">|</span>
              <button onClick={handleLogout} className="hover:text-red-400 transition-colors font-semibold">{t('topbar.logout', 'Logout')}</button>
            </>
          ) : (
            <Link to="/login" className="hover:text-brand-tealCyan transition-colors font-semibold">{t('topbar.portal_login', 'Portal Login')}</Link>
          )}
          <span className="text-gray-500">|</span>
          <a href="/#faq" className="hover:text-brand-tealCyan transition-colors">{t('topbar.faq', 'FAQ')}</a>
          <span className="text-gray-500">|</span>
          <button onClick={toggleLanguage} className="hover:text-brand-tealCyan transition-colors font-bold text-brand-mintGreen">
            {i18n.language === 'en' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </div>

      {/* Main Header - hides completely on scroll */}
      <header className={`bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 py-3 px-6 md:px-12 flex flex-wrap justify-between items-center gap-4 border-b border-brand-softLavender/20 transition-all duration-500 ${scrolled ? 'opacity-0 -translate-y-full absolute invisible' : 'opacity-100 translate-y-0 relative'}`}>
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div 
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-12 h-12 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-xl flex items-center justify-center shadow-lg"
          >
            <span className="text-brand-deepPlum font-black text-xl">DIA</span>
          </motion.div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-brand-deepPlum to-brand-royalPurple bg-clip-text text-transparent">
              Dhaka Ideal Academy
            </h1>
            <p className="text-xs text-brand-royalPurple font-medium">Committed to Excellence</p>
          </div>
        </Link>
        <div className="hidden md:flex gap-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-brand-tealCyan text-lg" />
            <div>
              <p className="font-bold text-brand-deepPlum">Campus</p>
              <p>Dhanmondi, Dhaka</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
            <FaPhoneAlt className="text-brand-tealCyan text-lg" />
            <div>
              <p className="font-bold text-brand-deepPlum">Admission</p>
              <p>+880 1712-345678</p>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Navbar */}
      <nav className="sticky top-0 bg-brand-deepPlum/80 backdrop-blur-md text-white z-50 shadow-lg border-t border-white/10">
        <div className="px-4 md:px-12 overflow-x-auto scrollbar-hide">
          <div className="flex justify-center min-w-max">
            <div className="flex items-center gap-2 md:gap-8 flex-nowrap">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    className={`py-4 px-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-brand-tealCyan text-brand-tealCyan' 
                        : 'border-transparent hover:text-brand-softLavender hover:border-brand-softLavender/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-brand-deepPlum to-[#0d0420] text-white pt-20 pb-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-brand-tealCyan/20"></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-tealCyan to-brand-mintGreen rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-brand-deepPlum font-black text-xl">DIA</span>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-brand-softLavender bg-clip-text text-transparent">
                  Dhaka Ideal Academy
                </h2>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                Empowering students to reach their full potential through modern education, deep care, and moral values.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social, idx) => (
                  <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-tealCyan transition-colors duration-300 group">
                    <social.icon className="text-sm text-gray-300 group-hover:text-brand-deepPlum transition-colors" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-brand-tealCyan after:rounded-full">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {['Home', 'About Us', 'Notice Board', 'Events', 'Careers', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(/\s+/g, '-')}`} className="group flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
                      <span className="w-0 group-hover:w-2 h-0.5 bg-brand-tealCyan transition-all duration-300"></span>
                      <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-brand-tealCyan after:rounded-full">
                Contact Info
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3 group"><FaMapMarkerAlt className="text-brand-tealCyan text-lg mt-1 group-hover:scale-110 transition" /><span className="text-gray-300 text-sm">House #12, Road #4, Dhanmondi, Dhaka-1209</span></li>
                <li className="flex gap-3 group"><FaEnvelope className="text-brand-tealCyan group-hover:scale-110 transition" /><a href="mailto:info@dhakaideal.edu.bd" className="text-gray-300 hover:text-white text-sm">info@dhakaideal.edu.bd</a></li>
                <li className="flex gap-3 group"><FaPhoneAlt className="text-brand-tealCyan group-hover:scale-110 transition" /><a href="tel:+8801712345678" className="text-gray-300 hover:text-white text-sm">+880 1712-345678</a></li>
                <li className="flex gap-3 group"><FaClock className="text-brand-tealCyan group-hover:scale-110 transition" /><span className="text-gray-300 text-sm">Sat - Thu: 8:00 AM – 4:00 PM</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-brand-tealCyan after:rounded-full">
                Newsletter
              </h3>
              <p className="text-gray-300 text-sm mb-4">Subscribe for latest campus updates.</p>
              <form className="relative mb-4" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Your Email" className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 focus:border-brand-tealCyan focus:outline-none text-white placeholder:text-gray-400 transition-all" required />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-tealCyan text-brand-deepPlum p-2 rounded-lg hover:bg-brand-mintGreen transition-colors">
                  <FaPaperPlane />
                </button>
              </form>
              <p className="text-xs text-gray-400">We don't spam, only send important updates.</p>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Dhaka Ideal Academy. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-brand-tealCyan transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-brand-tealCyan transition">Terms of Service</Link>
            </div>
            <p className="text-gray-500">Developed with ❤️ by Mahmudul Hasan Moon</p>
          </div>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-royalPurple/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-brand-tealCyan/10 rounded-full blur-3xl"></div>
      </footer>
    </div>
  );
}