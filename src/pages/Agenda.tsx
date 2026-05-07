import { useMemo, useState, useEffect } from 'react';
import { useStore, ScheduleItem } from '../store';
import { Edit2, Phone, Plus, Trash2, Calendar, Clock, MapPin, Loader2, X, CheckCircle } from 'lucide-react';
import { isToday, isThisWeek, parseISO, startOfMonth, endOfMonth, isWithinInterval, getDaysInMonth } from 'date-fns';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const statusLabels: Record<string, string> = {
  agendado: 'Agendado',
  presente: 'Presente',
  falta: 'Falta',
  falta_justificada: 'Falta Justificada',
  cancelamento: 'Cancelado',
};

const statusColors: Record<string, string> = {
  agendado: 'bg-gray-100 text-gray-800',
  presente: 'bg-green-100 text-green-800',
  falta: 'bg-red-200 text-red-900 font-bold',
  falta_justificada: 'bg-yellow-100 text-yellow-800',
  cancelamento: 'bg-purple-100 text-purple-800',
};

const statusBarColors: Record<string, string> = {
  agendado: 'bg-blue-400',
  presente: 'bg-green-500',
  falta: 'bg-red-600',
  falta_justificada: 'bg-yellow-500',
  cancelamento: 'bg-purple-500',
};

const offices = ['Consultório 1', 'Consultório 2', 'Consultório 3'];

