// src/app/(admin)/sala-espera/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  buscarPreCadastrosPendentes,
  aprovarPreCadastro,
  reprovarPreCadastro,
  buscarEstatisticasPreCadastro,
} from '@/lib/services/pre-cadastro-service';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatDateBR } from '@/lib/utils/masks';

export default function SalaEsperaPage() {
  const router = useRouter();
  const [preCadastros, setPreCadastros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    pendentes: 0,
    aprovados: 0,
    reprovados: 0,
    duplicados: 0,
  });
  const [processando, setProcessando] = useState<string | null>(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const dados = await buscarPreCadastrosPendentes();
      setPreCadastros(dados);
      const stats = await buscarEstatisticasPreCadastro();
      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleAprovar = async (id: string) => {
    const nome = sessionStorage.getItem('amovin_nome') || 'Admin';
    setProcessando(id);
    const result = await aprovarPreCadastro(id, nome);
    setProcessando(null);

    if (result.success) {
      alert(`✅ Cadastro aprovado! ID Firebase: ${result.firebaseId}`);
      carregarDados();
    } else {
      alert(`❌ Erro: ${result.error}`);
    }
  };

  const handleReprovar = async (id: string) => {
    const motivo = prompt('Motivo da reprovação:');
    if (motivo === null) return;

    setProcessando(id);
    const result = await reprovarPreCadastro(id, motivo);
    setProcessando(null);

    if (result.success) {
      alert('✅ Cadastro reprovado!');
      carregarDados();
    } else {
      alert(`❌ Erro: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F4ED] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            📋 Sala de Espera
          </h1>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard.html')}>
            ← Voltar
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-[#C65A11]">{estatisticas.total}</div>
            <div className="text-xs text-[#6B7280]">Total</div>
          </Card>
          <Card className="text-center p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</div>
            <div className="text-xs text-[#6B7280]">⏳ Pendentes</div>
          </Card>
          <Card className="text-center p-4 border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">{estatisticas.aprovados}</div>
            <div className="text-xs text-[#6B7280]">✅ Aprovados</div>
          </Card>
          <Card className="text-center p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-600">{estatisticas.reprovados}</div>
            <div className="text-xs text-[#6B7280]">❌ Reprovados</div>
          </Card>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-12 text-[#6B7280]">⏳ Carregando...</div>
        ) : preCadastros.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#6B7280]">Nenhum pré-cadastro pendente.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {preCadastros.map((item) => (
              <Card key={item.id} className="p-4 border-l-4 border-yellow-500">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1A1A1A]">{item.nome}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2 text-sm text-[#6B7280]">
                      <p>📞 {item.telefone || 'N/A'}</p>
                      <p>📧 {item.email || 'N/A'}</p>
                      <p>📍 {item.cidade || 'N/A'} {item.estado || ''}</p>
                      <p>📅 {formatDateBR(item.dataCadastro)}</p>
                      {item.responsavel && <p className="md:col-span-2">👤 Responsável: {item.responsavel}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="success" size="sm" onClick={() => handleAprovar(item.id)} disabled={processando === item.id}>
                      {processando === item.id ? '⏳...' : '✅ Aprovar'}
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleReprovar(item.id)} disabled={processando === item.id}>
                      ❌ Reprovar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
