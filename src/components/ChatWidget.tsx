import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { MessageCircle, Send, X, Users, User } from 'lucide-react';

export default function ChatWidget() {
  const { currentUser, professionals, chatMessages, addChatMessage } = useStore();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [channel, setChannel] = useState('geral');
  const [notification, setNotification] = useState<string | null>(null);
  const lastCountRef = useRef(chatMessages.length);
  const myId = currentUser?.professionalId || currentUser?.name || '';

  const participants = useMemo(() => [...professionals].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [professionals]);

  // Detect new messages when chat is closed
  useEffect(() => {
    if (chatMessages.length > lastCountRef.current) {
      const newest = chatMessages[chatMessages.length - 1];
      if (newest && newest.senderId !== myId && !open) {
        setNotification(`${newest.senderName}: ${newest.text.substring(0, 40)}${newest.text.length > 40 ? '...' : ''}`);
        setTimeout(() => setNotification(null), 5000);
      }
    }
    lastCountRef.current = chatMessages.length;
  }, [chatMessages.length, open, myId]);

  const visibleMessages = useMemo(() => chatMessages.filter(m => {
    if (!m.channel || m.channel === 'geral') return channel === 'geral';
    if (channel !== 'geral') return (m.channel === channel && m.senderId === myId) || (m.channel === myId && m.senderId === channel) || (m.senderId === myId && m.channel === channel);
    return false;
  }), [chatMessages, channel, myId]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    addChatMessage({ senderId: myId, senderName: currentUser.name, text: text.trim(), channel });
    setText('');
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Notification toast */}
      {notification && !open && (
        <div className="fixed bottom-24 right-6 z-50 max-w-xs bg-gray-950 text-yellow-200 rounded-xl px-4 py-3 shadow-2xl animate-bounce cursor-pointer" onClick={() => { setOpen(true); setNotification(null); }}>
          <p className="text-xs font-semibold">Nova mensagem</p>
          <p className="text-sm mt-1">{notification}</p>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button onClick={() => { setOpen(true); setNotification(null); }} className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gray-950 text-yellow-300 shadow-xl flex items-center justify-center hover:bg-gray-800 transition-transform hover:scale-110">
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-yellow-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-300 px-4 py-3 flex items-center justify-between">
            <span className="font-bold text-gray-950 text-sm">Chat Interno</span>
            <button onClick={() => setOpen(false)} className="text-gray-800 hover:text-gray-950"><X size={18}/></button>
          </div>

          <div className="flex border-b overflow-x-auto px-2 py-2 gap-1 bg-gray-50 shrink-0">
            <button onClick={() => setChannel('geral')} className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${channel === 'geral' ? 'bg-gray-950 text-yellow-300' : 'bg-white border text-gray-600'}`}><Users size={12}/> Geral</button>
            {participants.filter(p => p.id !== myId && p.name !== currentUser?.name).map(p => (
              <button key={p.id} onClick={() => setChannel(p.id)} className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${channel === p.id ? 'bg-gray-950 text-yellow-300' : 'bg-white border text-gray-600'}`}><User size={12}/> {p.name.split(' ')[0]}</button>
            ))}
          </div>

          <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-yellow-50/30">
            {visibleMessages.length === 0 ? <p className="text-center text-xs text-gray-400 mt-8">Nenhuma mensagem.</p> : visibleMessages.slice(-50).map(m => {
              const isMine = m.senderId === myId;
              return (
                <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 ${isMine ? 'bg-gray-950 text-white' : 'bg-white border text-gray-900'}`}>
                    <p className="text-[10px] font-semibold opacity-70">{m.senderName}</p>
                    <p className="text-xs whitespace-pre-wrap mt-0.5">{m.text}</p>
                    <p className="text-[9px] opacity-50 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={send} className="p-2 border-t flex gap-2 bg-white">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Mensagem..." className="flex-1 rounded-lg border px-3 py-2 text-sm focus:border-yellow-400 focus:ring-yellow-400" />
            <button type="submit" className="rounded-lg bg-yellow-400 px-3 py-2 text-gray-950"><Send size={16}/></button>
          </form>
        </div>
      )}
    </>
  );
}
