import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <div className="w-full bg-white pb-20">
      <div className="bg-brand-deepPlum py-20 text-center text-white px-6">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          {t('about.title')}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-brand-softLavender text-lg max-w-2xl mx-auto"
        >
          {t('about.subtitle')}
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-16 space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-brand-deepPlum mb-4 border-l-4 border-brand-tealCyan pl-4">
              {t('about.mission_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('about.mission_text')}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-brand-deepPlum mb-4 border-l-4 border-brand-royalPurple pl-4">
              {t('about.vision_title')}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {t('about.vision_text')}
            </p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2069&auto=format&fit=crop"
            alt="School Building"
            className="w-full h-[400px] object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
}