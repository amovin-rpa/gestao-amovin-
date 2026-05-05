import { useMemo, useState, useEffect } from 'react';
import { useStore, ScheduleItem } from '../store';
import { Check, Edit2, Mail, Phone, Plus, Trash2, Calendar, Clock, MapPin, Loader2, X } from 'lucide-react';
import { isToday, isThisWeek, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { createScheduleSlot, updateScheduleSlot, deleteScheduleSlot, getScheduleByProfessional, ScheduleSlot } from '../services/schedule';

const statusLabels: Record<string, string> = { agendado: 'Agendado', presente: 'Presente', falta: 'Falta', falta_justificada: 'Falta Justificada', ausencia: 'Declaração de Ausência' };
const statusColors: Record<string, string> = { agendado: 'bg-gray-100 text-gray-800', presente: 'bg-green-100 text-green-800', falta: 'bg-red-100 text-red-800', falta_justificada: 'bg-yellow-100 text-yellow-800', ausencia: 'bg-blue-100 text-blue-800' };

const offices = ['Consultório 1', 'Consultório 2', 'Consultório 3'];
const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

export default function Agenda() {
  const { currentUser, beneficiaries, professionals, schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem } = useStore();
  const professionalId = currentUser?.professionalId || professionals.find((p) => p.name === currentUser?.name)?.id || '';
  const professionalName = currentUser?.name || '';
  const [form, setForm] = useState({ beneficiaryId: '', professionalId: professionalId, date: '', time: '', type: '', notes: '', status: 'agendado' as ScheduleItem['status'] });
  const [view, setView] = useState<'todos' | 'dia' | 'semana' | 'mes'>('todos');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'disponibilidade'>('agendamentos');

  // Disponibilidade states
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isSlotFormOpen, setIsSlotFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: '', time: '', office: 'Consultório 1', isAvailable: true, isBlocked: false });

  useEffect(() => { if (professionalId) loadSlots(); }, [professionalId, selectedMonth]);

  const loadSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const allSlots = await getScheduleByProfessional(professionalId);
      setSlots(allSlots.filter(s => s.date.startsWith(selectedMonth)));
    } catch (err) { console.error('Erro ao carregar:', err); }
    finally { setIsLoadingSlots(false); }
  };

  const openNewSlot = () => { setEditingSlot(null); setSlotForm({ date: '', time: '', office: 'Consultório 1', isAvailable: true, isBlocked: false }); setIsSlotFormOpen(true); };
  const openEditSlot = (slot: ScheduleSlot) => { setEditingSlot(slot); setSlotForm({ date: slot.date, time: slot.time, office: slot.office, isAvailable: slot.isAvailable, isBlocked: slot.isBlocked }); setIsSlotFormOpen(true); };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSlot(true);
    try {
      const data = { professionalId, professionalName, date: slotForm.date, time: slotForm.time, office: slotForm.office, isAvailable: slotForm.isAvailable, isBlocked: slotForm.isBlocked };
      if (editingSlot?.id) await updateScheduleSlot(editingSlot.id, data);
      else await createScheduleSlot(data);
      await loadSlots();
      setIsSlotFormOpen(false);
    } catch (err) { console.error('Erro:', err); alert('Erro ao salvar.'); }
    finally { setIsSavingSlot(false); }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Excluir este horário?')) return;
    try { await deleteScheduleSlot(id); await loadSlots(); } catch (err) { console.error('Erro:', err); }
  };

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const dt = new Date(Number(y), Number(m)-1, Number(day));
    return `${dias[dt.getDay()]}, ${day}/${m}/${y}`;
  };

  const grouped = slots.reduce((acc, s) => { if (!acc[s.date]) acc[s.date] = []; acc[s.date].push(s); return acc; }, {} as Record<string, ScheduleSlot[]>);

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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{currentUser?.role === 'consulta' ? 'Minha Agenda' : 'Agenda'}</h1>
        <p className="text-sm text-gray-500">{currentUser?.role === 'admin' ? 'Agenda completa de todos os profissionais.' : 'Sua agenda profissional.'}</p>
      </div>

      {/* ABAS */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab('agendamentos')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === 'agendamentos' ? 'border-yellow-500 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          📋 Agendamentos
        </button>
        <button onClick={() => setActiveTab('disponibilidade')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === 'disponibilidade' ? 'border-yellow-500 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          📅 Minha Disponibilidade
        </button>
      </div>

      {/* ABA AGENDAMENTOS */}
      {activeTab === 'agendamentos' && (
        <>
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
            {filteredItems.length === 0 ? <p className="p-6 text-center text-gray-500">Nenhum agendamento.</p> : filteredItems.map((item) => {
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
                          <option value="agendado">Agendado</option><option value="presente">Presente</option><option value="falta">Falta</option><option value="falta_justificada">Falta Justificada</option><option value="ausencia">Declaração de Ausência</option>
                        </select>
                        <button onClick={() => { const el = document.getElementById(`status-${item.id}`) as HTMLSelectElement; saveStatus(item.id, el.value as ScheduleItem['status']); }} className="text-green-700 p-1.5 border rounded bg-green-50"><Check size={16}/></button>
                      </>
                    ) : (
                      <button onClick={() => setEditingItemId(item.id)} className="text-blue-700 p-1.5 border rounded"><Edit2 size={16}/></button>
                    )}
                    <button onClick={() => { const ben2 = beneficiaries.find(b => b.id === item.beneficiaryId); if (!ben2?.respPhone) return alert('Telefone não cadastrado'); const phone = ben2.respPhone.replace(/\D/g,''); const msg = encodeURIComponent(`Olá ${ben2.respName || ''}, lembramos que ${ben2.fullName} tem atendimento: ${item.type} em ${new Date(item.date+'T'+(item.time||'00:00')).toLocaleString()}. AMOVIN`); window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank'); }} className="text-green-700 p-1.5 border rounded"><Phone size={16}/></button>
                    <button onClick={() => { const ben2 = beneficiaries.find(b => b.id === item.beneficiaryId); const subject = encodeURIComponent('Lembrete - AMOVIN'); const body = encodeURIComponent(`Prezado(a) ${ben2?.respName || ''},\n\n${ben2?.fullName || ''} tem atendimento:\n${item.type}\nData: ${new Date(item.date+'T'+(item.time||'00:00')).toLocaleString()}\n\nAMOVIN`); window.open(`mailto:?subject=${subject}&body=${body}`, '_blank'); }} className="text-blue-700 p-1.5 border rounded"><Mail size={16}/></button>
                    <button onClick={() => deleteScheduleItem(item.id)} className="text-red-600 p-1.5 border rounded"><Trash2 size={16}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ABA DISPONIBILIDADE */}
      {activeTab === 'disponibilidade' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-yellow-100">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Mês/Ano:</label>
              <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border rounded-md p-2 text-sm" />
            </div>
            <button onClick={openNewSlot} className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-4 py-2 rounded-md flex items-center gap-2 font-semibold text-sm">
              <Plus size={18} /> Adicionar Horário
            </button>
            <div className="flex gap-3 text-xs ml-auto">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span> Disponível</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span> Bloqueado</span>
            </div>
          </div>

          {isLoadingSlots ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-yellow-100">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg">Nenhum horário cadastrado para este mês.</p>
              <p className="text-sm">Clique em "Adicionar Horário" para definir sua disponibilidade.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).sort().map(([date, dateSlots]) => (
                <div key={date} className="border rounded-lg overflow-hidden bg-white">
                  <div className="bg-gray-100 px-4 py-2 font-semibold text-sm flex items-center gap-2">
                    <Calendar size={16} /> {formatDate(date)}
                    <span className="ml-auto text-xs text-gray-500">{dateSlots.length} horário(s)</span>
                  </div>
                  <div className="divide-y">
                    {dateSlots.sort((a, b) => a.time.localeCompare(b.time)).map((slot) => (
                      <div key={slot.id} className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${slot.isBlocked ? 'bg-red-50' : ''}`}>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${slot.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            <Clock size={14} /> {slot.time}
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 text-sm"><MapPin size={14} /> {slot.office}</div>
                          {slot.isBlocked && <span className="text-red-600 text-xs font-bold bg-red-100 px-2 py-1 rounded">🚫 BLOQUEADO</span>}
                          {!slot.isBlocked && <span className="text-green-600 text-xs font-medium">✅ Disponível</span>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditSlot(slot)} className="text-blue-700 p-2 border rounded hover:bg-blue-50" title="Editar"><Edit2 size={15} /></button>
                          <button onClick={() => handleDeleteSlot(slot.id!)} className="text-red-600 p-2 border rounded hover:bg-red-50" title="Excluir"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORMULÁRIO DISPONIBILIDADE */}
      {isSlotFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingSlot ? '✏️ Editar Horário' : '➕ Novo Horário'}</h3>
              <button onClick={() => setIsSlotFormOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">📅 Data</label><input type="date" required value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">🕐 Horário</label><select required value={slotForm.time} onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2"><option value="">Selecione...</option>{timeSlots.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">🏥 Consultório</label><select required value={slotForm.office} onChange={(e) => setSlotForm({ ...slotForm, office: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2">{offices.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={slotForm.isAvailable} onChange={(e) => setSlotForm({ ...slotForm, isAvailable: e.target.checked })} className="rounded border-gray-300 text-green-600" /><span className="text-sm text-green-700 font-medium">✅ Disponível</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={slotForm.isBlocked} onChange={(e) => setSlotForm({ ...slotForm, isBlocked: e.target.checked })} className="rounded border-gray-300 text-red-600" /><span className="text-sm text-red-600 font-medium">🚫 Bloqueado</span></label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsSlotFormOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancelar</button>
                <button type="submit" disabled={isSavingSlot} className="px-6 py-2 bg-yellow-400 text-gray-950 font-bold rounded-md text-sm flex items-center gap-2 disabled:bg-gray-300">{isSavingSlot ? <><Loader2 className="animate-spin" size={16} /> Salvando...</> : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
