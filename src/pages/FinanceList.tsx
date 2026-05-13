import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const months = ['todos', '01','02','03','04','05','06','07','08','09','10','11','12'];
const monthLabels: Record<string,string> = {
  'todos': 'Todos',
  '01':'Janeiro','02':'Fevereiro','03':'Março','04':'Abril','05':'Maio','06':'Junho',
  '07':'Julho','08':'Agosto','09':'Setembro','10':'Outubro','11':'Novembro','12':'Dezembro'
};

const categories = ['todos', 'Doação', 'Evento', 'Subvenção', 'Material', 'Serviços', 'Outros'];
const types = ['todos', 'income', 'expense'];
const typeLabels: Record<string,string> = {
  'todos': 'Todos',
  'income': 'Receitas',
  'expense': 'Despesas'
};

export default function FinanceList() {
  const { finances, addFinance, updateFinance, deleteFinance } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const now = new Date();
  // ✅ Padrão "todos" para mostrar todos os lançamentos inicialmente
  const [filterMonth, setFilterMonth] = useState('todos');
  const [filterYear, setFilterYear] = useState('todos');
  // ✅ Novos filtros: categoria e tipo
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  
  const [formData, setFormData] = useState({
    type: 'income', 
    value: '', 
    date: '', 
    category: '', 
    description: '', 
    eventDate: ''
  });

  // ✅ Função para formatar data sem problema de fuso horário (mantida original)
  const formatDateLocal = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  // ✅ Função para extrair data no formato YYYY-MM-DD de um objeto Date local (mantida original)
  const getDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ✅ Nova função para exibir data DD/MM/AAAA sem bug de fuso
  const formatDateDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Corrige a data para evitar problema de fuso horário - mantém sua lógica original
    const dateParts = formData.date.split('-');
    const localDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    
    const financeData = {
      ...formData,
      type: formData.type as 'income' | 'expense',
      value: parseFloat(formData.value),
      month: String(localDate.getMonth()+1).padStart(2,'0'),
      year: String(localDate.getFullYear()),
    };

    if (editingId) {
      // ✅ ATUALIZA lançamento existente - FORÇA atualização do estado
      console.log('🔄 Atualizando lançamento:', editingId, financeData);
      // Chama updateFinance e força re-render
      updateFinance(editingId, financeData);
    } else {
      // ✅ CRIA novo lançamento
      console.log('💾 Criando novo lançamento:', financeData);
      addFinance(financeData);
    }
    
    // ✅ Reseta formulário e fecha modal SEMPRE após salvar
    setFormData({ 
      type: 'income', 
      value: '', 
      date: getDateLocal(new Date()), 
      category: '', 
      description: '', 
      eventDate: '' 
    });
    setEditingId(null);
    setIsFormOpen(false); // ✅ Fecha o modal
  };

  const handleEdit = (fin: any) => {
    console.log('✏️ Editando lançamento:', fin);
    setEditingId(fin.id);
    
    // ✅ Garante que a data esteja no formato correto para o input
    let dateValue = fin.date || '';
    if (dateValue && typeof dateValue === 'string' && dateValue.includes('T')) {
      // Se vier como ISO string, pega só a parte da data
      dateValue = dateValue.split('T')[0];
    }
    
    setFormData({
      type: fin.type,
      value: String(fin.value),
      date: formatDateLocal(dateValue),
      category: fin.category,
      description: fin.description || '',
      eventDate: fin.eventDate || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      console.log('🗑️ Excluindo:', id);
      deleteFinance(id);
    }
  };

  const handleCloseForm = () => {
    console.log('Fechando formulário');
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ 
      type: 'income', 
      value: '', 
      date: getDateLocal(new Date()), 
      category: '', 
      description: '', 
      eventDate: '' 
    });
  };

  // ✅ Filtragem com opção "todos" para mês, ano, categoria e tipo
  const filtered = useMemo(() => {
    return finances.filter(f => {
      // Filtro por mês
      if (filterMonth !== 'todos') {
        const m = f.month || String(new Date(f.date).getMonth()+1).padStart(2,'0');
        if (m !== filterMonth) return false;
      }
      
      // Filtro por ano
      if (filterYear !== 'todos') {
        const y = f.year || String(new Date(f.date).getFullYear());
        if (y !== filterYear) return false;
      }
      
      // Filtro por categoria
      if (filterCategory !== 'todos') {
        if (f.category !== filterCategory) return false;
      }
      
      // Filtro por tipo (income/expense)
      if (filterType !== 'todos') {
        if (f.type !== filterType) return false;
      }
      
      return true;
    });
  }, [finances, filterMonth, filterYear, filterCategory, filterType]);

  const totalIncome = filtered.filter(f => f.type === 'income').reduce((a, c) => a + (c.value || 0), 0);
  const totalExpense = filtered.filter(f => f.type === 'expense').reduce((a, c) => a + (c.value || 0), 0);
  const saldo = totalIncome - totalExpense;

  // ✅ Anos disponíveis incluindo "todos"
  const years = useMemo(() => {
    const set = new Set(finances.map(f => f.year || String(new Date(f.date).getFullYear())));
    set.add(String(now.getFullYear()));
    return ['todos', ...[...set].sort()];
  }, [finances]);

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Financeiro</h1>
        <div className="flex gap-2 items-center flex-wrap">
          {/* ✅ Select de Mês com opção "Todos" como padrão */}
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border rounded-md p-2 text-sm">
            {months.map(m => <option key={m} value={m}>{monthLabels[m]}</option>)}
          </select>
          {/* ✅ Select de Ano com opção "Todos" como padrão */}
          <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="border rounded-md p-2 text-sm">
            {years.map(y => <option key={y} value={y}>{y === 'todos' ? 'Todos' : y}</option>)}
          </select>
          {/* ✅ Select de Categoria com opção "Todos" como padrão */}
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border rounded-md p-2 text-sm">
            {categories.map(c => <option key={c} value={c}>{c === 'todos' ? 'Todas' : c}</option>)}
          </select>
          {/* ✅ Select de Tipo com opção "Todos" como padrão */}
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded-md p-2 text-sm">
            {types.map(t => <option key={t} value={t}>{typeLabels[t]}</option>)}
          </select>
          <button onClick={() => setIsFormOpen(true)} className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-4 py-2 rounded-md flex items-center gap-2 font-semibold">
            <Plus size={20} /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-6">
        <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500">Receitas</dt><dd className="mt-1 text-3xl font-semibold text-green-600">R$ {totalIncome.toFixed(2)}</dd></div></div>
        <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500">Despesas</dt><dd className="mt-1 text-3xl font-semibold text-red-600">R$ {totalExpense.toFixed(2)}</dd></div></div>
        <div className="bg-white overflow-hidden shadow rounded-lg"><div className="px-4 py-5 sm:p-6"><dt className="text-sm font-medium text-gray-500">Saldo</dt><dd className={`mt-1 text-3xl font-semibold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {saldo.toFixed(2)}</dd></div></div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filtered.length === 0 ? <li className="px-6 py-4 text-center text-gray-500">Nenhum lançamento encontrado com os filtros selecionados.</li> :
            filtered.map((fin) => (
              <li key={fin.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{fin.category}</p>
                  {/* ✅ Usa formatDateDisplay para evitar bug de fuso na exibição */}
                  <p className="text-sm text-gray-500">{formatDateDisplay(fin.date)} {fin.description ? `- ${fin.description}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${fin.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {fin.type === 'income' ? '+' : '-'} R$ {(fin.value || 0).toFixed(2)}
                  </span>
                  {/* ✅ Botão Editar */}
                  <button 
                    onClick={() => handleEdit(fin)} 
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  {/* ✅ Botão Excluir */}
                  <button 
                    onClick={() => handleDelete(fin.id)} 
                    className="p-1 text-red-600 hover:bg-red-50 rounded" 
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))
          }
        </ul>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={e => setFormData({...formData, type: e.target.value})} />
                  Receita
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={e => setFormData({...formData, type: e.target.value})} />
                  Despesa
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium">Categoria</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  <option value="">Selecione...</option>
                  <option value="Doação">Doação</option>
                  <option value="Evento">Evento</option>
                  <option value="Subvenção">Subvenção</option>
                  <option value="Material">Material</option>
                  <option value="Serviços">Serviços</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              {formData.category === 'Evento' && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Nome do Evento</label>
                    <input required type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Data do Evento</label>
                    <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </>
              )}
              {formData.category === 'Subvenção' && (
                <div>
                  <label className="block text-sm font-medium">Descrição da Subvenção</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
              )}
              {formData.category !== 'Evento' && formData.category !== 'Subvenção' && (
                <div>
                  <label className="block text-sm font-medium">Descrição (Opcional)</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium">Data</label>
                <input 
                  required 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: formatDateLocal(e.target.value)})} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Valor (R$)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  min="0.01" 
                  value={formData.value} 
                  onChange={e => setFormData({...formData, value: e.target.value})} 
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2" 
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={handleCloseForm} className="px-4 py-2 border rounded-md">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-md">
                  {editingId ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
