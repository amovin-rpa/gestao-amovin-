import { useRef } from 'react';
import { Beneficiary } from '../store';
import { Printer, X } from 'lucide-react';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';

export default function TermModal({ beneficiary, onClose }: { beneficiary: Beneficiary; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const styles = `@page{size:A4 portrait;margin:16mm}body{font-family:Arial,sans-serif;color:#111;line-height:1.5;font-size:13px}.sheet{max-width:790px;margin:0 auto}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.brand-logo{width:230px;height:75px;object-fit:contain}.org{text-align:right;font-size:12px;line-height:1.35}.title{text-align:center;font-weight:700;font-size:18px;margin:20px 0}p{margin:8px 0}ul{margin:4px 0 8px 0;padding-left:20px}li{margin-bottom:4px}.signature{margin-top:50px;text-align:center}.line{width:430px;border-top:1px solid #111;margin:0 auto 6px}.page2{page-break-before:always;break-before:page}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win || !ref.current) return;
    win.document.write(`<html><head><title>Termo</title><meta charset="UTF-8"/><style>${styles}</style></head><body>${ref.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}<\/script></body></html>`);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900/70 p-4 overflow-y-auto">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4 rounded-t-2xl">
          <h2 className="text-xl font-bold">{S.termoAdesao + ' e Compromisso'}</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="rounded-md border px-3 py-2 text-sm inline-flex gap-2"><Printer size={16}/> {S.imprimir}</button>
            <button onClick={onClose} className="rounded-md px-3 py-2 text-red-600"><X size={18}/></button>
          </div>
        </div>

        <div className="p-6">
          <div ref={ref} className="sheet bg-white p-8 w-[790px] mx-auto" style={{ fontSize: '13px', lineHeight: '1.5' }}>

            {/* === PAGE 1 === */}
            <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo"/><div className="org"><strong>{'Associa\u00e7\u00e3o e Movimento pela Inclus\u00e3o em Rio Parana\u00edba'}</strong><br/>CNPJ: 55.880.046/0001-34<br/>INSTAGRAM: @amovin_rpa<br/>EMAIL: contato@amovin.org.br<br/>WHATSAPP: (34) 99821-0513</div></div>

            <div className="title">{'TERMO DE ADES\u00c3O E COMPROMISSO'}</div>

            <p><strong>{'1. IDENTIFICA\u00c7\u00c3O'}</strong><br/>{'ASSOCIADO(A) RESPONS\u00c1VEL: '}{beneficiary.respName || '________________'}{', CPF: '}{beneficiary.respCpf || '________________'}{', '}{beneficiary.respAddress || 'Endereco nao informado'}{'.'}<br/>{'BENEFICI\u00c1RIO (FILHO/A): '}{beneficiary.fullName || '________________'}{', '}{beneficiary.birthDate ? new Date(beneficiary.birthDate).toLocaleDateString() : 'Data de nascimento nao informada'}{'.'}</p>

            <p><strong>{'2. DO OBJETO'}</strong>{' O presente termo formaliza a participa\u00e7\u00e3o do benefici\u00e1rio nas atividades promovidas pela Associa\u00e7\u00e3o, visando o suporte, a inclus\u00e3o e a defesa de direitos, conforme o Estatuto Social da entidade.'}</p>

            <p><strong>{'3. COMPROMISSOS DA ASSOCIA\u00c7\u00c3O'}</strong></p>
            <ul>
              <li>{'Oferecer atividades, orienta\u00e7\u00f5es ou acolhimento conforme a disponibilidade de volunt\u00e1rios e recursos.'}</li>
              <li>{'Zelar pelo bem-estar e seguran\u00e7a dos benefici\u00e1rios durante o per\u00edodo das atividades na sede.'}</li>
              <li>{'Manter sigilo sobre laudos e dados sens\u00edveis compartilhados pela fam\u00edlia.'}</li>
            </ul>

            <p><strong>{'4. COMPROMISSOS DOS PAIS/RESPONS\u00c1VEIS'}</strong></p>
            <ul>
              <li><strong>{'Frequ\u00eancia e Pontualidade:'}</strong>{' Comunicar aus\u00eancias em oficinas ou atendimentos com no m\u00ednimo 24h de anteced\u00eancia.'}</li>
              <li><strong>{'Cl\u00e1usula de Frequ\u00eancia:'}</strong>{' A ocorr\u00eancia de 03 faltas consecutivas ou alternadas, sem comprova\u00e7\u00e3o ou justificativa, resultar\u00e1 na perda da vaga no hor\u00e1rio atual, sendo o benefici\u00e1rio redirecionado para o final da fila, se houver fila de espera.'}</li>
              <li><strong>{'Participa\u00e7\u00e3o Ativa e Voluntariado:'}</strong>{' O respons\u00e1vel compromete-se a realizar, no m\u00ednimo, 03 participa\u00e7\u00f5es volunt\u00e1rias anuais nas a\u00e7\u00f5es da associa\u00e7\u00e3o.'}</li>
              <li><strong>{'Atualiza\u00e7\u00e3o de Dados:'}</strong>{' Informar qualquer mudan\u00e7a de telefone, endere\u00e7o ou quadro cl\u00ednico/m\u00e9dico do benefici\u00e1rio.'}</li>
            </ul>

            <p><strong>{'5. PROTE\u00c7\u00c3O DE DADOS E IMAGEM (LGPD)'}</strong></p>
            <ul>
              <li><strong>{'Dados Sens\u00edveis:'}</strong>{' Autorizo a Associa\u00e7\u00e3o a armazenar c\u00f3pias de laudos e documentos para fins estritamente para avalia\u00e7\u00f5es multidisciplinares, estat\u00edsticos e de defesa de direitos.'}</li>
              <li><strong>{'Uso de Imagem:'}</strong>{' ( ) SIM   ( ) N\u00c3O - Autorizo a utiliza\u00e7\u00e3o da imagem e voz do benefici\u00e1rio em fotos e v\u00eddeos para divulga\u00e7\u00e3o exclusiva das a\u00e7\u00f5es da Associa\u00e7\u00e3o.'}</li>
            </ul>

            <div className="signature"><div className="line"></div>{'Assinatura do Respons\u00e1vel (Se\u00e7\u00e3o de Dados e Imagem)'}</div>

            {/* === PAGE 2 === */}
            <div className="page2">
              <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo"/><div className="org"><strong>{'Associa\u00e7\u00e3o e Movimento pela Inclus\u00e3o em Rio Parana\u00edba'}</strong><br/>CNPJ: 55.880.046/0001-34<br/>INSTAGRAM: @amovin_rpa<br/>EMAIL: contato@amovin.org.br<br/>WHATSAPP: (34) 99821-0513</div></div>

              <p><strong>{'6. DO CUSTO E CONTRIBUI\u00c7\u00c3O'}</strong></p>
              <ul>
                <li><strong>{'Gratuidade Atual:'}</strong>{' A AMOVIN informa que, na presente data, n\u00e3o realiza a cobran\u00e7a de mensalidades dos seus membros ou benefici\u00e1rios.'}</li>
                <li><strong>{'Servi\u00e7os e Consultas:'}</strong>{' A associa\u00e7\u00e3o busca oferecer acesso a consultas gratuitas ou com valor social, conforme a disponibilidade de parcerias e recursos.'}</li>
                <li><strong>{'Sustentabilidade Financeira:'}</strong>{' O modelo de gest\u00e3o da entidade prioriza a capta\u00e7\u00e3o e o uso de verbas p\u00fablicas para o custeio de suas atividades e projetos.'}</li>
                <li><strong>{'Altera\u00e7\u00f5es Futuras:'}</strong>{' Em caso de necessidade extrema para a manuten\u00e7\u00e3o das atividades ou expans\u00e3o dos servi\u00e7os, a AMOVIN reserva-se o direito de instituir taxas ou mensalidades, comprometendo-se a informar todos os aderentes com anteced\u00eancia pr\u00e9via sobre tais mudan\u00e7as.'}</li>
              </ul>

              <p><strong>{'7. DISPOSI\u00c7\u00d5ES GERAIS'}</strong>{' Este termo tem validade por tempo indeterminado, podendo ser rescindido por qualquer uma das partes mediante aviso pr\u00e9vio. Os casos omissos ser\u00e3o resolvidos pela Diretoria Executiva.'}</p>

              <p>{'Rio Parana\u00edba - MG, '}{new Date().toLocaleDateString()}</p>

              <div className="signature"><div className="line"></div>{'Assinatura Representante Amovin'}</div>
              <div className="signature"><div className="line"></div>{'Assinatura do Respons\u00e1vel do Benefici\u00e1rio'}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
