import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/imageHelper';

export default function Blogs() {
  const { t, i18n } = useTranslation();
  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const res = await api.get('/cms/blogs/');
      return res.data;
    },
  });

  if (isLoading) return <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center"><div className="text-brand-deepPlum font-semibold">Loading blogs...</div></div>;
  if (error) return <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center"><div className="text-red-500">Failed to load blogs.</div></div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20">
      <div className="bg-brand-deepPlum py-16 text-center text-white px-6">
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-bold mb-4">{t('blogs.title')}</motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-brand-softLavender text-lg max-w-2xl mx-auto">{t('blogs.subtitle')}</motion.p>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => {
            const title = i18n.language === 'bn' && blog.title_bn ? blog.title_bn : blog.title_en;
            const description = i18n.language === 'bn' && blog.description_bn ? blog.description_bn : blog.description_en;
            const imageUrl = getImageUrl(blog.image);
            return (
              <motion.div key={blog.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="h-48 overflow-hidden"><img src={imageUrl} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                <div className="p-6">
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3"><span>📅 {new Date(blog.date).toLocaleDateString()}</span><span>✍️ {blog.author}</span></div>
                  <h3 className="text-xl font-bold text-brand-deepPlum mb-3">{title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>
                  <button className="text-brand-tealCyan font-bold hover:text-brand-deepPlum transition-colors">{t('blogs.read_more')}</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}