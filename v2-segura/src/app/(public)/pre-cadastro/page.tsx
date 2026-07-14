// src/app/(public)/pre-cadastro/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BeneficiarioForm } from '@/components/forms/BeneficiarioForm';
import { Wizard } from '@/components/forms/Wizard';
import { LGPDModal } from '@/components/LGPDModal';
import { salvarPreCadastro } from '@/lib/services/pre-cadastro-service';
import { Button } from '@/components/ui/Button';

export default function PreCadastroPage() {
  const router = useRouter();
  const [showLGPD, setShowLGPD] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [resultado, setResultado] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleLGPDAccept = () => setShowLGPD(false);
  const handleLGPDClose = () => router.push('/');

  const handleComplete = async (dados: any) => {
    setIsSubmitting(true);
    setResultado(null);

    const dadosCompletos = {
      ...dados,
      assinaturaNome: dados.nome,
      assinaturaCPF: dados.cpf,
    };

    const result = await salvarPreCadastro(dadosCompletos);

    if (result.success) {
      setResultado({
        success: true,
        message: '✅ Cadastro enviado com sucesso! Aguarde a aprovação da equipe AMOVIN.',
      });
    } else {
      setResultado({
        success: false,
        message: result.error || '❌ Erro ao enviar cadastro. Tente novamente.',
      });
    }

    setIsSubmitting(false);
  };

  const steps = [
    {
      id: 'dados',
      title: 'Dados Pessoais',
      icon: '👤',
      component: (
        <BeneficiarioForm
          onNext={(data) => setFormData(data)}
          initialData={formData}
        />
      ),
    },
    {
      id: 'confirmacao',
      title: 'Confirmação',
      icon: '✅',
      component: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 text-sm">✅ Revise seus dados antes de finalizar.</p>
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {(formData as any).nome}</p>
            <p><strong>CPF:</strong> {(formData as any).cpf}</p>
            <p><strong>Telefone:</strong> {(formData as any).telefone}</p>
            <p><strong>Tipo:</strong> {(formData as any).tipo}</p>
          </div>
        </div>
      ),
    },
  ];

  if (showLGPD) {
    return <LGPDModal isOpen={showLGPD} onAccept={handleLGPDAccept} onClose={handleLGPDClose} />;
  }

  if (resultado) {
    return (
      <div className="min-h-screen bg-[#F8F4ED] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
          {resultado.success ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Cadastro Enviado!</h2>
              <p className="text-[#6B7280] text-sm">{resultado.message}</p>
              <Button variant="primary" className="mt-6 w-full" onClick={() => router.push('/')}>
                🏠 Voltar
              </Button>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Ops!</h2>
              <p className="text-[#6B7280] text-sm">{resultado.message}</p>
              <Button variant="primary" className="mt-6 w-full" onClick={() => setResultado(null)}>
                🔄 Tentar Novamente
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4ED] py-8 px-4">
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">📝 Pré-Cadastro AMOVIN</h1>
        <p className="text-[#6B7280] text-sm mt-2">
          Preencha seus dados para iniciar o processo de cadastro na AMOVIN.
        </p>
      </div>
      <Wizard steps={steps} onComplete={handleComplete} initialData={formData} />
    </div>
  );
}
