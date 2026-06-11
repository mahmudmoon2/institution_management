import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/imageHelper';

const categories = ['All', 'Academic', 'Administrative', 'Exam', 'Event', 'General'];

// নিরাপদ তারিখ পার্সিং - NaN error এড়ানোর জন্য
const safeParseDate = (dateString) => {
  if (!dateString) return new Date();
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date;
};

export default function NoticeBoard() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const { data: notices = [], isLoading, error } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const res = await api.get('/cms/notices/');
      return res.data;
    },
  });

  const filteredNotices = activeTab === 'All'
    ? notices
    : notices.filter(notice => notice.category === activeTab);

  const handleDownloadPDF = (noticeId) => {
    // PDF ডাউনলোড URL - মিডিয়া বেস URL ব্যবহার করে
    const pdfUrl = `${import.meta.env.VITE_MEDIA_BASE_URL}/api/v1/cms/notices/${noticeId}/download-pdf/`;
    window.open(pdfUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-brand-deepPlum font-semibold">Loading notices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-red-500">Failed to load notices. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20">
      <div className="bg-brand-deepPlum py-16 text-center text-white px-6">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          {t('notice.title')}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-brand-softLavender text-lg max-w-2xl mx-auto"
        >
          {t('notice.subtitle')}
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white p-4 rounded-2xl shadow-md flex flex-wrap gap-2 justify-center mb-8 border border-gray-100">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === category
                  ? 'bg-brand-tealCyan text-brand-deepPlum shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice, index) => {
                const title = i18n.language === 'bn' && notice.title_bn ? notice.title_bn : notice.title_en;
                const description = i18n.language === 'bn' && notice.description_bn ? notice.description_bn : notice.description_en;
                const noticeDate = safeParseDate(notice.created_at);
                const formattedDate = noticeDate.toLocaleDateString();

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={notice.id}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-1 pr-4 mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-brand-softLavender/20 text-brand-royalPurple px-3 py-1 rounded-full text-xs font-bold">
                          {notice.category}
                        </span>
                        <span className="text-gray-400 text-sm font-medium flex items-center gap-1">
                          📅 {formattedDate}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-brand-deepPlum group-hover:text-brand-tealCyan transition-colors">
                        {title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{description}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(notice.id)}
                      className="flex items-center gap-2 bg-brand-deepPlum text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-brand-royalPurple transition-colors shrink-0"
                    >
                      <span>📄</span> {t('notice.download_pdf')}
                    </button>
                  </motion.div>
                );
              })
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center text-gray-500">
                No notices found in this category.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}