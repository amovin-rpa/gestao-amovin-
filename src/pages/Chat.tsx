import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Send } from 'lucide-react';

export default function Chat() {
  const { currentUser, professionals, chatMessages, addChatMessage } = useStore();
  const [text, setText] = useState('');

  const participants = useMemo(
    () => [...professionals].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [professionals]
  );

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    addChatMessage({
      senderId: currentUser.professionalId || currentUser.name,
      senderName: currentUser.name,
      text: text.trim(),
    });
    setText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      <aside className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-5">
        <h2 className="font-semibold text-gray-900">Profissionais cadastrados</h2>
        <p className="text-xs text-gray-500 mt-1">Chat interno do Gestao Amovin Integrado.</p>
        <div className="mt-4 space-y-3">
          {participants.length === 0 ? <p className="text-sm text-gray-500">Nenhum profissional cadastrado.</p> : participants.map((person) => (
            <div key={person.id} className="flex items-center gap-3">
              <div className="h-10 w-8 border bg-yellow-50 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">
                {person.photoUrl ? <img src={person.photoUrl} alt="" className="h-full w-full object-cover" /> : '3x4'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{person.name}</p>
                <p className="text-xs text-gray-500">{person.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden flex flex-col min-h-[560px]">
        <div className="bg-gradient-to-r from-yellow-300 to-amber-200 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-950">Chat online entre profissionais</h1>
          <p className="text-sm text-gray-800">Mensagens ficam disponiveis para todos os profissionais cadastrados neste prototipo.</p>
        </div>
        <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-yellow-50/40">
          {chatMessages.length === 0 ? <p className="text-center text-sm text-gray-500 mt-16">Nenhuma conversa iniciada.</p> : chatMessages.map((message) => {
            const isMine = message.senderId === currentUser?.professionalId || message.senderName === currentUser?.name;
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