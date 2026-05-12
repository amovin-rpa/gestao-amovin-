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
  
  // Dados editáveis da ficha de avaliação
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
    // Checkboxes dispositivos auxiliares
    cadeiraRodas: false,
    muletasAxilar: false,
    muletaCanadense: false,
    bengala: false,
    andador: false,
    outrosDispositivos: '',
    // Checkboxes sexo
    sexoF: false,
    sexoM: false,
  });
  
  const ref = useRef<HTMLDivElement>(null);
  
  // ✅ ESTILOS IDÊNTICOS AO TERMO DE ADESÃO
  const styles = `@page{size:A4 portrait;margin:12mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.4;font-size:11px}.sheet{max-width:790px;margin:0 auto}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:15px}.brand-logo{width:200px;height:65px;object-fit:contain}.org{text-align:right;font-size:11px;line-height:1.3}.title{text-align:center;font-weight:700;font-size:14px;margin:15px 0;text-transform:uppercase}.subtitle{font-weight:bold;margin:12px 0 6px 0;text-decoration:underline;font-size:12px}.field-row{display:flex;gap:10px;margin:4px 0}.field-label{font-weight:bold;min-width:140px}.field-value{flex:1;border-bottom:1px dotted #999;padding:2px 4px}.checkbox-group{display:flex;gap:15px;margin:4px 0}.checkbox-item{display:flex;align-items:center;gap:4px}.text-area{width:100%;min-height:40px;border:1px solid #ddd;padding:4px;font-size:11px;font-family:Arial,sans-serif;margin:4px 0}.signature{margin-top:40px;text-align:center}.line{width:400px;border-top:1px solid #111;margin:30px auto 8px auto}.page-break{page-break-before:always}.section-box{border:1px solid #eee;padding:8px;margin:6px 0}.print-only{display:block}@media print{.no-print{display:none!important}}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !ref.current) return;
    win.document.write(`<html><head><title>Termo</title><meta charset="UTF-8"/><style>${styles}</style></head><body>${ref.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`);
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

  // ✅ TELA 1: MENU DE SELEÇÃO DE TERMOS
  if (!selectedTerm) {
    return (
      <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto flex items-center justify-center">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-blue-600" />
              Selecionar Documento
            </h2>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <button
              onClick={() => setSelectedTerm('adesao')}
              className="w-full text-left p-5 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-400 transition-all flex items-center gap-4 group"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="text-blue-600" size={28} />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">Termo de Adesão e Compromisso</div>
                <div className="text-sm text-gray-500">Termo padrão de participação nas atividades da associação</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedTerm('consentimento')}
              className="w-full text-left p-5 border-2 border-green-200 rounded-xl hover:bg-green-50 hover:border-green-400 transition-all flex items-center gap-4 group"
            >
              <div className="p-3 bg-green-100 rounded-lg group-hover:scale-110 transition-transform">
                <ClipboardCheck className="text-green-600" size={28} />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">Termo de Consentimento Livre e Esclarecido</div>
                <div className="text-sm text-gray-500">Autorização para tratamento fisioterapêutico</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedTerm('avaliacao_fisio')}
              className="w-full text-left p-5 border-2 border-purple-200 rounded-xl hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center gap-4 group"
            >
              <div className="p-3 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform">
                <Stethoscope className="text-purple-600" size={28} />
              </div>
              <div>
                <div className="font-bold text-gray-800 text-lg">Ficha de Avaliação Fisioterapêutica Pediátrica</div>
                <div className="text-sm text-gray-500">Avaliação clínica e funcional do paciente pediátrico</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ TELA 2: TERMO DE CONSENTIMENTO (TCLE) - Mantido igual
  if (selectedTerm === 'consentimento') {
    const respName = beneficiary.respName || '_________________________';
    const respCpf = formatCPF(beneficiary.respCpf || '');
    const respAddress = beneficiary.respAddress || '_________________________';
    const beneficiaryName = beneficiary.fullName || '_________________________';
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
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="text-green-600" />
              Termo de Consentimento Livre e Esclarecido
            </h2>
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
                <p style={{ marginTop: '25px', textAlign: 'right' }}>{localDate.city}, {day} de {monthCap} de {year}.</p>
                <div className="signature"><div className="line"></div><div style={{ fontWeight: 'bold', fontSize: '12px' }}>{respName}</div><div style={{ fontSize: '11px', color: '#555' }}>CPF: {respCpf}</div></div>
                <div className="signature"><div className="line"></div><div style={{ fontWeight: 'bold', fontSize: '12px' }}>{profName}</div><div style={{ fontSize: '11px', color: '#555' }}>{profSpecialty} – {profCouncil}: {profRegistration}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ TELA 3: FICHA DE AVALIAÇÃO FISIOTERAPÊUTICA PEDIÁTRICA
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
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Stethoscope className="text-purple-600" />
              Ficha de Avaliação Fisioterapêutica Pediátrica
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setSelectedTerm(null)} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">← Voltar</button>
              <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2 bg-purple-600 text-white hover:bg-purple-700"><Printer size={16} /> {S.imprimir}</button>
              <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50"><X size={18} /></button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Painel lateral - Dados e preenchimento */}
            <div className="w-full lg:w-80 p-5 border-r bg-gray-50 overflow-y-auto max-h-[calc(100vh-100px)]">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Stethoscope className="text-purple-600" size={20} /> Dados da Avaliação</h3>
              
              <div className="space-y-4">
                {/* Select de profissionais */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Fisioterapeuta *</label>
                  <select value={selectedProfessionalId} onChange={(e) => setSelectedProfessionalId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white">
                    <option value="">Selecione um profissional...</option>
                    {professionals?.map(prof => (<option key={prof.id} value={prof.id}>{prof.name} - {prof.specialty}</option>))}
                  </select>
                </div>

                {/* Dados auto-preenchidos */}
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Profissional:</p>
                  <p className="text-sm text-gray-800">{professionalData.name || '—'}</p>
                  <p className="text-xs text-gray-500">{professionalData.specialty} – {professionalData.council}: {professionalData.registration}</p>
                </div>

                {/* Dados do paciente (auto) */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                  <p className="text-xs font-semibold text-gray-600">Paciente:</p>
                  <p className="text-sm text-gray-800">{beneficiary.fullName || '—'}</p>
                  <p className="text-xs text-gray-500">Nasc: {birthDate} | Idade: {age}</p>
                  <p className="text-xs text-gray-500">Resp: {beneficiary.respName || '—'}</p>
                </div>

                {/* Data da avaliação */}
                <div className="pt-2 border-t">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Data da Avaliação</label>
                  <div className="grid grid-cols-3 gap-2">
                    <div><label className="block text-[10px] text-gray-500">Dia</label><input type="number" min="1" max="31" value={day} onChange={(e) => setLocalDate(prev => ({ ...prev, day: parseInt(e.target.value) || 1 }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                    <div><label className="block text-[10px] text-gray-500">Mês</label><input type="text" value={monthCap} onChange={(e) => setLocalDate(prev => ({ ...prev, month: e.target.value }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                    <div><label className="block text-[10px] text-gray-500">Ano</label><input type="number" value={year} onChange={(e) => setLocalDate(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" /></div>
                  </div>
                </div>

                {/* Campos editáveis principais */}
                <div className="space-y-3 pt-2 border-t">
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1">Peso (kg)</label><input type="text" value={avaliacaoData.peso} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, peso: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Ex: 25,5" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1">Altura (cm)</label><input type="text" value={avaliacaoData.altura} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, altura: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Ex: 120" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1">Naturalidade</label><input type="text" value={avaliacaoData.naturalidade} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, naturalidade: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-gray-700 mb-1">Diagnóstico Clínico</label><textarea value={avaliacaoData.diagnostico} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, diagnostico: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows={2} /></div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-800">
                <strong>💡 Dica:</strong> Os dados do paciente são preenchidos automaticamente. Edite os campos da avaliação conforme necessário.
              </div>
            </div>

            {/* Área da ficha para impressão */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
              <div ref={ref} className="sheet bg-white p-6 w-[790px] mx-auto shadow-lg" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                
                {/* Header - PADRÃO DOS TERMOS */}
                <div className="header">
                  <img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" />
                  <div className="org">
                    <strong>AMOVIN – Associação e Movimento pela Inclusão em Rio Paranaíba/MG</strong><br />
                    CNPJ: 55.880.046/0001-34<br />
                    INSTAGRAM: @amovin_rpa | EMAIL: contato@amovin.org.br<br />
                    WHATSAPP: (34) 99821-0513
                  </div>
                </div>

                <div className="title">FICHA DE AVALIAÇÃO FISIOTERAPÊUTICA PEDIÁTRICA</div>
                
                <p style={{ textAlign: 'center', marginBottom: '15px', fontSize: '11px' }}>
                  <strong>Fisioterapeuta:</strong> {profName} – {profCouncil}/{profRegistration}
                </p>

                {/* IDENTIFICAÇÃO DO PACIENTE */}
                <p className="subtitle">IDENTIFICAÇÃO DO PACIENTE</p>
                <div className="field-row"><span className="field-label">NOME:</span><span className="field-value">{beneficiary.fullName || '___________________________'}</span></div>
                <div className="field-row"><span className="field-label">DATA DE NASCIMENTO:</span><span className="field-value">{birthDate}</span><span className="field-label" style={{minWidth:'80px'}}>SEXO:</span><span className="field-value" style={{minWidth:'100px'}}>{avaliacaoData.sexoF ? '(X) F' : '( ) F'} {avaliacaoData.sexoM ? '(X) M' : '( ) M'}</span><span className="field-label" style={{minWidth:'70px'}}>IDADE:</span><span className="field-value">{age}</span></div>
                <div className="field-row"><span className="field-label">PESO:</span><span className="field-value">{avaliacaoData.peso || '__________'}</span><span className="field-label" style={{minWidth:'90px'}}>ALTURA:</span><span className="field-value">{avaliacaoData.altura || '__________'}</span><span className="field-label" style={{minWidth:'130px'}}>NATURALIDADE:</span><span className="field-value">{avaliacaoData.naturalidade || '__________'}</span></div>
                <div className="field-row"><span className="field-label">NOME DO RESPONSÁVEL:</span><span className="field-value">{beneficiary.respName || '___________________________'}</span><span className="field-label" style={{minWidth:'100px'}}>CELULAR:</span><span className="field-value">{beneficiary.respPhone || '__________'}</span></div>
                <div className="field-row"><span className="field-label">ENDEREÇO:</span><span className="field-value">{beneficiary.respAddress || '_______________________________________________________________'}</span></div>
                <div className="field-row"><span className="field-label">DIAGNÓSTICO CLÍNICO:</span><span className="field-value">{avaliacaoData.diagnostico || '__________________________________________________________________'}</span></div>
                <div className="field-row"><span className="field-label">DATA DA AVALIAÇÃO:</span><span className="field-value">{day}/{monthCap.substring(0,3).toLowerCase()}/{year}</span></div>
                
                <p className="field-row" style={{ marginTop: '8px' }}><span className="field-label">DISPOSITIVOS AUXILIARES:</span>
                  <span className="checkbox-group">
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.cadeiraRodas} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, cadeiraRodas: e.target.checked }))} /> CADEIRA DE RODAS</label>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.muletasAxilar} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, muletasAxilar: e.target.checked }))} /> MULETAS AXILAR</label>
                    <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.muletaCanadense} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, muletaCanadense: e.target.checked }))} /> MULETA CANADENSE</label>
                  </span>
                </p>
                <p className="checkbox-group" style={{ marginLeft: '145px' }}>
                  <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.bengala} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, bengala: e.target.checked }))} /> BENGALA</label>
                  <label className="checkbox-item"><input type="checkbox" checked={avaliacaoData.andador} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, andador: e.target.checked }))} /> ANDADOR</label>
                  <label className="checkbox-item">OUTROS: <input type="text" value={avaliacaoData.outrosDispositivos} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, outrosDispositivos: e.target.value }))} style={{ border: 'none', borderBottom: '1px dotted #999', width: '120px', marginLeft: '4px' }} /></label>
                </p>

                {/* HISTÓRIA CLÍNICA */}
                <p className="subtitle">HISTÓRIA CLÍNICA</p>
                <p className="field-row"><span className="field-label">QUEIXA PRINCIPAL:</span><span className="field-value">{avaliacaoData.queixaPrincipal || '________________________________________________________________________________________________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>HMP/HMA:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '60px', border: 'none', padding: 0 }} value={avaliacaoData.hmpHma} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, hmpHma: e.target.value }))} /></span></p>
                <p className="field-row"><span className="field-label">MEDICAMENTOS EM USO:</span><span className="field-value">{avaliacaoData.medicamentos || '________________________________________________________________________________________________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label">RESTRIÇÃO ALIMENTAR:</span><span className="checkbox-group"><label className="checkbox-item"><input type="radio" name="restricao" checked={avaliacaoData.restricaoAlimentar === 'Sim'} onChange={() => setAvaliacaoData(prev => ({ ...prev, restricaoAlimentar: 'Sim' }))} /> SIM</label><label className="checkbox-item"><input type="radio" name="restricao" checked={avaliacaoData.restricaoAlimentar === 'Não'} onChange={() => setAvaliacaoData(prev => ({ ...prev, restricaoAlimentar: 'Não' }))} /> NÃO</label></span> QUAIS: <input type="text" value={avaliacaoData.restricaoDetalhes} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, restricaoDetalhes: e.target.value }))} style={{ border: 'none', borderBottom: '1px dotted #999', width: '200px' }} /></p>
                <p className="field-row"><span className="field-label">HÁBITOS DE VIDA:</span><span className="field-value">{avaliacaoData.habitosVida || '________________________________________________________________________________________________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label">TRATAMENTOS REALIZADOS:</span><span className="field-value">{avaliacaoData.tratamentosRealizados || '________________________________________________________________________________________________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label">CIRURGIAS:</span><span className="checkbox-group"><label className="checkbox-item"><input type="radio" name="cirurgias" checked={avaliacaoData.cirurgias === 'Não'} onChange={() => setAvaliacaoData(prev => ({ ...prev, cirurgias: 'Não' }))} /> NÃO</label><label className="checkbox-item"><input type="radio" name="cirurgias" checked={avaliacaoData.cirurgias === 'Sim'} onChange={() => setAvaliacaoData(prev => ({ ...prev, cirurgias: 'Sim' }))} /> SIM</label></span> QUAL: <input type="text" value={avaliacaoData.cirurgiasDetalhes} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, cirurgiasDetalhes: e.target.value }))} style={{ border: 'none', borderBottom: '1px dotted #999', width: '200px' }} /></p>
                <p className="field-row"><span className="field-label">RESULTADO DE EXAMES:</span><span className="field-value">{avaliacaoData.exames || '________________________________________________________________________________________________________________________________________________________________'}</span></p>

                {/* SAÚDE GERAL DA CRIANÇA */}
                <p className="subtitle">SAÚDE GERAL DA CRIANÇA</p>
                <p className="checkbox-group"><label className="checkbox-item">CONVULSÕES: <input type="radio" name="conv" checked={avaliacaoData.convulsoes === 'Sim'} onChange={() => setAvaliacaoData(prev => ({ ...prev, convulsoes: 'Sim' }))} /> SIM <input type="radio" name="conv" checked={avaliacaoData.convulsoes === 'Não'} onChange={() => setAvaliacaoData(prev => ({ ...prev, convulsoes: 'Não' }))} /> NÃO</label> FREQUÊNCIA: <input type="text" value={avaliacaoData.convulsoesFreq} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, convulsoesFreq: e.target.value }))} style={{ border: 'none', borderBottom: '1px dotted #999', width: '150px' }} /></p>
                <p className="checkbox-group"><label className="checkbox-item">CONSTIPAÇÃO: <input type="radio" name="constip" checked={avaliacaoData.constipacao === 'Sim'} onChange={() => setAvaliacaoData(prev => ({ ...prev, constipacao: 'Sim' }))} /> SIM <input type="radio" name="constip" checked={avaliacaoData.constipacao === 'Não'} onChange={() => setAvaliacaoData(prev => ({ ...prev, constipacao: 'Não' }))} /> NÃO</label></p>
                <p className="checkbox-group"><label className="checkbox-item">SONO: <input type="radio" name="sono" checked={avaliacaoData.sono === 'Bom'} onChange={() => setAvaliacaoData(prev => ({ ...prev, sono: 'Bom' }))} /> BOM <input type="radio" name="sono" checked={avaliacaoData.sono === 'Ruim'} onChange={() => setAvaliacaoData(prev => ({ ...prev, sono: 'Ruim' }))} /> RUIM</label></p>
                <p className="checkbox-group"><label className="checkbox-item">ALIMENTAÇÃO: <input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Pastoso'} onChange={() => setAvaliacaoData(prev => ({ ...prev, alimentacao: 'Pastoso' }))} /> PASTOSO <input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Líquido'} onChange={() => setAvaliacaoData(prev => ({ ...prev, alimentacao: 'Líquido' }))} /> LÍQUIDO <input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Auxiliado'} onChange={() => setAvaliacaoData(prev => ({ ...prev, alimentacao: 'Auxiliado' }))} /> AUXILIADO <input type="radio" name="aliment" checked={avaliacaoData.alimentacao === 'Independente'} onChange={() => setAvaliacaoData(prev => ({ ...prev, alimentacao: 'Independente' }))} /> INDEPENDENTE</label></p>
                <p className="checkbox-group"><label className="checkbox-item">LÍQUIDOS: <input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Mamadeira'} onChange={() => setAvaliacaoData(prev => ({ ...prev, liquidos: 'Mamadeira' }))} /> MAMADEIRA <input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Copo'} onChange={() => setAvaliacaoData(prev => ({ ...prev, liquidos: 'Copo' }))} /> COPO <input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Auxiliado'} onChange={() => setAvaliacaoData(prev => ({ ...prev, liquidos: 'Auxiliado' }))} /> AUXILIADO <input type="radio" name="liq" checked={avaliacaoData.liquidos === 'Independente'} onChange={() => setAvaliacaoData(prev => ({ ...prev, liquidos: 'Independente' }))} /> INDEPENDENTE</label></p>
                <p className="checkbox-group"><label className="checkbox-item">HIGIENE: <input type="radio" name="hig" checked={avaliacaoData.higiene === 'Dependente'} onChange={() => setAvaliacaoData(prev => ({ ...prev, higiene: 'Dependente' }))} /> DEPENDENTE <input type="radio" name="hig" checked={avaliacaoData.higiene === 'Independente'} onChange={() => setAvaliacaoData(prev => ({ ...prev, higiene: 'Independente' }))} /> INDEPENDENTE</label></p>

                {/* EXAME FÍSICO */}
                <p className="subtitle">EXAME FÍSICO</p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>INSPEÇÃO:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '40px', border: 'none', padding: 0 }} value={avaliacaoData.inspecao} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, inspecao: e.target.value }))} placeholder="Estado geral, pele, deformidade, padrões patológicos" /></span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>FORÇA MUSCULAR:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.forcaMuscular} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, forcaMuscular: e.target.value }))} /></span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>EQUILÍBRIO:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.equilibrio} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, equilibrio: e.target.value }))} /></span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>POSTURA:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.postura} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, postura: e.target.value }))} /></span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>REFLEXOS:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.reflexos} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, reflexos: e.target.value }))} /></span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>PALPAÇÃO:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.palpacao} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, palpacao: e.target.value }))} placeholder="Tônus, trofismo, edema" /></span></p>
                <p className="field-row"><span className="field-label">ADM MMSS:</span><span className="field-value">{avaliacaoData.admMmss || '__________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label">ADM MMII:</span><span className="field-value">{avaliacaoData.admMmii || '___________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>PADRÕES DE MOVIMENTO:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.padroesMovimento} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, padroesMovimento: e.target.value }))} placeholder="Habilidades e inabilidades" /></span></p>

                {/* AVALIAÇÃO FUNCIONAL */}
                <p className="subtitle">AVALIAÇÃO FUNCIONAL</p>
                <p className="checkbox-group"><label className="checkbox-item">SUSTENTA CABEÇA / ROLAR LATERAL: <input type="radio" name="cabeca" checked={avaliacaoData.sustentaCabeca === 'Sim'} onChange={() => setAvaliacaoData(prev => ({ ...prev, sustentaCabeca: 'Sim' }))} /> SIM <input type="radio" name="cabeca" checked={avaliacaoData.sustentaCabeca === 'Não'} onChange={() => setAvaliacaoData(prev => ({ ...prev, sustentaCabeca: 'Não' }))} /> NÃO <input type="radio" name="cabeca" checked={avaliacaoData.sustentaCabeca === 'Às vezes'} onChange={() => setAvaliacaoData(prev => ({ ...prev, sustentaCabeca: 'Às vezes' }))} /> ÀS VEZES</label></p>
                <p className="checkbox-group"><label className="checkbox-item">ROLAR PARA VENTRAL: <input type="radio" name="rolarV" checked={avaliacaoData.rolarVentral === 'Sim'} onChange={() => setAvaliacaoData(prev => ({ ...prev, rolarVentral: 'Sim' }))} /> SIM <input type="radio" name="rolarV" checked={avaliacaoData.rolarVentral === 'Não'} onChange={() => setAvaliacaoData(prev => ({ ...prev, rolarVentral: 'Não' }))} /> NÃO <input type="radio" name="rolarV" checked={avaliacaoData.rolarVentral === 'Às vezes'} onChange={() => setAvaliacaoData(prev => ({ ...prev, rolarVentral: 'Às vezes' }))} /> ÀS VEZES</label></p>
                <p className="field-row"><span className="field-label">SENTAR (COM/SEM APOIO):</span><span className="field-value">{avaliacaoData.sentar || '________________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label">ARRASTAR/ENGATINHAR:</span><span className="field-value">{avaliacaoData.arrastar || '________________________________________________________________________________'}</span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>MOBILIDADES:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.mobilidades} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, mobilidades: e.target.value }))} /></span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>TRANSFERÊNCIAS:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.transferencias} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, transferencias: e.target.value }))} /></span></p>
                <p className="field-row"><span className="field-label" style={{ verticalAlign: 'top', paddingTop: '4px' }}>INDEPENDÊNCIA FUNCIONAL:</span><span className="field-value"><textarea className="text-area" style={{ minHeight: '30px', border: 'none', padding: 0 }} value={avaliacaoData.independenciaFuncional} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, independenciaFuncional: e.target.value }))} /></span></p>

                {/* DIAGNÓSTICO E PLANO */}
                <p className="subtitle">DIAGNÓSTICO FISIOTERAPÊUTICO</p>
                <p><textarea className="text-area" style={{ minHeight: '40px' }} value={avaliacaoData.diagnosticoFisio} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, diagnosticoFisio: e.target.value }))} /></p>
                
                <p className="subtitle">OBJETIVOS</p>
                <p><textarea className="text-area" style={{ minHeight: '50px' }} value={avaliacaoData.objetivos} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, objetivos: e.target.value }))} /></p>
                
                <p className="subtitle">PLANO DE TRATAMENTO</p>
                <p><textarea className="text-area" style={{ minHeight: '50px' }} value={avaliacaoData.planoTratamento} onChange={(e) => setAvaliacaoData(prev => ({ ...prev, planoTratamento: e.target.value }))} /></p>

                {/* Local, Data e Assinatura */}
                <p style={{ marginTop: '25px', textAlign: 'right', fontSize: '11px' }}>
                  {localDate.city}, {day} de {monthCap} de {year}.
                </p>

                <div className="signature">
                  <div className="line"></div>
                  <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{profName}</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>{profSpecialty} – {profCouncil}/{profRegistration}</div>
                </div>

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
