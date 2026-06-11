import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../../api/axios';

export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/cms/events/${id}/`);
      return res.data;
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/cms/events/${id}/register/`, formData);
      return res.data;
    },
    onSuccess: () => {
      alert('Registration successful! We will contact you soon.');
      navigate('/events');
    },
    onError: () => {
      alert('Registration failed. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    registerMutation.mutate();
    setIsSubmitting(false);
  };

  if (eventLoading) return <div className="min-h-screen flex items-center justify-center">Loading event...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-6">
        <Link to="/events" className="text-brand-tealCyan hover:underline mb-6 inline-block">← Back to Events</Link>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-brand-deepPlum mb-2">{event.title_en}</h1>
          <p className="text-gray-500 mb-6">{new Date(event.date_time).toLocaleString()} • {event.venue}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message (Optional)</label>
              <textarea rows="3" name="message" value={formData.message} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-brand-tealCyan outline-none"></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-tealCyan hover:bg-brand-mintGreen text-brand-deepPlum font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : 'Register Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}