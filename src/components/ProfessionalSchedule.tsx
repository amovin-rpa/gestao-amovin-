import { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface ScheduleSlot {
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

interface Props {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
}

const offices = ['Consultório 1', 'Consultório 2', 'Consultório 3'];
const timeSlots = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

export default function ProfessionalSchedule({ professionalId, professionalName, onClose }: Props) {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ScheduleSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ date: '', time: '', office: 'Consultório 1', isAvailable: true, isBlocked: false });

  useEffect(() => { loadSlots(); }, [professionalId, selectedMonth]);

  const loadSlots = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'schedule'), where('professionalId', '==', professionalId));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ScheduleSlot);
      setSlots(all.filter((s) => s.date.startsWith(selectedMonth)));
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openNew = () => {
    setEditingSlot(null);
    setFormData({ date: '', time: '', office: 'Consultório 1', isAvailable: true, isBlocked: false });
    setIsFormOpen(true);
  };

  const openEdit = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setFormData({ date: slot.date, time: slot.time, office: slot.office, isAvailable: slot.isAvailable, isBlocked: slot.isBlocked });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const data = {
        professionalId,
        professionalName,
        date: formData.date,
        time: formData.time,
        office: formData.office,
        isAvailable: formData.isAvailable,
        isBlocked: formData.isBlocked
      };
      if (editingSlot?.id) {
        await updateDoc(doc(db, 'schedule', editingSlot.id), data);
      } else {
        await addDoc(collection(db, 'schedule'), { ...data, createdAt: new Date().toISOString() });
      }
      await loadSlots();
      setIsFormOpen(false);
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao salvar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir?')) return;
    try {
      await deleteDoc(doc(db, 'schedule', id));
      await loadSlots();
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const formatDate = (d: string) => {
    const [y, m, day] = d.split('-');
    const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const dt = new Date(Number(y), Number(m) - 1, Number(day));
    return `${dias[dt.getDay()]}, ${day}/${m}/${y}`;
  };

  const grouped = slots.reduce((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {} as Record<string, ScheduleSlot[]>);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-yellow-50">
          <h2 className="text-xl font-bold flex items-center gap-2"><Calendar size={22} /> Agenda de {professionalName}</h2>
          <button onClick={onClose} className="p-2 text-red-600 hover:bg-red-50 rounded"><X size={20} /></button>
        </div>

        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Mês/Ano:</label>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border rounded-md p-2 text-sm" />
          </div>
          <button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-4 py-2 rounded-md flex items-center gap-2 font-semibold text-sm"><Plus size={18} /> Adicionar Horário</button>
          <div className="flex gap-3 text-xs ml-auto">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span> Disponível</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span> Bloqueado</span>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-12 text-gray-400"><Calendar size={48} className="mx-auto mb-3 opacity-50" /><p>Nenhum horário cadastrado.</p></div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).sort().map(([date, dateSlots]) => (
                <div key={date} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 font-semibold text-sm flex items-center gap-2"><Calendar size={16} /> {formatDate(date)} <span className="ml-auto text-xs text-gray-500">{dateSlots.length} horário(s)</span></div>
                  <div className="divide-y">
                    {dateSlots.sort((a, b) => a.time.localeCompare(b.time)).map((slot) => (
                      <div key={slot.id} className={`px-4 py-3 flex items-center justify-between hover:bg-gray-50 ${slot.isBlocked ? 'bg-red-50' : ''}`}>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${slot.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}><Clock size={14} /> {slot.time}</div>
                          <div className="flex items-center gap-1 text-gray-600 text-sm"><MapPin size={14} /> {slot.office}</div>
                          {slot.isBlocked ? <span className="text-red-600 text-xs font-bold">🚫 BLOQUEADO</span> : <span className="text-green-600 text-xs">✅ Disponível</span>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(slot)} className="text-blue-700 p-2 border rounded hover:bg-blue-50"><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(slot.id!)} className="text-red-600 p-2 border rounded hover:bg-red-50"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editingSlot ? 'Editar Horário' : 'Novo Horário'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Data</label><input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Horário</label><select required value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2"><option value="">Selecione...</option>{timeSlots.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Consultório</label><select required value={formData.office} onChange={(e) => setFormData({ ...formData, office: e.target.value })} className="block w-full border border-gray-300 rounded-md p-2">{offices.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
              <div className="flex items-center gap-6 py-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} className="rounded" /><span className="text-sm text-green-700 font-medium">Disponível</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.isBlocked} onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })} className="rounded" /><span className="text-sm text-red-600 font-medium">Bloqueado</span></label>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-md text-sm">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-6 py-2 bg-yellow-400 text-gray-950 font-bold rounded-md text-sm disabled:bg-gray-300">{isSaving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
