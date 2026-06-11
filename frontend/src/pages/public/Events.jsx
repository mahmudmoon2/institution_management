import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/imageHelper';

export default function Events() {
  const { t, i18n } = useTranslation();
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await api.get('/cms/events/');
      return res.data;
    },
  });

  if (isLoading) return <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center"><div className="text-brand-deepPlum font-semibold">Loading events...</div></div>;
  if (error) return <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center"><div className="text-red-500">Failed to load events.</div></div>;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      full: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-brand-deepPlum py-16 text-center text-white px-6">
        <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-bold mb-4">{t('events.title')}</motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-brand-softLavender text-lg max-w-2xl mx-auto">{t('events.subtitle')}</motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, idx) => {
            const { date, month, full, time } = formatDate(event.date_time);
            const title = i18n.language === 'bn' && event.title_bn ? event.title_bn : event.title_en;
            const description = i18n.language === 'bn' && event.description_bn ? event.description_bn : event.description_en;
            const imageUrl = getImageUrl(event.cover_image);

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                {/* Event Image */}
                <div className="h-48 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.target.src = 'https://placehold.co/800x400?text=Event+Image')}
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-brand-tealCyan text-brand-deepPlum px-3 py-1 rounded-full text-xs font-bold">
                      {event.status}
                    </div>
                    <span className="text-gray-400 text-sm">📅 {full}</span>
                  </div>
                  <h3 className="text-xl font-bold text-brand-deepPlum mb-2 group-hover:text-brand-tealCyan transition-colors">
                    {title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-3 space-y-1">
                    <p>🕒 {time}</p>
                    <p>📍 {event.venue}</p>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{description}</p>

                  {/* Action Buttons */}
                  {event.status === 'Upcoming' && (
                    <Link
                      to={`/events/${event.id}/register`}
                      className="inline-block w-full text-center bg-brand-tealCyan hover:bg-brand-mintGreen text-brand-deepPlum font-semibold py-2 rounded-xl transition-colors"
                    >
                      {t('events.register')}
                    </Link>
                  )}
                  {event.status === 'Past' && (
                    <Link
                      to={`/events/${event.id}/gallery`}
                      className="inline-block w-full text-center border border-brand-royalPurple text-brand-royalPurple hover:bg-brand-royalPurple hover:text-white font-semibold py-2 rounded-xl transition-colors"
                    >
                      {t('events.gallery')}
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}