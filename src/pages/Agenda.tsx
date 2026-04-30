import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2 } from 'lucide-react';

export default function Agenda() {
  const { currentUser, beneficiaries, professionals, schedule, addScheduleItem, deleteScheduleItem } = useStore();
  const professionalId = currentUser?.professionalId || professionals.find((p) => p.name === currentUser?.name)?.id || '';
  const [form, setForm] = useState({ beneficiaryId: '', professionalId: professionalId, date: '', time: '', type: '', notes: '' });

  const visibleSchedule = useMemo(() => {
    const items = currentUser?.role === 'admin' ? schedule : schedule.filter((item) => item.professionalId === professionalId);
    return [...items].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [currentUser?.role, professionalId, schedule]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    addScheduleItem({ ...form, professionalId: currentUser?.role === 'admin' ? form.professionalId : professionalId });
    setForm({ beneficiaryId: '', professionalId, date: '', time: '', type: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Agenda</h1>
        <p className="text-sm text-gray-500">{currentUser?.role === 'admin' ? 'Agenda completa de todos os profissionais.' : 'Sua agenda profissional.'}</p>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-3">
        <select required value={form.beneficiaryId} onChange={(e) => setForm({ ...form, beneficiaryId: e.target.value })} className="rounded-md border p-2 md:col-span-2"><option value="">Beneficiário...</option>{beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.fullName}</option>)}</select>
        {currentUser?.role === 'admin' && <select required value={form.professionalId} onChange={(e) => setForm({ ...form, professionalId: e.target.value })} className="rounded-md border p-2 md:col-span-2"><option value="">Profissional...</option>{professionals.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>)}</select>}
        <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-md border p-2" />
        <input required type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-md border p-2" />
        <input required placeholder="Atendimento/atividade" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-md border p-2 md:col-span-2" />
        <input placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-md border p-2 md:col-span-3" />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-yellow-400 px-4 py-2 font-semibold text-gray-950"><Plus size={18}/> Agendar</button>
      </form>

      <div className="rounded-2xl border border-yellow-100 bg-white shadow-sm overflow-hidden">
        {visibleSchedule.length === 0 ? <p className="p-6 text-center text-gray-500">Nenhum agendamento.</p> : visibleSchedule.map((item) => {
          const ben = beneficiaries.find((b) => b.id === item.beneficiaryId);
          const prof = professionals.find((p) => p.id === item.professionalId);
          return <div key={item.id} className="flex items-center justify-between border-b p-4"><div><p className="font-semibold text-gray-900">{new Date(`${item.date}T${item.time}`).toLocaleString()} - {item.type}</p><p className="text-sm text-gray-500">{ben?.fullName || 'Beneficiário'} | {prof?.name || currentUser?.name} {item.notes ? `| ${item.notes}` : ''}</p></div><button onClick={() => deleteScheduleItem(item.id)} className="text-red-600 p-2"><Trash2 size={18}/></button></div>;
        })}
      </div>
    </div>
  );
}