import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../utils/imageHelper';
import api from '../../api/axios';

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

const FAQItem = ({ faq, isOpen, onClick }) => (
  <div className="border border-gray-100 bg-white rounded-xl mb-4 overflow-hidden shadow-sm">
    <button onClick={onClick} className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none hover:bg-gray-50 transition-colors">
      <span className={`font-semibold ${isOpen ? 'text-brand-tealCyan' : 'text-brand-deepPlum'}`}>{faq.question}</span>
      <span className={`text-2xl transition-transform duration-300 ${isOpen ? 'rotate-45 text-brand-tealCyan' : 'text-gray-400'}`}>+</span>
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
      <p className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-l-4 border-brand-tealCyan ml-6 mb-2">{faq.answer}</p>
    </div>
  </div>
);

export default function Home() {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  const { data: apiSlides = [] } = useQuery({ queryKey: ['heroSlides'], queryFn: async () => { const res = await api.get('/cms/hero-slides/'); return res.data; } });
  const { data: apiFaqs = [] } = useQuery({ queryKey: ['faqs'], queryFn: async () => { const res = await api.get('/cms/faqs/'); return res.data; } });
  const { data: apiNotices = [] } = useQuery({ queryKey: ['notices'], queryFn: async () => { const res = await api.get('/cms/notices/'); return res.data; } });
  const { data: apiEvents = [] } = useQuery({ queryKey: ['events'], queryFn: async () => { const res = await api.get('/cms/events/'); return res.data; } });
  const { data: apiBlogs = [] } = useQuery({ queryKey: ['blogs'], queryFn: async () => { const res = await api.get('/cms/blogs/'); return res.data; } });

  const slides = apiSlides.length > 0 ? apiSlides.map(s => ({
    id: s.id,
    image: getImageUrl(s.image),
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

  const statsData = [
    { id: 1, labelKey: 'home.stats_students', value: 1200, suffix: '+', icon: '👨‍🎓', color: 'text-brand-tealCyan' },
    { id: 2, labelKey: 'home.stats_teachers', value: 85, suffix: '+', icon: '👩‍🏫', color: 'text-brand-softLavender' },
    { id: 3, labelKey: 'home.stats_achievers', value: 320, suffix: '+', icon: '🏆', color: 'text-brand-mintGreen' },
    { id: 4, labelKey: 'home.stats_legacy', value: 25, suffix: '+', icon: '🏫', color: 'text-white' },
  ];

  const milestones = [
    { year: 1995, eventKey: 'public.milestone_1995' },
    { year: 2005, eventKey: 'public.milestone_2005' },
    { year: 2015, eventKey: 'public.milestone_2015' },
    { year: 2025, eventKey: 'public.milestone_2025' }
  ];

  return (
    <div className="w-full">
      {/* Hero Carousel */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-brand-deepPlum group">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="absolute inset-0 bg-cover bg-center transform scale-105" style={{ backgroundImage: `url(${slide.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-deepPlum/90 via-brand-deepPlum/60 to-brand-deepPlum/10" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
                <motion.h1 initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-3xl leading-tight">{slide.title}</motion.h1>
                <motion.p initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="text-xl md:text-2xl text-brand-mintGreen mb-10 max-w-2xl font-medium">{slide.subtitle}</motion.p>
                <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="flex flex-wrap gap-5">
                  <Link to={slide.link1} className="px-10 py-4 bg-brand-tealCyan hover:bg-white text-brand-deepPlum font-bold rounded-full transition-all hover:scale-105 text-lg shadow-xl shadow-brand-tealCyan/30">{slide.cta1}</Link>
                  <Link to={slide.link2} className="px-10 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-deepPlum font-bold rounded-full transition-all hover:scale-105 text-lg">{slide.cta2}</Link>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 opacity-0 focus:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 opacity-0 focus:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>
        <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
          {slides.map((_, index) => (<button key={index} onClick={() => setCurrentSlide(index)} className={`h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-12 bg-brand-tealCyan' : 'w-3 bg-white/50 hover:bg-white'}`} />))}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="w-full flex justify-center py-16">
        <div className="w-[90%] max-w-7x3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { icon: '🏛️', titleKey: 'home.feature_principals_corner', descKey: 'home.feature_principals_desc' },
              { icon: '👩‍🏫', titleKey: 'home.feature_staff', descKey: 'home.feature_staff_desc' },
              { icon: '📊', titleKey: 'home.feature_result', descKey: 'home.feature_result_desc' },
              { icon: '🌍', titleKey: 'public.feature_international', descKey: 'public.feature_international_desc' },
              { icon: '💻', titleKey: 'public.feature_smart_classroom', descKey: 'public.feature_smart_classroom_desc' },
            ].map((feature, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-gradient-to-br from-brand-deepPlum to-brand-royalPurple p-5 rounded-2xl shadow-xl border-b-4 border-brand-tealCyan hover:-translate-y-2 transition-transform duration-300 cursor-pointer group relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-softLavender/10 rounded-full blur-2xl group-hover:bg-brand-tealCyan/20 transition-colors duration-500"></div>
                <div className="w-12 h-12 bg-white/10 text-white text-2xl flex items-center justify-center rounded-xl mb-4 group-hover:scale-110 group-hover:bg-brand-tealCyan group-hover:text-brand-deepPlum transition-all duration-300 backdrop-blur-sm border border-white/10">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2 relative z-10">{t(feature.titleKey)}</h3>
                <p className="text-brand-softLavender mb-4 text-sm leading-relaxed relative z-10">{t(feature.descKey)}</p>
                <span className="text-brand-mintGreen font-semibold text-sm flex items-center gap-2 group-hover:gap-3 transition-all relative z-10">{t('home.explore')} <span className="text-lg">→</span></span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Principal & Notices Section */}
      <section className="py-16 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#F5F0FF] rounded-3xl p-8 shadow-md border border-brand-softLavender/30">
              <span className="bg-brand-mintGreen/30 text-[#0e5c3c] px-4 py-1.5 rounded-full text-xs font-bold mb-6 inline-block uppercase tracking-wider">{t('public.principal_word')}</span>
              <h2 className="text-3xl font-bold text-brand-deepPlum mb-4">{t('public.principal_name')}</h2>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <img src="https://images.unsplash.com/photo-1758685734503-58a8accc24e8?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Principal" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" onError={(e) => e.target.src = "https://placehold.co/200x200?text=Principal"} />
                <div>
                  <p className="text-gray-700 italic leading-relaxed text-xl md:text-2xl font-medium">{t('public.principal_quote')}</p>
                  <p className="font-bold text-brand-royalPurple mt-4 text-lg">{t('public.principal_desc')}</p>
                </div>
              </div>
            </div>
            <div className="bg-brand-mintGreen/15 rounded-3xl p-8 shadow-md border border-brand-mintGreen/40">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-brand-deepPlum">{t('home.latest_notices')}</h2>
                <Link to="/notice-board" className="text-brand-tealCyan font-bold hover:underline">{t('home.view_all')}</Link>
              </div>
              <div className="space-y-4">
                {notices.map((notice) => {
                  const title = i18n.language === 'bn' && notice.title_bn ? notice.title_bn : notice.title_en;
                  const noticeDate = safeParseDate(notice.created_at);
                  const day = noticeDate.getDate();
                  const month = noticeDate.toLocaleString('default', { month: 'short' });
                  return (
                    <div key={notice.id} className="p-4 bg-white rounded-2xl hover:shadow-md transition-all flex gap-4 items-start group">
                      <div className="bg-brand-softLavender/20 text-brand-royalPurple px-3 py-2 rounded-xl text-center shrink-0 w-16">
                        <span className="block text-xl font-bold">{day}</span><span className="block text-xs uppercase">{month}</span>
                      </div>
                      <div><span className="text-xs font-bold bg-brand-mintGreen/30 px-2 py-1 rounded-md mb-2 inline-block">{notice.category}</span><h4 className="font-bold text-brand-deepPlum group-hover:text-brand-tealCyan transition-colors">{title}</h4></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Heritage Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="rounded-2xl overflow-hidden shadow-2xl">
              <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&h=600&fit=crop" alt="School" className="w-full h-96 object-cover hover:scale-105 transition-transform duration-700" onError={handleImageError} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.2 }}>
              <span className="bg-brand-tealCyan/20 text-brand-deepPlum px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{t('public.our_heritage')}</span>
              <h2 className="text-4xl md:text-5xl font-bold text-brand-deepPlum mt-4 mb-6">{t('public.heritage_title')}</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{t('public.heritage_desc1')}</p>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{t('public.heritage_desc2')}</p>
              <Link to="/about-us" className="inline-flex items-center gap-2 bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold px-8 py-3 rounded-full transition-all hover:gap-4">{t('public.discover_story')} <span className="text-xl">→</span></Link>
            </motion.div>
          </div>
          <div className="mt-20">
            <div className="text-center mb-12"><h3 className="text-2xl font-bold text-brand-deepPlum">{t('public.journey_years')}</h3><p className="text-gray-500 max-w-2xl mx-auto">{t('public.journey_sub')}</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((m, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1, duration: 0.5 }} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all text-center border-t-4 border-brand-tealCyan">
                  <div className="text-4xl font-black text-brand-tealCyan mb-2">{m.year}</div><p className="text-gray-700 font-medium">{t(m.eventKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-brand-tealCyan font-bold uppercase tracking-wider text-sm mb-2 block">{t('home.why_choose_dia')}</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-brand-deepPlum">{t('home.nurturing')}</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-500 max-w-2xl mx-auto mt-4">{t('public.why_choose_sub')}</motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { titleKey: "public.modern_labs", icon: "🔬", descKey: "public.modern_labs_desc", color: "from-blue-500 to-cyan-400" },
              { titleKey: "public.rich_library", icon: "📚", descKey: "public.rich_library_desc", color: "from-green-500 to-emerald-400" },
              { titleKey: "public.safe_transport", icon: "🚌", descKey: "public.safe_transport_desc", color: "from-orange-500 to-yellow-400" },
              { titleKey: "public.sports_excellence", icon: "⚽", descKey: "public.sports_excellence_desc", color: "from-red-500 to-rose-400" },
              { titleKey: "public.career_counseling", icon: "🎯", descKey: "public.career_counseling_desc", color: "from-purple-500 to-pink-400" },
              { titleKey: "public.scholarships", icon: "🏅", descKey: "public.scholarships_desc", color: "from-yellow-500 to-orange-400" },
              { titleKey: "public.exchange_programs", icon: "🌏", descKey: "public.exchange_programs_desc", color: "from-teal-500 to-cyan-400" },
              { titleKey: "public.library_247", icon: "📖", descKey: "public.library_247_desc", color: "from-indigo-500 to-blue-400" },
              { titleKey: "public.smart_board", icon: "🖥️", descKey: "public.smart_board_desc", color: "from-gray-600 to-gray-400" },
              { titleKey: "public.parent_portal", icon: "📱", descKey: "public.parent_portal_desc", color: "from-rose-500 to-red-400" },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (idx % 5) * 0.08 + Math.floor(idx / 5) * 0.1 }} className="group relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <div className="relative z-10"><div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-brand-deepPlum/10 to-brand-royalPurple/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">{item.icon}</div><h3 className="text-lg font-bold text-brand-deepPlum mb-1">{t(item.titleKey)}</h3><p className="text-gray-500 text-xs leading-relaxed">{t(item.descKey)}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us / We Offer the Best Education */}
      <section className="py-24 bg-gradient-to-b from-[#F5F0FF] to-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"><img src="https://images.unsplash.com/photo-1495727034151-8fdc73e332a8?q=80&w=1165&auto=format&fit=crop" alt="Students" className="w-full h-48 object-cover" onError={handleImageError} /></div>
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 mt-8"><img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=600" alt="Teacher" className="w-full h-48 object-cover" onError={handleImageError} /></div>
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 -mt-4"><img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600" alt="Campus Life" className="w-full h-48 object-cover" onError={handleImageError} /></div>
              <div className="rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 mt-4"><img src="https://images.unsplash.com/photo-1581726690015-c9861fa5057f?q=80&w=685&auto=format&fit=crop" alt="Classroom" className="w-full h-48 object-cover" onError={handleImageError} /></div>
            </div>
            <div>
              <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-brand-deepPlum leading-tight mb-6">{t('home.about_title')}</motion.h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-10">{t('home.about_desc')}</p>
              <div className="grid grid-cols-2 gap-5">
                {[t('home.chip_mentorship'), t('home.chip_care'), t('home.chip_passion'), t('home.chip_values')].map((chip, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-700 shadow-sm hover:shadow-md transition-shadow"><span className="text-brand-tealCyan text-xl">✦</span> {chip}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 bg-gray-100/60">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-8"><h2 className="text-3xl font-bold text-brand-deepPlum">{t('home.upcoming_events')}</h2><Link to="/events" className="text-brand-tealCyan font-bold hover:underline">{t('home.view_all')}</Link></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((evt) => {
              const title = i18n.language === 'bn' && evt.title_bn ? evt.title_bn : evt.title_en;
              const eventDate = safeParseDate(evt.date_time);
              const formattedDate = eventDate.toLocaleDateString();
              const eventImageUrl = getImageUrl(evt.cover_image);
              return (<div key={evt.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group"><img src={eventImageUrl} alt={title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" onError={handleImageError} /><div className="p-6"><h3 className="text-xl font-bold text-brand-deepPlum mb-2 group-hover:text-brand-tealCyan transition-colors">{title}</h3><p className="text-gray-500 text-sm mb-1">📅 {formattedDate}</p><p className="text-gray-500 text-sm">📍 {evt.venue}</p></div></div>);
            })}
          </div>
        </div>
      </section>

      {/* Statistics Counter */}
      <section className="py-28 bg-brand-deepPlum relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {statsData.map((stat, idx) => (
              <motion.div key={stat.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="flex flex-col items-center">
                <div className={`w-20 h-20 flex items-center justify-center rounded-3xl text-4xl mb-6 bg-white/10 backdrop-blur-sm shadow-xl ${stat.color}`}>{stat.icon}</div>
                <h3 className="text-5xl font-bold text-white mb-3"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></h3>
                <p className="text-brand-softLavender font-medium text-lg tracking-wide uppercase">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Life Gallery */}
      <section className="py-24 bg-white/90">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-bold text-brand-deepPlum mb-4">{t('home.life_at_campus')}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-gray-500 mb-12 max-w-2xl mx-auto">{t('public.campus_glimpse')}</motion.p>
          {galleryImageSources.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
              {galleryImageSources.map((imgUrl, idx) => {
                let spanClass = "col-span-1 row-span-1";
                if (idx === 0) spanClass = "col-span-2 row-span-2";
                else if (idx === 3 || idx === 6) spanClass = "col-span-2 row-span-1";
                return (<motion.div key={idx} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }} className={`rounded-2xl overflow-hidden shadow-sm group relative ${spanClass}`}><img src={imgUrl} alt={`Gallery ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" onError={handleImageError} /><div className="absolute inset-0 bg-brand-deepPlum/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div></motion.div>);
              })}
            </div>
          ) : (<p className="text-gray-500">{t('public.no_images')}</p>)}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-[#F5F0FF] to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-tealCyan/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-royalPurple/10 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-16">
            <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-brand-tealCyan font-bold uppercase tracking-wider text-sm mb-2 block">{t('home.testimonials')}</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl font-bold text-brand-deepPlum">{t('home.what_parents_say')}</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { nameKey: 'public.testimonial1_name', roleKey: 'public.testimonial1_role', quoteKey: 'public.testimonial1_quote' },
              { nameKey: 'public.testimonial2_name', roleKey: 'public.testimonial2_role', quoteKey: 'public.testimonial2_quote' },
              { nameKey: 'public.testimonial3_name', roleKey: 'public.testimonial3_role', quoteKey: 'public.testimonial3_quote' },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white p-8 rounded-tr-[3rem] rounded-bl-[3rem] rounded-tl-xl rounded-br-xl shadow-xl shadow-brand-deepPlum/5 relative border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-5 -right-2 text-7xl text-brand-softLavender/20 font-serif">"</div>
                <div className="flex gap-1 mb-6 text-brand-tealCyan">{Array(5).fill("★").map((star, i) => <span key={i} className="text-xl">{star}</span>)}</div>
                <p className="text-gray-600 mb-8 relative z-10 italic leading-relaxed">"{t(item.quoteKey)}"</p>
                <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-6">
                  <div className="w-14 h-14 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md border-2 border-brand-tealCyan shrink-0">{t(item.nameKey).charAt(0)}</div>
                  <div><h4 className="font-bold text-brand-deepPlum text-lg">{t(item.nameKey)}</h4><p className="text-sm text-brand-tealCyan font-medium">{t(item.roleKey)}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gray-100/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <span className="bg-brand-mintGreen/30 text-[#0e5c3c] px-4 py-1.5 rounded-full text-xs font-bold mb-6 inline-block uppercase tracking-wider">{t('public.help_support')}</span>
              <h2 className="text-4xl font-bold text-brand-deepPlum mb-3">{t('home.faq_title')}</h2>
              <p className="text-gray-500 text-base">{t('home.faq_subtitle')}</p>
            </div>
            <div className="lg:col-span-7"><div className="space-y-3">{faqs.map((faq, index) => (<FAQItem key={faq.id || index} faq={faq} isOpen={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)} />))}</div></div>
          </div>
        </div>
      </section>

      {/* Careers */}
      <section className="py-20 bg-brand-deepPlum relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-tealCyan/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-royalPurple/30 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-brand-tealCyan font-bold uppercase tracking-wider text-sm mb-3 block">{t('public.career_opportunities')}</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-white mb-6">{t('public.careers_title')}</motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-brand-softLavender text-lg max-w-2xl mx-auto mb-10">{t('public.careers_desc')}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Link to="/careers" className="inline-flex items-center gap-2 bg-brand-tealCyan hover:bg-white text-brand-deepPlum font-bold px-10 py-4 rounded-full transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(93,217,193,0.4)] text-lg">{t('public.explore_positions')} <span className="text-xl">→</span></Link>
          </motion.div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-end mb-8">
            <div><span className="text-brand-tealCyan font-bold uppercase tracking-wider text-sm">{t('public.our_blog')}</span><h2 className="text-3xl font-bold text-brand-deepPlum mt-2">{t('public.latest_articles')}</h2></div>
            <Link to="/blogs" className="bg-brand-deepPlum hover:bg-brand-royalPurple text-white px-6 py-2 rounded-full font-semibold transition-colors">{t('home.view_all')}</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.length > 0 ? blogs.slice(0, 5).map((blog, idx) => {
              const title = i18n.language === 'bn' && blog.title_bn ? blog.title_bn : blog.title_en;
              const description = i18n.language === 'bn' && blog.description_bn ? blog.description_bn : blog.description_en;
              const imageUrl = getImageUrl(blog.image);
              return (<motion.div key={blog.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"><div className="h-56 overflow-hidden"><img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={handleImageError} /></div><div className="p-6"><div className="text-xs text-gray-400 mb-2">{new Date(blog.date).toLocaleDateString()}</div><h3 className="text-xl font-bold text-brand-deepPlum mb-3 group-hover:text-brand-tealCyan transition-colors line-clamp-2">{title}</h3><p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p><Link to={`/blogs/${blog.slug}`} className="text-brand-tealCyan font-semibold hover:underline inline-flex items-center gap-1">{t('blogs.read_more')}</Link></div></motion.div>);
            }) : (<div className="col-span-3 text-center py-10 text-gray-500">{t('public.no_blogs')}</div>)}
          </div>
        </div>
      </section>
    </div>
  );
}