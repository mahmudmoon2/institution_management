import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Admissions() {
  const { t } = useTranslation();

  const steps = [
    { title: t('admissions.step1_title'), desc: t('admissions.step1_desc') },
    { title: t('admissions.step2_title'), desc: t('admissions.step2_desc') },
    { title: t('admissions.step3_title'), desc: t('admissions.step3_desc') },
    { title: t('admissions.step4_title'), desc: t('admissions.step4_desc') },
  ];

  const docs = [
    t('admissions.doc1'),
    t('admissions.doc2'),
    t('admissions.doc3'),
    t('admissions.doc4'),
    t('admissions.doc5'),
  ];

  return (
    <div className="w-full bg-white min-h-screen pb-20">
      <div className="bg-brand-deepPlum py-20 text-center text-white px-6">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          {t('admissions.title')}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-brand-softLavender text-lg max-w-2xl mx-auto"
        >
          {t('admissions.subtitle')}
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-16 space-y-16">
        <section>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-brand-deepPlum mb-8 text-center"
          >
            {t('admissions.process_title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center relative hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-brand-tealCyan text-brand-deepPlum font-bold rounded-full flex items-center justify-center mx-auto mb-4 text-lg">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-brand-deepPlum mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-softLavender/10 p-8 rounded-3xl border border-brand-softLavender/20"
          >
            <h3 className="text-2xl font-bold text-brand-deepPlum mb-6">{t('admissions.documents_title')}</h3>
            <ul className="space-y-4">
              {docs.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-700">
                  <span className="text-brand-royalPurple mt-1">✅</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-brand-deepPlum mb-6">{t('admissions.fee_title')}</h3>
            <p className="text-gray-600 mb-6">
              Our fee structure is designed to be accessible while maintaining high educational standards. Fees vary depending on the class level.
            </p>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-700">{t('admissions.fee_admission')}</span>
                <span className="text-brand-deepPlum font-bold">{t('admissions.fee_admission_range')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-700">{t('admissions.fee_tuition')}</span>
                <span className="text-brand-deepPlum font-bold">{t('admissions.fee_tuition_range')}</span>
              </div>
            </div>
            <button className="w-full mt-8 bg-brand-deepPlum hover:bg-brand-royalPurple text-white font-bold py-3 rounded-xl transition-colors">
              {t('admissions.download_fee_chart')}
            </button>
          </motion.section>
        </div>
      </div>
    </div>
  );
}