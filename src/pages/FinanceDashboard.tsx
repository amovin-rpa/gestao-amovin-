// src/pages/FinanceDashboard.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useStore, FinanceRecord } from '../store';
import { 
  Plus, Edit2, Trash2, Download, Filter, Calendar, 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  PieChart, BarChart3, Activity, AlertCircle, CheckCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RechartsPie, 
  Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';

// ✅ Cores Institucionais AMOVIN
const COLORS = {
  primary: '#1E40AF',      // Azul institucional
  primaryLight: '#3B82F6',
  secondary: '#F59E0B',    // Amarelo destaque
  income: '#10B981',       // Verde receitas
  expense: '#EF4444',      // Vermelho despesas
  balance: '#3B82F6',      // Azul saldo
  deficit: '#F97316',      // Laranja déficit
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

// ✅ Categorias e Filtros
const CATEGORIES = ['todos', 'Doação', 'Evento', 'Subvenção', 'Material', 'Serviços', 'Outros'];
const TYPES = ['todos', 'income', 'expense'];
const STATUS = ['todos', 'Pago', 'Pendente'];

const typeLabels: Record<string, string> = {
  'todos': 'Todos',
  'income': 'Receitas',
  'expense': 'Despesas'
};

const statusLabels: Record<string, string> = {
  'todos': 'Todos',
  'Pago': 'Pago',
  'Pendente': 'Pendente'
};

// ✅ Componente Card KPI Premium
const KPICard: React.FC<{
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, change, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(change)}% vs mês anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <div className={color.replace('bg-', 'text-')}>{icon}</div>
      </div>
    </div>
  </div>
);

// ✅ Componente Filtro Premium
const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ✅ Componente Principal
export default function FinanceDashboard() {
  const { finances, addFinance, updateFinance, deleteFinance } = useStore();
  
  // Estados de Filtro
  const [filterMonth, setFilterMonth] = useState('todos');
  const [filterYear, setFilterYear] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  // Estado do Formulário
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FinanceRecord>>({
    type: 'income',
    value: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    status: 'Pendente'
  });

  // ✅ Filtragem Inteligente
  const filteredFinances = useMemo(() => {
    return finances.filter(f => {
      if (filterMonth !== 'todos' && f.month !== filterMonth) return false;
      if (filterYear !== 'todos' && f.year !== filterYear) return false;
      if (filterCategory !== 'todos' && f.category !== filterCategory) return false;
      if (filterType !== 'todos' && f.type !== filterType) return false;
      if (filterStatus !== 'todos' && f.status !== filterStatus) return false;
      return true;
    });
  }, [finances, filterMonth, filterYear, filterCategory, filterType, filterStatus]);

  // ✅ Cálculos de KPIs
  const kpis = useMemo(() => {
    const totalIncome = filteredFinances
      .filter(f => f.type === 'income' && f.status === 'Pago')
      .reduce((sum, f) => sum + (f.value || 0), 0);
    
    const totalExpense = filteredFinances
      .filter(f => f.type === 'expense' && f.status === 'Pago')
      .reduce((sum, f) => sum + (f.value || 0), 0);
    
    const pendingPayable = filteredFinances
      .filter(f => f.type === 'expense' && f.status === 'Pendente')
      .reduce((sum, f) => sum + (f.value || 0), 0);
    
    const pendingReceivable = filteredFinances
      .filter(f => f.type === 'income' && f.status === 'Pendente')
      .reduce((sum, f) => sum + (f.value || 0), 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      pendingPayable,
      pendingReceivable,
      executionRate: totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0
    };
  }, [filteredFinances]);

  // ✅ Dados para Gráficos
  const chartData = useMemo(() => {
    // Receitas x Despesas por Mês
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    filteredFinances.forEach(f => {
      const key = `${f.month}/${f.year}`;
      if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
      if (f.status === 'Pago') {
        monthlyData[key][f.type === 'income' ? 'income' : 'expense'] += f.value || 0;
      }
    });
    
    const monthlyChartData = Object.entries(monthlyData)
      .sort(([a], [b]) => {
        const [ma, ya] = a.split('/');
        const [mb, yb] = b.split('/');
        return new Date(parseInt(ya), parseInt(ma) - 1).getTime() - new Date(parseInt(yb), parseInt(mb) - 1).getTime();
      })
      .map(([label, data]) => ({
        month: label,
        Receitas: data.income,
        Despesas: data.expense
      }));

    // Despesas por Categoria
    const expenseByCategory: Record<string, number> = {};
    filteredFinances
      .filter(f => f.type === 'expense' && f.status === 'Pago')
      .forEach(f => {
        expenseByCategory[f.category] = (expenseByCategory[f.category] || 0) + (f.value || 0);
      });
    
    const categoryChartData = Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Evolução do Saldo
    const balanceData = monthlyChartData.map((item, index, arr) => {
      const prevBalance = index === 0 ? 0 : arr[index - 1].balance || 0;
      return {
        ...item,
        balance: prevBalance + (item.Receitas - item.Despesas)
      };
    });

    return { monthlyChartData, categoryChartData, balanceData };
  }, [filteredFinances]);

  // ✅ Handlers
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const financeData = {
      ...formData,
      type: formData.type as 'income' | 'expense',
      value: parseFloat(String(formData.value)),
      month: formData.date?.split('-')[1] || '',
      year: formData.date?.split('-')[0] || '',
    } as FinanceRecord;

    if (editingId) {
      updateFinance(editingId, financeData);
    } else {
      addFinance({ ...financeData, id: crypto.randomUUID() });
    }
    
    setFormData({ type: 'income', value: 0, date: new Date().toISOString().split('T')[0], category: '', description: '', status: 'Pendente' });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (fin: FinanceRecord) => {
    setEditingId(fin.id);
    setFormData(fin);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteFinance(id);
    }
  };

  const handleExport = () => {
    // Exportar para CSV
    const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Status'];
    const rows = filteredFinances.map(f => [
      f.date,
      f.type === 'income' ? 'Receita' : 'Despesa',
      f.category,
      f.description,
      f.value?.toFixed(2),
      f.status
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amovin_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ✅ Anos disponíveis para filtro
  const years = useMemo(() => {
    const set = new Set(finances.map(f => f.year));
    set.add(String(new Date().getFullYear()));
    return ['todos', ...[...set].sort().reverse()];
  }, [finances]);

  const months = ['todos', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const monthLabels: Record<string, string> = {
    'todos': 'Todos', '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',
    '04': 'Abril', '05': 'Maio', '06': 'Junho', '07': 'Julho',
    '08': 'Agosto', '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎨 Header Premium */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img src={AMOVIN_LOGO_SRC} alt="AMOVIN" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Financeiro</h1>
                <p className="text-xs text-gray-500">AMOVIN - Associação e Movimento pela Inclusão</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download size={16} /> Exportar
              </button>
              <button
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={16} /> Novo Lançamento
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 🔍 Filtros Premium */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <FilterSelect
              label="Ano"
              value={filterYear}
              onChange={setFilterYear}
              options={years.map(y => ({ value: y, label: y === 'todos' ? 'Todos' : y }))}
            />
            <FilterSelect
              label="Mês"
              value={filterMonth}
              onChange={setFilterMonth}
              options={months.map(m => ({ value: m, label: monthLabels[m] }))}
            />
            <FilterSelect
              label="Categoria"
              value={filterCategory}
              onChange={setFilterCategory}
              options={CATEGORIES.map(c => ({ value: c, label: c === 'todos' ? 'Todas' : c }))}
            />
            <FilterSelect
              label="Tipo"
              value={filterType}
              onChange={setFilterType}
              options={TYPES.map(t => ({ value: t, label: typeLabels[t] }))}
            />
            <FilterSelect
              label="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              options={STATUS.map(s => ({ value: s, label: statusLabels[s] }))}
            />
            <button
              onClick={() => {
                setFilterMonth('todos'); setFilterYear('todos');
                setFilterCategory('todos'); setFilterType('todos'); setFilterStatus('todos');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Filter size={14} /> Limpar
            </button>
          </div>
        </div>

        {/* 📊 KPIs Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Receitas Totais"
            value={`R$ ${kpis.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={12.5}
            icon={<DollarSign size={20} />}
            color="bg-green-500"
          />
          <KPICard
            title="Despesas Totais"
            value={`R$ ${kpis.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            change={-5.2}
            icon={<Wallet size={20} />}
            color="bg-red-500"
          />
          <KPICard
            title="Saldo Atual"
            value={`R$ ${kpis.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<Activity size={20} />}
            color={kpis.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'}
          />
          <KPICard
            title="Execução Orçamentária"
            value={`${kpis.executionRate.toFixed(1)}%`}
            icon={<PieChart size={20} />}
            color="bg-purple-500"
          />
        </div>

        {/* 📈 Gráficos Premium */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico: Receitas x Despesas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receitas x Despesas por Mês</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v/1000}k`} />
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="Receitas" fill={COLORS.income} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill={COLORS.expense} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico: Despesas por Categoria */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={chartData.categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.primaryLight, COLORS.secondary, '#8B5CF6', '#EC4899', '#14B8A6'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📊 Gráfico de Evolução do Saldo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução do Saldo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData.balanceData}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v/1000}k`} />
              <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Area type="monotone" dataKey="balance" stroke={COLORS.primary} fill="url(#balanceGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 📋 Últimos Lançamentos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Últimos Lançamentos</h3>
            <span className="text-sm text-gray-500">{filteredFinances.length} registros</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Descrição</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoria</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFinances.slice(0, 10).map((fin) => (
                  <tr key={fin.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(fin.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">
                      <div className="font-medium">{fin.description}</div>
                      <div className="text-xs text-gray-500">{fin.category}</div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {fin.category}
                      </span>
                    </td>
                    <td className={`px-5 py-4 whitespace-nowrap text-sm font-semibold ${fin.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {fin.type === 'income' ? '+' : '-'} R$ {(fin.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        fin.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {fin.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(fin)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(fin.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 📝 Modal de Lançamento */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <button onClick={() => { setIsFormOpen(false); setEditingId(null); }} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <div className="flex gap-2">
                    {['income', 'expense'].map(type => (
                      <label key={type} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                        formData.type === type 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="type"
                          value={type}
                          checked={formData.type === type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                          className="sr-only"
                        />
                        {type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="text-sm font-medium">{typeLabels[type]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS.filter(s => s !== 'todos').map(s => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {CATEGORIES.filter(c => c !== 'todos').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input
                  required
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Doação Campanha Winter"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setIsFormOpen(false); setEditingId(null); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
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
