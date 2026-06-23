import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, CheckCheck, Check } from 'lucide-react';
import api from '../../api/axios';

export default function ParentMessages() {
  const { t } = useTranslation();
  const [conversation, setConversation] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [childInfo, setChildInfo] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/parent/messages/');
      const data = res.data;
      const msgs = data.conversation || [];
      for (const msg of msgs) { if (msg.is_root && !msg.is_read) { try { await api.post(`/parent/messages/${msg.id}/read/`); } catch (err) {} } }
      setConversation(msgs);
      const rootMsg = msgs.find(m => m.is_root);
      if (rootMsg) setThreadId(rootMsg.id);
    } catch (err) { setError(err.response?.data?.error || 'Failed to load messages'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMessages(); const interval = setInterval(fetchMessages, 5000); return () => clearInterval(interval); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation]);
  useEffect(() => { const f=async()=>{try{const r=await api.get('/parent/dashboard/');if(r.data.child){setChildInfo({name:r.data.child.name,class_name:r.data.child.class_name,guardian_name:r.data.child.guardian_name,photo:r.data.child.photo});}}catch(e){}};f();},[]);

  const handleSend = async () => {
    if (!messageText.trim() && !imageFile) return;
    if (!threadId) return;
    setIsSending(true);
    const formData = new FormData();
    if (messageText.trim()) formData.append('message_body', messageText);
    if (imageFile) formData.append('image', imageFile);
    try { await api.post(`/parent/messages/${threadId}/reply/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }); setMessageText(''); setImageFile(null); fetchMessages(); }
    catch (err) {} finally { setIsSending(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-12 h-12 border-4 border-brand-tealCyan border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-center"><span className="text-5xl">⚠️</span><p className="text-red-600 font-bold mt-4">{error}</p></div></div>;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex-1 flex flex-col">
        {conversation.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400"><div className="text-center"><span className="text-6xl">💬</span><p className="mt-4 font-semibold text-lg">{t('parent.no_messages_parent')}</p><p className="text-sm">{t('parent.no_messages_parent_desc')}</p></div></div>
        ) : (<>
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-tealCyan rounded-full flex items-center justify-center text-white font-bold text-sm">👩‍🏫</div>
            <div><p className="font-bold text-gray-800">{t('parent.school_teachers')}</p><p className="text-xs text-gray-400">{childInfo ? `${childInfo.name} • ${childInfo.class_name}` : t('parent.your_child')}</p></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-[#e8eaf0] space-y-3">
            {conversation.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_role === 'parent' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] ${msg.sender_role === 'parent' ? 'order-1' : 'order-2'}`}>
                  <div className={`p-3 rounded-2xl ${msg.sender_role==='parent'?'bg-brand-tealCyan text-white rounded-br-md':'bg-white rounded-bl-md shadow-sm border border-gray-100'}`}>
                    <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                    {msg.message_body&&<p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message_body}</p>}
                    {msg.image&&<img src={msg.image} alt="Attachment" className="mt-2 rounded-lg max-h-48 w-auto cursor-pointer hover:opacity-90" onClick={()=>window.open(msg.image,'_blank')}/>}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 px-1 flex items-center gap-1">{msg.timestamp}{msg.sender_role==='parent'&&(msg.is_read?<CheckCheck className="w-3 h-3 text-brand-tealCyan"/>:<Check className="w-3 h-3"/>)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}/>
          </div>
          <div className="p-4 border-t border-gray-100 bg-white">
            {imageFile&&<div className="mb-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg"><span>📎 {imageFile.name}</span><button onClick={()=>setImageFile(null)} className="text-red-400 hover:text-red-600 font-bold">✕</button></div>}
            <div className="flex items-center gap-2">
              <button onClick={()=>fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-tealCyan transition-colors"><Paperclip className="w-5 h-5"/></button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e)=>setImageFile(e.target.files[0])}/>
              <input type="text" value={messageText} onChange={(e)=>setMessageText(e.target.value)} onKeyDown={(e)=>e.key==='Enter'&&handleSend()} placeholder={t('parent.type_message')} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:border-brand-tealCyan focus:ring-1 focus:ring-brand-tealCyan"/>
              <button onClick={handleSend} disabled={isSending||(!messageText.trim()&&!imageFile)} className={`p-2.5 rounded-full transition-all ${isSending||(!messageText.trim()&&!imageFile)?'bg-gray-200 text-gray-400 cursor-not-allowed':'bg-brand-tealCyan text-white hover:bg-brand-royalPurple'}`}>{isSending?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>:<Send className="w-5 h-5"/>}</button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}