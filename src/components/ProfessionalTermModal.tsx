import { useRef } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { Professional } from '../store';
import { downloadElementAsPdf } from '../utils/pdf';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

const styles = `@page{size:A4 portrait;margin:14mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.4}.sheet{max-width:790px;margin:0 auto}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:10px;margin-bottom:14px}.brand-logo{width:200px;height:65px;object-fit:contain}.org{text-align:right;font-size:11px;line-height:1.3}.title{text-align:center;font-weight:700;font-size:16px;margin:14px 0}.signature{margin-top:40px;text-align:center}.line{width:430px;border-top:1px solid #111;margin:0 auto 5px}.vol-body p{margin:6px 0;font-size:12.5px;line-height:1.35}`;

function monthName(date: Date) { return date.toLocaleDateString('pt-BR', { month: 'long' }); }

interface Props { professional: Professional; termType: 'parceria' | 'voluntario'; onClose: () => void; }

export default function ProfessionalTermModal({ professional, termType, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  const regText = professional.hasRegistration === 'Sim' && professional.registration ? `, registrado(a) sob o nº ${professional.registration}` : '';

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !ref.current) return;
    win.document.write(`<html><head><title>Termo</title><style>${styles}</style></head><body>${ref.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`);
    win.document.close();
  };

  const handlePDF = () => {
    if (!ref.current) return;
    downloadElementAsPdf(ref.current, `Termo_${termType === 'parceria' ? 'Parceria' : 'Voluntario'}_${professional.name}.pdf`, styles, 'Confirma a geração e download do PDF?');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">{termType === 'parceria' ? 'Termo de Parceria e Cooperação' : 'Termo de Adesão ao Trabalho Voluntário'}</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2"><Printer size={16}/> Imprimir</button>
            <button onClick={handlePDF} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2"><Download size={16}/> PDF</button>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6">
          <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto" style={{ fontSize: '13px', lineHeight: '1.5' }}>
            <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo"/><div className="org"><strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br/>CNPJ: 55.880.046/0001-34<br/>INSTAGRAM: @amovin_rpa<br/>EMAIL: contato@amovin.org.br<br/>WHATSAPP: (34) 99821-0513</div></div>

            {termType === 'parceria' ? (
              <div className="vol-body">
                <div className="title">TERMO DE PARCERIA E COOPERAÇÃO TÉCNICO-SOCIAL</div>
                <p><strong>PARCEIRO(A):</strong> {professional.name}, {professional.specialty}, portador(a) do CPF {professional.cpf || '________________'}{regText}.</p>
                <p><strong>ASSOCIAÇÃO:</strong> AMOVIN - Associação e Movimento pela Inclusão em Rio Paranaíba<br/><strong>CNPJ:</strong> 55.880.046/0001-34</p>
                <p><strong>CLÁUSULA PRIMEIRA – DO OBJETO E DA INFRAESTRUTURA</strong><br/>1.1. A AMOVIN disponibiliza ao PARCEIRO o uso de suas instalações físicas e materiais pedagógicos. O PARCEIRO compromete-se a utilizar o papel timbrado da associação para todos os registros técnicos.<br/>1.2. O PARCEIRO deverá zelar pelo ambiente e materiais, notificando a secretaria com 24 horas de antecedência sobre a necessidade de impressões ou reposição de materiais de escritório.</p>
                <p><strong>CLÁUSULA SEGUNDA – DA DISPONIBILIDADE E GESTÃO DE AGENDA</strong><br/>2.1. O PARCEIRO informará formalmente à AMOVIN os dias e horários em que disponibilizará seus serviços, para que a agenda de atendimentos seja montada com base nessa disponibilidade.<br/>2.2. Uma vez estabelecida e montada a grade de horários conforme a demanda dos associados, o PARCEIRO compromete-se a cumprir integralmente os atendimentos agendados, garantindo a regularidade do suporte terapêutico.<br/>2.3. O PARCEIRO destinará 50% de sua grade de horários na sede para associados ativos. Os demais 50% ficam sob livre demanda para atendimentos privados.</p>
                <p><strong>CLÁUSULA TERCEIRA – DA AUSÊNCIA DE VÍNCULO E RESPONSABILIDADE FISCAL</strong><br/>3.1. A presente parceria não estabelece qualquer vínculo empregatício entre a AMOVIN e o PARCEIRO, sendo este um profissional autônomo com total independência técnica.<br/>3.2. A AMOVIN não possui qualquer responsabilidade sobre obrigações fiscais ou tributárias do profissional. A emissão de Notas Fiscais ou recibos decorrentes dos atendimentos é de responsabilidade exclusiva do PARCEIRO.</p>
                <p><strong>CLÁUSULA QUARTA – DOS CRITÉRIOS PARA VALOR SOCIAL</strong><br/>4.1. O acesso ao valor social ou gratuidade é exclusivo para famílias com cadastro ativo e que comprovem a não obrigatoriedade de declaração de Imposto de Renda (IR).</p>
                <p><strong>CLÁUSULA QUINTA – DA ASSIDUIDADE E COMUNICAÇÃO</strong><br/>5.1. Em caso de eventualidade que impeça o atendimento, o profissional deverá notificar a AMOVIN com a máxima antecedência possível.</p>
                <p><strong>CLÁUSULA SEXTA – DA RESCISÃO</strong><br/>6.1. O encerramento da parceria exige aviso prévio de 30 dias e transição orientada dos pacientes para preservar o vínculo terapêutico.</p>
              </div>
            ) : (
              <div className="vol-body">
                <div className="title">TERMO DE ADESÃO AO TRABALHO VOLUNTÁRIO – MULTIDISCIPLINAR</div>
                <p><strong>VOLUNTÁRIO(A):</strong> {professional.name}, {professional.specialty}, portador(a) do CPF {professional.cpf || '________________'}{regText}.</p>
                <p><strong>INSTITUIÇÃO:</strong> AMOVIN - Associação e Movimento pela Inclusão em Rio Paranaíba</p>
                <p><strong>CLÁUSULA PRIMEIRA – DA NATUREZA DO VÍNCULO E FISCAL</strong><br/>1.1. O serviço prestado é de natureza não remunerada e não gera vínculo empregatício, nem obrigações trabalhistas, previdenciárias ou fiscais para a AMOVIN. 1.2. A AMOVIN fica isenta de qualquer responsabilidade sobre emissão de documentos fiscais por parte do voluntário.</p>
                <p><strong>CLÁUSULA SEGUNDA – DA DISPONIBILIDADE E CUMPRIMENTO DA GRADE</strong><br/>2.1. O VOLUNTÁRIO informará previamente à AMOVIN os dias e horários disponíveis para o trabalho voluntário, a fim de que a agenda de atendimentos seja organizada. 2.2. Após a definição da grade de horários baseada na demanda da associação, o VOLUNTÁRIO compromete-se a cumprir os agendamentos realizados, zelando pela continuidade do tratamento dos pacientes assistidos.</p>
                <p><strong>CLÁUSULA TERCEIRA – DO CRITÉRIO DE BENEFÍCIO</strong><br/>3.1. A gratuidade nos atendimentos será assegurada apenas às famílias assistidas com cadastro ativo que comprovem a não declaração de Imposto de Renda (IR).</p>
                <p><strong>CLÁUSULA QUARTA – DA ESTRUTURA E COMUNICAÇÃO</strong><br/>4.1. A AMOVIN disponibiliza o espaço físico. O VOLUNTÁRIO deve comunicar faltas eventuais com 24 horas de antecedência.</p>
                <p><strong>CLÁUSULA QUINTA – DA RESCISÃO E VÍNCULO</strong><br/>5.1. O desligamento exige aviso prévio de 30 dias para garantir a transição adequada dos pacientes e a preservação do vínculo terapêutico.</p>
              </div>
            )}

            <p>Rio Paranaíba, {today.getDate()} de {monthName(today)} de {today.getFullYear()}</p>
            <div className="signature"><div className="line"></div>Presidente da AMOVIN</div>
            <div className="signature"><div className="line"></div>{professional.name}<br/>{professional.specialty}{professional.hasRegistration === 'Sim' && professional.registration ? ` - Registro: ${professional.registration}` : ''}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
