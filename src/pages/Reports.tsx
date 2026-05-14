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
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 print:shadow-none print:border print:border-gray-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2 print:text-xl">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}{suffix}
        </p>
        {subtitle && <p className="text-xs text-gray-400 mt-2 leading-relaxed print:hidden">{subtitle}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-sm font-medium print:hidden ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{Math.abs(trend).toFixed(1)}% vs período anterior</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 shadow-sm print:hidden`}>
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
  <div className={`flex flex-col gap-1.5 ${className} print:hidden`}>
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

  // ✅ IMPRESSÃO ULTRA-PREMIUM
  const handlePrint = () => {
    if (!reportRef.current) return;

    const tabTitle = activeTab === 'beneficiarios' ? 'Relatório de Beneficiários' : 
                     activeTab === 'faltas' ? 'Relatório de Frequência e Presenças' : 'Relatório de Profissionais';
    
    const printContent = reportRef.current.innerHTML;
    const printStyles = `
      @page { size: A4 portrait; margin: 12mm; }
      body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; font-size: 10pt; line-height: 1.3; background: #fff; }
      .print-header { text-align: center; border-bottom: 2px solid #1E40AF; padding-bottom: 12px; margin-bottom: 20px; page-break-after: avoid; }
      .print-header img { height: 45px; margin-bottom: 8px; }
      .print-header h1 { margin: 4px 0 2px; color: #1E40AF; font-size: 16pt; font-weight: 700; }
      .print-header p { margin: 0; color: #555; font-size: 9pt; }
      .print-kpis { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 10px; page-break-after: avoid; }
      .print-kpi { flex: 1; text-align: center; padding: 12px 8px; border: 1px solid #ddd; border-radius: 6px; background: #fafafa; }
      .print-kpi-value { font-size: 16pt; font-weight: bold; color: #111; margin-bottom: 2px; }
      .print-kpi-label { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      th { background: #f8f9fa; color: #1E40AF; text-align: left; padding: 8px 6px; font-size: 9pt; border-bottom: 2px solid #1E40AF; font-weight: 600; }
      td { padding: 7px 6px; border-bottom: 1px solid #eee; font-size: 9pt; }
      tr:nth-child(even) { background: #fafafa; }
      .print-footer { margin-top: 25px; border-top: 1px solid #ccc; padding-top: 10px; text-align: center; font-size: 8pt; color: #777; page-break-inside: avoid; }
      .no-print { display: none !important; }
      .chart-placeholder { display: none; }
      h3 { color: #1E40AF; font-size: 12pt; border-bottom: 1px solid #eee; padding-bottom: 6px; margin: 20px 0 10px; }
      .badge { display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 8pt; font-weight: 600; }
      .badge-green { background: #dcfce7; color: #166534; }
      .badge-red { background: #fee2e2; color: #991b1b; }
      .badge-yellow { background: #fef3c7; color: #92400e; }
      .badge-blue { background: #dbeafe; color: #1e40af; }
      .alert-box { background: #fff1f2; border-left: 4px solid #e11d48; padding: 10px; margin-bottom: 15px; font-size: 9pt; }
    `;

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>AMOVIN - ${tabTitle}</title>
        <style>${printStyles}</style>
      </head>
      <body>
        <div class="print-header">
          <img src="${AMOVIN_LOGO_SRC}" alt="AMOVIN Logo">
          <h1>${tabTitle}</h1>
          <p>Associação e Movimento pela Inclusão em Rio Paranaíba • CNPJ: 55.880.046/0001-34</p>
          <p>Período: ${periodLabel} | Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        ${printContent}
        <div class="print-footer">
          <p>AMOVIN – Associação e Movimento pela Inclusão • Rio Paranaíba/MG • (34) 99821-0513 • contato@amovin.org.br</p>
          <p>Documento confidencial • Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
        <script>
          window.onload = function() { 
            window.print(); 
            window.onafterprint = function() { window.close(); };
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ✅ EXPORTAÇÃO EXCEL/CSV ULTRA-PREMIUM
  const handleExportCSV = () => {
    const tabTitle = activeTab === 'beneficiarios' ? 'Relatorio_Beneficiarios' : 
                     activeTab === 'faltas' ? 'Relatorio_Frequencia' : 'Relatorio_Profissionais';
    
    let headers: string[] = [];
    let rows: string[][] = [];
    let data: any[] = [];

    if (activeTab === 'beneficiarios') {
      headers = ['Nome Completo', 'Data Nascimento', 'CPF', 'Diagnóstico', 'CID', 'Nível Suporte', 'Responsável', 'Telefone Responsável', 'Endereço', 'Estudante', 'Comorbidades', 'Alergias'];
      data = filteredBeneficiaries.map(b => [
        b.fullName,
        b.birthDate ? new Date(b.birthDate).toLocaleDateString('pt-BR') : '',
        b.cpf,
        b.diagnosis,
        b.cid,
        b.supportLevel,
        b.respName,
        b.respPhone,
        b.respAddress,
        b.isStudent,
        b.hasComorbidities,
        b.hasAllergies
      ]);
    } else if (activeTab === 'faltas') {
      headers = ['Data', 'Horário', 'Paciente', 'Profissional', 'Status', 'Observações'];
      data = filteredConsultations.map(c => {
        const ben = beneficiaries.find(b => b.id === c.beneficiaryId);
        const prof = professionals.find(p => p.id === c.professionalId);
        return [
          c.date ? new Date(c.date).toLocaleDateString('pt-BR') : '',
          c.time || '',
          ben?.fullName || 'N/A',
          prof?.name || c.professionalId,
          c.attendance === 'presente' ? 'Presente' : 
          c.attendance === 'falta' ? 'Falta' : 
          c.attendance === 'falta_justificada' ? 'Falta Justificada' : 'Cancelado',
          c.notes || ''
        ];
      });
    } else {
      headers = ['Nome', 'Especialidade', 'CPF', 'Registro Profissional', 'Vínculo', 'Telefone', 'Login', 'Total Consultas'];
      data = filteredProfessionals.map(p => [
        p.name,
        p.specialty,
        p.cpf || '',
        p.hasRegistration === 'Sim' ? (p.registration || '') : 'Não registrado',
        p.bondType || '-',
        p.phone,
        p.login,
        professionalKPIs.consultationsByProf[p.id] || 0
      ]);
    }

    // Monta o conteúdo CSV premium
    const csvLines: string[] = [];
    csvLines.push(`AMOVIN - Associação e Movimento pela Inclusão`);
    csvLines.push(`${tabTitle.replace(/_/g, ' ')} | Período: ${periodLabel} | Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    csvLines.push(''); // Linha em branco
    csvLines.push(headers.join(';'));
    data.forEach(row => {
      const safeRow = row.map(val => {
        const str = String(val ?? '');
        return str.includes(';') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      });
      csvLines.push(safeRow.join(';'));
    });

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${tabTitle}_${new Date().toISOString().split('T')[0]}.csv`);
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
      <header className="bg-white border-b-4 border-blue-900 shadow-lg sticky top-0 z-40 print:hidden">
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
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                <Printer size={16} /> Imprimir
              </button>
              <button
                onClick={handleExportCSV}
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
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 mb-6 print:hidden">
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 print:hidden">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
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
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:bg-white print:border-b-2 print:border-blue-900">
                <h3 className="text-lg font-bold text-gray-900 print:text-blue-900 print:text-xl">Lista de Beneficiários</h3>
                <span className="text-sm text-gray-500 print:hidden">{filteredBeneficiaries.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 print:bg-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Nome</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Nascimento</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Diagnóstico/CID</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Responsável</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Telefone</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Suporte</th>
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
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 print:bg-blue-50 print:text-blue-800 print:border print:border-blue-200">
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
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg print:bg-red-50 print:border-red-400 print:p-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 mt-0.5 print:hidden" size={20} />
                  <div>
                    <p className="font-semibold text-red-800 print:text-red-700 print:text-sm">⚠️ Atenção: Beneficiários com 3+ faltas</p>
                    <ul className="mt-2 text-sm text-red-700 space-y-1 print:mt-1 print:text-xs">
                      {attendanceKPIs.faltaRanking.filter(f => f.count >= 3).map(f => (
                        <li key={f.id}>• {f.name} - {f.count} faltas</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
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
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:bg-white print:border-b-2 print:border-blue-900">
                <h3 className="text-lg font-bold text-gray-900 print:text-blue-900 print:text-xl">Histórico de Consultas</h3>
                <span className="text-sm text-gray-500 print:hidden">{filteredConsultations.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 print:bg-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Data/Hora</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Paciente</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Profissional</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Observações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredConsultations.slice(0, 50).map(c => {
                      const ben = beneficiaries.find(b => b.id === c.beneficiaryId);
                      const prof = professionals.find(p => p.id === c.professionalId);
                      return (
                        <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${
                          c.attendance === 'falta' ? 'bg-red-50 print:bg-red-50' : 
                          c.attendance === 'falta_justificada' ? 'bg-yellow-50 print:bg-yellow-50' : ''
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
                              c.attendance === 'presente' ? 'bg-green-100 text-green-700 print:bg-green-50 print:text-green-800' :
                              c.attendance === 'falta' ? 'bg-red-100 text-red-700 print:bg-red-50 print:text-red-800' :
                              c.attendance === 'falta_justificada' ? 'bg-yellow-100 text-yellow-700 print:bg-yellow-50 print:text-yellow-800' :
                              'bg-purple-100 text-purple-700 print:bg-purple-50 print:text-purple-800'
                            }`}>
                              {c.attendance === 'presente' ? 'Presente' :
                               c.attendance === 'falta' ? 'Falta' :
                               c.attendance === 'falta_justificada' ? 'Justificada' : 'Cancelado'}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
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
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 print:bg-white print:border-b-2 print:border-blue-900">
                <h3 className="text-lg font-bold text-gray-900 print:text-blue-900 print:text-xl">Equipe de Profissionais</h3>
                <span className="text-sm text-gray-500 print:hidden">{filteredProfessionals.length} registros</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 print:bg-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Nome</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Especialidade</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Registro</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Vínculo</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Contato</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase print:text-blue-900">Consultas</th>
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
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 print:bg-blue-50 print:text-blue-800 print:border print:border-blue-200">
                            {p.specialty}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700">
                          {p.hasRegistration === 'Sim' ? (
                            <span className="text-green-600 font-medium print:text-green-700">{p.registration}</span>
                          ) : (
                            <span className="text-gray-400 print:text-gray-500">Não registrado</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            p.bondType === 'Efetivo' ? 'bg-green-100 text-green-700 print:bg-green-50 print:text-green-800' :
                            p.bondType === 'Voluntário' ? 'bg-blue-100 text-blue-700 print:bg-blue-50 print:text-blue-800' :
                            p.bondType === 'Parceiro' ? 'bg-purple-100 text-purple-700 print:bg-purple-50 print:text-purple-800' :
                            'bg-gray-100 text-gray-700 print:bg-gray-50 print:text-gray-800'
                          }`}>
                            {p.bondType || '-'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone size={14} className="text-gray-400 print:hidden" />
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
        <div className="mt-10 pt-8 border-t-2 border-gray-200 text-center print:border-t-2 print:border-blue-900 print:mt-12 print:pt-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={AMOVIN_LOGO_SRC} alt="AMOVIN" className="h-10 w-auto opacity-80 print:h-12 print:opacity-100" />
            <div className="text-left">
              <p className="font-bold text-gray-800 print:text-blue-900 print:text-lg">AMOVIN – Associação e Movimento pela Inclusão</p>
              <p className="text-xs text-gray-500 print:text-gray-600 print:text-sm">CNPJ: 55.880.046/0001-34</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500 mb-4 print:text-gray-600 print:text-sm print:gap-8">
            <span className="flex items-center gap-1"><MapPin size={12} className="print:hidden" /> Rio Paranaíba - MG</span>
            <span className="flex items-center gap-1"><Phone size={12} className="print:hidden" /> (34) 99821-0513</span>
            <span className="flex items-center gap-1"><Mail size={12} className="print:hidden" /> contato@amovin.org.br</span>
          </div>
          <p className="text-xs text-gray-400 print:text-gray-500 print:text-sm print:font-medium">
            Relatório gerado em {new Date().toLocaleString('pt-BR')} • Documento confidencial • 
            Impresso em {new Date().toLocaleDateString('pt-BR')}
          </p>
          {/* Marca d'água visual para tela */}
          <div className="mt-6 opacity-5 pointer-events-none select-none print:hidden">
            <img src={AMOVIN_LOGO_SRC} alt="Watermark" className="h-32 w-auto mx-auto" />
            <p className="text-4xl font-bold text-gray-300 mt-2">AMOVIN</p>
          </div>
        </div>
      </main>
    </div>
  );
}
