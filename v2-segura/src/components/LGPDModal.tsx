// src/components/LGPDModal.tsx

'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface LGPDModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export const LGPDModal = ({ isOpen, onAccept, onClose }: LGPDModalProps) => {
  const [accepted, setAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">
            🔒 Política de Privacidade - LGPD
          </h2>
          
          <div className="text-sm text-[#6B7280] space-y-3 max-h-60 overflow-y-auto">
            <p>
              A <strong>AMOVIN</strong> respeita sua privacidade e está comprometida 
              com a proteção dos seus dados pessoais, em conformidade com a Lei Geral 
              de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
            
            <p>
              <strong>Quais dados coletamos?</strong>
              <br />
              Nome, CPF, RG, data de nascimento, telefone, e-mail, endereço e 
              informações relevantes para o atendimento social.
            </p>
            
            <p>
              <strong>Para que usamos seus dados?</strong>
              <br />
              • Cadastro e atendimento nos projetos sociais da AMOVIN
              <br />
              • Comunicação sobre atividades e eventos
              <br />
              • Cumprimento de obrigações legais e prestação de contas
            </p>
            
            <p>
              <strong>Seus direitos:</strong>
              <br />
              Você pode solicitar a qualquer momento:
              <br />
              • Acesso, correção ou exclusão dos seus dados
              <br />
              • Revogação do consentimento
              <br />
              • Informações sobre compartilhamento de dados
            </p>
            
            <p>
              <strong>Contato para dúvidas:</strong>
              <br />
              📧 lgpd@amovin.org.br
              <br />
              📞 (34) 99999-9999
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 text-[#C65A11] border-gray-300 rounded focus:ring-[#C65A11]"
              />
              <span className="text-sm text-[#1A1A1A]">
                Li e concordo com a Política de Privacidade e com o tratamento 
                dos meus dados conforme a LGPD.
              </span>
            </label>

            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                disabled={!accepted}
                onClick={onAccept}
              >
                ✅ Aceito e Continuar
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                ❌ Recusar
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