const timeSlots = Array.from({ length: 49 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

interface Slot {
  id?: string;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  office: string;
  isAvailable: boolean;
  isBlocked: boolean;
  createdAt: string;
}

export default function Agenda() {
  const { currentUser, beneficiaries, professionals, schedule, addScheduleItem, updateScheduleItem, deleteScheduleItem } = useStore();
  const professionalId = currentUser?.professionalId || professionals.find((p) => p.name === currentUser?.name)?.id || '';
  const professionalName = currentUser?.name || '';

  const now = new Date();
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [presenceItemId, setPresenceItemId] = useState<string | null>(null);

  const [form, setForm] = useState({
    beneficiaryId: '',
    professionalId: professionalId,
    time: '',
    notes: '',
    selectedDays: [] as string[],
    calendarMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
  });

  const [view, setView] = useState<'todos' | 'dia' | 'semana' | 'mes'>('todos');
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'disponibilidade'>('agendamentos');

  const [calendarViewMonth, setCalendarViewMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(now.toISOString().slice(0, 7));
  const [isSlotFormOpen, setIsSlotFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: '', time: '', office: 'Consultório 1', isAvailable: true, isBlocked: false });

  useEffect(() => { if (professionalId) loadSlots(); }, [professionalId, selectedMonth]);

  const loadSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const q = query(collection(db, 'schedule'), where('professionalId', '==', professionalId));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Slot);
      setSlots(all.filter((s) => s.date.startsWith(selectedMonth)));
    } catch (err) { console.error('Erro:', err); }
    finally { setIsLoadingSlots(false); }
  };

  const openNewSlot = () => {
    setEditingSlot(null);
    setSlotForm({ date: '', time: '', office: 'Consultório 1', isAvailable: true, isBlocked: false });
    setIsSlotFormOpen(true);
  };

  const openEditSlot = (slot: Slot) => {
    setEditingSlot(slot);
    setSlotForm({ date: slot.date, time: slot.time, office: slot.office, isAvailable: slot.isAvailable, isBlocked: slot.isBlocked });
    setIsSlotFormOpen(true);
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSlot(true);
    try {
      const data = { professionalId, professionalName, date: slotForm.date, time: slotForm.time, office: slotForm.office, isAvailable: slotForm.isAvailable, isBlocked: slotForm.isBlocked };
      if (editingSlot?.id) await updateDoc(doc(db, 'schedule', editingSlot.id), data);
      else await addDoc(collection(db, 'schedule'), { ...data, createdAt: new Date().toISOString() });
      await loadSlots();
      setIsSlotFormOpen(false);
    } catch (err) { console.error('Erro:', err); alert('Erro ao salvar.'); }
    finally { setIsSavingSlot(false); }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm('Excluir?')) return;
    try { await deleteDoc(doc(db, 'schedule', id)); await loadSlots(); } catch (err) { console.error('Erro:', err); }
  };

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    const dt = new Date(Number(y), Number(m) - 1, Number(day));
    return `${weekDays[dt.getDay()]}, ${day}/${m}/${y}`;
  };

  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {} as Record<string, Slot[]>);

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

  const calendarDays = useMemo(() => {
    const [y, m] = form.calendarMonth.split('-').map(Number);
    const total = getDaysInMonth(new Date(y, m - 1));
    const firstDay = new Date(y, m - 1, 1).getDay();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  }, [form.calendarMonth]);

  const monthCalendarDays = useMemo(() => {
    const [y, m] = calendarViewMonth.split('-').map(Number);
    const total = getDaysInMonth(new Date(y, m - 1));
    const firstDay = new Date(y, m - 1, 1).getDay();
    const days: (number | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= total; i++) days.push(i);
    return days;
  }, [calendarViewMonth]);

  const monthAppointments = useMemo(() => {
    return allItems.filter(item => item.date.startsWith(calendarViewMonth));
  }, [allItems, calendarViewMonth]);

  const toggleDay = (day: number) => {
    const [y, m] = form.calendarMonth.split('-').map(Number);
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setForm(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dateStr)
        ? prev.selectedDays.filter(d => d !== dateStr)
        : [...prev.selectedDays, dateStr]
    }));
  };

  const openNewForm = () => {
    setEditingItem(null);
    setForm({
      beneficiaryId: '',
      professionalId: professionalId,
      time: '',
      notes: '',
      selectedDays: [],
      calendarMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
    });
    setFormOpen(true);
  };

  const openEditForm = (item: ScheduleItem) => {
    setEditingItem(item);
    setForm({
      beneficiaryId: item.beneficiaryId,
      professionalId: item.professionalId,
      time: item.time,
      notes: item.notes || '',
      selectedDays: [item.date],
      calendarMonth: item.date.slice(0, 7),
    });
    setFormOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.selectedDays.length === 0) {
      alert('Selecione pelo menos um dia no calendário!');
      return;
    }

    const prof = professionals.find(
      (p) => p.id === (currentUser?.role === 'admin' ? form.professionalId : professionalId)
    );
    const specialty = prof?.specialty || currentUser?.specialty || 'Consulta';

    if (editingItem) {
      updateScheduleItem(editingItem.id, {
        date: form.selectedDays[0],
        time: form.time,
        notes: form.notes,
        type: specialty,
      });
    } else {
      form.selectedDays.forEach(date => {
        addScheduleItem({
          beneficiaryId: form.beneficiaryId,
          professionalId: currentUser?.role === 'admin' ? form.professionalId : professionalId,
          date,
          time: form.time,
          type: specialty,
          notes: form.notes,
          status: 'agendado',
        });
      });
    }

    setFormOpen(false);
  };

  const saveStatus = (id: string, status: ScheduleItem['status']) => {
    updateScheduleItem(id, { status });
    setPresenceItemId(null);
  };

  const changeCalendarMonth = (delta: number) => {
    const [y, m] = calendarViewMonth.split('-').map(Number);
    const next = new Date(y, m - 1 + delta, 1);
    setCalendarViewMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{currentUser?.role === 'consulta' ? 'Minha Agenda' : 'Agenda'}</h1>
        <p className="text-sm text-gray-500">{currentUser?.role === 'admin' ? 'Agenda completa.' : 'Sua agenda profissional.'}</p>
      </div>

      <div className="flex gap-2 border-b">
        <button onClick={() => setActiveTab('agendamentos')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === 'agendamentos' ? 'border-yellow-500 text-yellow-700' : 'border-transparent text-gray-500'}`}>📋 Agendamentos</button>
        <button onClick={() => setActiveTab('disponibilidade')} className={`px-4 py-2 text-sm font-semibold border-b-2 ${activeTab === 'disponibilidade' ? 'border-yellow-500 text-yellow-700' : 'border-transparent text-gray-500'}`}>📅 Minha Disponibilidade</button>
      </div>

      {activeTab === 'agendamentos' && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              {(['todos','dia','semana','mes'] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-md text-sm font-medium ${view === v ? 'bg-yellow-400 text-gray-950' : 'bg-white border text-gray-600'}`}>
                  {v === 'todos' ? 'Todos' : v === 'dia' ? 'Hoje' : v === 'semana' ? 'Esta Semana' : 'Este Mês'}
                </button>
              ))}
              <span className="text-sm text-gray-500 self-center ml-2">{filteredItems.length} agendamento(s)</span>
            </div>
            <button onClick={openNewForm} className="inline-flex items-center gap-2 rounded-md bg-yellow-400 px-4 py-2 font-semibold text-gray-950 text-sm">
              <Plus size={18}/> Novo Agendamento
            </button>
          </div>

          <div className="rounded-2xl border border-yellow-100 bg-white shadow-sm overflow-hidden">
            {filteredItems.length === 0 ? (
              <p className="p-6 text-center text-gray-500">Nenhum agendamento.</p>
            ) : (
              filteredItems.map((item) => {
                const ben = beneficiaries.find((b) => b.id === item.beneficiaryId);
                const prof = professionals.find((p) => p.id === item.professionalId);
                const st = item.status || 'agendado';
                const isPresenceOpen = presenceItemId === item.id;

                return (
                  <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between border-b p-4 gap-3 ${st === 'falta' ? 'bg-red-50' : ''}`}>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {item.date ? new Date(`${item.date}T${item.time || '00:00'}`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                        {' às '}{item.time || '-'}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">{item.type}</p>
                      <p className="text-sm text-gray-500">{ben?.fullName || 'Beneficiário'} | {prof?.name || currentUser?.name}</p>
                      {item.notes && <p className="text-xs text-gray-400 mt-0.5">📝 {item.notes}</p>}
                      <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[st]}`}>{statusLabels[st]}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap relative">
                      <button onClick={() => openEditForm(item)} className="text-blue-700 p-1.5 border rounded hover:bg-blue-50" title="Editar">
                        <Edit2 size={16}/>
                      </button>

                      <div className="relative">
                        <button onClick={() => setPresenceItemId(isPresenceOpen ? null : item.id)} className="inline-flex items-center gap-1 text-green-700 p-1.5 border rounded hover:bg-green-50 text-xs font-semibold" title="Confirmar Presença">
                          <CheckCircle size={16}/> Presença
                        </button>

                        {isPresenceOpen && (
                          <div className="absolute right-0 top-9 z-50 bg-white border rounded-lg shadow-xl w-52">
                            <div className="p-2 border-b text-xs font-bold text-gray-500">Confirmar Presença</div>
                            {[
                              { value: 'presente', label: '✅ Presente', color: 'text-green-700 hover:bg-green-50' },
                              { value: 'falta', label: '❌ Falta', color: 'text-red-600 hover:bg-red-50' },
                              { value: 'falta_justificada', label: '📝 Falta Justificada', color: 'text-yellow-700 hover:bg-yellow-50' },
                              { value: 'cancelamento', label: '🚫 Cancelamento', color: 'text-purple-700 hover:bg-purple-50' },
                            ].map(opt => (
                              <button key={opt.value} onClick={() => saveStatus(item.id, opt.value as ScheduleItem['status'])} className={`w-full text-left px-4 py-2 text-sm font-medium ${opt.color}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const b2 = beneficiaries.find(b => b.id === item.beneficiaryId);
                          if (!b2?.respPhone) return alert('Telefone não cadastrado');
                          window.open(`https://wa.me/55${b2.respPhone.replace(/\D/g,'')}?text=${encodeURIComponent(`Olá! Lembramos do atendimento de ${b2.fullName}: ${item.type} em ${item.date} às ${item.time}. AMOVIN`)}`, '_blank');
                        }}
                        className="text-green-700 p-1.5 border rounded hover:bg-green-50"
                        title="WhatsApp"
                      >
                        <Phone size={16}/>
                      </button>

                      <button onClick={() => { if (window.confirm('Excluir agendamento?')) deleteScheduleItem(item.id); }} className="text-red-600 p-1.5 border rounded hover:bg-red-50" title="Excluir">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CALENDÁRIO MENSAL VISUAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Calendar size={20}/> Visão do Mês
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={() => changeCalendarMonth(-1)} className="px-3 py-1 border rounded hover:bg-gray-50">◀</button>
                <span className="text-sm font-semibold w-40 text-center">
                  {monthNames[parseInt(calendarViewMonth.split('-')[1]) - 1]} {calendarViewMonth.split('-')[0]}
                </span>
                <button onClick={() => changeCalendarMonth(1)} className="px-3 py-1 border rounded hover:bg-gray-50">▶</button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 mb-2">
              {weekDays.map(d => <div key={d} className="py-1">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthCalendarDays.map((day, idx) => {
                if (!day) return <div key={idx} className="min-h-[90px]" />;
                const [y, m] = calendarViewMonth.split('-').map(Number);
                const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayAppointments = monthAppointments.filter(a => a.date === dateStr);
                const isTodayDay = dateStr === now.toISOString().split('T')[0];

                return (
                  <div
                    key={idx}
                    className={`min-h-[90px] border rounded-md p-1 text-left
                      ${isTodayDay ? 'bg-yellow-50 border-yellow-400' : 'bg-white'}
                    `}
                  >
                    <div className={`text-xs font-bold mb-1 ${isTodayDay ? 'text-yellow-700' : 'text-gray-600'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayAppointments.slice(0, 3).map((a) => {
                        const ben = beneficiaries.find(b => b.id === a.beneficiaryId);
                        const st = a.status || 'agendado';
                        return (
                          <button
                            key={a.id}
                            onClick={() => openEditForm(a)}
                            className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded text-white truncate ${statusBarColors[st]} hover:opacity-90`}
                            title={`${a.time} - ${ben?.fullName || ''} - ${statusLabels[st]}`}
                          >
                            {a.time} {ben?.fullName?.split(' ')[0] || ''}
                          </button>
                        );
                      })}
                      {dayAppointments.length > 3 && (
                        <div className="text-[10px] text-gray-500 font-semibold">
                          +{dayAppointments.length - 3} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 mt-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-400 inline-block"></span> Agendado</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Presente</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-600 inline-block"></span> Falta</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block"></span> Falta Justificada</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500 inline-block"></span> Cancelado</span>
            </div>
          </div>
        </>
      )}

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
                          {slot.isBlocked ? <span className="text-red-600 text-xs font-bold">🚫 BLOQUEADO</span> : <span className="text-green-600 text-xs">✅ Disponível</span>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditSlot(slot)} className="text-blue-700 p-2 border rounded hover:bg-blue-50"><Edit2 size={15} /></button>
                          <button onClick={() => handleDeleteSlot(slot.id!)} className="text-red-600 p-2 border rounded hover:bg-red-50"><Trash2 size={15} /></button>
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

      {formOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingItem ? '✏️ Editar Agendamento' : '📅 Novo Agendamento'}</h3>
              <button onClick={() => setFormOpen(false)} className="text-gray-500 hover:text-red-600"><X size={20} /></button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {!editingItem && (
                <div>
                  <label className="block text-sm font-medium mb-1">Beneficiário</label>
                  <select required value={form.beneficiaryId} onChange={(e) => setForm({ ...form, beneficiaryId: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2">
                    <option value="">Selecione...</option>
                    {beneficiaries.map((b) => <option key={b.id} value={b.id}>{b.fullName}</option>)}
                  </select>
                </div>
              )}

              {currentUser?.role === 'admin' && !editingItem && (
                <div>
                  <label className="block text-sm font-medium mb-1">Profissional</label>
                  <select required value={form.professionalId} onChange={(e) => setForm({ ...form, professionalId: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2">
                    <option value="">Selecione...</option>
                    {professionals.map((p) => <option key={p.id} value={p.id}>{p.name} - {p.specialty}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <select required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2">
                  <option value="">Selecione...</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Opcional..." className="block w-full border border-gray-300 rounded-md p-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    {editingItem ? 'Novo dia (selecione 1):' : 'Selecione os dias:'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => {
                      const [y, m] = form.calendarMonth.split('-').map(Number);
                      const prev = new Date(y, m - 2, 1);
                      setForm(f => ({ ...f, calendarMonth: `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`, selectedDays: [] }));
                    }} className="px-2 py-1 border rounded text-sm">◀</button>
                    <span className="text-sm font-semibold">
                      {monthNames[parseInt(form.calendarMonth.split('-')[1]) - 1]} {form.calendarMonth.split('-')[0]}
                    </span>
                    <button type="button" onClick={() => {
                      const [y, m] = form.calendarMonth.split('-').map(Number);
                      const next = new Date(y, m, 1);
                      setForm(f => ({ ...f, calendarMonth: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`, selectedDays: [] }));
                    }} className="px-2 py-1 border rounded text-sm">▶</button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-500 mb-1">
                  {weekDays.map(d => <div key={d}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const [y, m] = form.calendarMonth.split('-').map(Number);
                    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = form.selectedDays.includes(dateStr);
                    const isToday2 = dateStr === now.toISOString().split('T')[0];
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => toggleDay(day)}
                        className={`rounded-full w-9 h-9 text-sm font-semibold mx-auto flex items-center justify-center transition-all
                          ${isSelected ? 'bg-yellow-400 text-gray-900 shadow' : 'hover:bg-yellow-100 text-gray-700'}
                          ${isToday2 && !isSelected ? 'border-2 border-yellow-400' : ''}
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {form.selectedDays.length > 0 && (
                  <p className="text-xs text-green-700 font-semibold mt-2">
                    ✅ {form.selectedDays.length} dia(s) selecionado(s)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setFormOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-yellow-400 text-gray-950 font-bold rounded-md text-sm">
                  {editingItem ? 'Salvar Alteração' : `Agendar ${form.selectedDays.length > 0 ? `(${form.selectedDays.length} dia${form.selectedDays.length > 1 ? 's' : ''})` : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSlotFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingSlot ? 'Editar Horário' : 'Novo Horário'}</h3>
              <button onClick={() => setIsSlotFormOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input type="date" required value={slotForm.date} onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <select required value={slotForm.time} onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2">
                  <option value="">Selecione...</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Consultório</label>
                <select required value={slotForm.office} onChange={(e) => setSlotForm({ ...slotForm, office: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2">
                  {offices.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={slotForm.isAvailable} onChange={(e) => setSlotForm({ ...slotForm, isAvailable: e.target.checked })} className="rounded" />
                  <span className="text-sm text-green-700 font-medium">Disponível</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={slotForm.isBlocked} onChange={(e) => setSlotForm({ ...slotForm, isBlocked: e.target.checked })} className="rounded" />
                  <span className="text-sm text-red-600 font-medium">Bloqueado</span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsSlotFormOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancelar</button>
                <button type="submit" disabled={isSavingSlot} className="px-6 py-2 bg-yellow-400 text-gray-950 font-bold rounded-md text-sm disabled:bg-gray-300">
                  {isSavingSlot ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
