import { useRef, useState, useEffect } from 'react';
import { Beneficiary, Professional, useStore } from '../store';
import { Printer, X, FileText, ClipboardCheck } from 'lucide-react';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';

// FUNÇÃO QUE CORRIGE A DATA (evita problema de fuso horário)
function formatDateBR(dateString?: string): string {
  if (!dateString) return '________________';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return '________________';
  return `${day}/${month}/${year}`;
}

type TermType = 'adesao' | 'consentimento' | null;

export default function TermModal({ beneficiary, onClose }: { beneficiary: Beneficiary; onClose: () => void }) {
  const { professionals } = useStore();
  
  // ⚠️ IMPORTANTE: Iniciar com null para mostrar o menu de seleção primeiro
  const [selectedTerm, setSelectedTerm] = useState<TermType>(null);
  
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');
  
  const [professionalData, setProfessionalData] = useState({
    name: '',
    specialty: '',
    council: '',
    registration: '',
  });
  
  const [localDate, setLocalDate] = useState({
    city: 'Rio Paranaíba - MG',
    date: new Date().toLocaleDateString('pt-BR'),
  });
  
  const ref = useRef<HTMLDivElement>(null);
  
  const styles = `@page{size:A4 portrait;margin:16mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.5;font-size:13px}.sheet{max-width:790px;margin:0 auto}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.brand-logo{width:230px;height:75px;object-fit:contain}.org{text-align:right;font-size:12px;line-height:1.35}.title{text-align:center;font-weight:700;font-size:18px;margin:20px 0}p{margin:8px 0}ul{margin:4px 0 8px 0;padding-left:20px}li{margin-bottom:4px}.signature{margin-top:50px;text-align:center}.line{width:430px;border-top:1px solid #111;margin:40px auto 10px auto}.page2{page-break-before:always;break-before:page}.field-inline{display:inline;font-weight:bold;border-bottom:1px solid #000;padding:0 5px;margin:0 3px}.vertical-signatures{margin-top:60px}.sig-block{text-align:center;margin-bottom:40px}.sig-block .line{border-top:1px solid #000;margin-bottom:10px}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !ref.current) return;
    win.document.write(`<html><head><title>Termo</title><meta charset="UTF-8"/><style>${styles}</style></head><body>${ref.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`);
    win.document.close();
  };

  // Data de hoje formatada para BR
  const hoje = new Date();
  const dataHoje = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

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

  // ✅ TELA 1: MENU DE SELEÇÃO DE TERMOS (aparece quando selectedTerm é null)
  if (!selectedTerm) {
    return (
      <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto flex items-center justify-center">
        <div className="mx-auto max-w-2xl rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-blue-600" />
              Selecionar Termo
            </h2>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Botão: Termo de Adesão */}
            <button
              onClick={() => {
                console.log('Selecionado: adesao');
                setSelectedTerm('adesao');
              }}
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

            {/* Botão: Termo de Consentimento */}
            <button
              onClick={() => {
                console.log('Selecionado: consentimento');
                setSelectedTerm('consentimento');
              }}
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
          </div>
        </div>
      </div>
    );
  }

  // ✅ TELA 2: TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO
  if (selectedTerm === 'consentimento') {
    const respName = beneficiary.respName || '_________________________';
    const respCpf = formatCPF(beneficiary.respCpf || '');
    const respAddress = beneficiary.respAddress || '_________________________';
    const beneficiaryName = beneficiary.fullName || '_________________________';
    
    const profName = professionalData.name || '_________________________';
    const profSpecialty = professionalData.specialty || '_________________________';
    const profCouncil = professionalData.council || '_________________________';
    const profRegistration = professionalData.registration || '_________________________';

    return (
      <div className="fixed inset-0 z-[60] bg-gray-900/70 p-2 overflow-y-auto">
        <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="text-green-600" />
              Termo de Consentimento Livre e Esclarecido
            </h2>
            <div className="flex gap-2">
              <button onClick={() => {
                console.log('Voltando para menu');
                setSelectedTerm(null);
              }} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
                ← Voltar
              </button>
              <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2 bg-green-600 text-white hover:bg-green-700">
                <Printer size={16} /> {S.imprimir}
              </button>
              <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Painel lateral - Seleção do profissional */}
            <div className="w-full lg:w-80 p-5 border-r bg-gray-50 overflow-y-auto max-h-[calc(100vh-100px)]">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <ClipboardCheck className="text-green-600" size={20} />
                Selecionar Profissional
              </h3>
              
              <div className="space-y-4">
                {/* Select de profissionais */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Profissional *</label>
                  <select
                    value={selectedProfessionalId}
                    onChange={(e) => setSelectedProfessionalId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  >
                    <option value="">Selecione um profissional...</option>
                    {professionals?.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.name} - {prof.specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dados preenchidos automaticamente (somente leitura) */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Nome</label>
                    <p className="text-sm text-gray-800 font-medium">{professionalData.name || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Especialidade</label>
                    <p className="text-sm text-gray-800 font-medium">{professionalData.specialty || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Conselho/Órgão</label>
                    <p className="text-sm text-gray-800 font-medium">{professionalData.council || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Nº do Registro</label>
                    <p className="text-sm text-gray-800 font-medium">{professionalData.registration || '—'}</p>
                  </div>
                </div>

                {/* Local e Data - Automáticos */}
                <div className="pt-4 border-t">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={localDate.city}
                    onChange={(e) => setLocalDate(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Data</label>
                  <input
                    type="text"
                    value={localDate.date}
                    onChange={(e) => setLocalDate(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                <strong>💡 Dica:</strong> Selecione o profissional para preencher automaticamente os dados no termo.
              </div>
            </div>

            {/* Área do termo para impressão */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
              <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto shadow-lg" style={{ fontSize: '13px', lineHeight: '1.5' }}>
                
                {/* Header */}
                <div className="header">
                  <img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" />
                  <div className="org">
                    <strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br />
                    CNPJ: 55.880.046/0001-34<br />
                    INSTAGRAM: @amovin_rpa<br />
                    EMAIL: contato@amovin.org.br<br />
                    WHATSAPP: (34) 99821-0513
                  </div>
                </div>

                <div className="title">TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO</div>

                <div style={{ marginTop: '20px', marginBottom: '25px' }}>
                  <p style={{ margin: '10px 0' }}>
                    <strong>Profissional responsável:</strong> <span className="field-inline">{profName}</span><br />
                    <strong>Especialidade:</strong> <span className="field-inline">{profSpecialty}</span>
                  </p>
                </div>

                <div style={{ textAlign: 'justify', textIndent: '40px', margin: '20px 0' }}>
                  <p>
                    Eu, <span className="field-inline">{respName}</span>, portador(a) do CPF: <span className="field-inline">{respCpf}</span>, residente <span className="field-inline">{respAddress}</span>, DECLARO, estando em pleno gozo de minhas faculdades mentais, que fui previamente informado(a) pelo(a) Fisioterapeuta, Dr(a). <span className="field-inline">{profName}</span>, registrado(a) no {profCouncil} sob o nº <span className="field-inline">{profRegistration}</span>, acerca do meu estado de saúde funcional, bem como declaro que recebi deste(a) todos os esclarecimentos necessários no que se refere ao diagnóstico fisioterapêutico e/ou os objetivos da assistência fisioterapêutica para o tratamento ao qual o menor <span className="field-inline">{beneficiaryName}</span> irá ser submetido, tendo este cumprido o dever que lhe é imposto no art. 14, inciso V, da Res. COFFITO nº 424/2013.
                  </p>
                </div>

                <div style={{ textAlign: 'justify', textIndent: '40px', margin: '15px 0' }}>
                  <p>
                    Declaro, ainda, ter sido informado(a), de forma clara, acerca da finalidade, riscos e benefícios de referido tratamento, bem como dos efeitos colaterais e outras anormalidades e intercorrências que poderão advir do mesmo.
                  </p>
                </div>

                <p style={{ margin: '25px 0 40px 0', fontWeight: 'bold' }}>
                  Concordo com todas as informações descritas acima.
                </p>

                <p style={{ textAlign: 'right', margin: '30px 0', fontWeight: 'bold' }}>
                  {localDate.city}, {localDate.date}.
                </p>

                {/* ✅ ASSINATURAS VERTICAIS (uma embaixo da outra) */}
                <div className="vertical-signatures">
                  {/* Assinatura do Responsável */}
                  <div className="sig-block">
                    <div className="line"></div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{respName}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>Responsável Legal<br />CPF: {respCpf}</div>
                  </div>
                  
                  {/* Assinatura do Profissional */}
                  <div className="sig-block">
                    <div className="line"></div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{profName}</div>
                    <div style={{ fontSize: '11px', color: '#555' }}>
                      {profSpecialty}<br />
                      {profCouncil}: {profRegistration}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ TELA 3: TERMO DE ADESÃO E COMPROMISSO (original)
  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">{S.termoAdesao + ' e Compromisso'}</h2>
          <div className="flex gap-2">
            <button onClick={() => {
              console.log('Voltando para menu');
              setSelectedTerm(null);
            }} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">
              ← Ver outros termos
            </button>
            <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2">
              <Printer size={16} /> {S.imprimir}
            </button>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600 hover:bg-red-50">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto" style={{ fontSize: '13px', lineHeight: '1.5' }}>

            {/* === PAGE 1 === */}
            <div className="header">
              <img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" />
              <div className="org">
                <strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br />
                CNPJ: 55.880.046/0001-34<br />
                INSTAGRAM: @amovin_rpa<br />
                EMAIL: contato@amovin.org.br<br />
                WHATSAPP: (34) 99821-0513
              </div>
            </div>

            <div className="title">TERMO DE ADESÃO E COMPROMISSO</div>

            <p>
              <strong>1. IDENTIFICAÇÃO</strong><br />
              ASSOCIADO(A) RESPONSÁVEL: {beneficiary.respName || '________________'}, CPF: {beneficiary.respCpf || '________________'}, {beneficiary.respAddress || 'Endereco nao informado'}.<br />
              BENEFICIÁRIO (FILHO/A): {beneficiary.fullName || '________________'}   |   MATRÍCULA: {beneficiary.matricula || '________________'}, Nascimento: {formatDateBR(beneficiary.birthDate)}.
            </p>

            <p>
              <strong>2. DO OBJETO</strong> O presente termo formaliza a participação do beneficiário nas atividades promovidas pela Associação, visando o suporte, a inclusão e a defesa de direitos, conforme o Estatuto Social da entidade.
            </p>

            <p>
              <strong>3. COMPROMISSOS DA ASSOCIAÇÃO</strong>
            </p>
            <ul>
              <li>Oferecer atividades, orientações ou acolhimento conforme a disponibilidade de voluntários e recursos.</li>
              <li>Zelar pelo bem-estar e segurança dos beneficiários durante o período das atividades na sede.</li>
              <li>Manter sigilo sobre laudos e dados sensíveis compartilhados pela família.</li>
            </ul>

            <p>
              <strong>4. COMPROMISSOS DOS PAIS/RESPONSÁVEIS</strong>
            </p>
            <ul>
              <li><strong>Frequência e Pontualidade:</strong> Comunicar ausências em oficinas ou atendimentos com no mínimo 24h de antecedência.</li>
              <li><strong>Cláusula de Frequência:</strong> A ocorrência de 03 faltas consecutivas ou alternadas, sem comprovação ou justificativa, resultará na perda da vaga no horário atual, sendo o beneficiário redirecionado para o final da fila, se houver fila de espera.</li>
              <li><strong>Participação Ativa e Voluntariado:</strong> O responsável compromete-se a realizar, no mínimo, 03 participações voluntárias anuais nas ações da associação.</li>
              <li><strong>Atualização de Dados:</strong> Informar qualquer mudança de telefone, endereço ou quadro clínico/médico do beneficiário.</li>
            </ul>

            <p>
              <strong>5. PROTEÇÃO DE DADOS E IMAGEM (LGPD)</strong>
            </p>
            <ul>
              <li><strong>Dados Sensíveis:</strong> Autorizo a Associação a armazenar cópias de laudos e documentos para fins estritamente para avaliações multidisciplinares, estatísticos e de defesa de direitos.</li>
              <li><strong>Uso de Imagem:</strong> ( ) SIM   ( ) NÃO - Autorizo a utilização da imagem e voz do beneficiário em fotos e vídeos para divulgação exclusiva das ações da Associação.</li>
            </ul>

            <div className="signature">
              <div className="line"></div>
              Assinatura do Responsável (Seção de Dados e Imagem)
            </div>

            {/* === PAGE 2 === */}
            <div className="page2">
              <div className="header">
                <img src={AMOVIN_LOGO_SRC} className="brand-logo" alt="Logo" />
                <div className="org">
                  <strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br />
                  CNPJ: 55.880.046/0001-34<br />
                  INSTAGRAM: @amovin_rpa<br />
                  EMAIL: contato@amovin.org.br<br />
                  WHATSAPP: (34) 99821-0513
                </div>
              </div>

              <p>
                <strong>6. DO CUSTO E CONTRIBUIÇÃO</strong>
              </p>
              <ul>
                <li><strong>Gratuidade Atual:</strong> A AMOVIN informa que, na presente data, não realiza a cobrança de mensalidades dos seus membros ou beneficiários.</li>
                <li><strong>Serviços e Consultas:</strong> A associação busca oferecer acesso a consultas gratuitas ou com valor social, conforme a disponibilidade de parcerias e recursos.</li>
                <li><strong>Sustentabilidade Financeira:</strong> O modelo de gestão da entidade prioriza a captação e o uso de verbas públicas para o custeio de suas atividades e projetos.</li>
                <li><strong>Alterações Futuras:</strong> Em caso de necessidade extrema para a manutenção das atividades ou expansão dos serviços, a AMOVIN reserva-se o direito de instituir taxas ou mensalidades, comprometendo-se a informar todos os aderentes com antecedência prévia sobre tais mudanças.</li>
              </ul>

              <p>
                <strong>7. DISPOSIÇÕES GERAIS</strong> Este termo tem validade por tempo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso prévio. Os casos omissos serão resolvidos pela Diretoria Executiva.
              </p>

              <p>
                Rio Paranaíba - MG, {dataHoje}
              </p>

              <div className="signature">
                <div className="line"></div>
                Assinatura Representante Amovin
              </div>
              <div className="signature">
                <div className="line"></div>
                Assinatura do Responsável do Beneficiário
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
