import { useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { Printer, RefreshCw, AlertTriangle } from 'lucide-react';

const monthLabels: Record<string,string> = {'01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun','07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez'};
const monthsList = ['01','02','03','04','05','06','07','08','09','10','11','12'];

type Tab = 'financeiro' | 'profissionais' | 'beneficiarios' | 'faltas' | 'voluntarios';

export default function Reports() {
  const { currentUser, beneficiaries, volunteers, professionals, consultations, finances } = useStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [tab, setTab] = useState<Tab>('beneficiarios');
  const [finYear, setFinYear] = useState(String(now.getFullYear()));
  const [finMonth, setFinMonth] = useState(String(now.getMonth()+1).padStart(2,'0'));
  const [period, setPeriod] = useState<'semana' | 'mes' | 'ano'>('mes');
  const [, setRefreshKey] = useState(0);

  const isConsulta = currentUser?.role === 'consulta';
  const profId = currentUser?.professionalId || currentUser?.name || '';

  const years = useMemo(() => { const s = new Set(finances.map(f => f.year || String(new Date(f.date).getFullYear()))); s.add(String(now.getFullYear())); return [...s].sort(); }, [finances]);

  // Filter consultations for professional
  const relevantConsultations = useMemo(() => isConsulta ? consultations.filter(c => c.professionalId === profId || c.professionalId === currentUser?.name) : consultations, [isConsulta, consultations, profId, currentUser?.name]);

  // Filter consultations by period
  const filterByPeriod = (dateStr: string) => {
    const d = new Date(dateStr);
    if (period === 'semana') { const now2 = new Date(); const weekStart = new Date(now2); weekStart.setDate(now2.getDate() - now2.getDay()); weekStart.setHours(0,0,0,0); const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7); return d >= weekStart && d < weekEnd; }
    if (period === 'mes') { return String(d.getMonth()+1).padStart(2,'0') === finMonth && String(d.getFullYear()) === finYear; }
    return String(d.getFullYear()) === finYear;
  };
  const periodLabel = period === 'semana' ? 'Esta Semana' : period === 'mes' ? `${monthLabels[finMonth]}/${finYear}` : finYear;

  // Faltas with 3+ alert
  const faltasByBen = useMemo(() => {
    const map: Record<string, number> = {};
    relevantConsultations.filter(c => c.attendance === 'falta' && filterByPeriod(c.date)).forEach(c => { map[c.beneficiaryId] = (map[c.beneficiaryId] || 0) + 1; });
    return map;
  }, [relevantConsultations, finYear, finMonth, period]);

  // Finance by month for chart
  const monthlyFinance = useMemo(() => monthsList.map(m => {
    const mf = finances.filter(f => { const y = f.year || String(new Date(f.date).getFullYear()); const mo = f.month || String(new Date(f.date).getMonth()+1).padStart(2,'0'); return y === finYear && mo === m; });
    const income = mf.filter(f => f.type === 'income').reduce((a,c) => a + (c.value||0), 0);
    const expense = mf.filter(f => f.type === 'expense').reduce((a,c) => a + (c.value||0), 0);
    return { month: m, income, expense };
  }), [finances, finYear]);

  const maxFinVal = Math.max(...monthlyFinance.map(m => Math.max(m.income, m.expense)), 1);

  // Falta chart - top faltantes
  const faltaRanking = useMemo(() => Object.entries(faltasByBen).map(([id, count]) => ({ id, name: beneficiaries.find(b => b.id === id)?.fullName || 'N/A', count })).sort((a,b) => b.count - a.count).slice(0, 10), [faltasByBen, beneficiaries]);
  const maxFalta = Math.max(...faltaRanking.map(f => f.count), 1);

  const handlePrint = () => {
    if (!reportRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Relatório</title><style>@page{size:A4 portrait;margin:14mm}body{font-family:sans-serif;padding:20px;color:#111}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:12px}th{background:#f2f2f2}h2{margin-top:20px;color:#333}.bar-container{display:flex;align-items:center;gap:8px;margin-bottom:4px}.bar{height:16px;background:#eab308;border-radius:3px}.bar-red{background:#ef4444}.alert{color:#ef4444;font-weight:bold}</style></head><body>${reportRef.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`);
    win.document.close();
  };

  const tabs: { key: Tab; label: string }[] = isConsulta
    ? [{ key: 'beneficiarios', label: 'Atendimentos' }, { key: 'faltas', label: 'Faltas' }]
    : [{ key: 'financeiro', label: 'Financeiro' }, { key: 'profissionais', label: 'Profissionais' }, { key: 'beneficiarios', label: 'Beneficiários' }, { key: 'faltas', label: 'Faltas' }, { key: 'voluntarios', label: 'Voluntários' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
        <div className="flex gap-2 flex-wrap">
          <select value={period} onChange={e => setPeriod(e.target.value as typeof period)} className="border rounded-md p-2 text-sm"><option value="semana">Semana</option><option value="mes">Mês</option><option value="ano">Ano</option></select>
          {period === 'mes' && <select value={finMonth} onChange={e => setFinMonth(e.target.value)} className="border rounded-md p-2 text-sm">{monthsList.map(m => <option key={m} value={m}>{monthLabels[m]}</option>)}</select>}
          {period !== 'semana' && <select value={finYear} onChange={e => setFinYear(e.target.value)} className="border rounded-md p-2 text-sm">{years.map(y => <option key={y}>{y}</option>)}</select>}
          <button onClick={() => setRefreshKey(k => k + 1)} className="bg-white border text-gray-700 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50 text-sm"><RefreshCw size={16} /> Atualizar</button>
          <button onClick={handlePrint} className="bg-yellow-400 text-gray-950 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-yellow-500 font-semibold text-sm"><Printer size={16} /> Imprimir</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">{tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-gray-950 text-yellow-300' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>{t.label}</button>)}</div>

      <div ref={reportRef} className="bg-white p-6 shadow rounded-xl overflow-x-auto">
        {tab === 'financeiro' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Financeiro - {finYear}</h2>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg grid grid-cols-3 gap-4 text-center">
            <div><p className="text-sm text-gray-500">Receitas</p><p className="text-2xl font-bold text-green-600">R$ {monthlyFinance.reduce((a,c) => a+c.income,0).toFixed(2)}</p></div>
            <div><p className="text-sm text-gray-500">Despesas</p><p className="text-2xl font-bold text-red-600">R$ {monthlyFinance.reduce((a,c) => a+c.expense,0).toFixed(2)}</p></div>
            <div><p className="text-sm text-gray-500">Saldo</p><p className={`text-2xl font-bold ${monthlyFinance.reduce((a,c) => a+c.income-c.expense,0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>R$ {monthlyFinance.reduce((a,c) => a+c.income-c.expense,0).toFixed(2)}</p></div>
          </div>
          <h3 className="font-semibold mb-3">Comparativo Mensal</h3>
          <div className="space-y-2">{monthlyFinance.map(m => <div key={m.month}><p className="text-xs font-medium text-gray-600 mb-1">{monthLabels[m.month]}</p><div className="flex items-center gap-2"><div className="bar" style={{width:`${Math.max((m.income/maxFinVal)*100,1)}%`,height:'14px',background:'#22c55e',borderRadius:'3px',minWidth:'2px'}}></div><span className="text-xs text-green-700">R$ {m.income.toFixed(0)}</span></div><div className="flex items-center gap-2"><div className="bar-red" style={{width:`${Math.max((m.expense/maxFinVal)*100,1)}%`,height:'14px',background:'#ef4444',borderRadius:'3px',minWidth:'2px'}}></div><span className="text-xs text-red-700">R$ {m.expense.toFixed(0)}</span></div></div>)}</div>
        </div>}

        {tab === 'beneficiarios' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">{isConsulta ? 'Meus Atendimentos' : 'Beneficiários'}</h2>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nasc.</th>{!isConsulta && <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inclusão</th>}<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condição/CID</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsável</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">
            {(isConsulta ? beneficiaries.filter(b => relevantConsultations.some(c => c.beneficiaryId === b.id)) : beneficiaries).map(b => <tr key={b.id}><td className="px-3 py-2 text-sm">{b.fullName}</td><td className="px-3 py-2 text-sm text-gray-500">{new Date(b.birthDate).toLocaleDateString()}</td>{!isConsulta && <td className="px-3 py-2 text-sm text-gray-500">{new Date(b.inclusionDate).toLocaleDateString()}</td>}<td className="px-3 py-2 text-sm text-gray-500">{b.diagnosis} / {b.cid}</td><td className="px-3 py-2 text-sm text-gray-500">{b.respName}</td><td className="px-3 py-2 text-sm text-gray-500">{b.respPhone}</td></tr>)}
          </tbody></table>
        </div>}

        {tab === 'faltas' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Faltas - {periodLabel}</h2>
          {faltaRanking.filter(f => f.count >= 3).length > 0 && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-800 font-semibold"><AlertTriangle size={18}/> Alerta: Beneficiários com 3+ faltas no ano</div><ul className="mt-2 text-sm text-red-700 list-disc list-inside">{faltaRanking.filter(f => f.count >= 3).map(f => <li key={f.id}>{f.name} - {f.count} faltas</li>)}</ul></div>}
          <h3 className="font-semibold mb-3">Ranking de Faltas</h3>
          <div className="space-y-2 mb-6">{faltaRanking.map(f => <div key={f.id} className="flex items-center gap-3"><span className="text-sm w-40 truncate">{f.name}</span><div style={{width:`${Math.max((f.count/maxFalta)*100,4)}%`,height:'18px',background: f.count >= 3 ? '#ef4444' : '#eab308',borderRadius:'3px'}}></div><span className="text-sm font-semibold">{f.count}</span></div>)}</div>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{relevantConsultations.filter(c => c.attendance === 'falta' && filterByPeriod(c.date)).map(c => { const ben = beneficiaries.find(b => b.id === c.beneficiaryId); const prof = professionals.find(p => p.id === c.professionalId || p.name === c.professionalId); return <tr key={c.id} className={faltasByBen[c.beneficiaryId] >= 3 ? 'bg-red-50' : ''}><td className="px-3 py-2 text-sm">{new Date(c.date).toLocaleDateString()}</td><td className="px-3 py-2 text-sm">{ben?.fullName || 'N/A'} {faltasByBen[c.beneficiaryId] >= 3 ? '⚠️' : ''}</td><td className="px-3 py-2 text-sm text-gray-500">{prof?.name || currentUser?.name}</td></tr>; })}</tbody></table>
        </div>}

        {tab === 'profissionais' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Profissionais</h2>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vínculo</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{professionals.map(p => <tr key={p.id}><td className="px-3 py-2 text-sm">{p.name}</td><td className="px-3 py-2 text-sm text-gray-500">{p.specialty}</td><td className="px-3 py-2 text-sm text-gray-500">{p.bondType || '-'}</td><td className="px-3 py-2 text-sm text-gray-500">{p.phone}</td></tr>)}</tbody></table>
        </div>}

        {tab === 'voluntarios' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Voluntários</h2>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Função</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{volunteers.map(v => <tr key={v.id}><td className="px-3 py-2 text-sm">{v.name}</td><td className="px-3 py-2 text-sm text-gray-500">{v.function}</td><td className="px-3 py-2 text-sm text-gray-500">{v.phone}</td></tr>)}</tbody></table>
        </div>}
      </div>
    </div>
  );
}
