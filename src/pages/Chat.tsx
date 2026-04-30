import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Send, Users, User } from 'lucide-react';

export default function Chat() {
  const { currentUser, professionals, chatMessages, addChatMessage } = useStore();
  const [text, setText] = useState('');
  const [channel, setChannel] = useState('geral');

  const myId = currentUser?.professionalId || currentUser?.name || '';

  const participants = useMemo(
    () => [...professionals].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [professionals]
  );

  const visibleMessages = useMemo(() => {
    return chatMessages.filter(m => {
      if (!m.channel || m.channel === 'geral') return channel === 'geral';
      // Private: show if I'm sender or receiver
      if (channel !== 'geral') {
        return (m.channel === channel && (m.senderId === myId)) ||
               (m.channel === myId && m.senderId === channel) ||
               (m.senderId === myId && m.channel === channel);
      }
      return false;
    });
  }, [chatMessages, channel, myId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    addChatMessage({
      senderId: myId,
      senderName: currentUser.name,
      text: text.trim(),
      channel: channel,
    });
    setText('');
  };

  const channelName = channel === 'geral' ? 'Bate-papo Geral' : `Privado: ${professionals.find(p => p.id === channel)?.name || channel}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-5">
        <h2 className="font-semibold text-gray-900">Conversas</h2>

        <button onClick={() => setChannel('geral')} className={`mt-4 w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${channel === 'geral' ? 'bg-yellow-100 border border-yellow-300' : 'hover:bg-gray-50 border border-transparent'}`}>
          <Users size={18} className="text-amber-700" />
          <div className="text-left"><p className="text-sm font-semibold text-gray-900">Bate-papo Geral</p><p className="text-xs text-gray-500">Todos os profissionais</p></div>
        </button>

        <p className="mt-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Privado</p>
        <div className="mt-2 space-y-1">
          {participants.length === 0 ? <p className="text-sm text-gray-500 p-2">Nenhum profissional.</p> : participants.filter(p => p.id !== myId && p.name !== currentUser?.name).map((person) => (
            <button key={person.id} onClick={() => setChannel(person.id)} className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${channel === person.id ? 'bg-yellow-100 border border-yellow-300' : 'hover:bg-gray-50 border border-transparent'}`}>
              <div className="h-8 w-6 border bg-yellow-50 overflow-hidden flex items-center justify-center text-[8px] text-gray-400 rounded shrink-0">
                {person.photoUrl ? <img src={person.photoUrl} alt="" className="h-full w-full object-cover" /> : <User size={12} />}
              </div>
              <div className="text-left min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{person.name}</p><p className="text-xs text-gray-500 truncate">{person.specialty}</p></div>
            </button>
          ))}
        </div>
      </aside>

      <section className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden flex flex-col min-h-[560px]">
        <div className="bg-gradient-to-r from-yellow-300 to-amber-200 px-6 py-4">
          <h1 className="text-lg font-bold text-gray-950">{channelName}</h1>
          <p className="text-sm text-gray-800">{channel === 'geral' ? 'Mensagens visiveis para todos.' : 'Conversa privada.'}</p>
        </div>
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-yellow-50/40">
          {visibleMessages.length === 0 ? <p className="text-center text-sm text-gray-500 mt-16">Nenhuma mensagem neste chat.</p> : visibleMessages.map((message) => {
            const isMine = message.senderId === myId;
            return (
              <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[76%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'bg-gray-950 text-white' : 'bg-white border border-yellow-100 text-gray-900'}`}>
                  <div className="text-xs font-semibold opacity-75">{message.senderName}</div>
                  <div className="mt-1 text-sm whitespace-pre-wrap">{message.text}</div>
                  <div className="mt-2 text-[10px] opacity-60">{new Date(message.createdAt).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
        <form onSubmit={sendMessage} className="p-4 border-t border-yellow-100 flex gap-3 bg-white">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:border-yellow-500 focus:ring-yellow-500" />
          <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-gray-950 hover:bg-yellow-500"><Send size={18} /> Enviar</button>
        </form>
      </section>
    </div>
  );
}
