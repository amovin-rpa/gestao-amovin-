import { useRef, useState, useEffect } from 'react';
import { Beneficiary, Professional, useStore } from '../store';
import { Printer, X, FileText, ClipboardCheck, Stethoscope } from 'lucide-react';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';

// FUNÇÃO QUE CORRIGE A DATA (evita problema de fuso horário)
function formatDateBR(dateString?: string): string {
  if (!dateString) return '________________';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return '________________';
  return `${day}/${month}/${year}`;
}

// Calcula idade a partir da data de nascimento
function calculateAge(dateString?: string): string {
  if (!dateString) return '';
  try {
    const birthDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 0 ? `${age} ano${age !== 1 ? 's' : ''}` : '';
  } catch { return ''; }
}

type TermType = 'adesao' | 'consentimento' | 'avaliacao_fisio' | null;

export default function TermModal({ beneficiary, onClose }: { beneficiary: Beneficiary; onClose: () => void }) {
  const { professionals } = useStore();
  
  const [selectedTerm, setSelectedTerm] = useState<TermType>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  
  const [professionalData, setProfessionalData] = useState({
    name: '',
    specialty: '',
    council: '',
    registration: '',
  });
  
  const [localDate, setLocalDate] = useState({
    city: 'Rio Paranaíba',
    day: new Date().getDate(),
    month: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
    year: new Date().getFullYear(),
  });
  
  const [avaliacaoData, setAvaliacaoData] = useState({
    peso: '',
    altura: '',
    naturalidade: '',
    diagnostico: '',
    queixaPrincipal: '',
    hmpHma: '',
    medicamentos: '',
    restricaoAlimentar: 'Não',
    restricaoDetalhes: '',
    habitosVida: '',
    tratamentosRealizados: '',
    cirurgias: 'Não',
    cirurgiasDetalhes: '',
    exames: '',
    convulsoes: 'Não',
    convulsoesFreq: '',
    constipacao: 'Não',
    sono: 'Bom',
    alimentacao: '',
    liquidos: '',
    higiene: 'Dependente',
    inspecao: '',
    forcaMuscular: '',
    equilibrio: '',
    postura: '',
    reflexos: '',
    palpacao: '',
    admMmss: '',
    admMmii: '',
    padroesMovimento: '',
    sustentaCabeca: '',
    rolarLateral: '',
    rolarVentral: '',
    sentar: '',
    arrastar: '',
    mobilidades: '',
    transferencias: '',
    independenciaFuncional: '',
    diagnosticoFisio: '',
    objetivos: '',
    planoTratamento: '',
    cadeiraRodas: false,
    muletasAxilar: false,
    muletaCanadense: false,
    bengala: false,
    andador: false,
    outrosDispositivos: '',
    sexoF: false,
    sexoM: false,
  });
  
  const ref = useRef<HTMLDivElement>(null);
  
  // ✅ ESTILOS CORRIGIDOS: Campos automáticos como span, sem linha, espaçamento compacto
  const styles = `@page{size:A4 portrait;margin:10mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.4;font-size:13px}.sheet{max-width:790px;margin:0 auto;padding:15px}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:12px}.brand-logo{width:190px;height:60px;object-fit:contain}.org{text-align:right;font-size:11px;line-height:1.3}.title{text-align:center;font-weight:700;font-size:15px;margin:12px 0;text-transform:uppercase;letter-spacing:0.5px}.subtitle{font-weight:bold;margin:12px 0 6px 0;text-decoration:underline;font-size:13px}.field-row{display:flex;gap:10px;margin:4px 0;align-items:center;flex-wrap:wrap}.field-label{font-weight:bold;min-width:145px;font-size:13px;white-space:nowrap}.field-value{font-weight:bold;font-size:13px;padding:2px 4px}.checkbox-group{display:flex;gap:12px;margin:4px 0;flex-wrap:wrap;align-items:center;font-size:13px}.checkbox-item{display:flex;align-items:center;gap:4px}.form-input{width:100%;border:none;border-bottom:1px solid #444;font-size:13px;font-family:Arial,sans-serif;padding:6px 4px;background:transparent;resize:vertical;min-height:36px;line-height:1.3;box-sizing:border-box}.form-input:focus{outline:none;border-bottom:1px solid #2563eb}.signature{margin-top:30px;text-align:center}.line{width:400px;border-top:1px solid #111;margin:25px auto 6px auto}.page-break{page-break-before:always}@media print{.form-input{border-bottom:1px solid #111!important}}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !ref.current) return;
    win.document.write(`<html><head><title>Ficha de Avaliação</title><meta charset="UTF-8"/><style>${styles}</style></head><body>${ref.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`);
    win.document.close();
  };

  // Formata CPF
  const formatCPF = (cpf: string): string => {
    if (!cpf) return '________________';
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // ✅ Quando selecionar um profissional, preencher os dados automaticamente
  useEffect(() => {
    if (selectedProfessionalId && professionals) {
      const prof = professionals.find(p => p.id === selectedProfessionalId);
      if (prof) {
        setProfessionalData({
          name: prof.name || '',
          specialty: prof.specialty || '',
          council: (prof as any).registrationCouncil || '',
          registration: prof.registration || '',
        });
      }
    }
  }, [selectedProfessionalId, professionals]);

  // ✅ TELA 1: MENU DE SELEÇÃO
  if (!selectedTerm) {
    return (
      <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto flex items-center justify-center">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="text-blue-600" /> Selecionar Documento</h2>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50"><X size={20} /></button>
          </div>
          <div className="p-6 space-y-4">
            <button onClick={() => setSelectedTerm('adesao')} className="w-full text-left p-5 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center gap-4 group"><div className="p-3 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform"><FileText className="text-blue-600" size={28} /></div><div><div className="font-bold text-gray-800 text-lg">Termo de Adesão e Compromisso</div><div className="text-sm text-gray-500">Termo padrão de participação nas atividades da associação</div></div></button>
            <button onClick={() => setSelectedTerm('consentimento')} className="w-full text-left p-5 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all flex items-center gap-4 group"><div className="p-3 bg-green-100 rounded-lg group-hover:scale-110 transition-transform"><ClipboardCheck className="text-green-600" size={28} /></div><div><div className="font-bold text-gray-800 text-lg">Termo de Consentimento Livre e Esclarecido</div><div className="text-sm text-gray-500">Autorização para tratamento fisioterapêutico</div></div></button>
            <button onClick={() => setSelectedTerm('avaliacao_fisio')} className="w-full text-left p-5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center gap-4 group"><div className="p-3 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform"><Stethoscope className="text-purple-600" size={28} /></div><div><div className="font-bold text-gray-800 text-lg">Ficha de Avaliação Fisioterapêutica Pediátrica</div><div className="text-sm text-gray-500">Avaliação clínica e funcional do paciente pediátrico</div></div></button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ TELA 2: TERMO DE CONSENTIMENTO (TCLE)
  if (selectedTerm === 'consentimento') {
    const respName = beneficiary.respName || '_________________________';
    const respCpf = formatCPF(beneficiary.respCpf || '');
    const respAddress = beneficiary.respAddress || '_________________________';
    const profName = professionalData.name || '_________________________';
    const profSpecialty = professionalData.specialty || '_________________________';
    const profCouncil = professionalData.council || '_________________________';
    const profRegistration = professionalData.registration || '_________________________';
    const { day, month, year } = localDate;
    const monthCap = month.charAt(0).toUpperCase() + month.slice(1);

    return (
      <div className="fixed inset-0 z-[60] bg-gray-900/70 p-2 overflow-y-auto">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardCheck className="text-green-600" /> Termo de Consentimento Livre e Esclarecido</h2>
            <div className="flex gap-2">
              <button onClick={() => setSelectedTerm(null)} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">← Voltar</button>
              <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2 bg-green-600 text-white hover:bg-green-700"><Printer size={16} /> {S.imprimir}</button>
              <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50"><X size={18} /></button>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-80 p-5 border-r bg-gray-50 overflow-y-auto max-h-[calc(100vh-100px)]">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ClipboardCheck className="text-green-600" size={20} /> Dados do Termo</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Profissional *</label>
                  <select value={selectedProfessionalId} onChange={(e) => setSelectedProfessionalId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                    <option value="">Selecione um profissional...</option>
                    {professionals?.map(prof => (<option key={prof.id} value={prof.id}>{prof.name} - {prof.specialty}</option>))}
                  </select>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-3">
                  <div><label className="block text-xs font-semibold text-gray-600">Nome</label><p className="text-sm text-gray-800 font-medium">{professionalData.name || '—'}</p></div>
                  <div><label className="block text-xs font-semibold text-gray-600">Especialidade</label><p className="text-sm text-gray-800 font-medium">{professionalData.specialty || '—'}</p></div>
                  <div><label className="block text-xs font-semibold text-gray-600">Conselho/UF</label><p className="text-sm text-gray-800 font-medium">{professionalData.council || '—'}</p></div>
                  <div><label className="block text-xs font-semibold text-gray-600">Nº do Registro</label><p className="text-sm text-gray-800 font-medium">{professionalData.registration || '—'}</p></div>
                </div>
                <div className="pt-4 border-t"><label className="block text-xs font-semibold text-gray-700 mb-2">Data</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="block text-[10px] text-gray-500">Dia</label><input type="number" min="1" max="31" value={day} onChange={(e) => setLocalDate(prev => ({ ...prev, day: parseInt(e.target.value) || 1 }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                    <div><label className="block text-[10px] text-gray-500">Mês</label><input type="text" value={monthCap} onChange={(e) => setLocalDate(prev => ({ ...prev, month: e.target.value }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                    <div><label className="block text-[10px] text-gray-500">Ano</label><input type="number" value={year} onChange={(e) => setLocalDate(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                  </div>
                </div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Cidade</label><input type="text" value={localDate.city} onChange={(e) => setLocalDate(prev => ({ ...prev, city: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
              <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto shadow-lg" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" /><div className="org"><strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br />CNPJ: 55.880.046/0001-34<br />INSTAGRAM: @amovin_rpa<br />EMAIL: contato@amovin.org.br<br />WHATSAPP: (34) 99821-0513</div></div>
                <div className="title">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)</div>
                <p className="subtitle">IDENTIFICAÇÃO DO RESPONSÁVEL LEGAL</p>
                <p>Eu, <strong>{respName}</strong>, portadora(o) do CPF: <strong>{respCpf}</strong>, residente na <strong>{respAddress}</strong>.</p>
                <p className="subtitle">IDENTIFICAÇÃO DO PROFISSIONAL</p>
                <p>Declaro que fui previamente informado(a) pelo(a) profissional <strong>{profName}</strong>, inscrito(a) no Conselho de Classe <strong>{profCouncil}</strong> sob o nº <strong>{profRegistration}</strong>, acerca do estado de saúde funcional e/ou necessidades de desenvolvimento do menor abaixo identificado.</p>
                <p className="subtitle">CONSENTIMENTO E ESCLARECIMENTOS</p>
                <p>Declaro, estando em pleno gozo de minhas faculdades mentais, que recebi do profissional acima citado todos os esclarecimentos necessários no que se refere ao diagnóstico, plano de intervenção e/ou objetivos da assistência para o tratamento ao qual o menor <strong>{beneficiary.fullName || '________________'}</strong> será submetido.</p>
                <p>Confirmo que o profissional cumpriu com o dever de informação, conforme preconizado pelos códigos de ética de sua respectiva categoria profissional e pela legislação vigente, garantindo a transparência sobre:</p>
                <ul><li>A finalidade e a natureza do tratamento/intervenção;</li><li>Os benefícios esperados e os riscos eventuais;</li><li>Possíveis efeitos colaterais, intercorrências ou limitações do método aplicado.</li></ul>
                <p className="subtitle">AUTORIZAÇÃO</p>
                <p>Estou ciente de que posso, a qualquer momento, solicitar novos esclarecimentos, bem como interromper o tratamento, mediante comunicação prévia ao profissional. Diante do exposto, dou meu livre consentimento para o início e continuidade da assistência proposta.</p>
                <p style={{ marginTop: '20px', textAlign: 'right' }}>{localDate.city}, {day} de {monthCap} de {year}.</p>
                <div className="signature"><div className="line"></div><div style={{ fontWeight: 'bold', fontSize: '12px' }}>{respName}</div><div style={{ fontSize: '11px', color: '#555' }}>CPF: {respCpf}</div></div>
                <div className="signature"><div className="line"></div><div style={{ fontWeight: 'bold', fontSize: '12px' }}>{profName}</div><div style={{ fontSize: '11px', color: '#555' }}>{profSpecialty} – {profCouncil}: {profRegistration}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ TELA 3: FICHA DE AVALIAÇÃO FISIOTERAPÊUTICA PEDIÁTRICA (CORRIGIDA PARA IMPRESSÃO)
  if (selectedTerm === 'avaliacao_fisio') {
    const { day, month, year } = localDate;
    const monthCap = month.charAt(0).toUpperCase() + month.slice(1);
    const birthDate = beneficiary.birthDate ? formatDateBR(beneficiary.birthDate) : '___/___/____';
    const age = calculateAge(beneficiary.birthDate);
    const profName = professionalData.name || '_________________________';
    const profSpecialty = professionalData.specialty || '_________________________';
    const profCouncil = professionalData.council || '_________________________';
    const profRegistration = professionalData.registration || '_________________________';

    return (
      <div className="fixed inset-0 z-[60] bg-gray-900/70 p-2 overflow-y-auto">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2"><Stethoscope className="text-purple-600" /> Ficha de Avaliação Fisioterapêutica Pediátrica</h2>
            <div className="flex gap-2">
              <button onClick={() => setSelectedTerm(null)} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">← Voltar</button>
              <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2 bg-purple-600 text-white hover:bg-purple-700"><Printer size={16} /> {S.imprimir}</button>
              <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50"><X size={18} /></button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Painel lateral - Dados e preenchimento rápido */}
            <div className="w-full lg:w-80 p-5 border-r bg-gray-50 overflow-y-auto max-h-[calc(100vh-100px)]">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Stethoscope className="text-purple-600" size={20} /> Dados da Avaliação</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Fisioterapeuta *</label>
                  <select value={selectedProfessionalId} onChange={(e) => setSelectedProfessionalId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                    <option value="">Selecione um profissional...</option>
                    {professionals?.map(prof => (<option key={prof.id} value={prof.id}>{prof.name} - {prof.specialty}</option>))}
                  </select>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Profissional:</p>
                  <p className="text-sm text-gray-800">{professionalData.name || '—'}</p>
                  <p className="text-xs text-gray-500">{professionalData.specialty} – {professionalData.council}: {professionalData.registration}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Paciente:</p>
                  <p className="text-sm text-gray-800">{beneficiary.fullName || '—'}</p>
                  <p className="text-xs text-gray-500">Nasc: {birthDate} | Idade: {age}</p>
                </div>
                <div className="pt-2 border-t"><label className="block text-xs font-semibold text-gray-700 mb-2">Data da Avaliação</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="block text-[10px] text-gray-500">Dia</label><input type="number" min="1" max="31" value={day} onChange={(e) => setLocalDate(prev => ({ ...prev, day: parseInt(e.target.value) || 1 }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                    <div><label className="block text-[10px] text-gray-500">Mês</label><input type="text" value={monthCap} onChange={(e) => setLocalDate(prev => ({ ...prev, month: e.target.value }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                    <div><label className="block text-[10px] text-gray-500">Ano</label><input type="number" value={year} onChange={(e) => setLocalDate(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800"><strong>💡 Dica:</strong> Preencha os campos diretamente na ficha ao lado. Tudo será salvo e impresso automaticamente.</div>
            </div>

            {/* Área da ficha para impressão e edição */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
              <div ref={ref} className="sheet bg-white p-6 w-[790px] mx-auto shadow-lg">
                
                {/* Header */}
                <div className="header">
                  <img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" />
                  <div className="org"><strong>AMOVIN – Associação e Movimento pela Inclusão em Rio Paranaíba/MG</strong><br />CNPJ: 55.880.046/0001-34<br />INSTAGRAM: @amovin_rpa | EMAIL: contato@amovin.org.br<br />WHATSAPP: (34) 99821-0513</div>
                </div>

                {/* TÍTULO E DADOS DA PROFISSIONAL LOGO ABAIXO */}
                <div className="title">FICHA DE AVALIAÇÃO FISIOTERAPÊUTICA PEDIÁTRICA</div>
                <p style={{ textAlign: 'center', marginBottom: '12px', fontSize: '13px' }}>
                  <strong>{profName}</strong> – {profSpecialty}<br />
                  {profCouncil}/{profRegistration}
                </p>

                {/* IDENTIFICAÇÃO DO PACIENTE */}
                <p className="subtitle">IDENTIFICAÇÃO DO PACIENTE</p>
                
                {/* ✅ CAMPOS AUTOMÁTICOS USANDO <span> - Sem linha, compacto, ao lado da label */}
                <div className="field-row">
                  <span className="field-label">NOME:</span>
                  <span className="field-value">{beneficiary.fullName || '___________________________'}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">DATA DE NASCIMENTO:</span>
                  <span className="field-value">{birthDate}</span>
                  <span className="field-label" style={{ minWidth: '65px' }}>SEXO:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.sexoF} onChange={() => setAvaliacaoData(p => ({ ...p, sexoF: true, sexoM: false }))} /> F</label>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.sexoM} onChange={() => setAvaliacaoData(p => ({ ...p, sexoM: true, sexoF: false }))} /> M</label>
                  </div>
                  <span className="field-label" style={{ minWidth: '55px' }}>IDADE:</span>
                  <span className="field-value">{age}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">PESO (kg):</span>
                  <input className="form-input" style={{ maxWidth: '110px' }} value={avaliacaoData.peso} onChange={e => setAvaliacaoData(p => ({ ...p, peso: e.target.value }))} />
                  <span className="field-label" style={{ minWidth: '75px' }}>ALTURA (cm):</span>
                  <input className="form-input" style={{ maxWidth: '110px' }} value={avaliacaoData.altura} onChange={e => setAvaliacaoData(p => ({ ...p, altura: e.target.value }))} />
                  <span className="field-label" style={{ minWidth: '105px' }}>NATURALIDADE:</span>
                  <input className="form-input" value={avaliacaoData.naturalidade} onChange={e => setAvaliacaoData(p => ({ ...p, naturalidade: e.target.value }))} />
                </div>
                
                <div className="field-row">
                  <span className="field-label">NOME DO RESPONSÁVEL:</span>
                  <span className="field-value">{beneficiary.respName || '___________________________'}</span>
                  <span className="field-label" style={{ minWidth: '85px' }}>CELULAR:</span>
                  <span className="field-value">{beneficiary.respPhone || '__________'}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">ENDEREÇO:</span>
                  <span className="field-value">{beneficiary.respAddress || '_______________________________________________________________'}</span>
                </div>
                
                <div className="field-row">
                  <span className="field-label">DIAGNÓSTICO CLÍNICO:</span>
                  <input className="form-input" value={avaliacaoData.diagnostico} onChange={e => setAvaliacaoData(p => ({ ...p, diagnostico: e.target.value }))} />
                </div>
                
                <div className="field-row">
                  <span className="field-label">DATA DA AVALIAÇÃO:</span>
                  <span className="field-value" style={{ maxWidth: '150px' }}>{day} de {monthCap} de {year}</span>
                </div>
                
                <p className="field-row" style={{ marginTop: '6px' }}>
                  <span className="field-label">DISPOSITIVOS AUXILIARES:</span>
                  <div className="checkbox-group" style={{ marginLeft: '150px', flexWrap: 'wrap' }}>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.cadeiraRodas} onChange={e => setAvaliacaoData(p => ({ ...p, cadeiraRodas: e.target.checked }))} /> CADEIRA DE RODAS</label>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.muletasAxilar} onChange={e => setAvaliacaoData(p => ({ ...p, muletasAxilar: e.target.checked }))} /> MULETAS AXILAR</label>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.muletaCanadense} onChange={e => setAvaliacaoData(p => ({ ...p, muletaCanadense: e.target.checked }))} /> MULETA CANADENSE</label>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.bengala} onChange={e => setAvaliacaoData(p => ({ ...p, bengala: e.target.checked }))} /> BENGALA</label>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.andador} onChange={e => setAvaliacaoData(p => ({ ...p, andador: e.target.checked }))} /> ANDADOR</label>
                    <label className="checkbox-item">OUTROS: <input className="form-input" style={{ width: '140px', minWidth: '140px', margin: '0 4px' }} value={avaliacaoData.outrosDispositivos} onChange={e => setAvaliacaoData(p => ({ ...p, outrosDispositivos: e.target.value }))} /></label>
                  </div>
                </p>

                {/* HISTÓRIA CLÍNICA */}
                <p className="subtitle">HISTÓRIA CLÍNICA</p>
                <p className="field-row"><span className="field-label">QUEIXA PRINCIPAL:</span><textarea className="form-input" rows={2} value={avaliacaoData.queixaPrincipal} onChange={e => setAvaliacaoData(p => ({ ...p, queixaPrincipal: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>HMP/HMA:</span><textarea className="form-input" rows={3} value={avaliacaoData.hmpHma} onChange={e => setAvaliacaoData(p => ({ ...p, hmpHma: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label">MEDICAMENTOS EM USO:</span><textarea className="form-input" rows={2} value={avaliacaoData.medicamentos} onChange={e => setAvaliacaoData(p => ({ ...p, medicamentos: e.target.value }))} /></p>
                <p className="field-row">
                  <span className="field-label">RESTRIÇÃO ALIMENTAR:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="restricao" checked={avaliacaoData.restricaoAlimentar === 'Sim'} onChange={() => setAvaliacaoData(p => ({ ...p, restricaoAlimentar: 'Sim' }))} /> SIM</label>
                    <label className="checkbox-item"><input type="radio" name="restricao" checked={avaliacaoData.restricaoAlimentar === 'Não'} onChange={() => setAvaliacaoData(p => ({ ...p, restricaoAlimentar: 'Não' }))} /> NÃO</label>
                  </div> 
                  QUAIS: <input className="form-input" style={{ width: '240px', minWidth: '240px', margin: '0 6px' }} value={avaliacaoData.restricaoDetalhes} onChange={e => setAvaliacaoData(p => ({ ...p, restricaoDetalhes: e.target.value }))} />
                </p>
                <p className="field-row"><span className="field-label">HÁBITOS DE VIDA:</span><textarea className="form-input" rows={2} value={avaliacaoData.habitosVida} onChange={e => setAvaliacaoData(p => ({ ...p, habitosVida: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label">TRATAMENTOS REALIZADOS:</span><textarea className="form-input" rows={2} value={avaliacaoData.tratamentosRealizados} onChange={e => setAvaliacaoData(p => ({ ...p, tratamentosRealizados: e.target.value }))} /></p>
                <p className="field-row">
                  <span className="field-label">CIRURGIAS:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="cirurgias" checked={avaliacaoData.cirurgias === 'Não'} onChange={() => setAvaliacaoData(p => ({ ...p, cirurgias: 'Não' }))} /> NÃO</label>
                    <label className="checkbox-item"><input type="radio" name="cirurgias" checked={avaliacaoData.cirurgias === 'Sim'} onChange={() => setAvaliacaoData(p => ({ ...p, cirurgias: 'Sim' }))} /> SIM</label>
                  </div> 
                  QUAL: <input className="form-input" style={{ width: '240px', minWidth: '240px', margin: '0 6px' }} value={avaliacaoData.cirurgiasDetalhes} onChange={e => setAvaliacaoData(p => ({ ...p, cirurgiasDetalhes: e.target.value }))} />
                </p>
                <p className="field-row"><span className="field-label">RESULTADO DE EXAMES:</span><textarea className="form-input" rows={2} value={avaliacaoData.exames} onChange={e => setAvaliacaoData(p => ({ ...p, exames: e.target.value }))} /></p>

                {/* SAÚDE GERAL DA CRIANÇA */}
                <p className="subtitle">SAÚDE GERAL DA CRIANÇA</p>
                <p className="field-row">
                  <span className="field-label">CONVULSÕES:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="conv" checked={avaliacaoData.convulsoes === 'Sim'} onChange={() => setAvaliacaoData(p => ({ ...p, convulsoes: 'Sim' }))} /> SIM</label>
                    <label className="checkbox-item"><input type="radio" name="conv" checked={avaliacaoData.convulsoes === 'Não'} onChange={() => setAvaliacaoData(p => ({ ...p, convulsoes: 'Não' }))} /> NÃO</label>
                  </div> 
                  FREQUÊNCIA: <input className="form-input" style={{ width: '190px', minWidth: '190px', margin: '0 6px' }} value={avaliacaoData.convulsoesFreq} onChange={e => setAvaliacaoData(p => ({ ...p, convulsoesFreq: e.target.value }))} />
                </p>
                <p className="field-row">
                  <span className="field-label">CONSTIPAÇÃO:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="constip" checked={avaliacaoData.constipacao === 'Sim'} onChange={() => setAvaliacaoData(p => ({ ...p, constipacao: 'Sim' }))} /> SIM</label>
                    <label className="checkbox-item"><input type="radio" name="constip" checked={avaliacaoData.constipacao === 'Não'} onChange={() => setAvaliacaoData(p => ({ ...p, constipacao: 'Não' }))} /> NÃO</label>
                  </div>
                </p>
                <p className="field-row">
                  <span className="field-label">SONO:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="sono" checked={avaliacaoData.sono === 'Bom'} onChange={() => setAvaliacaoData(p => ({ ...p, sono: 'Bom' }))} /> BOM</label>
                    <label className="checkbox-item"><input type="radio" name="sono" checked={avaliacaoData.sono === 'Ruim'} onChange={() => setAvaliacaoData(p => ({ ...p, sono: 'Ruim' }))} /> RUIM</label>
                  </div>
                </p>
                <p className="field-row">
                  <span className="field-label">ALIMENTAÇÃO:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Pastoso'} onChange={() => setAvaliacaoData(p => ({ ...p, alimentacao: 'Pastoso' }))} /> PASTOSO</label>
                    <label className="checkbox-item"><input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Líquido'} onChange={() => setAvaliacaoData(p => ({ ...p, alimentacao: 'Líquido' }))} /> LÍQUIDO</label>
                    <label className="checkbox-item"><input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Auxiliado'} onChange={() => setAvaliacaoData(p => ({ ...p, alimentacao: 'Auxiliado' }))} /> AUXILIADO</label>
                    <label className="checkbox-item"><input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Independente'} onChange={() => setAvaliacaoData(p => ({ ...p, alimentacao: 'Independente' }))} /> INDEPENDENTE</label>
                  </div>
                </p>
                <p className="field-row">
                  <span className="field-label">LÍQUIDOS:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Mamadeira'} onChange={() => setAvaliacaoData(p => ({ ...p, liquidos: 'Mamadeira' }))} /> MAMADEIRA</label>
                    <label className="checkbox-item"><input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Copo'} onChange={() => setAvaliacaoData(p => ({ ...p, liquidos: 'Copo' }))} /> COPO</label>
                    <label className="checkbox-item"><input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Auxiliado'} onChange={() => setAvaliacaoData(p => ({ ...p, liquidos: 'Auxiliado' }))} /> AUXILIADO</label>
                    <label className="checkbox-item"><input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Independente'} onChange={() => setAvaliacaoData(p => ({ ...p, liquidos: 'Independente' }))} /> INDEPENDENTE</label>
                  </div>
                </p>
                <p className="field-row">
                  <span className="field-label">HIGIENE:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="hig" checked={avaliacaoData.higiene === 'Dependente'} onChange={() => setAvaliacaoData(p => ({ ...p, higiene: 'Dependente' }))} /> DEPENDENTE</label>
                    <label className="checkbox-item"><input type="radio" name="hig" checked={avaliacaoData.higiene === 'Independente'} onChange={() => setAvaliacaoData(p => ({ ...p, higiene: 'Independente' }))} /> INDEPENDENTE</label>
                  </div>
                </p>

                {/* EXAME FÍSICO */}
                <p className="subtitle">EXAME FÍSICO</p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>INSPEÇÃO:</span><textarea className="form-input" rows={3} value={avaliacaoData.inspecao} onChange={e => setAvaliacaoData(p => ({ ...p, inspecao: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>FORÇA MUSCULAR:</span><textarea className="form-input" rows={2} value={avaliacaoData.forcaMuscular} onChange={e => setAvaliacaoData(p => ({ ...p, forcaMuscular: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>EQUILÍBRIO:</span><textarea className="form-input" rows={2} value={avaliacaoData.equilibrio} onChange={e => setAvaliacaoData(p => ({ ...p, equilibrio: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>POSTURA:</span><textarea className="form-input" rows={2} value={avaliacaoData.postura} onChange={e => setAvaliacaoData(p => ({ ...p, postura: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>REFLEXOS:</span><textarea className="form-input" rows={2} value={avaliacaoData.reflexos} onChange={e => setAvaliacaoData(p => ({ ...p, reflexos: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>PALPAÇÃO:</span><textarea className="form-input" rows={2} value={avaliacaoData.palpacao} onChange={e => setAvaliacaoData(p => ({ ...p, palpacao: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label">ADM MMSS:</span><textarea className="form-input" rows={2} value={avaliacaoData.admMmss} onChange={e => setAvaliacaoData(p => ({ ...p, admMmss: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label">ADM MMII:</span><textarea className="form-input" rows={2} value={avaliacaoData.admMmii} onChange={e => setAvaliacaoData(p => ({ ...p, admMmii: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>PADRÕES DE MOVIMENTO:</span><textarea className="form-input" rows={2} value={avaliacaoData.padroesMovimento} onChange={e => setAvaliacaoData(p => ({ ...p, padroesMovimento: e.target.value }))} /></p>

                {/* AVALIAÇÃO FUNCIONAL */}
                <p className="subtitle">AVALIAÇÃO FUNCIONAL</p>
                <p className="field-row">
                  <span className="field-label">SUSTENTA CABEÇA / ROLAR LATERAL:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="cabeca" checked={avaliacaoData.sustentaCabeca === 'Sim'} onChange={() => setAvaliacaoData(p => ({ ...p, sustentaCabeca: 'Sim' }))} /> SIM</label>
                    <label className="checkbox-item"><input type="radio" name="cabeca" checked={avaliacaoData.sustentaCabeca === 'Não'} onChange={() => setAvaliacaoData(p => ({ ...p, sustentaCabeca: 'Não' }))} /> NÃO</label>
                    <label className="checkbox-item"><input type="radio" name="cabeca" checked={avaliacaoData.sustentaCabeca === 'Às vezes'} onChange={() => setAvaliacaoData(p => ({ ...p, sustentaCabeca: 'Às vezes' }))} /> ÀS VEZES</label>
                  </div>
                </p>
                <p className="field-row">
                  <span className="field-label">ROLAR PARA VENTRAL:</span>
                  <div className="checkbox-group" style={{ margin: 0 }}>
                    <label className="checkbox-item"><input type="radio" name="rolarV" checked={avaliacaoData.rolarVentral === 'Sim'} onChange={() => setAvaliacaoData(p => ({ ...p, rolarVentral: 'Sim' }))} /> SIM</label>
                    <label className="checkbox-item"><input type="radio" name="rolarV" checked={avaliacaoData.rolarVentral === 'Não'} onChange={() => setAvaliacaoData(p => ({ ...p, rolarVentral: 'Não' }))} /> NÃO</label>
                    <label className="checkbox-item"><input type="radio" name="rolarV" checked={avaliacaoData.rolarVentral === 'Às vezes'} onChange={() => setAvaliacaoData(p => ({ ...p, rolarVentral: 'Às vezes' }))} /> ÀS VEZES</label>
                  </div>
                </p>
                <p className="field-row"><span className="field-label">SENTAR (COM/SEM APOIO):</span><textarea className="form-input" rows={2} value={avaliacaoData.sentar} onChange={e => setAvaliacaoData(p => ({ ...p, sentar: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label">ARRASTAR/ENGATINHAR:</span><textarea className="form-input" rows={2} value={avaliacaoData.arrastar} onChange={e => setAvaliacaoData(p => ({ ...p, arrastar: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>MOBILIDADES:</span><textarea className="form-input" rows={2} value={avaliacaoData.mobilidades} onChange={e => setAvaliacaoData(p => ({ ...p, mobilidades: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>TRANSFERÊNCIAS:</span><textarea className="form-input" rows={2} value={avaliacaoData.transferencias} onChange={e => setAvaliacaoData(p => ({ ...p, transferencias: e.target.value }))} /></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '6px' }}>INDEPENDÊNCIA FUNCIONAL:</span><textarea className="form-input" rows={2} value={avaliacaoData.independenciaFuncional} onChange={e => setAvaliacaoData(p => ({ ...p, independenciaFuncional: e.target.value }))} /></p>

                {/* DIAGNÓSTICO E PLANO */}
                <p className="subtitle">DIAGNÓSTICO FISIOTERAPÊUTICO</p>
                <textarea className="form-input" rows={3} value={avaliacaoData.diagnosticoFisio} onChange={e => setAvaliacaoData(p => ({ ...p, diagnosticoFisio: e.target.value }))} />
                
                <p className="subtitle">OBJETIVOS</p>
                <textarea className="form-input" rows={3} value={avaliacaoData.objetivos} onChange={e => setAvaliacaoData(p => ({ ...p, objetivos: e.target.value }))} />
                
                <p className="subtitle">PLANO DE TRATAMENTO</p>
                <textarea className="form-input" rows={4} value={avaliacaoData.planoTratamento} onChange={e => setAvaliacaoData(p => ({ ...p, planoTratamento: e.target.value }))} />

                {/* Local, Data e Assinatura */}
                <p style={{ marginTop: '20px', textAlign: 'right', fontSize: '13px' }}>{localDate.city}, {day} de {monthCap} de {year}.</p>
                <div className="signature"><div className="line"></div><div style={{ fontWeight: 'bold', fontSize: '12px' }}>{profName}</div><div style={{ fontSize: '11px', color: '#555' }}>{profSpecialty} – {profCouncil}/{profRegistration}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ TELA 4: TERMO DE ADESÃO E COMPROMISSO (ORIGINAL - INALTERADO)
  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">{S.termoAdesao + ' e Compromisso'}</h2>
          <div className="flex gap-2">
            <button onClick={() => setSelectedTerm(null)} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">← Ver outros documentos</button>
            <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2"><Printer size={16} /> {S.imprimir}</button>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50"><X size={18} /></button>
          </div>
        </div>
        <div className="p-6">
          <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto" style={{ fontSize: '13px', lineHeight: '1.5' }}>
            <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" /><div className="org"><strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br />CNPJ: 55.880.046/0001-34<br />INSTAGRAM: @amovin_rpa<br />EMAIL: contato@amovin.org.br<br />WHATSAPP: (34) 99821-0513</div></div>
            <div className="title">TERMO DE ADESÃO E COMPROMISSO</div>
            <p><strong>1. IDENTIFICAÇÃO</strong><br />ASSOCIADO(A) RESPONSÁVEL: {beneficiary.respName || '________________'}, CPF: {beneficiary.respCpf || '________________'}, {beneficiary.respAddress || 'Endereco nao informado'}.<br />BENEFICIÁRIO (FILHO/A): {beneficiary.fullName || '________________'} | MATRÍCULA: {beneficiary.matricula || '________________'}, Nascimento: {formatDateBR(beneficiary.birthDate)}.</p>
            <p><strong>2. DO OBJETO</strong> O presente termo formaliza a participação do beneficiário nas atividades promovidas pela Associação, visando o suporte, a inclusão e a defesa de direitos, conforme o Estatuto Social da entidade.</p>
            <p><strong>3. COMPROMISSOS DA ASSOCIAÇÃO</strong></p><ul><li>Oferecer atividades, orientações ou acolhimento conforme a disponibilidade de voluntários e recursos.</li><li>Zelar pelo bem-estar e segurança dos beneficiários durante o período das atividades na sede.</li><li>Manter sigilo sobre laudos e dados sensíveis compartilhados pela família.</li></ul>
            <p><strong>4. COMPROMISSOS DOS PAIS/RESPONSÁVEIS</strong></p><ul><li><strong>Frequência e Pontualidade:</strong> Comunicar ausências em oficinas ou atendimentos com no mínimo 24h de antecedência.</li><li><strong>Cláusula de Frequência:</strong> A ocorrência de 03 faltas consecutivas ou alternadas, sem comprovação ou justificativa, resultará na perda da vaga no horário atual, sendo o beneficiário redirecionado para o final da fila, se houver fila de espera.</li><li><strong>Participação Ativa e Voluntariado:</strong> O responsável compromete-se a realizar, no mínimo, 03 participações voluntárias anuais nas ações da associação.</li><li><strong>Atualização de Dados:</strong> Informar qualquer mudança de telefone, endereço ou quadro clínico/médico do beneficiário.</li></ul>
            <p><strong>5. PROTEÇÃO DE DADOS E IMAGEM (LGPD)</strong></p><ul><li><strong>Dados Sensíveis:</strong> Autorizo a Associação a armazenar cópias de laudos e documentos para fins estritamente para avaliações multidisciplinares, estatísticos e de defesa de direitos.</li><li><strong>Uso de Imagem:</strong> ( ) SIM ( ) NÃO - Autorizo a utilização da imagem e voz do beneficiário em fotos e vídeos para divulgação exclusiva das ações da Associação.</li></ul>
            <div className="signature"><div className="line"></div>Assinatura do Responsável (Seção de Dados e Imagem)</div>
            <div className="page-break"><div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" /><div className="org"><strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br />CNPJ: 55.880.046/0001-34<br />INSTAGRAM: @amovin_rpa<br />EMAIL: contato@amovin.org.br<br />WHATSAPP: (34) 99821-0513</div></div>
            <p><strong>6. DO CUSTO E CONTRIBUIÇÃO</strong></p><ul><li><strong>Gratuidade Atual:</strong> A AMOVIN informa que, na presente data, não realiza a cobrança de mensalidades dos seus membros ou beneficiários.</li><li><strong>Serviços e Consultas:</strong> A associação busca oferecer acesso a consultas gratuitas ou com valor social, conforme a disponibilidade de parcerias e recursos.</li><li><strong>Sustentabilidade Financeira:</strong> O modelo de gestão da entidade prioriza a captação e o uso de verbas públicas para o custeio de suas atividades e projetos.</li><li><strong>Alterações Futuras:</strong> Em caso de necessidade extrema para a manutenção das atividades ou expansão dos serviços, a AMOVIN reserva-se o direito de instituir taxas ou mensalidades, comprometendo-se a informar todos os aderentes com antecedência prévia sobre tais mudanças.</li></ul>
            <p><strong>7. DISPOSIÇÕES GERAIS</strong> Este termo tem validade por tempo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso prévio. Os casos omissos serão resolvidos pela Diretoria Executiva.</p>
            <p>Rio Paranaíba - MG, {new Date().toLocaleDateString('pt-BR')}</p>
            <div className="signature"><div className="line"></div>Assinatura Representante Amovin</div><div className="signature"><div className="line"></div>Assinatura do Responsável do Beneficiário</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
