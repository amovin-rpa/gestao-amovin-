// src/components/forms/BeneficiarioForm.tsx

'use client';

import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { maskCPF, maskPhone, unMask } from '@/lib/utils/masks';
import { validarCPF, validarEmail, validarTelefone } from '@/lib/utils/validators';

const estados = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface BeneficiarioFormProps {
  onNext: (data: any) => void;
  initialData?: any;
}

export const BeneficiarioForm = ({ onNext, initialData = {} }: BeneficiarioFormProps) => {
  const [formData, setFormData] = useState({
    tipo: initialData.tipo || 'beneficiario',
    nome: initialData.nome || '',
    cpf: initialData.cpf || '',
    rg: initialData.rg || '',
    dataNascimento: initialData.dataNascimento || '',
    sexo: initialData.sexo || '',
    telefone: initialData.telefone || '',
    whatsapp: initialData.whatsapp || '',
    email: initialData.email || '',
    endereco: initialData.endereco || '',
    cidade: initialData.cidade || '',
    estado: initialData.estado || '',
    responsavel: initialData.responsavel || '',
    observacoes: initialData.observacoes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche automaticamente o WhatsApp se vazio
  useEffect(() => {
    if (!formData.whatsapp && formData.telefone) {
      setFormData(prev => ({ ...prev, whatsapp: prev.telefone }));
    }
  }, [formData.telefone, formData.whatsapp]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'nome':
        return value.trim().length < 3 ? 'Nome deve ter pelo menos 3 caracteres' : '';
      case 'cpf':
        return !validarCPF(value) ? 'CPF inválido' : '';
      case 'email':
        return value && !validarEmail(value) ? 'E-mail inválido' : '';
      case 'telefone':
        return value && !validarTelefone(value) ? 'Telefone inválido' : '';
      case 'dataNascimento':
        if (value) {
          const idade = calcularIdade(value);
          if (idade < 0) return 'Data de nascimento inválida';
        }
        return '';
      default:
        return '';
    }
  };

  const calcularIdade = (dataNasc: string): number => {
    const nasc = new Date(dataNasc);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validação em tempo real
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Valida todos os campos
    const newErrors: Record<string, string> = {};
    let hasError = false;

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) {
        newErrors[key] = error;
        hasError = true;
      }
    });

    // Validações específicas
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
      hasError = true;
    }

    if (formData.tipo === 'beneficiario' && !formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório para beneficiários';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    // Envia os dados
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Select
            label="Tipo de Cadastro *"
            options={[
              { value: 'beneficiario', label: '👥 Beneficiário' },
              { value: 'profissional', label: '👨‍⚕️ Profissional' },
              { value: 'voluntario', label: '💪 Voluntário' },
            ]}
            value={formData.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Nome Completo *"
            placeholder="Digite o nome completo"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            error={errors.nome}
          />
        </div>

        <Input
          label="CPF *"
          placeholder="000.000.000-00"
          value={formData.cpf}
          onChange={(e) => handleChange('cpf', e.target.value)}
          mask={maskCPF}
          error={errors.cpf}
        />

        <Input
          label="RG"
          placeholder="00.000.000-0"
          value={formData.rg}
          onChange={(e) => handleChange('rg', e.target.value)}
        />

        <Input
          label="Data de Nascimento"
          type="date"
          value={formData.dataNascimento}
          onChange={(e) => handleChange('dataNascimento', e.target.value)}
          error={errors.dataNascimento}
        />

        <Select
          label="Sexo"
          options={[
            { value: '', label: 'Selecione...' },
            { value: 'Masculino', label: 'Masculino' },
            { value: 'Feminino', label: 'Feminino' },
            { value: 'Outro', label: 'Outro' },
          ]}
          value={formData.sexo}
          onChange={(e) => handleChange('sexo', e.target.value)}
        />

        <Input
          label="Telefone"
          placeholder="(00) 00000-0000"
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          mask={maskPhone}
          error={errors.telefone}
        />

        <Input
          label="WhatsApp"
          placeholder="(00) 00000-0000"
          value={formData.whatsapp}
          onChange={(e) => handleChange('whatsapp', e.target.value)}
          mask={maskPhone}
        />

        <div className="md:col-span-2">
          <Input
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Endereço"
            placeholder="Rua, número, bairro"
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
          />
        </div>

        <Input
          label="Cidade"
          placeholder="Cidade"
          value={formData.cidade}
          onChange={(e) => handleChange('cidade', e.target.value)}
        />

        <Select
          label="Estado"
          options={[
            { value: '', label: 'Selecione...' },
            ...estados.map(uf => ({ value: uf, label: uf })),
          ]}
          value={formData.estado}
          onChange={(e) => handleChange('estado', e.target.value)}
        />

        {formData.tipo === 'beneficiario' && (
          <div className="md:col-span-2">
            <Input
              label="Responsável *"
              placeholder="Ex: Mãe do beneficiário João Silva"
              value={formData.responsavel}
              onChange={(e) => handleChange('responsavel', e.target.value)}
              error={errors.responsavel}
            />
            <p className="text-xs text-[#6B7280] mt-1">
              Preencher quando o cadastro for beneficiário
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <Input
            label="Observações"
            placeholder="Informações adicionais..."
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" variant="primary" className="w-full py-3 text-base">
        ➡️ Próximo Passo
      </Button>
    </form>
  );
};
