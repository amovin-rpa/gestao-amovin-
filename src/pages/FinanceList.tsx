import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Plus } from 'lucide-react';

const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const monthLabels: Record<string,string> = {'01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril','05':'Maio','06':'Junho','07':'Julho','08':'Agosto','09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'};

export default function FinanceList() {
  const { finances, addFinance } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(String(now.getMonth()+1).padStart(2,'0'));
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));
  const [formData, setFormData] = useState({
    type: 'income', value: '', date: now.toISOString().split('T')[0], category: '', description: '', eventDate: ''
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date(formData.date);
    addFinance({
      ...formData,
      type: formData.type as 'income' | 'expense',
      value: parseFloat(formData.value),
      month: String(d.getMonth()+1).padStart(2,'0'),
      year: String(d.getFullYear()),
    });
    setFormData({ type: 'income', value: '', date: now.toISOString().split('T')[0], category: '', description: '', eventDate: '' });
    setIsFormOpen(false);
  };

  const filtered = useMemo(() => finances.filter(f => {
    const m = f.month || String(new Date(f.date).getMonth()+1).padStart(2,'0');
    const y = f.year || String(new Date(f.date).getFullYear());
    return m === filterMonth && y === filterYear;
  }), [finances, filterMonth, filterYear]);

  const totalIncome = filtered.filter(f => f.type === 'income').reduce((a, c) => a + (c.value || 0), 0);
  const totalExpense = filtered.filter(f => f.type === 'expense').reduce((a, c) => a + (c.value || 0), 0);
  const saldo = totalIncome - totalExpense;

  const years = useMemo(() => {
    const set = new Set(finances.map(f => f.year || String(new Date(f.date).getFullYear())));
    set.add(String(now.getFullYear()));
    return [...set].sort();
  }, [finances]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Financeiro</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border rounded-md p-2 text-sm">
            {months.map(m => <option key={m} value={m}>{monthLabels[m]}</option>)}
          </select>
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border rounded-md p-2 text-sm">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setIsFormOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-4 py-2 rounded-md flex items-center gap-2 font-semibold">
            <Plus size={20} /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500">Receitas ({monthLabels[filterMonth]}/{filterYear})</dt><dd className="mt-1 text-3xl font-semibold text-green-600">R$ {totalIncome.toFixed(2)}</dd></div></div>
        <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500">Despesas ({monthLabels[filterMonth]}/{filterYear})</dt><dd className="mt-1 text-3xl font-semibold text-red-600">R$ {totalExpense.toFixed(2)}</dd></div></div>
        <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500">Saldo ({monthLabels[filterMonth]}/{filterYear})</dt><dd className={`mt-1 text-3xl font-semibold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {saldo.toFixed(2)}</dd></div></div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filtered.length === 0 ? <li className="px-6 py-4 text-center text-gray-500">Nenhum lançamento neste período.</li> :
            filtered.map((fin) => (
              <li key={fin.id} className="px-6 py-4 flex justify-between items-center">
                <div><p className="font-medium text-gray-900">{fin.category}</p><p className="text-sm text-gray-500">{new Date(fin.date).toLocaleDateString()} {fin.description ? `- ${fin.description}` : ''}</p></div>
                <div className={`font-semibold ${fin.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{fin.type === 'income' ? '+' : '-'} R$ {(fin.value || 0).toFixed(2)}</div>
              </li>
            ))
          }
        </ul>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Lançamento</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2"><input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={e => setFormData({...formData, type: e.target.value})} />Receita</label>
                <label className="flex items-center gap-2"><input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={e => setFormData({...formData, type: e.target.value})} />Despesa</label>
              </div>
              <div><label className="block text-sm font-medium">Categoria</label><select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="">Selecione...</option><option value="Doação">Doação</option><option value="Evento">Evento</option><option value="Subvenção">Subvenção</option><option value="Material">Material</option><option value="Serviços">Serviços</option><option value="Outros">Outros</option></select></div>
              {formData.category === 'Evento' && <><div><label className="block text-sm font-medium">Nome do Evento</label><input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div><div><label className="block text-sm font-medium">Data do Evento</label><input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div></>}
              {formData.category === 'Subvenção' && <div><label className="block text-sm font-medium">Descrição da Subvenção</label><textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>}
              {formData.category !== 'Evento' && formData.category !== 'Subvenção' && <div><label className="block text-sm font-medium">Descrição (Opcional)</label><input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>}
              <div><label className="block text-sm font-medium">Data</label><input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
              <div><label className="block text-sm font-medium">Valor (R$)</label><input required type="number" step="0.01" min="0.01" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
              <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-md">Salvar</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
