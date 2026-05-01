import { useMemo, useState } from 'react';
import { useStore, ScheduleItem } from '../store';
import { Check, Edit2, Mail, Phone, Plus, Trash2 } from 'lucide-react';
import { isToday, isThisWeek, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const statusLabels: Record<string, string> = { agendado: 'Agendado', presente: 'Presente', falta: 'Falta', falta_justificada: 'Falta Justificada', ausencia: 'Declaração de Ausência' };
const statusColors: Record<string, string> = { agendado: 'bg-gray-100 text-gray-800', presente: 'bg-green-100 text-green-800', falta: 'bg-red-100 text-red-800', falta_justificada: 'bg-yellow-100 text-yellow-800', ausencia: 'bg-blue-100 text-blue-800' };

export default function Agenda() {
  const { currentUser, beneficiaries, professionals, schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem } = useStore();
  const professionalId = currentUser?.professionalId || professionals.find((p) => p.name === currentUser?.name)?.id || '';
  const [form, setForm] = useState({ beneficiaryId: '', professionalId: professionalId, date: '', time: '', type: '', notes: '', status: 'agendado' as ScheduleItem['status'] });
  const [view, setView] = useState<'todos' | 'dia' | 'semana' | 'mes'>('todos');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const allItems = useMemo(() => {
    const items = currentUser?.role === 'admin' ? schedule : schedule.filter((item) => item.professionalId === professionalId);
    return [...items].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [currentUser?.role, professionalId, schedule]);

  const filteredItems = useMemo(() => {
    if (view === 'todos') return allItems;
    return allItems.filter((item) => {
      const d = parseISO(item.date);
      if (view === 'dia') return isToday(d);
      if (view === 'semana') return isThisWeek(d);
      if (view === 'mes') return isWithinInterval(d, { start: startOfMonth(new Date()), end: endOfMonth(new Date()) });
      return true;
    });
  }, [allItems, view]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addScheduleItem({ ...form, professionalId: currentUser?.role === 'admin' ? form.professionalId : professionalId });
    setForm({ beneficiaryId: '', professionalId, date: '', time: '', type: '', notes: '', status: 'agendado' });
  };

  const saveStatus = (id: string, status: ScheduleItem['status']) => {
    updateScheduleItem(id, { status });
    setEditingItemId(null);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-gray-900">Agenda</h1><p className="text-sm text-gray-500">{currentUser?.role === 'admin' ? 'Agenda completa de todos os profissionais.' : 'Sua agenda profissional.'}</p></div>

      <form onSubmit={submit} className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3">
        <select required value={form.beneficiaryId} onChange={(e) => setForm({ ...form, beneficiaryId: e.target.value })} className="rounded-md border p-2 md:col-span-2"><option value="">Beneficiário...</option>{beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.fullName}</option>)}</select>
        {currentUser?.role === 'admin' && <select required value={form.professionalId} onChange={(e) => setForm({ ...form, professionalId: e.target.value })} className="rounded-md border p-2 md:col-span-2"><option value="">Profissional...</option>{professionals.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>)}</select>}
        <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-md border p-2" />
        <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-md border p-2" />
        <input required placeholder="Atendimento/atividade" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-md border p-2 md:col-span-2" />
        <input placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-md border p-2 md:col-span-3" />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow-400 px-4 py-2 font-semibold text-gray-950"><Plus size={18}/> Agendar</button>
      </form>

      <div className="flex gap-2 flex-wrap">
        {(['todos', 'dia', 'semana', 'mes'] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-md text-sm font-medium ${view === v ? 'bg-yellow-400 text-gray-950' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {v === 'todos' ? 'Todos' : v === 'dia' ? 'Hoje' : v === 'semana' ? 'Esta Semana' : 'Este Mês'}
          </button>
        ))}
        <span className="text-sm text-gray-500 self-center ml-2">{filteredItems.length} agendamento(s)</span>
      </div>

      <div className="rounded-2xl border border-yellow-100 bg-white shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? <p className="p-6 text-center text-gray-500">Nenhum agendamento{view !== 'todos' ? ` para ${view === 'dia' ? 'hoje' : view === 'semana' ? 'esta semana' : 'este mês'}` : ''}.</p> : filteredItems.map((item) => {
          const ben = beneficiaries.find((b) => b.id === item.beneficiaryId);
          const prof = professionals.find((p) => p.id === item.professionalId);
          const st = item.status || 'agendado';
          const isEditing = editingItemId === item.id;
          return (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b p-4 gap-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.date ? new Date(`${item.date}T${item.time || '00:00'}`).toLocaleString() : '-'} - {item.type}</p>
                <p className="text-sm text-gray-500">{ben?.fullName || 'Beneficiário'} | {prof?.name || currentUser?.name} {item.notes ? `| ${item.notes}` : ''}</p>
                <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[st]}`}>{statusLabels[st]}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {isEditing ? (
                  <>
                    <select defaultValue={st} id={`status-${item.id}`} className="text-xs border rounded-md p-1.5">
                      <option value="agendado">Agendado</option>
                      <option value="presente">Presente</option>
                      <option value="falta">Falta</option>
                      <option value="falta_justificada">Falta Justificada</option>
                      <option value="ausencia">Declaração de Ausência</option>
                    </select>
                    <button onClick={() => { const el = document.getElementById(`status-${item.id}`) as HTMLSelectElement; saveStatus(item.id, el.value as ScheduleItem['status']); }} className="text-green-700 p-1.5 border rounded bg-green-50" title="Salvar"><Check size={16}/></button>
                  </>
                ) : (
                  <button onClick={() => setEditingItemId(item.id)} className="text-blue-700 p-1.5 border rounded" title="Editar status"><Edit2 size={16}/></button>
                )}
                <button onClick={() => { const ben2 = beneficiaries.find(b => b.id === item.beneficiaryId); if (!ben2?.respPhone) return alert('Telefone do responsavel nao cadastrado'); const phone = ben2.respPhone.replace(/\D/g,''); const msg = encodeURIComponent(`Olá ${ben2.respName || ''}, lembramos que ${ben2.fullName} tem atendimento agendado: ${item.type} em ${new Date(item.date+'T'+(item.time||'00:00')).toLocaleString()}. AMOVIN`); window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank'); }} className="text-green-700 p-1.5 border rounded" title="WhatsApp"><Phone size={16}/></button>
                <button onClick={() => { const ben2 = beneficiaries.find(b => b.id === item.beneficiaryId); const subject = encodeURIComponent('Lembrete de Agendamento - AMOVIN'); const body = encodeURIComponent(`Prezado(a) ${ben2?.respName || ''},\n\nLembramos que ${ben2?.fullName || ''} tem atendimento agendado:\n${item.type}\nData: ${new Date(item.date+'T'+(item.time||'00:00')).toLocaleString()}\n\nAtenciosamente,\nAMOVIN`); window.open(`mailto:?subject=${subject}&body=${body}`, '_blank'); }} className="text-blue-700 p-1.5 border rounded" title="E-mail"><Mail size={16}/></button>
                <button onClick={() => deleteScheduleItem(item.id)} className="text-red-600 p-1.5 border rounded"><Trash2 size={16}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
