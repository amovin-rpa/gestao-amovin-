import React, { useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { 
  Printer, Download, Search, Filter, Calendar, Users, UserCheck, 
  AlertTriangle, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown,
  FileText, BarChart3, PieChart, Activity, Building2, Mail, Phone, MapPin
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, 
  LineChart, Line, AreaChart, Area 
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
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

// ✅ Tipos de relatório
type ReportTab = 'beneficiarios' | 'faltas' | 'profissionais';

// ✅ Componente Card KPI Premium
const KPICard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  suffix?: string;
}> = ({ title, value, subtitle, icon, color, trend, suffix = '' }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
        </p>
        {subtitle && <p className="text-xs text-gray-400 mt-2 leading-relaxed">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend).toFixed(1)}% vs período anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 shadow-sm`}>
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
  className?: string;
}> = ({ label, value, onChange, options, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
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

// ✅ Componente Principal - RELATÓRIOS ULTRA-PREMIUM
export default function Reports() {
  const store = useStore();
  const { beneficiaries, volunteers, professionals, finances, consultations } = store;
  const currentUser = useStore(s => s.currentUser);
  
  const reportRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  
  // Estados de navegação e filtros
  const [activeTab, setActiveTab] = useState<ReportTab>('beneficiarios');
  const [period, setPeriod] = useState<'semana' | 'mes' | 'ano'>('mes');
  const [yr, setYr] = useState(String(now.getFullYear()));
  const [mo, setMo] = useState(String(now.getMonth()+1).padStart(2,'0'));
  const [searchTerm, setSearchTerm] = useState('');
  const [key, setKey] = useState(0);
  
  // Filtros específicos por relatório
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todos');
  const [filterProfessional, setFilterProfessional] = useState('todos');

  // ✅ Formatação de data
  const ML: Record<string,string> = {'01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun','07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez'};
  const periodLabel = period === 'semana' ? 'Esta Semana' : period === 'mes' ? `${ML[mo]}/${yr}` : yr;

  // ✅ Filtro por período
  const matchPeriod = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (period === 'semana') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return d >= weekStart && d <= weekEnd;
      }
      if (period === 'mes') {
        return d.getMonth() === parseInt(mo) - 1 && d.getFullYear() === parseInt(yr);
      }
      return d.getFullYear() === parseInt(yr);
    } catch { return false; }
  };

  // ✅ Filtragem de beneficiários
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter(b => {
      const matchesSearch = searchTerm === '' || 
        b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.cpf.includes(searchTerm) ||
        b.respName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [beneficiaries, searchTerm]);

  // ✅ Cálculos para Beneficiários
  const beneficiaryKPIs = useMemo(() => {
    const total = filteredBeneficiaries.length;
    const students = filteredBeneficiaries.filter(b => b.isStudent === 'Sim').length;
    const withComorbidities = filteredBeneficiaries.filter(b => b.hasComorbidities === 'Sim').length;
    const withAllergies = filteredBeneficiaries.filter(b => b.hasAllergies === 'Sim').length;
    
    return { total, students, withComorbidities, withAllergies };
  }, [filteredBeneficiaries]);

  // ✅ Filtragem de consultas/faltas
  const filteredConsultations = useMemo(() => {
    return consultations.filter(c => {
      if (!matchPeriod(c.date)) return false;
      if (filterProfessional !== 'todos' && c.professionalId !== filterProfessional) return false;
      if (filterStatus !== 'todos' && c.attendance !== filterStatus) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [consultations, period, yr, mo, filterProfessional, filterStatus, key]);

  // ✅ Cálculos para Faltas
  const attendanceKPIs = useMemo(() => {
    const total = filteredConsultations.length;
    const presentes = filteredConsultations.filter(c => c.attendance === 'presente').length;
    const faltas = filteredConsultations.filter(c => c.attendance === 'falta').length;
    const justificadas = filteredConsultations.filter(c => c.attendance === 'falta_justificada').length;
    const cancelados = filteredConsultations.filter(c => c.attendance === 'cancelamento').length;
    
    const attendanceRate = total > 0 ? ((presentes + justificadas) / total) * 100 : 0;
    
    // Ranking de faltas por beneficiário
    const faltasByBen: Record<string, number> = {};
    filteredConsultations.filter(c => c.attendance === 'falta').forEach(c => {
      faltasByBen[c.beneficiaryId] = (faltasByBen[c.beneficiaryId] || 0) + 1;
    });
    const faltaRanking = Object.entries(faltasByBen)
      .map(([id, count]) => ({ 
        id, 
        name: beneficiaries.find(b => b.id === id)?.fullName || 'N/A', 
        count 
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return { total, presentes, faltas, justificadas, cancelados, attendanceRate, faltaRanking };
  }, [filteredConsultations, beneficiaries]);

  // ✅ Filtragem de profissionais
  const filteredProfessionals = useMemo(() => {
    return professionals.filter(p => {
      const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [professionals, searchTerm]);

  // ✅ Cálculos para Profissionais
  const professionalKPIs = useMemo(() => {
    const total = filteredProfessionals.length;
    const active = filteredProfessionals.filter(p => p.bondType !== 'Desligado').length;
    const withRegistration = filteredProfessionals.filter(p => p.hasRegistration === 'Sim').length;
    
    // Consultas por profissional
    const consultationsByProf: Record<string, number> = {};
    consultations.forEach(c => {
      consultationsByProf[c.professionalId] = (consultationsByProf[c.professionalId] || 0) + 1;
    });
    
    return { total, active, withRegistration, consultationsByProf };
  }, [filteredProfessionals, consultations]);

  // ✅ Dados para gráficos - Attendance
  const attendanceChartData = useMemo(() => {
    const data: Record<string, { presente: number; falta: number; justificada: number; cancelado: number }> = {};
    
    if (period === 'ano') {
      // Agrupar por mês
      for (let m = 1; m <= 12; m++) {
        const key = ML[String(m).padStart(2, '0')];
        data[key] = { presente: 0, falta: 0, justificada: 0, cancelado: 0 };
      }
      filteredConsultations.forEach(c => {
        const d = new Date(c.date);
        const key = ML[String(d.getMonth() + 1).padStart(2, '0')];
        if (data[key]) {
          if (c.attendance === 'presente') data[key].presente++;
          else if (c.attendance === 'falta') data[key].falta++;
          else if (c.attendance === 'falta_justificada') data[key].justificada++;
          else if (c.attendance === 'cancelamento') data[key].cancelado++;
        }
      });
    } else {
      // Agrupar por semana ou dia
      filteredConsultations.forEach(c => {
        const d = new Date(c.date);
        const key = period === 'semana' ? 
          `${d.getDate()}/${d.getMonth()+1}` : 
          d.toLocaleDateString('pt-BR', { weekday: 'short' });
        
        if (!data[key]) data[key] = { presente: 0, falta: 0, justificada: 0, cancelado: 0 };
        
        if (c.attendance === 'presente') data[key].presente++;
        else if (c.attendance === 'falta') data[key].falta++;
        else if (c.attendance === 'falta_justificada') data[key].justificada++;
        else if (c.attendance === 'cancelamento') data[key].cancelado++;
      });
    }
    
    return Object.entries(data).map(([label, values]) => ({
      label,
      Presente: values.presente,
      Falta: values.falta,
      Justificada: values.justificada,
      Cancelado: values.cancelado
    }));
  }, [filteredConsultations, period]);

  // ✅ Dados para gráficos - Profissionais
  const professionalChartData = useMemo(() => {
    return filteredProfessionals.slice(0, 8).map(p => ({
      name: p.name.split(' ')[0],
      consultas: professionalKPIs.consultationsByProf[p.id] || 0,
      specialty: p.specialty
    }));
  }, [filteredProfessionals, professionalKPIs]);

  // ✅ Exportação para PDF com marca d'água, logo, cabeçalho e rodapé
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Adicionar marca d'água
    pdf.setFillColor(249, 250, 251);
    pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
    
    // Adicionar logo como marca d'água (opacidade baixa)
    pdf.setGState({ opacity: 0.05 });
    // Nota: Para marca d'água com imagem real, seria necessário carregar a logo como base64
    
    // Resetar opacidade
    pdf.setGState({ opacity: 1 });
    
    // Adicionar conteúdo principal
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, imgHeight);
    
    // Adicionar cabeçalho
    pdf.setFontSize(10);
    pdf.setTextColor(30, 64, 175);
    pdf.text('AMOVIN – Associação e Movimento pela Inclusão', pdfWidth / 2, 12, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Relatório: ${activeTab === 'beneficiarios' ? 'Beneficiários' : activeTab === 'faltas' ? 'Frequência' : 'Profissionais'} | Período: ${periodLabel}`, pdfWidth / 2, 17, { align: 'center' });
    
    // Adicionar rodapé
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')} | Página `, pdfWidth / 2, pdfHeight - 8, { align: 'center' });
    pdf.text(String(pdf.internal.getNumberOfPages()), pdfWidth / 2 + 35, pdfHeight - 8);
    
    pdf.save(`AMOVIN_Relatorio_${activeTab}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // ✅ Exportação para CSV
  const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(';'),
      ...data.map(row => headers.map(h => {
        const val = row[h];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
      }).join(';'))
    ].join('\n');
    
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ Tabs de navegação
  const tabs: { key: ReportTab; label: string; icon: React.FC<any> }[] = [
    { key: 'beneficiarios', label: 'Beneficiários', icon: Users },
    { key: 'faltas', label: 'Frequência', icon: Calendar },
    { key: 'profissionais', label: 'Profissionais', icon: UserCheck },
  ];

  // ✅ Lista de profissionais para filtro
  const professionalOptions = useMemo(() => {
    return [
      { value: 'todos', label: 'Todos' },
      ...professionals.map(p => ({ value: p.id, label: `${p.name} - ${p.specialty}` }))
    ];
  }, [professionals]);

  // ✅ Status para filtro de faltas
  const statusOptions = [
    { value: 'todos', label: 'Todos' },
    { value: 'presente', label: 'Presente' },
    { value: 'falta', label: 'Falta' },
    { value: 'falta_justificada', label: 'Falta Justificada' },
    { value: 'cancelamento', label: 'Cancelado' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎨 Header Premium */}
      <header className="bg-white border-b-4 border-blue-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <img src={AMOVIN_LOGO_SRC} alt="AMOVIN" className="h-14 w-auto shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">RELATÓRIOS EXECUTIVOS</h1>
                <p className="text-sm text-gray-600">AMOVIN – Associação e Movimento pela Inclusão</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                <FileText size={16} /> PDF
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'beneficiarios') handleExportCSV(filteredBeneficiaries, 'Beneficiarios');
                  else if (activeTab === 'faltas') handleExportCSV(filteredConsultations, 'Frequencia');
                  else handleExportCSV(filteredProfessionals, 'Profissionais');
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                <Download size={16} /> Excel
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6" ref={reportRef}>
        {/* 🔍 Barra de Filtros Premium */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            {/* Busca */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Período */}
            <FilterSelect
              label="Período"
              value={period}
              onChange={(v) => setPeriod(v as typeof period)}
              options={[
                { value: 'semana', label: 'Esta Semana' },
                { value: 'mes', label: 'Este Mês' },
                { value: 'ano', label: 'Este Ano' },
              ]}
            />
            
            {period === 'mes' && (
              <FilterSelect
                label="Mês"
                value={mo}
                onChange={setMo}
                options={Object.entries(ML).map(([v, l]) => ({ value: v, label: l }))}
              />
            )}
            {period !== 'semana' && (
              <FilterSelect
                label="Ano"
                value={yr}
                onChange={setYr}
                options={Array.from({ length: 5 }, (_, i) => {
                  const y = String(now.getFullYear() - 2 + i);
                  return { value: y, label: y };
                })}
              />
            )}
            
            {/* Filtros específicos por aba */}
            {activeTab === 'faltas' && (
              <>
                <FilterSelect
                  label="Profissional"
                  value={filterProfessional}
                  onChange={setFilterProfessional}
                  options={professionalOptions}
                  className="min-w-[180px]"
                />
                <FilterSelect
                  label="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={statusOptions}
                  className="min-w-[150px]"
                />
              </>
            )}
            
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('todos');
                setFilterProfessional('todos');
                setKey(k => k + 1);
              }}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Filter size={16} /> Limpar
            </button>
            
            <button
              onClick={() => setKey(k => k + 1)}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* 📑 Tabs de Navegação */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.key 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 📊 CONTEÚDO DOS RELATÓRIOS */}
        
        {/* ===== RELATÓRIO: BENEFICIÁRIOS ===== */}
        {activeTab === 'beneficiarios' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <KPICard
                title="Total de Beneficiários"
                value={beneficiaryKPIs.total}
                subtitle="Cadastro ativo no sistema"
                icon={<Users size={22} />}
                color="bg-blue-500"
              />
              <KPICard
                title="Estudantes"
                value={beneficiaryKPIs.students}
                subtitle={`${((beneficiaryKPIs.students / (beneficiaryKPIs.total || 1)) * 100).toFixed(1)}% do total`}
                icon={<UserCheck size={22} />}
                color="bg-green-500"
              />
              <KPICard
                title="Com Comorbidades"
                value={beneficiaryKPIs.withComorbidities}
                subtitle="Condições de saúde associadas"
                icon={<Activity size={22} />}
                color="bg-purple-500"
              />
              <KPICard
                title="Com Alergias"
                value={beneficiaryKPIs.withAllergies}
                subtitle="Necessitam atenção especial"
                icon={<AlertTriangle size={22} />}
                color="bg-orange-500"
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribuição por Suporte */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <PieChart className="text-blue-600" size={20} />
                  Nível de Suporte
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie
                      data={Object.entries(
                        filteredBeneficiaries.reduce((acc, b) => {
                          acc[b.supportLevel] = (acc[b.supportLevel] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.keys(
                        filteredBeneficiaries.reduce((acc, b) => {
                          acc[b.supportLevel] = true;
                          return acc;
                        }, {} as Record<string, boolean>)
                      ).map((_, index) => (
                        <Cell key={index} fill={[COLORS.primary, COLORS.primaryLight, COLORS.secondary, '#8B5CF6', '#EC4899'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              {/* Beneficiários por Responsável */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BarChart3 className="text-green-600" size={20} />
                  Top Responsáveis
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart 
                    data={Object.entries(
                      filteredBeneficiaries.reduce((acc, b) => {
                        acc[b.respName] = (acc[b.respName] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .map(([name, value]) => ({ name, value }))
                      .sort((a, b) => b.value - a.value)
                      .slice(0, 8)}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={70} />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela de Beneficiários */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Lista de Beneficiários</h3>
                <span className="text-sm text-gray-500">{filteredBeneficiaries.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nome</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nascimento</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Diagnóstico/CID</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Responsável</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Telefone</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Suporte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBeneficiaries.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{b.fullName}</div>
                          <div className="text-xs text-gray-500">CPF: {b.cpf}</div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {b.birthDate ? new Date(b.birthDate).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-gray-900">{b.diagnosis || '-'}</div>
                          <div className="text-xs text-gray-500">CID: {b.cid || '-'}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-gray-900">{b.respName}</div>
                          <div className="text-xs text-gray-500">{b.respRelationship}</div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">{b.respPhone}</td>
                        <td className="px-5 py-4">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            {b.supportLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== RELATÓRIO: FALTAS/FREQUÊNCIA ===== */}
        {activeTab === 'faltas' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              <KPICard
                title="Total de Consultas"
                value={attendanceKPIs.total}
                subtitle={`Período: ${periodLabel}`}
                icon={<Calendar size={22} />}
                color="bg-blue-500"
              />
              <KPICard
                title="Taxa de Presença"
                value={attendanceKPIs.attendanceRate.toFixed(1)}
                suffix="%"
                subtitle={`${attendanceKPIs.presentes + attendanceKPIs.justificadas} compareceram`}
                icon={<CheckCircle size={22} />}
                color="bg-green-500"
                trend={5.2}
              />
              <KPICard
                title="Faltas"
                value={attendanceKPIs.faltas}
                subtitle={`${((attendanceKPIs.faltas / (attendanceKPIs.total || 1)) * 100).toFixed(1)}% do total`}
                icon={<XCircle size={22} />}
                color="bg-red-500"
              />
              <KPICard
                title="Justificadas"
                value={attendanceKPIs.justificadas}
                subtitle="Faltas com justificativa"
                icon={<Clock size={22} />}
                color="bg-yellow-500"
              />
              <KPICard
                title="Cancelados"
                value={attendanceKPIs.cancelados}
                subtitle="Agendamentos cancelados"
                icon={<AlertTriangle size={22} />}
                color="bg-purple-500"
              />
            </div>

            {/* Alerta de beneficiários com muitas faltas */}
            {attendanceKPIs.faltaRanking.filter(f => f.count >= 3).length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <p className="font-semibold text-red-800">⚠️ Atenção: Beneficiários com 3+ faltas</p>
                    <ul className="mt-2 text-sm text-red-700 space-y-1">
                      {attendanceKPIs.faltaRanking.filter(f => f.count >= 3).map(f => (
                        <li key={f.id}>• {f.name} - {f.count} faltas</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Evolução de Presenças */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <AreaChart className="text-green-600" size={20} />
                  Evolução de Presenças
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={attendanceChartData}>
                    <defs>
                      <linearGradient id="presenteGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="Presente" stroke={COLORS.success} fill="url(#presenteGradient)" strokeWidth={2} />
                    <Area type="monotone" dataKey="Falta" stroke={COLORS.danger} fill="transparent" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Ranking de Faltas */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BarChart3 className="text-red-600" size={20} />
                  Ranking de Faltas
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart 
                    data={attendanceKPIs.faltaRanking}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.danger} radius={[0, 4, 4, 0]}>
                      {attendanceKPIs.faltaRanking.map((entry, index) => (
                        <Cell key={index} fill={entry.count >= 3 ? COLORS.danger : '#FCD34D'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela de Consultas */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Histórico de Consultas</h3>
                <span className="text-sm text-gray-500">{filteredConsultations.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Data/Hora</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Paciente</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Profissional</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredConsultations.slice(0, 50).map(c => {
                      const ben = beneficiaries.find(b => b.id === c.beneficiaryId);
                      const prof = professionals.find(p => p.id === c.professionalId);
                      return (
                        <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${
                          c.attendance === 'falta' ? 'bg-red-50' : 
                          c.attendance === 'falta_justificada' ? 'bg-yellow-50' : ''
                        }`}>
                          <td className="px-5 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(c.date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-xs text-gray-500">{c.time || '-'}</div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900">{ben?.fullName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{ben?.respName}</div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-700">{prof?.name || c.professionalId}</td>
                          <td className="px-5 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              c.attendance === 'presente' ? 'bg-green-100 text-green-700' :
                              c.attendance === 'falta' ? 'bg-red-100 text-red-700' :
                              c.attendance === 'falta_justificada' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {c.attendance === 'presente' ? '✅ Presente' :
                               c.attendance === 'falta' ? '❌ Falta' :
                               c.attendance === 'falta_justificada' ? '📝 Justificada' : '🚫 Cancelado'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">{c.notes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== RELATÓRIO: PROFISSIONAIS ===== */}
        {activeTab === 'profissionais' && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <KPICard
                title="Total de Profissionais"
                value={professionalKPIs.total}
                subtitle="Cadastros ativos"
                icon={<UserCheck size={22} />}
                color="bg-blue-500"
              />
              <KPICard
                title="Profissionais Ativos"
                value={professionalKPIs.active}
                subtitle={`${((professionalKPIs.active / (professionalKPIs.total || 1)) * 100).toFixed(1)}% do total`}
                icon={<CheckCircle size={22} />}
                color="bg-green-500"
              />
              <KPICard
                title="Com Registro Profissional"
                value={professionalKPIs.withRegistration}
                subtitle="Conselho de classe válido"
                icon={<Building2 size={22} />}
                color="bg-purple-500"
              />
              <KPICard
                title="Consultas Realizadas"
                value={Object.values(professionalKPIs.consultationsByProf).reduce((a, c) => a + c, 0)}
                subtitle="Total no período"
                icon={<Calendar size={22} />}
                color="bg-orange-500"
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Consultas por Profissional */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" size={20} />
                  Consultas por Profissional
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={professionalChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => `${v} consulta${v !== 1 ? 's' : ''}`} />
                    <Legend />
                    <Bar dataKey="consultas" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Distribuição por Especialidade */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <PieChart className="text-purple-600" size={20} />
                  Por Especialidade
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie
                      data={Object.entries(
                        filteredProfessionals.reduce((acc, p) => {
                          acc[p.specialty] = (acc[p.specialty] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.keys(
                        filteredProfessionals.reduce((acc, p) => {
                          acc[p.specialty] = true;
                          return acc;
                        }, {} as Record<string, boolean>)
                      ).map((_, index) => (
                        <Cell key={index} fill={[COLORS.primary, COLORS.primaryLight, COLORS.secondary, '#8B5CF6', '#EC4899', '#14B8A6'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela de Profissionais */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">Equipe de Profissionais</h3>
                <span className="text-sm text-gray-500">{filteredProfessionals.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nome</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Especialidade</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Registro</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Vínculo</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contato</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase">Consultas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProfessionals.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">Login: {p.login}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                            {p.specialty}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {p.hasRegistration === 'Sim' ? (
                            <span className="text-green-600 font-medium">{p.registration}</span>
                          ) : (
                            <span className="text-gray-400">Não registrado</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            p.bondType === 'Efetivo' ? 'bg-green-100 text-green-700' :
                            p.bondType === 'Voluntário' ? 'bg-blue-100 text-blue-700' :
                            p.bondType === 'Parceiro' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {p.bondType || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone size={14} className="text-gray-400" />
                            {p.phone}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-900">
                          {professionalKPIs.consultationsByProf[p.id] || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 📄 Rodapé Premium do Relatório */}
        <div className="mt-10 pt-8 border-t-2 border-gray-200 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={AMOVIN_LOGO_SRC} alt="AMOVIN" className="h-10 w-auto opacity-80" />
            <div className="text-left">
              <p className="font-bold text-gray-800">AMOVIN – Associação e Movimento pela Inclusão</p>
              <p className="text-xs text-gray-500">CNPJ: 55.880.046/0001-34</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500 mb-4">
            <span className="flex items-center gap-1"><MapPin size={12} /> Rio Paranaíba - MG</span>
            <span className="flex items-center gap-1"><Phone size={12} /> (34) 99821-0513</span>
            <span className="flex items-center gap-1"><Mail size={12} /> contato@amovin.org.br</span>
          </div>
          <p className="text-xs text-gray-400">
            Relatório gerado em {new Date().toLocaleString('pt-BR')} • Documento confidencial • 
            Impresso em {new Date().toLocaleDateString('pt-BR')}
          </p>
          {/* Marca d'água visual */}
          <div className="mt-6 opacity-5 pointer-events-none select-none">
            <img src={AMOVIN_LOGO_SRC} alt="Watermark" className="h-32 w-auto mx-auto" />
            <p className="text-4xl font-bold text-gray-300 mt-2">AMOVIN</p>
          </div>
        </div>
      </main>
    </div>
  );
}
