import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/imageHelper';

export default function TeachersCorner() {
  const { t } = useTranslation();
  const { data: teachers = [], isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const res = await api.get('/teachers/');
      return res.data;
    },
  });

  if (isLoading) return <div className="w-full bg-white min-h-screen flex items-center justify-center"><div className="text-brand-deepPlum font-semibold">Loading teachers...</div></div>;
  if (error) return <div className="w-full bg-white min-h-screen flex items-center justify-center"><div className="text-red-500">Failed to load teachers.</div></div>;

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="bg-brand-deepPlum py-16 text-center text-white px-6">
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-bold mb-4">{t('teachers.title')}</motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-brand-softLavender text-lg max-w-2xl mx-auto">{t('teachers.subtitle')}</motion.p>
      </div>
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {teachers.map((teacher, idx) => (
            <motion.div key={teacher.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-gray-50 rounded-3xl p-6 text-center border border-gray-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-md">
                {teacher.photo ? <img src={getImageUrl(teacher.photo)} alt={teacher.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-brand-royalPurple flex items-center justify-center text-white text-3xl font-bold">{teacher.name?.charAt(0) || 'T'}</div>}
              </div>
              <h3 className="text-lg font-bold text-brand-deepPlum mb-1">{teacher.name}</h3>
              <p className="text-brand-tealCyan font-semibold text-sm">{teacher.major_subject_name || 'Faculty Member'}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}