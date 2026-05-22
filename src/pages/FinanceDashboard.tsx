// src/pages/FinanceDashboard.tsx
import React, { useState, useMemo, useRef } from 'react';
import { useStore, FinanceRecord } from '../store';
import { 
  Plus, Edit2, Trash2, Download, Filter, Calendar, 
  TrendingUp, TrendingDown, DollarSign, Wallet, 
  PieChart, BarChart3, Activity, AlertCircle, CheckCircle, X,
  Printer, FileSpreadsheet, FileText, ChevronDown, ChevronUp, Building2, FileCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart as RechartsPie, 
  Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ✅ Cores Institucionais AMOVIN
const COLORS = {
  primary: '#1E40AF',
  primaryLight: '#3B82F6',
  secondary: '#F59E0B',
  income: '#10B981',
  expense: '#EF4444',
  balance: '#3B82F6',
  deficit: '#F97316',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

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

// ✅ FUNÇÃO DE FORMATAÇÃO CONTÁBRICA BRASILEIRA (R$ 0,00) - PARA EXIBIÇÃO
const formatCurrency = (value: number | undefined | null): string => {
  const num = value || 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// ✅ FUNÇÃO PARA FORMATAR DATA SEM BUG DE FUSO
const formatDateDisplay = (dateString: string | undefined | null): string => {
  if (!dateString) return '-';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

// ✅ Componente Card KPI Premium
const KPICard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}> = ({ title, value, subtitle, icon, color, trend }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2 font-mono">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend).toFixed(1)}% vs mês anterior</span>
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 shadow-sm`}>
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
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-300 transition-colors"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ✅ Componente Input de Filtro Premium
const FilterInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:border-gray-300 transition-colors"
    />
  </div>
);

// ✅ Componente Toggle Sim/Não Premium
const ToggleFiscal: React.FC<{
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
          value === true 
            ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
            : 'border-gray-200 hover:border-gray-300 text-gray-600'
        }`}
      >
        <CheckCircle size={18} />
        <span className="text-sm font-semibold">Sim</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
          value === false 
            ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' 
            : 'border-gray-200 hover:border-gray-300 text-gray-600'
        }`}
      >
        <X size={18} />
        <span className="text-sm font-semibold">Não</span>
      </button>
    </div>
  </div>
);

// ✅ Componente Badge Fiscal Premium
const FiscalBadge: React.FC<{ hasReceipt: boolean | undefined }> = ({ hasReceipt }) => {
  if (hasReceipt === undefined || hasReceipt === null) {
    return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">-</span>;
  }
  
  return hasReceipt ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
      <CheckCircle size={12} /> Comprovante
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
      <X size={12} /> Sem comprovante
    </span>
  );
};

// ✅ Componente Principal
export default function FinanceDashboard() {
  const { finances, addFinance, updateFinance, deleteFinance } = useStore();
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Estados de Filtro
  const [filterMonth, setFilterMonth] = useState('todos');
  const [filterYear, setFilterYear] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterEmpresa, setFilterEmpresa] = useState('todos');
  const [filterEventName, setFilterEventName] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');
  const [filterValueMin, setFilterValueMin] = useState('');
  const [filterValueMax, setFilterValueMax] = useState('');
  const [filterHasFiscalReceipt, setFilterHasFiscalReceipt] = useState<'todos' | 'sim' | 'nao'>('todos');
  
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Estado do Formulário
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    type: 'income' | 'expense';
    value: number;
    date: string;
    category: string;
    description: string;
    status: 'Pago' | 'Pendente';
    empresaPessoaFisica: string;
    eventDate: string;
    eventName: string;
    hasFiscalReceipt: boolean; // ✅ NOVO CAMPO
  }>({
    type: 'income',
    value: 0,
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    status: 'Pendente',
    empresaPessoaFisica: '',
    eventDate: '',
    eventName: '',
    hasFiscalReceipt: false // ✅ VALOR PADRÃO
  });

  // ✅ Lista única de empresas/pessoas para filtro
  const empresasList = useMemo(() => {
    const set = new Set<string>();
    finances.forEach(f => {
      if (f.empresaPessoaFisica && f.empresaPessoaFisica.trim() !== '') {
        set.add(f.empresaPessoaFisica);
      }
    });
    return ['todos', ...Array.from(set).sort()];
  }, [finances]);

  // ✅ Lista única de nomes de evento para filtro
  const eventNamesList = useMemo(() => {
    const set = new Set<string>();
    finances.forEach(f => {
      if (f.eventName && f.eventName.trim() !== '') {
        set.add(f.eventName);
      }
    });
    return Array.from(set).sort();
  }, [finances]);

  // ✅ Filtragem Inteligente (COM FILTRO DE COMPROVANTE FISCAL)
  const filteredFinances = useMemo(() => {
    return finances.filter(f => {
      if (filterMonth !== 'todos') {
        const recordMonth = f.month || String(new Date(f.date).getMonth() + 1).padStart(2, '0');
        if (recordMonth !== filterMonth) return false;
      }
      if (filterYear !== 'todos') {
        const recordYear = f.year || String(new Date(f.date).getFullYear());
        if (recordYear !== filterYear) return false;
      }
      if (filterCategory !== 'todos') {
        if (f.category !== filterCategory) return false;
      }
      if (filterType !== 'todos') {
        if (f.type !== filterType) return false;
      }
      if (filterStatus !== 'todos') {
        if (f.status !== filterStatus) return false;
      }
      if (filterEmpresa !== 'todos') {
        if (f.empresaPessoaFisica !== filterEmpresa) return false;
      }
      if (filterEventName && filterEventName.trim() !== '') {
        if (!f.eventName || !f.eventName.toLowerCase().includes(filterEventName.toLowerCase())) {
          return false;
        }
      }
      // ✅ FILTRO COMPROVANTE FISCAL
      if (filterHasFiscalReceipt !== 'todos') {
        const hasReceipt = f.hasFiscalReceipt === true;
        if (filterHasFiscalReceipt === 'sim' && !hasReceipt) return false;
        if (filterHasFiscalReceipt === 'nao' && hasReceipt) return false;
      }
      if (filterDateStart && f.date < filterDateStart) return false;
      if (filterDateEnd && f.date > filterDateEnd) return false;
      if (filterValueMin && filterValueMin.trim() !== '') {
        const minVal = parseFloat(filterValueMin);
        if (f.value === undefined || f.value === null || f.value < minVal) return false;
      }
      if (filterValueMax && filterValueMax.trim() !== '') {
        const maxVal = parseFloat(filterValueMax);
        if (f.value === undefined || f.value === null || f.value > maxVal) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    finances, filterMonth, filterYear, filterCategory, filterType, filterStatus, filterEmpresa,
    filterEventName, filterDateStart, filterDateEnd, filterValueMin, filterValueMax, filterHasFiscalReceipt
  ]);

  // ✅ Cálculos de KPIs
  const kpis = useMemo(() => {
    const totalIncome = filteredFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + (f.value || 0), 0);
    const totalExpense = filteredFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + (f.value || 0), 0);
    const incomePaid = filteredFinances.filter(f => f.type === 'income' && f.status === 'Pago').reduce((sum, f) => sum + (f.value || 0), 0);
    const expensePaid = filteredFinances.filter(f => f.type === 'expense' && f.status === 'Pago').reduce((sum, f) => sum + (f.value || 0), 0);
    const pendingReceivable = filteredFinances.filter(f => f.type === 'income' && f.status === 'Pendente').reduce((sum, f) => sum + (f.value || 0), 0);
    const pendingPayable = filteredFinances.filter(f => f.type === 'expense' && f.status === 'Pendente').reduce((sum, f) => sum + (f.value || 0), 0);

    return {
      totalIncome, totalExpense, balance: totalIncome - totalExpense,
      pendingPayable, pendingReceivable, incomePaid, expensePaid,
      executionRate: totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0
    };
  }, [filteredFinances]);

  // ✅ Dados para Gráficos
  const chartData = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    filteredFinances.forEach(f => {
      const key = `${f.month || '00'}/${f.year || '0000'}`;
      if (!monthlyData[key]) monthlyData[key] = { income: 0, expense: 0 };
      monthlyData[key][f.type === 'income' ? 'income' : 'expense'] += f.value || 0;
    });
    
    const monthlyChartData = Object.entries(monthlyData)
      .sort(([a], [b]) => {
        const [ma, ya] = a.split('/');
        const [mb, yb] = b.split('/');
        return new Date(parseInt(ya), parseInt(ma) - 1).getTime() - new Date(parseInt(yb), parseInt(mb) - 1).getTime();
      })
      .map(([label, data]) => ({ month: label, Receitas: data.income, Despesas: data.expense }));

    const expenseByCategory: Record<string, number> = {};
    filteredFinances.filter(f => f.type === 'expense').forEach(f => {
      expenseByCategory[f.category] = (expenseByCategory[f.category] || 0) + (f.value || 0);
    });
    
    const categoryChartData = Object.entries(expenseByCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const balanceData = monthlyChartData.map((item, index, arr) => {
      const prevBalance = index === 0 ? 0 : arr[index - 1].balance || 0;
      return { ...item, balance: prevBalance + (item.Receitas - item.Despesas) };
    });

    return { monthlyChartData, categoryChartData, balanceData };
  }, [filteredFinances]);

  // ✅ Handlers
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const financeData: Partial<FinanceRecord> & { 
      eventName?: string;
      hasFiscalReceipt?: boolean; // ✅ NOVO CAMPO
    } = {
      id: editingId || crypto.randomUUID(),
      type: formData.type,
      value: formData.value,
      date: formData.date,
      month: formData.date?.split('-')[1] || '',
      year: formData.date?.split('-')[0] || '',
      category: formData.category,
      description: formData.description,
      status: formData.status,
      empresaPessoaFisica: formData.empresaPessoaFisica || '',
      eventDate: formData.category === 'Evento' ? (formData.eventDate || '') : '',
      eventName: formData.category === 'Evento' ? (formData.eventName || '') : '',
      hasFiscalReceipt: formData.hasFiscalReceipt, // ✅ SALVAR CAMPO
    };

    if (editingId) {
      updateFinance(editingId, financeData);
    } else {
      addFinance(financeData as Omit<FinanceRecord, 'id'>);
    }
    
    setFormData({
      type: 'income', value: 0, date: new Date().toISOString().split('T')[0],
      category: '', description: '', status: 'Pendente',
      empresaPessoaFisica: '', eventDate: '', eventName: '',
      hasFiscalReceipt: false // ✅ RESETAR CAMPO
    });
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (fin: any) => {
    setEditingId(fin.id);
    setFormData({
      type: fin.type || 'income',
      value: fin.value !== undefined && fin.value !== null ? fin.value : 0,
      date: fin.date || new Date().toISOString().split('T')[0],
      category: fin.category || '',
      description: fin.description || '',
      status: fin.status || 'Pendente',
      empresaPessoaFisica: fin.empresaPessoaFisica || '',
      eventDate: fin.category === 'Evento' ? (fin.eventDate || '') : '',
      eventName: fin.category === 'Evento' ? (fin.eventName || '') : '',
      hasFiscalReceipt: fin.hasFiscalReceipt || false // ✅ CARREGAR CAMPO
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      deleteFinance(id);
    }
  };

  // ✅ Exportação para PDF
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    const pdf = new jsPDF('l', 'mm', 'a4');
    const canvas = await html2canvas(dashboardRef.current, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`AMOVIN_Relatorio_Financeiro_${new Date().getFullYear()}.pdf`); // ✅ ANO CORRETO
  };

  // ✅ Exportação para CSV (COM CAMPO COMPROVANTE FISCAL)
  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Categoria', 'Empresa/Pessoa', 'Nome Evento', 'Data Evento', 'Descrição', 'Valor', 'Status', 'Comprovante Fiscal'];
    const rows = filteredFinances.map(f => [
      f.date ? formatDateDisplay(f.date) : '',
      f.type === 'income' ? 'Receita' : 'Despesa',
      f.category || '',
      f.empresaPessoaFisica || '',
      f.eventName || '',
      f.eventDate ? formatDateDisplay(f.eventDate) : '',
      `"${(f.description || '').replace(/"/g, '""')}"`,
      formatCurrency(f.value).replace('R$', '').trim(),
      f.status || '',
      f.hasFiscalReceipt ? 'Sim' : 'Não' // ✅ CAMPO COMPROVANTE NO CSV
    ]);
    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AMOVIN_Lancamentos_${new Date().getFullYear()}.csv`); // ✅ ANO CORRETO
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Anos disponíveis para filtro (CORRIGIDO: new Date().getFullYear())
  const years = useMemo(() => {
    const currentYear = String(new Date().getFullYear()); // ✅ CORREÇÃO: 2025
    const set = new Set(finances.map(f => f.year || String(new Date(f.date).getFullYear())));
    set.add(currentYear);
    return ['todos', ...[...set].sort().reverse()];
  }, [finances]);

  const months = ['todos', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const monthLabels: Record<string, string> = {
    'todos': 'Todos', '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março',
    '04': 'Abril', '05': 'Maio', '06': 'Junho', '07': 'Julho',
    '08': 'Agosto', '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
  };

  // ✅ CORREÇÃO: Usar getFullYear() para evitar erro de ano
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50" ref={dashboardRef}>
      {/* 🎨 Header Premium */}
      <header className="bg-white border-b-4 border-blue-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img src={AMOVIN_LOGO_SRC} alt="AMOVIN" className="h-16 w-auto shadow-sm" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">RELATÓRIO FINANCEIRO EXECUTIVO</h1>
                <p className="text-sm text-gray-600 mt-1 font-medium">AMOVIN – Associação e Movimento pela Inclusão em Rio Paranaíba</p>
                <p className="text-xs text-gray-500 mt-1">Período: {currentMonth} | Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm" title="Exportar PDF">
                <FileText size={18} /> PDF
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm" title="Exportar Excel">
                <FileSpreadsheet size={18} /> Excel
              </button>
              <button onClick={() => {
                setEditingId(null);
                setFormData({ 
                  type: 'income', value: 0, date: new Date().toISOString().split('T')[0],
                  category: '', description: '', status: 'Pendente',
                  empresaPessoaFisica: '', eventDate: '', eventName: '',
                  hasFiscalReceipt: false // ✅ RESETAR NOVO CAMPO
                });
                setIsFormOpen(true);
              }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                <Plus size={18} /> Novo Lançamento
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 🔍 Filtros Premium (COM FILTRO DE COMPROVANTE FISCAL) */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-end gap-4">
            <FilterSelect label="Ano" value={filterYear} onChange={setFilterYear} options={years.map(y => ({ value: y, label: y === 'todos' ? 'Todos' : y }))} />
            <FilterSelect label="Mês" value={filterMonth} onChange={setFilterMonth} options={months.map(m => ({ value: m, label: monthLabels[m] }))} />
            <FilterSelect label="Categoria" value={filterCategory} onChange={setFilterCategory} options={CATEGORIES.map(c => ({ value: c, label: c === 'todos' ? 'Todas' : c }))} />
            <FilterSelect label="Tipo" value={filterType} onChange={setFilterType} options={TYPES.map(t => ({ value: t, label: typeLabels[t] }))} />
            <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={STATUS.map(s => ({ value: s, label: statusLabels[s] }))} />
            <FilterSelect label="Empresa/Pessoa" value={filterEmpresa} onChange={setFilterEmpresa} options={empresasList.map(e => ({ value: e, label: e === 'todos' ? 'Todas' : e }))} />
            {/* ✅ NOVO FILTRO: Comprovante Fiscal */}
            <FilterSelect 
              label="Comprovante Fiscal" 
              value={filterHasFiscalReceipt} 
              onChange={(v) => setFilterHasFiscalReceipt(v as 'todos' | 'sim' | 'nao')} 
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'sim', label: 'Com comprovante' },
                { value: 'nao', label: 'Sem comprovante' }
              ]} 
            />
            <FilterInput label="Nome do Evento" value={filterEventName} onChange={setFilterEventName} placeholder="Digite para buscar..." />
            <FilterInput label="Data Inicial" value={filterDateStart} onChange={setFilterDateStart} type="date" />
            <FilterInput label="Data Final" value={filterDateEnd} onChange={setFilterDateEnd} type="date" />
            <FilterInput label="Valor Mínimo" value={filterValueMin} onChange={setFilterValueMin} type="number" placeholder="0,00" />
            <FilterInput label="Valor Máximo" value={filterValueMax} onChange={setFilterValueMax} type="number" placeholder="0,00" />
            <button onClick={() => {
              setFilterMonth('todos'); setFilterYear('todos'); setFilterCategory('todos'); setFilterType('todos'); setFilterStatus('todos'); setFilterEmpresa('todos');
              setFilterHasFiscalReceipt('todos');
              setFilterEventName(''); setFilterDateStart(''); setFilterDateEnd(''); setFilterValueMin(''); setFilterValueMax('');
            }} className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              <Filter size={16} /> Limpar
            </button>
          </div>
        </div>

        {/* 📊 KPIs Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard title="Receitas Totais" value={formatCurrency(kpis.totalIncome)} subtitle={`Pago: ${formatCurrency(kpis.incomePaid)} • Pendente: ${formatCurrency(kpis.pendingReceivable)}`} icon={<DollarSign size={24} />} color="bg-green-500" trend={12.5} />
          <KPICard title="Despesas Totais" value={formatCurrency(kpis.totalExpense)} subtitle={`Pago: ${formatCurrency(kpis.expensePaid)} • Pendente: ${formatCurrency(kpis.pendingPayable)}`} icon={<Wallet size={24} />} color="bg-red-500" trend={-5.2} />
          <KPICard title="Saldo Atual" value={formatCurrency(kpis.balance)} icon={<Activity size={24} />} color={kpis.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} />
          <KPICard title="Execução Orçamentária" value={`${kpis.executionRate.toFixed(1)}%`} icon={<PieChart size={24} />} color="bg-purple-500" />
        </div>

        {/* 📈 Gráficos Executivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><BarChart3 className="text-blue-600" size={20} /> Receitas x Despesas por Mês</h3>
            {chartData.monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData.monthlyChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v).replace('R$', '').trim()} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Receitas" fill={COLORS.income} radius={[6, 6, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="Despesas" fill={COLORS.expense} radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400 bg-gray-50 rounded-lg">
                <div className="text-center"><AlertCircle className="mx-auto h-12 w-12 mb-2" /><p>Sem dados para exibir</p></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><PieChart className="text-purple-600" size={20} /> Despesas por Categoria</h3>
            {chartData.categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <RechartsPie>
                  <Pie data={chartData.categoryChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {chartData.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS.primary, COLORS.primaryLight, COLORS.secondary, '#8B5CF6', '#EC4899', '#14B8A6'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400 bg-gray-50 rounded-lg">
                <div className="text-center"><AlertCircle className="mx-auto h-12 w-12 mb-2" /><p>Sem dados para exibir</p></div>
              </div>
            )}
          </div>
        </div>

        {/* 📈 Gráfico de Evolução do Saldo */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2"><Activity className="text-blue-600" size={20} /> Evolução do Saldo Acumulado</h3>
          {chartData.balanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData.balanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <defs><linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v).replace('R$', '').trim()} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Area type="monotone" dataKey="balance" stroke={COLORS.primary} fill="url(#balanceGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg"><p>Sem dados para exibir</p></div>
          )}
        </div>

        {/* 📋 Tabela Completa de Lançamentos - COM COLUNA COMPROVANTE FISCAL ✅ */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Lançamentos Financeiros</h3>
              <p className="text-sm text-gray-500 mt-1">{filteredFinances.length} registros encontrados</p>
            </div>
            <button onClick={() => setShowAllTransactions(!showAllTransactions)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              {showAllTransactions ? <><ChevronUp size={16} /> Mostrar menos</> : <><ChevronDown size={16} /> Ver todos ({filteredFinances.length})</>}
            </button>
          </div>
          {filteredFinances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Descrição</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Categoria</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Empresa/Pessoa</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Nome Evento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data Evento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Valor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    {/* ✅ NOVA COLUNA: Comprovante Fiscal */}
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Comprovante</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(showAllTransactions ? filteredFinances : filteredFinances.slice(0, 10)).map((fin) => (
                    <tr key={fin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatDateDisplay(fin.date)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{fin.description || '-'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{fin.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{fin.category}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fin.empresaPessoaFisica || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{fin.eventName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateDisplay(fin.eventDate)}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${fin.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{fin.type === 'income' ? '+' : '-'} {formatCurrency(fin.value)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-3 py-1.5 text-xs font-semibold rounded-full ${fin.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{fin.status}</span></td>
                      {/* ✅ COLUNA COMPROVANTE FISCAL */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <FiscalBadge hasReceipt={fin.hasFiscalReceipt} />
                      </td>
                      {/* ✅ BOTÕES DE AÇÃO - EDITAR E EXCLUIR */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {/* ✅ BOTÃO EDITAR - VISÍVEL E FUNCIONAL */}
                          <button 
                            onClick={() => handleEdit(fin)} 
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center" 
                            title="Editar"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Edit2 size={16} />
                          </button>
                          {/* ✅ BOTÃO EXCLUIR */}
                          <button onClick={() => handleDelete(fin.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <AlertCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Nenhum lançamento encontrado</p>
              <p className="text-sm mb-4">Ajuste os filtros ou adicione um novo lançamento</p>
              <button onClick={() => {
                setFilterMonth('todos'); setFilterYear('todos'); setFilterCategory('todos'); setFilterType('todos'); setFilterStatus('todos'); setFilterEmpresa('todos');
                setFilterHasFiscalReceipt('todos');
                setFilterEventName(''); setFilterDateStart(''); setFilterDateEnd(''); setFilterValueMin(''); setFilterValueMax('');
              }} className="px-6 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Limpar filtros</button>
            </div>
          )}
        </div>

        {/* 📄 Rodapé do Relatório - ANO CORRIGIDO */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p className="font-medium text-gray-700">AMOVIN – Associação e Movimento pela Inclusão em Rio Paranaíba</p>
          <p className="mt-1">CNPJ: 55.880.046/0001-34 | contato@amovin.org.br | (34) 99821-0513</p>
          <p className="mt-2 text-xs">Relatório gerado em {new Date().toLocaleString('pt-BR')} • Documento confidencial</p>
          <p className="mt-1 text-xs font-semibold text-blue-600">Exercício Financeiro: {currentYear}</p> {/* ✅ ANO CORRETO */}
        </div>
      </main>

      {/* 📝 Modal de Lançamento - COM CAMPO COMPROVANTE FISCAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Lançamento' : 'Novo Lançamento'}</h2>
              <button onClick={() => { setIsFormOpen(false); setEditingId(null); }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
                  <div className="flex gap-2">
                    {['income', 'expense'].map(type => (
                      <label key={type} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${formData.type === type ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="type" value={type} checked={formData.type === type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })} className="sr-only" />
                        {type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        <span className="text-sm font-semibold">{typeLabels[type]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {STATUS.filter(s => s !== 'todos').map(s => (<option key={s} value={s}>{statusLabels[s]}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                <select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Selecione uma categoria...</option>
                  {CATEGORIES.filter(c => c !== 'todos').map(c => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{formData.type === 'income' ? 'Doador/Empresa' : 'Fornecedor/Empresa'}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" value={formData.empresaPessoaFisica || ''} onChange={(e) => setFormData({ ...formData, empresaPessoaFisica: e.target.value })} className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Empresa XYZ ou João Silva" list="empresas-suggestions" />
                  <datalist id="empresas-suggestions">{empresasList.filter(e => e !== 'todos').map(e => (<option key={e} value={e} />))}</datalist>
                </div>
              </div>

              {formData.category === 'Evento' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Evento</label>
                    <input type="text" value={formData.eventName || ''} onChange={(e) => setFormData({ ...formData, eventName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Bazar de Inverno" list="eventos-suggestions" />
                    <datalist id="eventos-suggestions">{eventNamesList.map(name => (<option key={name} value={name} />))}</datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Data do Evento</label>
                    <input type="date" value={formData.eventDate || ''} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                <input required type="text" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Doação Campanha Winter" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data do Lançamento</label>
                  <input required type="date" value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Valor (R$)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right font-mono"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ex: 20.50 para R$ 20,50</p>
                </div>
              </div>

              {/* ✅ NOVO CAMPO: Possui Comprovante Fiscal? */}
              <ToggleFiscal 
                label="Possui Comprovante Fiscal?" 
                value={formData.hasFiscalReceipt} 
                onChange={(val) => setFormData({ ...formData, hasFiscalReceipt: val })} 
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setIsFormOpen(false); setEditingId(null); }} className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md">{editingId ? 'Atualizar' : 'Salvar Lançamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
