import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { getImageUrl } from '../../utils/imageHelper';

export default function EventGallery() {
  const { id } = useParams();
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/cms/events/${id}/`);
      return res.data;
    },
  });
  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ['event-gallery', id],
    queryFn: async () => {
      const res = await api.get(`/cms/events/${id}/gallery/`);
      return res.data;
    },
    enabled: !!id,
  });

  if (eventLoading || imagesLoading) return <div className="min-h-screen flex items-center justify-center">Loading gallery...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <Link to="/events" className="text-brand-tealCyan hover:underline mb-6 inline-block">← Back to Events</Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-deepPlum">{event.title_en} – Gallery</h1>
          <p className="text-gray-500 mt-2">Relive the moments from {new Date(event.date_time).toLocaleDateString()}</p>
        </div>
        {images.length === 0 ? (
          <p className="text-center text-gray-500">No images uploaded for this event yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
              >
                <img src={getImageUrl(img.image)} alt={img.caption_en || 'Gallery'} className="w-full h-64 object-cover" />
                {img.caption_en && <p className="p-2 text-sm text-gray-600 text-center">{img.caption_en}</p>}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}