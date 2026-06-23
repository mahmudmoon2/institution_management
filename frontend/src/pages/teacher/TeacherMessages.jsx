import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, Send, Paperclip, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import api from '../../api/axios';

export default function TeacherMessages() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchStudents = async () => {
    try { const res = await api.get('/teacher/students/'); setStudents(res.data.students || []); } catch (err) {} finally { setIsLoading(false); }
  };
  const fetchConversation = async (studentId) => {
    try { const res = await api.get(`/teacher/conversation/${studentId}/`); setConversation(res.data.conversation || []); } catch (err) {}
  };

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { if (selectedStudent) { fetchConversation(selectedStudent.id); } }, [selectedStudent?.id]);
  useEffect(() => { if (!selectedStudent) return; const interval = setInterval(() => { fetchConversation(selectedStudent.id); }, 5000); return () => clearInterval(interval); }, [selectedStudent?.id]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);

  const handleSend = async () => {
    if (!messageText.trim() && !imageFile) return;
    if (!selectedStudent) return;
    setIsSending(true);
    const formData = new FormData();
    formData.append('student_id', selectedStudent.id);
    if (messageText.trim()) formData.append('message_body', messageText);
    if (imageFile) formData.append('image', imageFile);
    try {
      await api.post('/teacher/send-message/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessageText(''); setImageFile(null); fetchConversation(selectedStudent.id);
    } catch (err) {} finally { setIsSending(false); }
  };

  const filteredStudents = students.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.student_id.toLowerCase().includes(searchQuery.toLowerCase()) || s.guardian_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (isLoading) {
    return (<div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin"></div></div>);
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`${selectedStudent ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-100 flex-col`}>
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-bold text-brand-deepPlum text-lg mb-3">{t('teacher.parent_messages')} 💬</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('teacher.search_parent')} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-400"><span className="text-4xl">📭</span><p className="mt-2 text-sm font-semibold">{t('common.no_results')}</p></div>
          ) : (
            filteredStudents.map((student) => (
              <motion.div key={student.id} whileHover={{ backgroundColor: '#f9fafb' }} onClick={() => setSelectedStudent(student)} className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${selectedStudent?.id === student.id ? 'bg-brand-tealCyan/10 border-l-4 border-l-brand-tealCyan' : ''}`}>
                <div className="flex items-center gap-3">
                  {student.photo ? (<img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover" />) : (<div className="w-10 h-10 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-sm">{student.name?.charAt(0) || 'S'}</div>)}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{student.name}</p>
                    <p className="text-xs text-gray-400 truncate">{student.class_name} • {t('teacher.roll')} {student.roll_number}</p>
                    <p className="text-[10px] text-brand-tealCyan font-semibold truncate">👤 {student.guardian_name || 'Unknown Guardian'}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <div className={`${selectedStudent ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {!selectedStudent ? (
          <div className="flex-1 flex items-center justify-center text-gray-400"><div className="text-center"><span className="text-6xl">💬</span><p className="mt-4 font-semibold text-lg">{t('teacher.select_student')}</p><p className="text-sm">{t('teacher.select_student_desc')}</p></div></div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
              <button onClick={() => setSelectedStudent(null)} className="md:hidden p-1 rounded-lg hover:bg-gray-200"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              {selectedStudent.photo ? (<img src={selectedStudent.photo} alt={selectedStudent.name} className="w-10 h-10 rounded-full object-cover" />) : (<div className="w-10 h-10 bg-brand-royalPurple rounded-full flex items-center justify-center text-white font-bold text-sm">{selectedStudent.name?.charAt(0) || 'S'}</div>)}
              <div><p className="font-bold text-gray-800">{selectedStudent.name}</p><p className="text-xs text-gray-400">{selectedStudent.class_name} • 👤 {selectedStudent.guardian_name || 'Guardian'}</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-[#e8eaf0] space-y-3">
              {conversation.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400"><div className="text-center"><span className="text-5xl">👋</span><p className="mt-3 font-semibold">{t('teacher.no_messages')}</p><p className="text-sm">{t('teacher.no_messages_desc').replace('{parent}', selectedStudent.guardian_name || 'parent')}</p></div></div>
              ) : (
                conversation.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_role === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${msg.sender_role === 'teacher' ? 'order-1' : 'order-2'}`}>
                      <div className={`p-3 rounded-2xl ${msg.sender_role === 'teacher' ? 'bg-brand-tealCyan text-white rounded-br-md' : 'bg-white rounded-bl-md shadow-sm border border-gray-100'}`}>
                        <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                        {msg.message_body && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message_body}</p>}
                        {msg.image && (<img src={msg.image} alt="Attachment" className="mt-2 rounded-lg max-h-48 w-auto cursor-pointer hover:opacity-90" onClick={() => window.open(msg.image, '_blank')} />)}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-1">{msg.timestamp}{msg.sender_role === 'teacher' && (msg.is_read ? <CheckCheck className="w-3 h-3 text-brand-tealCyan" /> : <Check className="w-3 h-3" />)}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              {imageFile && (<div className="mb-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg"><span>📎 {imageFile.name}</span><button onClick={() => setImageFile(null)} className="text-red-400 hover:text-red-600 font-bold">✕</button></div>)}
              <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-tealCyan transition-colors"><Paperclip className="w-5 h-5" /></button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} />
                <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('teacher.type_message')} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan" />
                <button onClick={handleSend} disabled={isSending || (!messageText.trim() && !imageFile)} className={`p-2.5 rounded-full transition-all ${isSending || (!messageText.trim() && !imageFile) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-tealCyan text-white hover:bg-brand-royalPurple'}`}>
                  {isSending ? (<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>) : (<Send className="w-5 h-5" />)}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}