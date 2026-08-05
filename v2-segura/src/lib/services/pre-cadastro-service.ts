// src/lib/services/pre-cadastro-service.ts

import { supabase } from '../supabase/client';
import { criarPessoa, buscarPessoaPorNomeCPF, verificarDuplicidade, FirebasePessoa } from './firebase-service';
import { PreCadastro, PreCadastroFormData } from '@/types/pre-cadastro';

// ============================================================
// FUNÇÕES SUPABASE (Sala de Espera)
// ============================================================

/**
 * Salva um pré-cadastro no Supabase
 */
export async function salvarPreCadastro(dados: PreCadastroFormData): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  try {
    // Verifica se já existe no Firebase (duplicidade)
    const duplicado = await verificarDuplicidade(dados.cpf, dados.nome);
    
    if (duplicado.existe) {
      return {
        success: false,
        error: `⚠️ Já existe um cadastro para ${dados.nome} (CPF: ${dados.cpf}) no sistema.`,
      };
    }

    // Prepara os dados para o Supabase
    const preCadastroData = {
      tipo: dados.tipo,
      nome: dados.nome,
      cpf: dados.cpf,
      rg: dados.rg,
      data_nascimento: dados.dataNascimento,
      sexo: dados.sexo,
      telefone: dados.telefone,
      whatsapp: dados.whatsapp,
      email: dados.email,
      endereco: dados.endereco,
      cidade: dados.cidade,
      estado: dados.estado,
      responsavel: dados.responsavel || null,
      especialidade: dados.especialidade || null,
      area: dados.area || null,
      disponibilidade: dados.disponibilidade || null,
      observacoes: dados.observacoes,
      assinatura_nome: dados.assinaturaNome,
      assinatura_cpf: dados.assinaturaCPF,
      assinatura_data: new Date().toISOString(),
      status: 'pendente',
      data_cadastro: new Date().toISOString(),
      duplicado: false,
    };

    // Salva no Supabase
    const { data, error } = await supabase
      .from('pre_cadastros')
      .insert(preCadastroData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar pré-cadastro:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error) {
    console.error('Erro ao salvar pré-cadastro:', error);
    return {
      success: false,
      error: 'Erro interno ao processar o cadastro.',
    };
  }
}

/**
 * Busca todos os pré-cadastros pendentes
 */
export async function buscarPreCadastrosPendentes(): Promise<PreCadastro[]> {
  try {
    const { data, error } = await supabase
      .from('pre_cadastros')
      .select('*')
      .eq('status', 'pendente')
      .order('data_cadastro', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pré-cadastros pendentes:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      tipo: item.tipo,
      nome: item.nome,
      cpf: item.cpf,
      rg: item.rg || '',
      dataNascimento: item.data_nascimento || '',
      sexo: item.sexo || '',
      telefone: item.telefone || '',
      whatsapp: item.whatsapp || '',
      email: item.email || '',
      endereco: item.endereco || '',
      cidade: item.cidade || '',
      estado: item.estado || '',
      responsavel: item.responsavel || '',
      especialidade: item.especialidade || '',
      area: item.area || '',
      disponibilidade: item.disponibilidade || '',
      observacoes: item.observacoes || '',
      assinaturaNome: item.assinatura_nome,
      assinaturaCPF: item.assinatura_cpf,
      assinaturaData: item.assinatura_data,
      status: item.status,
      dataCadastro: item.data_cadastro,
      firebaseId: item.firebase_id || '',
    }));
  } catch (error) {
    console.error('Erro ao buscar pré-cadastros pendentes:', error);
    return [];
  }
}

/**
 * Busca todos os pré-cadastros (com filtro)
 */
export async function buscarPreCadastros(filtro?: {
  status?: string;
  tipo?: string;
  dataInicio?: string;
  dataFim?: string;
}): Promise<PreCadastro[]> {
  try {
    let query = supabase.from('pre_cadastros').select('*');

    if (filtro?.status && filtro.status !== 'todos') {
      query = query.eq('status', filtro.status);
    }

    if (filtro?.tipo && filtro.tipo !== 'todos') {
      query = query.eq('tipo', filtro.tipo);
    }

    if (filtro?.dataInicio) {
      query = query.gte('data_cadastro', filtro.dataInicio);
    }

    if (filtro?.dataFim) {
      query = query.lte('data_cadastro', filtro.dataFim);
    }

    const { data, error } = await query.order('data_cadastro', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pré-cadastros:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      tipo: item.tipo,
      nome: item.nome,
      cpf: item.cpf,
      rg: item.rg || '',
      dataNascimento: item.data_nascimento || '',
      sexo: item.sexo || '',
      telefone: item.telefone || '',
      whatsapp: item.whatsapp || '',
      email: item.email || '',
      endereco: item.endereco || '',
      cidade: item.cidade || '',
      estado: item.estado || '',
      responsavel: item.responsavel || '',
      especialidade: item.especialidade || '',
      area: item.area || '',
      disponibilidade: item.disponibilidade || '',
      observacoes: item.observacoes || '',
      assinaturaNome: item.assinatura_nome,
      assinaturaCPF: item.assinatura_cpf,
      assinaturaData: item.assinatura_data,
      status: item.status,
      dataCadastro: item.data_cadastro,
      dataAprovacao: item.data_aprovacao || '',
      aprovadoPor: item.aprovado_por || '',
      firebaseId: item.firebase_id || '',
      duplicado: item.duplicado || false,
    }));
  } catch (error) {
    console.error('Erro ao buscar pré-cadastros:', error);
    return [];
  }
}

