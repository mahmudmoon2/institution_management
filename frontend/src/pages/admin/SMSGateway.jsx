import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';

export default function SMSGateway() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [channel, setChannel] = useState('WhatsApp');
  const [audience, setAudience] = useState('Custom');
  const [customNumbers, setCustomNumbers] = useState('');
  const [smsType, setSmsType] = useState('Custom');
  const [message, setMessage] = useState('');

  // --- স্মার্ট মেসেজ টেমপ্লেটস ---
  const templates = {
    'Custom': '',
    'Fee-Reminder': 'Dear Guardian, this is a gentle reminder that the school fee for the current month is due. Please clear the dues at your earliest convenience to avoid late fees. - Ideal Academy',
    'Result': 'Dear Guardian, the recent exam results for your child have been published. Please log in to the Parent Portal to view the detailed mark sheet. - Ideal Academy',
    'Attendance': 'Dear Guardian, this is to inform you that your child was marked absent today. If this was not informed earlier, please contact the class teacher. - Ideal Academy'
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/notifications/sms-logs/');
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching SMS logs", error);
    }
  };

  // ক্যাটাগরি চেঞ্জ করলে অটোমেটিক টেমপ্লেট বসে যাবে
  const handleSmsTypeChange = (e) => {
    const type = e.target.value;
    setSmsType(type);
    setMessage(templates[type]);
  };

  const formatPhoneForWA = (phone) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '88' + cleanPhone;
    }
    return cleanPhone;
  };

  const handleSendSMS = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });

    let recipients = [];

    try {
      // --- ডাটাবেস থেকে রিয়েল নাম্বার ফেচ করার লজিক ---
      if (audience === 'Custom') {
        recipients = customNumbers.split(',').map(n => n.trim()).filter(n => n);
      } 
      else if (audience === 'All Parents') {
        const res = await api.get('/students/');
        // স্টুডেন্টদের ডাটা থেকে শুধু গার্ডিয়ানদের ফোন নাম্বার নেওয়া এবং ডুপ্লিকেট বাদ দেওয়া (যেমন এক অভিভাবকের ২ সন্তান থাকলে ১ বারই যাবে)
        const parentNumbers = res.data.map(student => student.guardian_phone).filter(phone => phone);
        recipients = [...new Set(parentNumbers)]; 
      } 
      else if (audience === 'All Teachers') {
        const res = await api.get('/teachers/');
        recipients = res.data.map(teacher => teacher.phone).filter(phone => phone);
      }

      if (recipients.length === 0) {
        setMsg({ type: 'error', text: `No valid numbers found for ${audience}. Please check database.` });
        setIsLoading(false);
        return;
      }

      // ডাটাবেসে লগ সেভ করা
      await api.post('/notifications/send-bulk-sms/', {
        recipients,
        message: `[${channel}] ${message}`,
        sms_type: smsType
      });

      // WhatsApp এ মেসেজ ওপেন করার লজিক
      if (channel === 'WhatsApp') {
        recipients.forEach((phone, index) => {
          const waPhone = formatPhoneForWA(phone);
          const text = encodeURIComponent(message);
          setTimeout(() => {
            window.open(`https://wa.me/${waPhone}?text=${text}`, '_blank');
          }, index * 800); 
        });
      }

      setMsg({ type: 'success', text: `Success! Prepared to send ${channel} to ${recipients.length} real recipients.` });
      setMessage('');
      setCustomNumbers('');
      setSmsType('Custom');
      fetchLogs();
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);

    } catch (error) {
      console.error(error);
      setMsg({ type: 'error', text: `Failed to process ${channel}. Check backend connection or database.` });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-brand-tealCyan text-sm bg-gray-50 focus:bg-white transition-colors";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#190933] p-8 rounded-3xl shadow-lg border border-brand-royalPurple text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="relative z-10 w-full md:w-2/3">
          <span className="inline-block px-3 py-1 bg-brand-tealCyan/20 text-brand-tealCyan font-bold text-xs rounded-full mb-3 tracking-wider uppercase border border-brand-tealCyan/30">
            Communication Module
          </span>
          <h1 className="text-3xl font-bold mb-2">Smart Messaging Gateway</h1>
          <p className="text-gray-300 text-sm leading-relaxed max-w-lg">
            Broadcast messages directly to registered Parents and Teachers. Select a category to use auto-generated professional templates.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="text-[200px]">💬</span>
        </div>
      </motion.div>

      {msg.text && (
        <div className={`p-4 rounded-xl font-bold text-sm shadow-sm ${msg.type === 'success' ? 'bg-[#D1FAE5] text-[#065F46] border border-[#34D399]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Compose Message */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-lg font-bold text-brand-deepPlum mb-4 border-b pb-2">Compose Broadcast</h2>
          
          <form onSubmit={handleSendSMS} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Channel *</label>
                <select value={channel} onChange={(e) => setChannel(e.target.value)} className={inputClass}>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS Gateway</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Audience *</label>
                <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
                  <option value="Custom">Custom Numbers</option>
                  <option value="All Parents">All Registered Parents</option>
                  <option value="All Teachers">All Teachers</option>
                </select>
              </div>
            </div>

            {audience === 'Custom' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className={labelClass}>Phone Numbers *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 01711..., 01822..." 
                  value={customNumbers} 
                  onChange={(e) => setCustomNumbers(e.target.value)} 
                  className={inputClass} 
                />
              </motion.div>
            )}

            <div>
              <label className={labelClass}>Message Category (Auto-Template) *</label>
              <select value={smsType} onChange={handleSmsTypeChange} className={inputClass}>
                <option value="Custom">Blank / Custom Message</option>
                <option value="Fee-Reminder">Fee Reminder Template</option>
                <option value="Result">Exam Result Template</option>
                <option value="Attendance">Attendance Alert Template</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Message Body *</label>
              <textarea 
                required 
                rows="5" 
                placeholder="Type your message or select a category above..." 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className={inputClass}
              ></textarea>
            </div>

            <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-xl font-bold transition-colors shadow-md mt-2 flex items-center justify-center gap-2 ${isLoading ? 'bg-gray-400 text-white' : channel === 'WhatsApp' ? 'bg-[#25D366] hover:bg-[#1DA851] text-white' : 'bg-brand-tealCyan hover:bg-[#4bc2ab] text-brand-deepPlum'}`}>
              {isLoading ? 'Fetching Data & Processing...' : channel === 'WhatsApp' ? <><span>📱</span> Send via WhatsApp</> : <><span>🚀</span> Queue SMS</>}
            </button>
          </form>
        </motion.div>

        {/* Right Column: Delivery Logs */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F5F0FF]">
            <h2 className="text-lg font-bold text-brand-deepPlum">Delivery Logs</h2>
            <span className="text-xs font-bold text-brand-royalPurple bg-white px-3 py-1 rounded-full border border-brand-softLavender/30">Total: {logs.length}</span>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-sm min-w-[500px]">
              <thead className="bg-white sticky top-0 shadow-sm text-gray-500">
                <tr>
                  <th className="p-4 border-b border-gray-100 font-semibold">Date & Time</th>
                  <th className="p-4 border-b border-gray-100 font-semibold">Recipient</th>
                  <th className="p-4 border-b border-gray-100 font-semibold">Message</th>
                  <th className="p-4 border-b border-gray-100 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-semibold">No messages logged yet.</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50 border-b border-gray-50 transition-colors">
                      <td className="p-4 text-xs font-semibold text-gray-500 whitespace-nowrap">
                        {new Date(log.sent_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="p-4 font-bold text-gray-800">{log.recipient_phone}</td>
                      <td className="p-4">
                        <p className="text-xs text-gray-600 line-clamp-2" title={log.message_body}>{log.message_body}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${log.status === 'Sent' ? 'bg-brand-mintGreen/20 text-[#0e5c3c]' : 'bg-red-100 text-red-600'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}