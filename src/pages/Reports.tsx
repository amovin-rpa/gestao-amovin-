import { useMemo, useRef, useState } from 'react';
import { useStore } from '../store';
import { Printer, AlertTriangle } from 'lucide-react';
import { isThisWeek, parseISO } from 'date-fns';

const ML: Record<string,string> = {'01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun','07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez'};
const MONTHS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

type Tab = 'financeiro' | 'profissionais' | 'beneficiarios' | 'faltas' | 'voluntarios';

export default function Reports() {
  const store = useStore();
  const { beneficiaries, volunteers, professionals, finances } = store;
  // Read consultations fresh each render
  const consultations = useStore(s => s.consultations);
  const currentUser = useStore(s => s.currentUser);

  const reportRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [tab, setTab] = useState<Tab>('beneficiarios');
  const [yr, setYr] = useState(String(now.getFullYear()));
  const [mo, setMo] = useState(String(now.getMonth()+1).padStart(2,'0'));
  const [period, setPeriod] = useState<'semana' | 'mes' | 'ano'>('mes');
  const [key, setKey] = useState(0);

  const isConsulta = currentUser?.role === 'consulta';
  const profId = currentUser?.professionalId || currentUser?.name || '';

  const years = useMemo(() => {
    const s = new Set<string>();
    finances.forEach(f => s.add(f.year || String(new Date(f.date).getFullYear())));
    consultations.forEach(c => s.add(String(new Date(c.date).getFullYear())));
    s.add(String(now.getFullYear()));
    return [...s].sort();
  }, [finances, consultations, key]);

  const matchPeriod = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (period === 'semana') return isThisWeek(d);
      if (period === 'mes') {
        const dm = String(d.getMonth()+1).padStart(2,'0');
        const dy = String(d.getFullYear());
        return dm === mo && dy === yr;
      }
      return String(d.getFullYear()) === yr;
    } catch { return false; }
  };

  const periodLabel = period === 'semana' ? 'Esta Semana' : period === 'mes' ? `${ML[mo]}/${yr}` : yr;

  // Consultations filtered
  const allConsultations = useMemo(() => {
    let list = consultations;
    if (isConsulta) list = list.filter(c => c.professionalId === profId || c.professionalId === currentUser?.name);
    return list.filter(c => matchPeriod(c.date));
  }, [consultations, isConsulta, profId, currentUser?.name, period, yr, mo, key]);

  // Faltas
  const faltasList = useMemo(() => allConsultations.filter(c => c.attendance === 'falta'), [allConsultations]);
  const faltasByBen = useMemo(() => {
    const map: Record<string, number> = {};
    faltasList.forEach(c => { map[c.beneficiaryId] = (map[c.beneficiaryId] || 0) + 1; });
    return map;
  }, [faltasList]);
  const faltaRanking = useMemo(() => Object.entries(faltasByBen).map(([id, count]) => ({ id, name: beneficiaries.find(b => b.id === id)?.fullName || 'N/A', count })).sort((a,b) => b.count - a.count).slice(0, 10), [faltasByBen, beneficiaries]);
  const maxFalta = Math.max(...faltaRanking.map(f => f.count), 1);

  // Finance
  const monthlyFinance = useMemo(() => MONTHS.map(m => {
    const mf = finances.filter(f => {
      const fy = f.year || String(new Date(f.date).getFullYear());
      const fm = f.month || String(new Date(f.date).getMonth()+1).padStart(2,'0');
      return fy === yr && fm === m;
    });
    return { month: m, income: mf.filter(f => f.type === 'income').reduce((a,c) => a + (c.value||0), 0), expense: mf.filter(f => f.type === 'expense').reduce((a,c) => a + (c.value||0), 0) };
  }), [finances, yr, key]);
  const maxFinVal = Math.max(...monthlyFinance.map(m => Math.max(m.income, m.expense)), 1);

  const filteredFinances = useMemo(() => finances.filter(f => matchPeriod(f.date)), [finances, period, yr, mo, key]);
  const fIncome = filteredFinances.filter(f => f.type === 'income').reduce((a,c) => a + (c.value||0), 0);
  const fExpense = filteredFinances.filter(f => f.type === 'expense').reduce((a,c) => a + (c.value||0), 0);

  const handlePrint = () => {
    if (!reportRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<html><head><title>Relatorio</title><meta charset="UTF-8"/><style>@page{size:A4 portrait;margin:14mm}body{font-family:sans-serif;padding:20px;color:#111}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{border:1px solid #ddd;padding:6px;text-align:left;font-size:12px}th{background:#f2f2f2}h2{margin-top:20px;color:#333}.bar{display:inline-block;height:14px;border-radius:3px;min-width:2px}.alert{color:#ef4444;font-weight:bold}.summary{background:#f9f9f9;padding:12px;border:1px solid #ddd;margin-bottom:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center}</style></head><body>' + reportRef.current.innerHTML + '<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>');
    win.document.close();
  };

  const tabs: { key: Tab; label: string }[] = isConsulta
    ? [{ key: 'beneficiarios', label: 'Atendimentos' }, { key: 'faltas', label: 'Faltas' }]
    : [{ key: 'financeiro', label: 'Financeiro' }, { key: 'profissionais', label: 'Profissionais' }, { key: 'beneficiarios', label: 'Beneficiarios' }, { key: 'faltas', label: 'Faltas' }, { key: 'voluntarios', label: 'Voluntarios' }];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Relatorios</h1>
        <div className="flex gap-2 flex-wrap">
          <select value={period} onChange={e => setPeriod(e.target.value as typeof period)} className="border rounded-md p-2 text-sm">
            <option value="semana">Semana</option><option value="mes">Mes</option><option value="ano">Ano</option>
          </select>
          {period === 'mes' && <select value={mo} onChange={e => setMo(e.target.value)} className="border rounded-md p-2 text-sm">{MONTHS.map(m => <option key={m} value={m}>{ML[m]}</option>)}</select>}
          {period !== 'semana' && <select value={yr} onChange={e => setYr(e.target.value)} className="border rounded-md p-2 text-sm">{years.map(y => <option key={y}>{y}</option>)}</select>}
          <button onClick={() => setKey(k => k + 1)} className="bg-white border text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-50">Atualizar</button>
          <button onClick={handlePrint} className="bg-yellow-400 text-gray-950 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-yellow-500 font-semibold text-sm"><Printer size={16} /> Imprimir</button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">{tabs.map(t => <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-gray-950 text-yellow-300' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>{t.label}</button>)}</div>

      <div ref={reportRef} className="bg-white p-6 shadow rounded-xl overflow-x-auto">
        {tab === 'financeiro' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Financeiro - {periodLabel}</h2>
          <div className="summary bg-gray-50 p-4 rounded-lg border mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', textAlign: 'center' }}>
            <div><p className="text-sm text-gray-500">Receitas</p><p className="text-2xl font-bold text-green-600">R$ {fIncome.toFixed(2)}</p></div>
            <div><p className="text-sm text-gray-500">Despesas</p><p className="text-2xl font-bold text-red-600">R$ {fExpense.toFixed(2)}</p></div>
            <div><p className="text-sm text-gray-500">Saldo</p><p className={`text-2xl font-bold ${(fIncome-fExpense)>=0?'text-blue-600':'text-red-600'}`}>R$ {(fIncome-fExpense).toFixed(2)}</p></div>
          </div>
          {period !== 'semana' && <><h3 className="font-semibold mb-3">Comparativo Mensal - {yr}</h3><div className="space-y-2 mb-6">{monthlyFinance.map(m=><div key={m.month}><p className="text-xs font-medium text-gray-600 mb-1">{ML[m.month]}</p><div className="flex items-center gap-2"><span className="bar" style={{width:`${Math.max((m.income/maxFinVal)*100,1)}%`,background:'#22c55e'}}>&nbsp;</span><span className="text-xs text-green-700">R$ {m.income.toFixed(0)}</span></div><div className="flex items-center gap-2"><span className="bar" style={{width:`${Math.max((m.expense/maxFinVal)*100,1)}%`,background:'#ef4444'}}>&nbsp;</span><span className="text-xs text-red-700">R$ {m.expense.toFixed(0)}</span></div></div>)}</div></>}
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descricao</th><th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredFinances.map(f=><tr key={f.id}><td className="px-3 py-2 text-sm">{new Date(f.date).toLocaleDateString()}</td><td className="px-3 py-2 text-sm">{f.type==='income'?'Receita':'Despesa'}</td><td className="px-3 py-2 text-sm text-gray-500">{f.category}</td><td className="px-3 py-2 text-sm text-gray-500">{f.description||'-'}</td><td className={`px-3 py-2 text-sm text-right font-semibold ${f.type==='income'?'text-green-600':'text-red-600'}`}>{f.type==='income'?'+':'-'} R$ {(f.value||0).toFixed(2)}</td></tr>)}</tbody></table>
        </div>}

        {tab === 'beneficiarios' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">{isConsulta ? 'Meus Atendimentos' : 'Beneficiarios'} - {periodLabel}</h2>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nasc.</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Condicao/CID</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Responsavel</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th></tr></thead><tbody className="divide-y divide-gray-200">
            {(isConsulta ? beneficiaries.filter(b => allConsultations.some(c => c.beneficiaryId === b.id)) : beneficiaries).map(b => <tr key={b.id}><td className="px-3 py-2 text-sm">{b.fullName}</td><td className="px-3 py-2 text-sm text-gray-500">{b.birthDate ? new Date(b.birthDate).toLocaleDateString() : '-'}</td><td className="px-3 py-2 text-sm text-gray-500">{b.diagnosis} / {b.cid}</td><td className="px-3 py-2 text-sm text-gray-500">{b.respName}</td><td className="px-3 py-2 text-sm text-gray-500">{b.respPhone}</td></tr>)}
          </tbody></table>
        </div>}

        {tab === 'faltas' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Faltas - {periodLabel}</h2>
          {faltaRanking.filter(f=>f.count>=3).length>0 && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"><div className="flex items-center gap-2 text-red-800 font-semibold"><AlertTriangle size={18}/> Alerta: Beneficiarios com 3+ faltas</div><ul className="mt-2 text-sm text-red-700 list-disc list-inside">{faltaRanking.filter(f=>f.count>=3).map(f=><li key={f.id}>{f.name} - {f.count} faltas</li>)}</ul></div>}
          <h3 className="font-semibold mb-3">Ranking de Faltas</h3>
          <div className="space-y-2 mb-6">{faltaRanking.map(f=><div key={f.id} className="flex items-center gap-3"><span className="text-sm w-40 truncate">{f.name}</span><span className="bar" style={{width:`${Math.max((f.count/maxFalta)*100,4)}%`,height:'18px',background:f.count>=3?'#ef4444':'#eab308',borderRadius:'3px',display:'inline-block'}}>&nbsp;</span><span className="text-sm font-semibold">{f.count}</span></div>)}</div>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profissional</th></tr></thead><tbody className="divide-y divide-gray-200">{faltasList.map(c=>{ const ben=beneficiaries.find(b=>b.id===c.beneficiaryId); const prof=professionals.find(p=>p.id===c.professionalId||p.name===c.professionalId); return <tr key={c.id} className={faltasByBen[c.beneficiaryId]>=3?'bg-red-50':''}><td className="px-3 py-2 text-sm">{new Date(c.date).toLocaleDateString()}</td><td className="px-3 py-2 text-sm">{ben?.fullName||'N/A'} {faltasByBen[c.beneficiaryId]>=3?'!!!':''}</td><td className="px-3 py-2 text-sm text-gray-500">{prof?.name||currentUser?.name}</td></tr>; })}</tbody></table>
        </div>}

        {tab === 'profissionais' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Profissionais</h2>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Especialidade</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vinculo</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th></tr></thead><tbody className="divide-y divide-gray-200">{professionals.map(p=><tr key={p.id}><td className="px-3 py-2 text-sm">{p.name}</td><td className="px-3 py-2 text-sm text-gray-500">{p.specialty}</td><td className="px-3 py-2 text-sm text-gray-500">{p.bondType||'-'}</td><td className="px-3 py-2 text-sm text-gray-500">{p.phone}</td></tr>)}</tbody></table>
        </div>}

        {tab === 'voluntarios' && <div>
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Voluntarios</h2>
          <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Funcao</th><th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th></tr></thead><tbody className="divide-y divide-gray-200">{volunteers.map(v=><tr key={v.id}><td className="px-3 py-2 text-sm">{v.name}</td><td className="px-3 py-2 text-sm text-gray-500">{v.function}</td><td className="px-3 py-2 text-sm text-gray-500">{v.phone}</td></tr>)}</tbody></table>
        </div>}
      </div>
    </div>
  );
}
