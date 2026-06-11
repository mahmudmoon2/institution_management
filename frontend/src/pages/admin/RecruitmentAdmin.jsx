import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function RecruitmentAdmin() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applications'
  
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [jobData, setJobData] = useState({ title: '', department: '', description: '', requirements: '', vacancies: 1, deadline: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.get('/recruitment/jobs/'),
        api.get('/recruitment/applications/')
      ]);
      setJobs(jobsRes.data);
      setApplications(appsRes.data);
    } catch (error) {
      console.error("Error fetching recruitment data", error);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/recruitment/jobs/', jobData);
      setMsg({ type: 'success', text: 'Job posted successfully!' });
      setJobData({ title: '', department: '', description: '', requirements: '', vacancies: 1, deadline: '' });
      fetchData();
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to post job.' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`/recruitment/applications/${appId}/`, { status: newStatus });
      fetchData();
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const inputClass = "w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-brand-deepPlum">Recruitment Module</h1>
          <p className="text-gray-500 text-sm mt-1">Manage job postings and applicant database.</p>
        </div>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-bold text-sm shadow-sm ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-2xl shadow-sm px-4 pt-2">
        <button onClick={() => setActiveTab('jobs')} className={`px-6 py-3 font-bold transition-colors border-b-2 ${activeTab === 'jobs' ? 'text-brand-deepPlum border-brand-deepPlum' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
          💼 Job Postings
        </button>
        <button onClick={() => setActiveTab('applications')} className={`px-6 py-3 font-bold transition-colors border-b-2 ${activeTab === 'applications' ? 'text-brand-deepPlum border-brand-deepPlum' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
          📄 Applicant Database
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100">
        
        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-[#F5F0FF] p-6 rounded-2xl border border-brand-softLavender/30 h-fit">
              <h2 className="text-lg font-bold text-brand-deepPlum mb-4">Post a New Job</h2>
              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Job Title *</label>
                  <input type="text" required value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} className={inputClass} placeholder="e.g. Senior Math Teacher" />
                </div>
                <div>
                  <label className={labelClass}>Department *</label>
                  <input type="text" required value={jobData.department} onChange={e => setJobData({...jobData, department: e.target.value})} className={inputClass} placeholder="e.g. Academic" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Vacancies *</label>
                    <input type="number" min="1" required value={jobData.vacancies} onChange={e => setJobData({...jobData, vacancies: e.target.value})} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Deadline *</label>
                    <input type="date" required value={jobData.deadline} onChange={e => setJobData({...jobData, deadline: e.target.value})} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description *</label>
                  <textarea required rows="3" value={jobData.description} onChange={e => setJobData({...jobData, description: e.target.value})} className={inputClass}></textarea>
                </div>
                <div>
                  <label className={labelClass}>Requirements *</label>
                  <textarea required rows="3" value={jobData.requirements} onChange={e => setJobData({...jobData, requirements: e.target.value})} className={inputClass}></textarea>
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-brand-royalPurple hover:bg-brand-deepPlum text-white font-bold transition-colors">
                  {isLoading ? 'Posting...' : 'Publish Job'}
                </button>
              </form>
            </div>
            
            <div className="lg:col-span-2 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500">
                    <th className="p-4 font-semibold border-b border-gray-100">Job Title</th>
                    <th className="p-4 font-semibold border-b border-gray-100">Deadline</th>
                    <th className="p-4 font-semibold border-b border-gray-100 text-center">Vacancies</th>
                    <th className="p-4 font-semibold border-b border-gray-100 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{job.title} <span className="text-xs font-normal text-gray-400 block">{job.department}</span></td>
                      <td className="p-4 text-gray-600">{new Date(job.deadline).toLocaleDateString()}</td>
                      <td className="p-4 text-center font-bold text-brand-tealCyan">{job.vacancies}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${job.is_active ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-100 text-red-600'}`}>
                          {job.is_active ? 'Active' : 'Closed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="p-4 font-semibold border-b border-gray-100">Applicant Info</th>
                  <th className="p-4 font-semibold border-b border-gray-100">Applied For</th>
                  <th className="p-4 font-semibold border-b border-gray-100 text-center">Resume</th>
                  <th className="p-4 font-semibold border-b border-gray-100 text-center">Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? <tr><td colSpan="4" className="text-center py-8 text-gray-500">No applications found.</td></tr> : applications.map(app => (
                  <tr key={app.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4">
                      <span className="font-bold text-gray-800 block">{app.applicant_name}</span>
                      <span className="text-xs text-gray-500">{app.email} | {app.phone}</span>
                    </td>
                    <td className="p-4 font-semibold text-brand-deepPlum">{app.job_title}</td>
                    <td className="p-4 text-center">
                      <a href={app.resume} target="_blank" rel="noreferrer" className="text-brand-tealCyan hover:text-brand-royalPurple font-bold underline text-xs">View CV</a>
                    </td>
                    <td className="p-4 text-center">
                      <select 
                        value={app.status} 
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1.5 rounded outline-none border cursor-pointer ${app.status === 'Applied' ? 'bg-gray-100 border-gray-200' : app.status === 'Shortlisted' ? 'bg-blue-50 border-blue-200 text-blue-700' : app.status === 'Selected' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}