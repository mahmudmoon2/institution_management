import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../utils/imageHelper';
import api from '../../api/axios';
import { useThemeStore } from '../../store/useThemeStore';
import {
  ChevronLeft, ChevronRight, ArrowRight, Star, Users, GraduationCap,
  Trophy, Landmark, BookOpen, Baby, Bus, FlaskConical, Laptop,
  Award, Sparkles, Target, HeartHandshake, ArrowUpRight
} from 'lucide-react';

const defaultSlides = [
  { id: 1, image: "https://images.unsplash.com/photo-1604134967494-8a9ed3adea0d?q=80&w=1074&auto=format&fit=crop", titleKey: "public.hero_excellence", subtitleKey: "public.hero_subtitle", cta1Key: "public.hero_learn_more", link1: "/about-us", cta2Key: "public.hero_admission_info", link2: "/admissions" },
  { id: 2, image: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1920&h=1080", titleKey: "public.hero_facilities", subtitleKey: "public.hero_facilities_sub", cta1Key: "public.hero_learn_more", link1: "/about-us", cta2Key: "public.hero_admission_info", link2: "/admissions" },
  { id: 3, image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&h=1080", titleKey: "public.hero_legacy", subtitleKey: "public.hero_legacy_sub", cta1Key: "public.hero_our_history", link1: "/about-us", cta2Key: "public.hero_explore", link2: "/admissions" },
  { id: 4, image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1920&h=1080", titleKey: "public.hero_global", subtitleKey: "public.hero_global_sub", cta1Key: "public.hero_learn_more", link1: "/about-us", cta2Key: "public.hero_admission_info", link2: "/admissions" },
];

const defaultFaqs = [
  { question: "When does the admission process start?", answer: "The admission process typically begins in November..." },
  { question: "Do you offer transportation facilities?", answer: "Yes, we provide safe and secure transport..." },
  { question: "What are the regular school hours?", answer: "8:00 AM to 1:30 PM, Sunday through Thursday." },
  { question: "What is the student-to-teacher ratio?", answer: "We maintain a healthy student-to-teacher ratio of 25:1." },
];

const defaultNotices = [
  { id: 1, title_en: "Mid-Term Examination Routine 2026 Published", category: "Exam", created_at: "2026-05-10" },
  { id: 2, title_en: "School Closed for Summer Vacation", category: "General", created_at: "2026-05-15" },
  { id: 3, title_en: "Inter-School Science Fair Registration Open", category: "Event", created_at: "2026-05-01" },
];

const defaultEvents = [
  { id: 1, title_en: "Annual Sports Day 2026", date_time: "2026-11-15T10:00:00Z", venue: "Main Campus Ground", cover_image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600" },
  { id: 2, title_en: "Science & Tech Exhibition", date_time: "2026-12-05T09:00:00Z", venue: "Auditorium", cover_image: "https://images.unsplash.com/photo-1564410267841-915d8e4d71ea?w=800&h=600" },
];

const safeParseDate = (dateString) => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
};

const AnimatedCounter = ({ value, suffix }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = Number(value) || 0;
  useEffect(() => {
    if (isInView && numericValue > 0) {
      let start = 0;
      const end = numericValue;
      const duration = 2000;
      const incrementTime = Math.max(10, Math.floor(duration / end));
      const timer = setInterval(() => {
        start += Math.ceil(end / (duration / incrementTime));
        if (start >= end) { setDisplayValue(end); clearInterval(timer); }
        else setDisplayValue(start);
      }, incrementTime);
      return () => clearInterval(timer);
    } else if (isInView) setDisplayValue(0);
  }, [isInView, numericValue]);
  return <span ref={ref}>{displayValue}{suffix ? String(suffix) : ''}</span>;
};

const FAQItem = ({ faq, isOpen, onClick, isDark }) => (
  <div className={`border rounded-xl mb-3 overflow-hidden transition-all duration-300 ${isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-100 bg-white shadow-sm'}`}>
    <button onClick={onClick} className={`w-full px-5 sm:px-6 py-4 flex justify-between items-center text-left focus:outline-none transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'}`}>
      <span className={`font-semibold text-sm sm:text-base ${isOpen ? (isDark ? 'text-indigo-300' : 'text-indigo-600') : (isDark ? 'text-white' : 'text-gray-900')}`}>{faq.question}</span>
      <span className={`text-2xl shrink-0 ml-3 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''} ${isOpen ? (isDark ? 'text-indigo-300' : 'text-indigo-600') : (isDark ? 'text-slate-500' : 'text-gray-400')}`}>+</span>
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
      <p className={`px-5 sm:px-6 pb-4 text-sm leading-relaxed border-l-4 ml-6 mb-2 ${isDark ? 'text-slate-300 border-indigo-500' : 'text-gray-600 border-indigo-300'}`}>{faq.answer}</p>
    </div>
  </div>
);

export default function Home() {
  const { t, i18n } = useTranslation();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const { data: apiSlides = [] } = useQuery({ queryKey: ['heroSlides'], queryFn: async () => { const res = await api.get('/cms/hero-slides/'); return res.data; } });
  const { data: apiFaqs = [] } = useQuery({ queryKey: ['faqs'], queryFn: async () => { const res = await api.get('/cms/faqs/'); return res.data; } });
  const { data: apiNotices = [] } = useQuery({ queryKey: ['notices'], queryFn: async () => { const res = await api.get('/cms/notices/'); return res.data; } });
  const { data: apiEvents = [] } = useQuery({ queryKey: ['events'], queryFn: async () => { const res = await api.get('/cms/events/'); return res.data; } });
  const { data: apiBlogs = [] } = useQuery({ queryKey: ['blogs'], queryFn: async () => { const res = await api.get('/cms/blogs/'); return res.data; } });

  const slides = apiSlides.length > 0 ? apiSlides.map(s => ({
    id: s.id, image: getImageUrl(s.image),
    title: i18n.language === 'bn' && s.title_bn ? s.title_bn : s.title_en,
    subtitle: i18n.language === 'bn' && s.subtitle_bn ? s.subtitle_bn : s.subtitle_en,
    cta1: s.cta_button_1_text, link1: s.cta_button_1_link, cta2: s.cta_button_2_text, link2: s.cta_button_2_link
  })) : defaultSlides.map(s => ({ id: s.id, image: getImageUrl(s.image), title: t(s.titleKey), subtitle: t(s.subtitleKey), cta1: t(s.cta1Key), link1: s.link1, cta2: t(s.cta2Key), link2: s.link2 }));

  const faqs = apiFaqs.length > 0 ? apiFaqs.map(f => ({ id: f.id, question: i18n.language === 'bn' && f.question_bn ? f.question_bn : f.question_en, answer: i18n.language === 'bn' && f.answer_bn ? f.answer_bn : f.answer_en })) : defaultFaqs;
  const notices = apiNotices.length > 0 ? apiNotices.slice(0, 4) : defaultNotices;
  const events = apiEvents.length > 0 ? apiEvents.slice(0, 3) : defaultEvents;
  const blogs = apiBlogs.slice(0, 5);

  const galleryImageSources = useMemo(() => {
    const images = [];
    slides.forEach(slide => { if (slide.image && !images.includes(slide.image)) images.push(slide.image); });
    events.forEach(evt => { const imgUrl = getImageUrl(evt.cover_image); if (imgUrl && !images.includes(imgUrl)) images.push(imgUrl); });
    const aboutImages = [
      "https://images.unsplash.com/photo-1495727034151-8fdc73e332a8?q=80&w=1165&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600",
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600",
      "https://images.unsplash.com/photo-1581726690015-c9861fa5057f?q=80&w=685&auto=format&fit=crop"
    ];
    aboutImages.forEach(img => { if (!images.includes(img)) images.push(img); });
    return images;
  }, [slides, events]);

  const handleImageError = (e) => { e.target.src = "https://placehold.co/800x600?text=Image+Not+Found"; };
  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  useEffect(() => { if (slides.length === 0) return; const timer = setInterval(nextSlide, 5000); return () => clearInterval(timer); }, [slides.length]);

  return (
    <div className={`w-full ${isDark ? 'bg-[#080615] text-white' : 'bg-white text-gray-900'}`}>
      {/* ═══════════════════════ HERO CAROUSEL ═══════════════════════ */}
      <div className={`relative h-[80vh] sm:h-[85vh] w-full overflow-hidden ${isDark ? 'bg-[#080615]' : 'bg-brand-deepPlum'} group`}>
        {slides.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center transform scale-105" style={{ backgroundImage: `url(${slide.image})` }} />
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-[#080615]/95 via-[#080615]/70 to-transparent' : 'bg-gradient-to-r from-brand-deepPlum/90 via-brand-deepPlum/60 to-transparent'}`} />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 w-full">
                <motion.h1 key={index} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 max-w-3xl leading-[1.1] tracking-tight">
                  {slide.title}
                </motion.h1>
                <motion.p key={index + 'sub'} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.15 }}
                  className={`text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-2xl font-medium ${isDark ? 'text-indigo-200' : 'text-brand-mintGreen'}`}>
                  {slide.subtitle}
                </motion.p>
                <motion.div key={index + 'btns'} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-wrap gap-4">
                  <Link to={slide.link1}
                    className="group inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-white text-brand-deepPlum font-bold rounded-full transition-all hover:shadow-xl hover:shadow-white/20 text-sm sm:text-base">
                    {slide.cta1} <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                  <Link to={slide.link2}
                    className="group inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 border-2 border-white/30 text-white hover:bg-white hover:text-brand-deepPlum font-bold rounded-full transition-all text-sm sm:text-base backdrop-blur-sm">
                    {slide.cta2}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
        {/* Controls */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-4 z-20">
          <div className="flex gap-2.5">
            {slides.map((_, index) => (
              <button key={index} onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-3 backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/10">
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 sm:p-3 backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 border border-white/10">
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* ═══════════════════════ FEATURE CARDS ═══════════════════════ */}
      <section className={`py-16 sm:py-20 ${isDark ? 'bg-[#0a0718]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              { icon: '🏛️', titleKey: 'home.feature_principals_corner', descKey: 'home.feature_principals_desc' },
              { icon: '👩‍🏫', titleKey: 'home.feature_staff', descKey: 'home.feature_staff_desc' },
              { icon: '📊', titleKey: 'home.feature_result', descKey: 'home.feature_result_desc' },
              { icon: '🌍', titleKey: 'public.feature_international', descKey: 'public.feature_international_desc' },
              { icon: '💻', titleKey: 'public.feature_smart_classroom', descKey: 'public.feature_smart_classroom_desc' },
            ].map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                className={`group relative p-5 sm:p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-indigo-500/30' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}>
                <div className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl text-2xl mb-4 transition-all duration-300 group-hover:scale-110 ${
                  isDark ? 'bg-indigo-500/10' : 'bg-brand-deepPlum/5'
                }`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className={`font-bold text-sm sm:text-base mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t(feature.titleKey)}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t(feature.descKey)}</p>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-3 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                  {t('home.explore')} <ArrowRight className="w-3 h-3" />
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ PRINCIPAL + NOTICES ═══════════════════════ */}
      <section className={`py-16 sm:py-20 ${isDark ? 'bg-[#0c091f]' : 'bg-gray-50/80'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Principal */}
            <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-[#F5F0FF] border-brand-softLavender/30 shadow-md'}`}>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 inline-block ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-brand-mintGreen/30 text-[#0e5c3c]'}`}>
                {t('public.principal_word')}
              </span>
              <h2 className={`text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('public.principal_name')}</h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1287&auto=format&fit=crop" alt="Principal"
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 sm:border-4 shrink-0 ${isDark ? 'border-white/[0.1]' : 'border-white'} shadow-lg`}
                  onError={(e) => e.target.src = "https://placehold.co/200x200?text=Principal"} />
                <div>
                  <p className={`italic leading-relaxed text-base sm:text-lg md:text-xl font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('public.principal_quote')}</p>
                  <p className={`font-bold mt-3 sm:mt-4 text-sm sm:text-base ${isDark ? 'text-indigo-300' : 'text-brand-royalPurple'}`}>{t('public.principal_desc')}</p>
                </div>
              </div>
            </div>

            {/* Notices */}
            <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 border ${isDark ? 'bg-white/[0.03] border-white/[0.06]' : 'shadow-md border-brand-mintGreen/40'}`}>
              <div className="flex justify-between items-end mb-5 sm:mb-6">
                <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('home.latest_notices')}</h2>
                <Link to="/notice-board" className={`text-xs sm:text-sm font-semibold hover:underline ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>{t('home.view_all')}</Link>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {notices.map((notice) => {
                  const title = i18n.language === 'bn' && notice.title_bn ? notice.title_bn : notice.title_en;
                  const noticeDate = safeParseDate(notice.created_at);
                  return (
                    <div key={notice.id} className={`p-3 sm:p-4 rounded-xl flex gap-3 sm:gap-4 items-start group transition-all cursor-default ${isDark ? 'bg-white/[0.02] hover:bg-white/[0.04]' : 'bg-white hover:shadow-md'}`}>
                      <div className={`px-3 py-2 rounded-xl text-center shrink-0 w-14 sm:w-16 ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-brand-softLavender/20 text-brand-royalPurple'}`}>
                        <span className="block text-lg sm:text-xl font-bold">{noticeDate.getDate()}</span>
                        <span className="block text-[10px] uppercase">{noticeDate.toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mb-1.5 ${
                          isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-brand-mintGreen/30 text-[#0e5c3c]'
                        }`}>{notice.category}</span>
                        <h4 className={`font-semibold text-sm sm:text-base truncate transition-colors ${isDark ? 'text-slate-200 group-hover:text-indigo-300' : 'text-brand-deepPlum group-hover:text-brand-tealCyan'}`}>{title}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HERITAGE ═══════════════════════ */}
      <section className={`py-20 sm:py-24 ${isDark ? 'bg-[#080615]' : 'bg-gradient-to-b from-white to-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop" alt="School"
                className="w-full h-72 sm:h-96 object-cover hover:scale-105 transition-transform duration-700" onError={handleImageError} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4 ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-brand-tealCyan/20 text-brand-deepPlum'}`}>
                {t('public.our_heritage')}
              </span>
              <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold mt-2 mb-5 sm:mb-6 leading-tight ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>
                {t('public.heritage_title')}
              </h2>
              <p className={`text-base sm:text-lg leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{t('public.heritage_desc1')}</p>
              <p className={`text-base sm:text-lg leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('public.heritage_desc2')}</p>
              <Link to="/about-us"
                className={`inline-flex items-center gap-2 font-bold px-6 sm:px-8 py-3 rounded-full transition-all text-sm sm:text-base group ${
                  isDark ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-brand-royalPurple hover:bg-brand-deepPlum text-white'
                }`}>
                {t('public.discover_story')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ WHY CHOOSE US ═══════════════════════ */}
      <section className={`py-20 sm:py-24 ${isDark ? 'bg-[#0c091f]' : 'bg-gradient-to-b from-gray-100 to-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              className={`font-bold uppercase tracking-wider text-xs sm:text-sm mb-2 block ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>
              {t('home.why_choose_dia')}
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-3xl sm:text-4xl md:text-5xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>
              {t('home.nurturing')}
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`max-w-2xl mx-auto mt-3 sm:mt-4 text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {t('public.why_choose_sub')}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {[
              { titleKey: "public.modern_labs", icon: "🔬", descKey: "public.modern_labs_desc" },
              { titleKey: "public.rich_library", icon: "📚", descKey: "public.rich_library_desc" },
              { titleKey: "public.safe_transport", icon: "🚌", descKey: "public.safe_transport_desc" },
              { titleKey: "public.sports_excellence", icon: "⚽", descKey: "public.sports_excellence_desc" },
              { titleKey: "public.career_counseling", icon: "🎯", descKey: "public.career_counseling_desc" },
              { titleKey: "public.scholarships", icon: "🏅", descKey: "public.scholarships_desc" },
              { titleKey: "public.exchange_programs", icon: "🌏", descKey: "public.exchange_programs_desc" },
              { titleKey: "public.library_247", icon: "📖", descKey: "public.library_247_desc" },
              { titleKey: "public.smart_board", icon: "🖥️", descKey: "public.smart_board_desc" },
              { titleKey: "public.parent_portal", icon: "📱", descKey: "public.parent_portal_desc" },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (idx % 5) * 0.06 + Math.floor(idx / 5) * 0.08 }}
                className={`group relative p-4 sm:p-5 rounded-xl border transition-all duration-300 ${
                  isDark ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-indigo-500/20 hover:-translate-y-1' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 ${isDark ? 'bg-indigo-500/10' : 'bg-brand-deepPlum/5'}`}>
                  {item.icon}
                </div>
                <h3 className={`font-bold text-sm sm:text-base mb-1 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t(item.titleKey)}</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ABOUT COLLAGE ═══════════════════════ */}
      <section className={`py-20 sm:py-24 ${isDark ? 'bg-[#080615]' : 'bg-gradient-to-b from-[#F5F0FF] to-white'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.03] transition-transform duration-300">
                <img src="https://images.unsplash.com/photo-1495727034151-8fdc73e332a8?q=80&w=1165&auto=format&fit=crop" alt="Students" className="w-full h-40 sm:h-48 object-cover" onError={handleImageError} />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.03] transition-transform duration-300 mt-6 sm:mt-8">
                <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600" alt="Teacher" className="w-full h-40 sm:h-48 object-cover" onError={handleImageError} />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.03] transition-transform duration-300 -mt-3 sm:-mt-4">
                <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600" alt="Campus" className="w-full h-40 sm:h-48 object-cover" onError={handleImageError} />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-[1.03] transition-transform duration-300 mt-3 sm:mt-4">
                <img src="https://images.unsplash.com/photo-1581726690015-c9861fa5057f?q=80&w=685&auto=format&fit=crop" alt="Classroom" className="w-full h-40 sm:h-48 object-cover" onError={handleImageError} />
              </div>
            </div>
            <div>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className={`text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-5 sm:mb-6 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>
                {t('home.about_title')}
              </motion.h2>
              <p className={`text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{t('home.about_desc')}</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[t('home.chip_mentorship'), t('home.chip_care'), t('home.chip_passion'), t('home.chip_values')].map((chip, i) => (
                  <div key={i} className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all ${
                    isDark ? 'bg-white/[0.03] border border-white/[0.06] text-slate-200 hover:bg-white/[0.06]' : 'bg-white border border-gray-100 text-gray-700 shadow-sm hover:shadow-md'
                  }`}>
                    <Sparkles className={`w-4 h-4 shrink-0 ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`} />
                    <span>{chip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ EVENTS ═══════════════════════ */}
      <section className={`py-20 sm:py-24 ${isDark ? 'bg-[#0c091f]' : 'bg-gray-100/60'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="flex justify-between items-end mb-8 sm:mb-10">
            <div>
              <span className={`font-bold uppercase tracking-wider text-xs sm:text-sm ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>{t('public.events')}</span>
              <h2 className={`text-2xl sm:text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('home.upcoming_events')}</h2>
            </div>
            <Link to="/events" className={`text-xs sm:text-sm font-semibold hover:underline ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>{t('home.view_all')}</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {events.map((evt) => {
              const title = i18n.language === 'bn' && evt.title_bn ? evt.title_bn : evt.title_en;
              const eventDate = safeParseDate(evt.date_time);
              const eventImageUrl = getImageUrl(evt.cover_image);
              return (
                <div key={evt.id} className={`rounded-2xl overflow-hidden transition-all group border ${
                  isDark ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]' : 'bg-white shadow-sm hover:shadow-md'
                }`}>
                  <div className="h-44 sm:h-48 overflow-hidden">
                    <img src={eventImageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImageError} />
                  </div>
                  <div className="p-5 sm:p-6">
                    <h3 className={`font-bold text-base sm:text-lg mb-2 sm:mb-3 transition-colors group-hover:text-indigo-500 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{title}</h3>
                    <p className={`text-xs sm:text-sm mb-1 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span>📅</span> {eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {evt.venue && <p className={`text-xs sm:text-sm flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}><span>📍</span> {evt.venue}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS COUNTER ═══════════════════════ */}
      <section className={`py-20 sm:py-28 relative overflow-hidden ${isDark ? 'bg-[#0a0718]' : 'bg-brand-deepPlum'}`}>
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)]"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { icon: '👨‍🎓', labelKey: 'home.stats_students', value: 1200, suffix: '+' },
              { icon: '👩‍🏫', labelKey: 'home.stats_teachers', value: 85, suffix: '+' },
              { icon: '🏆', labelKey: 'home.stats_achievers', value: 320, suffix: '+' },
              { icon: '🏫', labelKey: 'home.stats_legacy', value: 25, suffix: '+' },
            ].map((stat, idx) => (
              <motion.div key={stat.icon} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl sm:rounded-3xl text-3xl sm:text-4xl mx-auto mb-4 sm:mb-6 ${isDark ? 'bg-white/[0.05]' : 'bg-white/10'} backdrop-blur-sm border ${isDark ? 'border-white/[0.06]' : 'border-white/10'}`}>
                  <span>{stat.icon}</span>
                </div>
                <h3 className="text-4xl sm:text-5xl font-bold text-white mb-2"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></h3>
                <p className={`text-sm sm:text-base font-medium tracking-wide uppercase ${isDark ? 'text-slate-400' : 'text-brand-softLavender'}`}>{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CAMPUS GALLERY ═══════════════════════ */}
      <section className={`py-20 sm:py-24 ${isDark ? 'bg-[#080615]' : 'bg-white/90'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 text-center">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>
            {t('home.life_at_campus')}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className={`mb-10 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {t('public.campus_glimpse')}
          </motion.p>
          {galleryImageSources.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[150px] sm:auto-rows-[200px]">
              {galleryImageSources.map((imgUrl, idx) => {
                let spanClass = "col-span-1 row-span-1";
                if (idx === 0) spanClass = "col-span-2 row-span-2";
                else if (idx === 3 || idx === 6) spanClass = "col-span-2 row-span-1";
                return (
                  <motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                    className={`rounded-xl sm:rounded-2xl overflow-hidden group relative ${spanClass}`}>
                    <img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={handleImageError} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.div>
                );
              })}
            </div>
          ) : <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('public.no_images')}</p>}
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section className={`py-20 sm:py-24 relative overflow-hidden ${isDark ? 'bg-[#0c091f]' : 'bg-gradient-to-b from-[#F5F0FF] to-white'}`}>
        <div className={`absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[100px] ${isDark ? 'bg-indigo-500/5' : 'bg-brand-tealCyan/10'}`}></div>
        <div className={`absolute bottom-0 left-0 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[100px] ${isDark ? 'bg-purple-500/5' : 'bg-brand-royalPurple/10'}`}></div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              className={`font-bold uppercase tracking-wider text-xs sm:text-sm mb-2 block ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>
              {t('home.testimonials')}
            </motion.span>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>
              {t('home.what_parents_say')}
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { nameKey: 'public.testimonial1_name', roleKey: 'public.testimonial1_role', quoteKey: 'public.testimonial1_quote' },
              { nameKey: 'public.testimonial2_name', roleKey: 'public.testimonial2_role', quoteKey: 'public.testimonial2_quote' },
              { nameKey: 'public.testimonial3_name', roleKey: 'public.testimonial3_role', quoteKey: 'public.testimonial3_quote' },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className={`p-6 sm:p-8 rounded-2xl sm:rounded-tr-[3rem] sm:rounded-bl-[3rem] rounded-tl-xl rounded-br-xl relative border transition-all hover:-translate-y-1 ${
                  isDark ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]' : 'bg-white border-gray-100 shadow-xl shadow-brand-deepPlum/5'
                }`}>
                <div className="absolute -top-3 -right-1 sm:-top-5 sm:-right-2 text-5xl sm:text-7xl opacity-10 font-serif">"</div>
                <div className="flex gap-1 mb-4 sm:mb-6">
                  {[1,2,3,4,5].map(star => <span key={star} className={`text-lg sm:text-xl ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>★</span>)}
                </div>
                <p className={`mb-6 sm:mb-8 relative z-10 italic leading-relaxed text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  "{t(item.quoteKey)}"
                </p>
                <div className={`flex items-center gap-3 sm:gap-4 mt-auto pt-5 sm:pt-6 border-t ${isDark ? 'border-white/[0.04]' : 'border-gray-50'}`}>
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md border-2 shrink-0 ${isDark ? 'bg-indigo-500 border-indigo-400' : 'bg-brand-royalPurple border-brand-tealCyan'}`}>
                    {t(item.nameKey).charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`font-bold text-base sm:text-lg truncate ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t(item.nameKey)}</h4>
                    <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>{t(item.roleKey)}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section className={`py-20 sm:py-24 ${isDark ? 'bg-[#080615]' : 'bg-gray-100/40'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16">
            <div className="lg:col-span-5">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block mb-4 ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-brand-mintGreen/30 text-[#0e5c3c]'}`}>
                {t('public.help_support')}
              </span>
              <h2 className={`text-3xl sm:text-4xl font-bold mb-3 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('home.faq_title')}</h2>
              <p className={`text-sm sm:text-base ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('home.faq_subtitle')}</p>
            </div>
            <div className="lg:col-span-7">
              {faqs.map((faq, index) => (
                <FAQItem key={faq.id || index} faq={faq} isOpen={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} isDark={isDark} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ CTA / CAREERS ═══════════════════════ */}
      <section className={`py-20 sm:py-24 relative overflow-hidden ${isDark ? 'bg-[#0a0718]' : 'bg-brand-deepPlum'}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] ${isDark ? 'bg-indigo-500/10' : 'bg-brand-tealCyan/20'}`}></div>
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[100px] ${isDark ? 'bg-purple-500/10' : 'bg-brand-royalPurple/30'}`}></div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12 relative z-10 text-center">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className={`font-bold uppercase tracking-wider text-xs sm:text-sm mb-3 block ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>
            {t('public.career_opportunities')}
          </motion.span>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {t('public.careers_title')}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className={`text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10 ${isDark ? 'text-slate-300' : 'text-brand-softLavender'}`}>
            {t('public.careers_desc')}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Link to="/careers"
              className="group inline-flex items-center gap-2 bg-white text-brand-deepPlum font-bold px-8 sm:px-10 py-3 sm:py-4 rounded-full transition-all hover:shadow-xl text-sm sm:text-base hover:scale-105">
              {t('public.explore_positions')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ BLOG ═══════════════════════ */}
      <section className={`py-20 sm:py-24 ${isDark ? 'bg-[#0c091f]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 sm:mb-10">
            <div>
              <span className={`font-bold uppercase tracking-wider text-xs sm:text-sm ${isDark ? 'text-indigo-300' : 'text-brand-tealCyan'}`}>{t('public.our_blog')}</span>
              <h2 className={`text-2xl sm:text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{t('public.latest_articles')}</h2>
            </div>
            <Link to="/blogs" className={`px-5 sm:px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
              isDark ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-brand-deepPlum hover:bg-brand-royalPurple text-white'
            }`}>{t('home.view_all')}</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {blogs.length > 0 ? blogs.slice(0, 5).map((blog, idx) => {
              const title = i18n.language === 'bn' && blog.title_bn ? blog.title_bn : blog.title_en;
              const description = i18n.language === 'bn' && blog.description_bn ? blog.description_bn : blog.description_en;
              const imageUrl = getImageUrl(blog.image);
              return (
                <motion.div key={blog.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                  className={`rounded-2xl overflow-hidden border group transition-all ${
                    isDark ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]' : 'bg-white shadow-sm hover:shadow-xl border-transparent'
                  }`}>
                  <div className="h-44 sm:h-48 overflow-hidden">
                    <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImageError} />
                  </div>
                  <div className="p-5 sm:p-6">
                    <p className={`text-[10px] sm:text-xs mb-2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>{new Date(blog.date).toLocaleDateString()}</p>
                    <h3 className={`font-bold text-base sm:text-lg mb-2 sm:mb-3 line-clamp-2 transition-colors group-hover:text-indigo-500 ${isDark ? 'text-white' : 'text-brand-deepPlum'}`}>{title}</h3>
                    <p className={`text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{description}</p>
                    <Link to={`/blogs/${blog.slug}`} className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:underline ${
                      isDark ? 'text-indigo-300' : 'text-brand-tealCyan'
                    }`}>{t('blogs.read_more')} <ArrowRight className="w-3 h-3" /></Link>
                  </div>
                </motion.div>
              );
            }) : <div className={`col-span-3 text-center py-10 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('public.no_blogs')}</div>}
          </div>
        </div>
      </section>
    </div>
  );
}