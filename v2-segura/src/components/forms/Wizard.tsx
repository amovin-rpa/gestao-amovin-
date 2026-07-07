// src/components/forms/Wizard.tsx

'use client';

import { useState, ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface Step {
  id: string;
  title: string;
  icon: string;
  component: ReactNode;
}

interface WizardProps {
  steps: Step[];
  onComplete: (data: any) => void;
  initialData?: any;
}

export const Wizard = ({ steps, onComplete, initialData = {} }: WizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === totalSteps - 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = (stepData: any) => {
    const newData = { ...formData, ...stepData };
    setFormData(newData);

    if (isLastStep) {
      // Envia todos os dados
      setIsSubmitting(true);
      onComplete(newData);
      setIsSubmitting(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Barra de progresso */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#6B7280]">
            Passo {currentStep + 1} de {totalSteps}
          </span>
          <span className="text-sm font-medium text-[#C65A11]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-[#C65A11] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Indicador de passos */}
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`
              flex items-center gap-2
              ${index <= currentStep ? 'text-[#C65A11]' : 'text-[#6B7280]'}
              ${index < currentStep ? 'opacity-50' : ''}
            `}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${index === currentStep ? 'bg-[#C65A11] text-white' : ''}
              ${index < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200'}
            `}>
              {index < currentStep ? '✓' : step.icon}
            </div>
            <span className="hidden md:inline text-sm font-medium">
              {step.title}
            </span>
          </div>
        ))}
      </div>

      {/* Conteúdo do passo atual */}
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <span>{currentStepData.icon}</span>
            {currentStepData.title}
          </h2>
        </div>

        <div className="min-h-[300px]">
          {currentStepData.component}
        </div>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          ← Voltar
        </Button>

        {isLastStep ? (
          <Button
            variant="primary"
            onClick={() => {
              // Força o submit do formulário atual
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '⏳ Enviando...' : '📤 Finalizar Cadastro'}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              // Força o submit do formulário atual
              const form = document.querySelector('form');
              if (form) {
                form.dispatchEvent(new Event('submit', { bubbles: true }));
              }
            }}
          >
            ➡️ Continuar
          </Button>
        )}
      </div>
    </div>
  );
};
