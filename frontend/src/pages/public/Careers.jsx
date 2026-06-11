import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Application Form State
  const [formData, setFormData] = useState({ applicant_name: '', email: '', phone: '', cover_letter: '' });
  const [resume, setResume] = useState(null);

  useEffect(() => {
    api.get('/recruitment/jobs/').then(res => {
      // শুধুমাত্র অ্যাকটিভ জবগুলো দেখাব
      setJobs(res.data.filter(job => job.is_active));
    }).catch(err => console.error(err));
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) {
      setMsg({ type: 'error', text: 'Please attach your resume (PDF/DOC).' });
      return;
    }
    
    setIsLoading(true);
    setMsg({ type: '', text: '' });

    // File আপলোডের জন্য FormData ব্যবহার করতে হয়
    const data = new FormData();
    data.append('job', selectedJob.id);
    data.append('applicant_name', formData.applicant_name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('cover_letter', formData.cover_letter);
    data.append('resume', resume);

    try {
      await api.post('/recruitment/applications/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg({ type: 'success', text: 'Your application has been submitted successfully! We will contact you soon.' });
      setFormData({ applicant_name: '', email: '', phone: '', cover_letter: '' });
      setResume(null);
      setTimeout(() => {
        setSelectedJob(null);
        setMsg({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to submit application. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan bg-gray-50 focus:bg-white";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-deepPlum text-white py-20 px-6 text-center">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl md:text-5xl font-bold mb-4 font-montserrat tracking-tight">
          Join Our Dynamic Team
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-brand-softLavender max-w-2xl mx-auto">
          We are always looking for passionate educators and professionals to shape the future of our students. Explore our current openings below.
        </motion.p>
      </section>

      <div className="container mx-auto px-6 max-w-6xl mt-12">
        {!selectedJob ? (
          <>
            <h2 className="text-2xl font-bold text-brand-deepPlum mb-6 border-b pb-2">Current Openings</h2>
            {jobs.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl shadow-sm text-center border border-gray-100">
                <span className="text-4xl block mb-2">🌱</span>
                <h3 className="text-lg font-bold text-gray-700">No open positions at the moment</h3>
                <p className="text-gray-500 text-sm mt-1">Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map(job => (
                  <motion.div whileHover={{ y: -5 }} key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-royalPurple bg-brand-softLavender/20 px-2 py-1 rounded-md">{job.department}</span>
                        <h3 className="text-xl font-bold text-brand-deepPlum mt-2">{job.title}</h3>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded">Vacancies: {job.vacancies}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>
                    <p className="text-xs text-red-500 font-semibold mb-5">Deadline: {new Date(job.deadline).toLocaleDateString()}</p>
                    <button onClick={() => setSelectedJob(job)} className="w-full py-2.5 rounded-xl border-2 border-brand-tealCyan text-brand-tealCyan hover:bg-brand-tealCyan hover:text-brand-deepPlum font-bold transition-colors">
                      View & Apply
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-3xl mx-auto">
            <button onClick={() => {setSelectedJob(null); setMsg({type:'',text:''})}} className="text-gray-500 hover:text-brand-royalPurple font-semibold text-sm mb-6 flex items-center gap-1">
              ← Back to Jobs
            </button>
            <h2 className="text-3xl font-bold text-brand-deepPlum">{selectedJob.title}</h2>
            <span className="text-sm font-bold text-brand-tealCyan block mt-1">{selectedJob.department} Department</span>
            
            <div className="mt-6 space-y-4 text-sm text-gray-600">
              <div><strong className="text-gray-800 block mb-1">Job Description:</strong> <p className="whitespace-pre-wrap">{selectedJob.description}</p></div>
              <div><strong className="text-gray-800 block mb-1">Requirements:</strong> <p className="whitespace-pre-wrap">{selectedJob.requirements}</p></div>
            </div>

            <hr className="my-8" />

            <h3 className="text-xl font-bold text-brand-deepPlum mb-4">Submit Your Application</h3>
            {msg.text && <div className={`p-4 rounded-xl font-bold text-sm mb-4 ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-red-50 text-red-600'}`}>{msg.text}</div>}
            
            <form onSubmit={handleApply} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" required placeholder="Full Name *" value={formData.applicant_name} onChange={e => setFormData({...formData, applicant_name: e.target.value})} className={inputClass} />
                <input type="email" required placeholder="Email Address *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} />
              </div>
              <input type="text" required placeholder="Phone Number *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClass} />
              <textarea required rows="4" placeholder="Cover Letter (Tell us why you are a good fit) *" value={formData.cover_letter} onChange={e => setFormData({...formData, cover_letter: e.target.value})} className={inputClass}></textarea>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-white transition-colors">
                <label className="cursor-pointer block">
                  <span className="text-2xl block mb-2">📄</span>
                  <span className="font-semibold text-gray-700 block">Upload Resume / CV *</span>
                  <span className="text-xs text-gray-400 mt-1 block">(PDF or DOC format. Max 5MB)</span>
                  <input type="file" required accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} className="hidden" />
                </label>
                {resume && <span className="mt-3 inline-block bg-brand-mintGreen/30 text-[#0e5c3c] px-3 py-1 rounded-full text-xs font-bold">{resume.name}</span>}
              </div>

              <button type="submit" disabled={isLoading} className="w-full py-4 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors shadow-md mt-4 text-lg">
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}