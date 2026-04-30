import { useRef } from 'react';
import { Beneficiary } from '../store';
import { Printer, X } from 'lucide-react';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

export default function TermModal({ beneficiary, onClose }: { beneficiary: Beneficiary; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const styles = `@page{size:A4 portrait;margin:14mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.45}.sheet{max-width:790px;margin:0 auto}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.brand-logo{width:230px;height:75px;object-fit:contain}.org{text-align:right;font-size:12px;line-height:1.35}.title{text-align:center;font-weight:700;font-size:18px;margin:20px 0}.section{font-weight:700;margin-top:14px}.signature{margin-top:70px;text-align:center}.line{width:430px;border-top:1px solid #111;margin:0 auto 6px}.signature-page{break-before:page;page-break-before:always;margin-top:420px}.signature-page .header{margin-bottom:120px}.small-gap{height:28px}@media print{.signature-page{margin-top:0}}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !ref.current) return;
    win.document.write(`<html><head><title>Termo de Adesão</title><style>${styles}</style></head><body>${ref.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">{'Termo de Ades\u00e3o e Compromisso'}</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2"><Printer size={16}/> {'\u0049\u006d\u0070\u0072\u0069\u006d\u0069\u0072'}</button>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600"><X size={18}/></button>
          </div>
        </div>

        <div className="p-6">
          <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto">
            <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo"/><div className="org"><strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br/>CNPJ: 55.880.046/0001-34<br/>INSTAGRAM: @amovin_rpa<br/>EMAIL: contato@amovin.org.br<br/>WHATSAPP: (34) 99821-0513</div></div>
            <div className="title">TERMO DE ADESÃO E COMPROMISSO</div>
            <p><strong>1. IDENTIFICAÇÃO</strong><br/>ASSOCIADO(A) RESPONSÁVEL: {beneficiary.respName || '________________'}, CPF: {beneficiary.respCpf || '________________'}, {beneficiary.respAddress || 'Endereço não informado'}.<br/>BENEFICIÁRIO (FILHO/A): {beneficiary.fullName || '________________'}, {beneficiary.birthDate ? new Date(beneficiary.birthDate).toLocaleDateString() : 'Data de nascimento não informada'}.</p>
            <p><strong>2. DO OBJETO</strong> O presente termo formaliza a participação do beneficiário nas atividades promovidas pela Associação, visando o suporte, a inclusão e a defesa de direitos, conforme o Estatuto Social da entidade.</p>
            <p><strong>3. COMPROMISSOS DA ASSOCIAÇÃO</strong></p><ul><li>Oferecer atividades, orientações ou acolhimento conforme a disponibilidade de voluntários e recursos.</li><li>Zelar pelo bem-estar e segurança dos beneficiários durante o período das atividades na sede.</li><li>Manter sigilo sobre laudos e dados sensíveis compartilhados pela família.</li></ul>
            <p><strong>4. COMPROMISSOS DOS PAIS/RESPONSÁVEIS</strong></p><ul><li><strong>Frequência e Pontualidade:</strong> Comunicar ausências em oficinas ou atendimentos com no mínimo 24h de antecedência.</li><li><strong>Cláusula de Assiduidade:</strong> A ocorrência de 03 faltas consecutivas ou alternadas, sem comprovação ou justificativa, resultará na perda da vaga no horário atual, sendo o beneficiário redirecionado para o final da fila, se houver fila de espera.</li><li><strong>Participação Ativa e Voluntariado:</strong> O responsável compromete-se a realizar, no mínimo, 03 participações voluntárias anuais nas ações da associação.</li><li><strong>Atualização de Dados:</strong> Informar qualquer mudança de telefone, endereço ou quadro clínico/médico do beneficiário.</li></ul>
            <p><strong>5. PROTEÇÃO DE DADOS E IMAGEM (LGPD)</strong></p><ul><li><strong>Dados Sensíveis:</strong> Autorizo a Associação a armazenar cópias de laudos e documentos para fins estritamente para avaliações multidisciplinares, estatísticos e de defesa de direitos.</li><li><strong>Uso de Imagem:</strong> ( &nbsp; ) SIM &nbsp;&nbsp; ( &nbsp; ) NÃO - Autorizo a utilização da imagem e voz do beneficiário em fotos e vídeos para divulgação exclusiva das ações da Associação.</li></ul>
            <div className="signature-page">
              <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo"/><div className="org"><strong>Associação e Movimento pela Inclusão em Rio Paranaíba</strong><br/>CNPJ: 55.880.046/0001-34<br/>INSTAGRAM: @amovin_rpa<br/>EMAIL: contato@amovin.org.br<br/>WHATSAPP: (34) 99821-0513</div></div>
              <div className="signature"><div className="line"></div>Assinatura do Responsável (Seção de Dados e Imagem)</div>
              <div className="small-gap"></div>
              <p><strong>6. DISPOSIÇÕES GERAIS</strong> Este termo tem validade por tempo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso prévio. Os casos omissos serão resolvidos pela Diretoria Executiva.</p>
              <p>Rio Paranaíba - MG, {new Date().toLocaleDateString()}</p>
              <div className="signature"><div className="line"></div>Assinatura Representante Amovin</div>
              <div className="signature"><div className="line"></div>Assinatura do Responsável do Beneficiário</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}