/**
 * Aprova um pré-cadastro e envia para o Firebase
 */
export async function aprovarPreCadastro(id: string, usuario: string): Promise<{
  success: boolean;
  error?: string;
  firebaseId?: string;
}> {
  try {
    // Busca o pré-cadastro
    const { data: preCadastro, error: fetchError } = await supabase
      .from('pre_cadastros')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !preCadastro) {
      return {
        success: false,
        error: 'Pré-cadastro não encontrado.',
      };
    }

    // Verifica duplicidade novamente (pode ter sido cadastrado enquanto estava pendente)
    const duplicado = await verificarDuplicidade(preCadastro.cpf, preCadastro.nome);

    if (duplicado.existe) {
      // Marca como duplicado no Supabase
      await supabase
        .from('pre_cadastros')
        .update({
          status: 'duplicado',
          observacao_duplicado: `Já existe cadastro no Firebase (ID: ${duplicado.pessoa?.id})`,
          duplicado: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return {
        success: false,
        error: `⚠️ ${preCadastro.nome} já está cadastrado no sistema.`,
      };
    }

    // Prepara dados para o Firebase
    const dadosFirebase: FirebasePessoa = {
      nome: preCadastro.nome,
      tipo: preCadastro.tipo,
      cpf: preCadastro.cpf,
      rg: preCadastro.rg || '',
      dataNascimento: preCadastro.data_nascimento || '',
      sexo: preCadastro.sexo || '',
      telefone: preCadastro.telefone || '',
      whatsapp: preCadastro.whatsapp || '',
      email: preCadastro.email || '',
      endereco: preCadastro.endereco || '',
      cidade: preCadastro.cidade || '',
      estado: preCadastro.estado || '',
      responsavel: preCadastro.responsavel || '',
      especialidade: preCadastro.especialidade || '',
      area: preCadastro.area || '',
      disponibilidade: preCadastro.disponibilidade || '',
      observacoes: preCadastro.observacoes || '',
      ativo: true,
      dataCadastro: new Date().toISOString(),
    };

    // Cria no Firebase
    const resultado = await criarPessoa(dadosFirebase);

    if (!resultado.success) {
      return {
        success: false,
        error: 'Erro ao criar cadastro no Firebase.',
      };
    }

    // Atualiza o status no Supabase
    await supabase
      .from('pre_cadastros')
      .update({
        status: 'aprovado',
        data_aprovacao: new Date().toISOString(),
        aprovado_por: usuario,
        firebase_id: resultado.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return {
      success: true,
      firebaseId: resultado.id,
    };
  } catch (error) {
    console.error('Erro ao aprovar pré-cadastro:', error);
    return {
      success: false,
      error: 'Erro interno ao processar aprovação.',
    };
  }
}

/**
 * Reprova um pré-cadastro
 */
export async function reprovarPreCadastro(id: string, motivo: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { error } = await supabase
      .from('pre_cadastros')
      .update({
        status: 'reprovado',
        motivo_reprovacao: motivo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao reprovar pré-cadastro:', error);
    return {
      success: false,
      error: 'Erro interno ao reprovar.',
    };
  }
}

/**
 * Busca estatísticas dos pré-cadastros
 */
export async function buscarEstatisticasPreCadastro(): Promise<{
  total: number;
  pendentes: number;
  aprovados: number;
  reprovados: number;
  duplicados: number;
}> {
  try {
    const { data, error } = await supabase
      .from('pre_cadastros')
      .select('status');

    if (error) {
      return { total: 0, pendentes: 0, aprovados: 0, reprovados: 0, duplicados: 0 };
    }

    const total = data.length;
    const pendentes = data.filter((i: any) => i.status === 'pendente').length;
    const aprovados = data.filter((i: any) => i.status === 'aprovado').length;
    const reprovados = data.filter((i: any) => i.status === 'reprovado').length;
    const duplicados = data.filter((i: any) => i.status === 'duplicado').length;

    return { total, pendentes, aprovados, reprovados, duplicados };
  } catch (error) {
    return { total: 0, pendentes: 0, aprovados: 0, reprovados: 0, duplicados: 0 };
  }
}
