import { useRef } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { Professional } from '../store';
import { downloadElementAsPdf } from '../utils/pdf';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

const styles = `@page{size:A4 portrait;margin:14mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.45}.sheet{max-width:790px;margin:0 auto}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.brand-logo{width:230px;height:75px;object-fit:contain}.org{text-align:right;font-size:12px;line-height:1.35}.title{text-align:center;font-weight:700;font-size:18px;margin:20px 0}.signature{margin-top:80px;text-align:center}.line{width:430px;border-top:1px solid #111;margin:0 auto 6px}`;

function monthName(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long' });
}

export default function ProfessionalTermModal({ professional, onClose }: { professional: Professional; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !ref.current) return;
    win.document.write(`<html><head><title>Termo de Parceria</title><style>${styles}</style></head><body>${ref.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`);
    win.document.close();
  };

  const handlePDF = () => {
    if (!ref.current) return;
    downloadElementAsPdf(ref.current, `Termo_Parceria_${professional.name || 'Profissional'}.pdf`, styles, 'Confirma a geração e download do PDF do termo de parceria?');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">Termo de Parceria e Cooperação</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2"><Printer size={16}/> Imprimir</button>
            <button onClick={handlePDF} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2"><Download size={16}/> PDF</button>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600"><X size={18}/></button>
          </div>
        </div>
        <div className="p-6">
          <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto">
            <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo"/><div className="org"><strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br/>CNPJ: 55.880.046/0001-34<br/>INSTAGRAM: @amovin_rpa<br/>EMAIL: contato@amovin.org.br<br/>WHATSAPP: (34) 99821-0513</div></div>
            <div className="title">TERMO DE PARCERIA E COOPERAÇÃO TÉCNICO-SOCIAL</div>
            <p><strong>PARCEIRO(A):</strong> {professional.name}, {professional.specialty}, CPF: {professional.cpf || '________________'}.</p>
            <p><strong>ASSOCIAÇÃO:</strong> AMOVIN - Associação e Movimento pela Inclusão em Rio Paranaíba<br/><strong>CNPJ:</strong> 55.880.046/0001-34</p>
            <p><strong>CLÁUSULA PRIMEIRA - DO OBJETO E DA INFRAESTRUTURA</strong><br/>1.1. A AMOVIN disponibiliza ao PARCEIRO o uso de suas instalações físicas e materiais pedagógicos. O PARCEIRO compromete-se a utilizar o papel timbrado da associação para todos os registros técnicos (anamneses, fichas e relatórios).<br/>1.2. O PARCEIRO deverá zelar pelo ambiente e materiais, notificando a secretaria com 24 horas de antecedência sobre a necessidade de impressões ou reposição de materiais de escritório para uso nos atendimentos aos associados.</p>
            <p><strong>CLÁUSULA SEGUNDA - DA VALIDAÇÃO E STATUS DO ASSOCIADO</strong><br/>2.1. O acesso ao benefício social é exclusivo para famílias com cadastro ativo. O PARCEIRO deverá validar o status via QR Code antes de cada sessão.<br/>2.2. Caso o sistema indique status "INATIVO", o PARCEIRO informará ao paciente sobre a perda do benefício social naquela data, orientando a regularização na secretaria.</p>
            <p><strong>CLÁUSULA TERCEIRA - DA ASSIDUIDADE E COMUNICAÇÃO</strong><br/>3.1. O PARCEIRO compromete-se a cumprir rigorosamente os horários agendados. Em caso de eventualidade que impeça a realização do atendimento, o profissional deverá notificar a AMOVIN com a máxima antecedência possível.</p>
            <p><strong>CLÁUSULA QUARTA - DA GESTÃO DE AGENDA E VAGAS</strong><br/>4.1. O PARCEIRO destinará 50% de sua grade de horários para associados ativos. Os demais 50% ficam sob livre demanda para atendimentos privados.<br/>4.2. O atendimento particular (por status "Inativo") não deve ocupar horários da grade social se houver fila de espera.<br/>4.3. Após 3 (três) faltas injustificadas do paciente, o PARCEIRO notificará a AMOVIN em até 24 horas para liberação da vaga.</p>
            <p><strong>CLÁUSULA QUINTA - DOS RELATÓRIOS E CONTINUIDADE</strong><br/>5.1. O PARCEIRO entregará semestralmente o Relatório de Evolução Terapêutica como comprovação da eficácia dos serviços à comunidade.</p>
            <p><strong>CLÁUSULA SEXTA - DA RESCISÃO E PRESERVAÇÃO DO VÍNCULO</strong><br/>6.1. Caso o PARCEIRO deseje encerrar a parceria, deverá comunicar a AMOVIN com antecedência mínima de 30 (trinta) dias.<br/>6.2. Em respeito ao vínculo terapêutico, o profissional cessante fica responsável por informar cada família associada sobre sua saída e colaborar na transição para o novo profissional.</p>
            <p>Rio Paranaíba, {today.getDate()} de {monthName(today)} de {today.getFullYear()}</p>
            <div className="signature"><div className="line"></div>Presidente da AMOVIN</div>
            <div className="signature"><div className="line"></div>Profissional Parceiro</div>
          </div>
        </div>
      </div>
    </div>
  );
}