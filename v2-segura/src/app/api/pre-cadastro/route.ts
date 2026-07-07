// src/app/api/pre-cadastro/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { salvarPreCadastro } from '@/lib/services/pre-cadastro-service';

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    // Validações básicas
    if (!dados.nome || !dados.cpf || !dados.tipo) {
      return NextResponse.json(
        { success: false, error: 'Nome, CPF e tipo são obrigatórios.' },
        { status: 400 }
      );
    }

    // Salva o pré-cadastro
    const result = await salvarPreCadastro(dados);

    if (result.success) {
      return NextResponse.json({
        success: true,
        id: result.id,
        message: 'Pré-cadastro realizado com sucesso!',
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro na API de pré-cadastro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      // Busca um pré-cadastro específico
      const { data, error } = await supabase
        .from('pre_cadastros')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, data });
    }

    // Busca todos (com filtros)
    const status = searchParams.get('status') || 'pendente';
    const tipo = searchParams.get('tipo');

    let query = supabase.from('pre_cadastros').select('*');

    if (status !== 'todos') {
      query = query.eq('status', status);
    }

    if (tipo && tipo !== 'todos') {
      query = query.eq('tipo', tipo);
    }

    const { data, error } = await query.order('data_cadastro', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro na API de pré-cadastro GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
