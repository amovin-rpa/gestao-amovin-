// src/lib/services/firebase-service.ts

import { db } from '../firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ============================================================
// TIPOS
// ============================================================

export interface FirebasePessoa {
  id?: string;
  nome: string;
  tipo: 'beneficiario' | 'profissional' | 'voluntario';
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
  ativo: boolean;
  dataCadastro: string;
  foto?: string;
}

// ============================================================
// FUNÇÕES
// ============================================================

/**
 * Busca uma pessoa pelo CPF no Firebase
 */
export async function buscarPessoaPorCPF(cpf: string): Promise<FirebasePessoa | null> {
  try {
    const pessoasRef = collection(db, 'pessoas');
    const q = query(pessoasRef, where('cpf', '==', cpf));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as FirebasePessoa;
  } catch (error) {
    console.error('Erro ao buscar pessoa por CPF:', error);
    return null;
  }
}

/**
 * Busca uma pessoa pelo nome e CPF
 */
export async function buscarPessoaPorNomeCPF(nome: string, cpf: string): Promise<FirebasePessoa | null> {
  try {
    const pessoasRef = collection(db, 'pessoas');
    const q = query(
      pessoasRef,
      where('cpf', '==', cpf),
      where('nome', '==', nome)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
    } as FirebasePessoa;
  } catch (error) {
    console.error('Erro ao buscar pessoa por nome e CPF:', error);
    return null;
  }
}

/**
 * Verifica se uma pessoa já existe no Firebase
 */
export async function verificarDuplicidade(cpf: string, nome: string): Promise<{
  existe: boolean;
  pessoa?: FirebasePessoa;
  tipo?: string;
}> {
  try {
    const pessoa = await buscarPessoaPorNomeCPF(nome, cpf);
    if (pessoa) {
      return {
        existe: true,
        pessoa,
        tipo: pessoa.tipo,
      };
    }
    return { existe: false };
  } catch (error) {
    console.error('Erro ao verificar duplicidade:', error);
    return { existe: false };
  }
}

/**
 * Cria uma nova pessoa no Firebase
 */
export async function criarPessoa(dados: FirebasePessoa): Promise<{ id: string; success: boolean }> {
  try {
    const pessoasRef = collection(db, 'pessoas');
    const docRef = await addDoc(pessoasRef, {
      ...dados,
      dataCadastro: new Date().toISOString(),
      ativo: true,
      criadoEm: serverTimestamp(),
    });

    return {
      id: docRef.id,
      success: true,
    };
  } catch (error) {
    console.error('Erro ao criar pessoa:', error);
    return {
      id: '',
      success: false,
    };
  }
}

/**
 * Atualiza uma pessoa no Firebase
 */
export async function atualizarPessoa(id: string, dados: Partial<FirebasePessoa>): Promise<boolean> {
  try {
    const pessoaRef = doc(db, 'pessoas', id);
    await updateDoc(pessoaRef, {
      ...dados,
      atualizadoEm: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar pessoa:', error);
    return false;
  }
}

/**
 * Busca todas as pessoas de um tipo específico
 */
export async function buscarPessoasPorTipo(tipo: 'beneficiario' | 'profissional' | 'voluntario'): Promise<FirebasePessoa[]> {
  try {
    const pessoasRef = collection(db, 'pessoas');
    const q = query(pessoasRef, where('tipo', '==', tipo));
    const querySnapshot = await getDocs(q);

    const pessoas: FirebasePessoa[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      pessoas.push({
        id: doc.id,
        ...data,
      } as FirebasePessoa);
    });

    return pessoas;
  } catch (error) {
    console.error('Erro ao buscar pessoas por tipo:', error);
    return [];
  }
}

/**
 * Busca uma pessoa pelo ID
 */
export async function buscarPessoaPorId(id: string): Promise<FirebasePessoa | null> {
  try {
    const pessoaRef = doc(db, 'pessoas', id);
    const docSnap = await getDoc(pessoaRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
    } as FirebasePessoa;
  } catch (error) {
    console.error('Erro ao buscar pessoa por ID:', error);
    return null;
  }
}

/**
 * Conta o total de pessoas no Firebase
 */
export async function contarPessoas(): Promise<number> {
  try {
    const pessoasRef = collection(db, 'pessoas');
    const querySnapshot = await getDocs(pessoasRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Erro ao contar pessoas:', error);
    return 0;
  }
}
