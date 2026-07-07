// src/types/pre-cadastro.ts

export type TipoCadastro = 'beneficiario' | 'profissional' | 'voluntario';

export interface PreCadastro {
  id?: string;
  tipo: TipoCadastro;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  responsavel?: string; // Apenas para beneficiários
  especialidade?: string; // Apenas para profissionais
  area?: string; // Apenas para voluntários
  disponibilidade?: string; // Apenas para voluntários
  observacoes: string;
  
  // Campos de assinatura
  assinaturaNome: string;
  assinaturaCPF: string;
  assinaturaData: string;
  
  // Status
  status: 'pendente' | 'aprovado' | 'reprovado' | 'duplicado';
  dataCadastro: string;
  dataAprovacao?: string;
  aprovadoPor?: string;
  motivoReprovacao?: string;
  
  // Integração
  firebaseId?: string; // ID do documento criado no Firebase
  duplicado?: boolean;
  observacaoDuplicado?: string;
}

export interface PreCadastroFormData {
  tipo: TipoCadastro;
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  responsavel?: string;
  especialidade?: string;
  area?: string;
  disponibilidade?: string;
  observacoes: string;
  aceiteLGPD: boolean;
  assinaturaNome: string;
  assinaturaCPF: string;
}
