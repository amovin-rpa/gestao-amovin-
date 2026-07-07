// src/types/nota-fiscal.ts

export interface NotaFiscal {
  id?: string;
  chaveAcesso: string;
  numero: string;
  serie: string;
  modelo: string;
  tipo: 'entrada' | 'saida';
  emitente: {
    nome: string;
    cnpj: string;
    endereco?: string;
  };
  destinatario: {
    nome: string;
    cnpj: string;
    endereco?: string;
  };
  valorTotal: number;
  dataEmissao: string;
  dataRecebimento: string;
  itens: NotaFiscalItem[];
  status: 'pendente' | 'aprovada' | 'reprovada' | 'cancelada';
  arquivoUrl?: string;
  arquivoNome?: string;
  observacoes?: string;
  usuarioCriacao: string;
  dataCriacao: string;
  dataAprovacao?: string;
  aprovadoPor?: string;
  motivoReprovacao?: string;
}

export interface NotaFiscalItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
}
