// src/app/(admin)/sala-espera/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  buscarPreCadastrosPendentes,
  aprovarPreCadastro,
  reprovarPreCadastro,
  buscarEstatisticasPreCadastro,
  buscarPreCadastros,
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
  const [filtro, setFiltro] = useState({
    status: 'pendente',
    tipo: 'todos',
  });
  const [processando, setProcessando] = useState<string | null>(null);
  const [modoAprovacao, setModoAprovacao] = useState<'individual' | 'lote'>('individual');
  const [selecionados, setSelecionados] = useState<string[]>([]);

  // Carrega os dados
  const carregarDados = async () => {
    setLoading(true);
    try {
      const dados = await buscarPreCadastros(filtro);
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
  }, [filtro]);

  // Aprova um cadastro
  const handleAprovar = async (id: string) => {
    const nome = sessionStorage.getItem('amovin_nome') || 'Admin';
    setProcessando(id);
    const result = await aprovarPreCadastro(id, nome);
    setProcessando(null);

    if (result.success) {
      alert(`✅ Cadastro aprovado com sucesso! ID Firebase: ${result.firebaseId}`);
      carregarDados();
    } else {
      alert(`❌ Erro ao aprovar: ${result.error}`);
    }
  };

  // Reprova um cadastro
  const handleReprovar = async (id: string) => {
    const motivo = prompt('Motivo da reprovação:');
    if (motivo === null) return;

    setProcessando(id);
    const result = await reprovarPreCadastro(id, motivo);
    setProcessando(null);

    if (result.success) {
      alert('✅ Cadastro reprovado com sucesso!');
      carregarDados();
    } else {
      alert(`❌ Erro ao reprovar: ${result.error}`);
    }
  };

  // Aprova em lote
  const handleAprovarLote = async () => {
    if (selecionados.length === 0) {
      alert('Selecione pelo menos um cadastro para aprovar.');
      return;
    }

    if (!confirm(`Aprovar ${selecionados.length} cadastro(s)?`)) return;

    const nome = sessionStorage.getItem('amovin_nome') || 'Admin';
    let aprovados = 0;
    let erros = 0;

    for (const id of selecionados) {
      const result = await aprovarPreCadastro(id, nome);
      if (result.success) {
        aprovados++;
      } else {
        erros++;
      }
    }

    alert(`✅ ${aprovados} cadastros aprovados.\n❌ ${erros} erros.`);
    setSelecionados([]);
    carregarDados();
  };

  // Toggle seleção para lote
  const toggleSelecao = (id: string) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Alterna modo de aprovação
  const toggleModo = () => {
    setModoAprovacao((prev) => (prev === 'individual' ? 'lote' : 'individual'));
    setSelecionados([]);
  };

  return (
    <div className="min-h-screen bg-[#F8F4ED] p-6">
      {/* Cabeçalho */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
              📋 Sala de Espera
            </h1>
            <p className="text-[#6B7280] text-sm">
              Gerencie os pré-cadastros aguardando aprovação
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard.html')}
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
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
          <Card className="text-center p-4 border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.duplicados}</div>
            <div className="text-xs text-[#6B7280]">🔄 Duplicados</div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            value={filtro.status}
            onChange={(e) => setFiltro({ ...filtro, status: e.target.value })}
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">⏳ Pendentes</option>
            <option value="aprovado">✅ Aprovados</option>
            <option value="reprovado">❌ Reprovados</option>
            <option value="duplicado">🔄 Duplicados</option>
          </select>

          <select
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            value={filtro.tipo}
            onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
          >
            <option value="todos">Todos os tipos</option>
            <option value="beneficiario">👥 Beneficiários</option>
            <option value="profissional">👨‍⚕️ Profissionais</option>
            <option value="voluntario">💪 Voluntários</option>
          </select>

          <Button variant="outline" size="sm" onClick={carregarDados}>
            🔄 Atualizar
          </Button>

          <Button
            variant={modoAprovacao === 'lote' ? 'success' : 'outline'}
            size="sm"
            onClick={toggleModo}
          >
            {modoAprovacao === 'individual' ? '📦 Modo Lote' : '📋 Modo Individual'}
          </Button>

          {modoAprovacao === 'lote' && (
            <Button
              variant="success"
              size="sm"
              onClick={handleAprovarLote}
              disabled={selecionados.length === 0}
            >
              ✅ Aprovar Selecionados ({selecionados.length})
            </Button>
          )}
        </div>

        {/* Lista de pré-cadastros */}
        {loading ? (
          <div className="text-center py-12 text-[#6B7280]">⏳ Carregando...</div>
        ) : preCadastros.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-[#6B7280]">Nenhum pré-cadastro encontrado.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {preCadastros.map((item) => (
              <Card
                key={item.id}
                className={`
                  p-4 transition-all hover:shadow-md
                  ${item.status === 'pendente' ? 'border-l-4 border-yellow-500' : ''}
                  ${item.status === 'aprovado' ? 'border-l-4 border-green-500 opacity-70' : ''}
                  ${item.status === 'reprovado' ? 'border-l-4 border-red-500 opacity-70' : ''}
                  ${item.status === 'duplicado' ? 'border-l-4 border-purple-500 opacity-70' : ''}
                `}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Checkbox para modo lote */}
                    {modoAprovacao === 'lote' && item.status === 'pendente' && (
                      <input
                        type="checkbox"
                        checked={selecionados.includes(item.id)}
                        onChange={() => toggleSelecao(item.id)}
                        className="mt-1 w-4 h-4"
                      />
                    )}

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-[#1A1A1A]">{item.nome}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                          {item.tipo}
                        </span>
                        <span className={`
                          text-xs px-2 py-1 rounded-full
                          ${item.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${item.status === 'aprovado' ? 'bg-green-100 text-green-700' : ''}
                          ${item.status === 'reprovado' ? 'bg-red-100 text-red-700' : ''}
                          ${item.status === 'duplicado' ? 'bg-purple-100 text-purple-700' : ''}
                        `}>
                          {item.status === 'pendente' && '⏳ Pendente'}
                          {item.status === 'aprovado' && '✅ Aprovado'}
                          {item.status === 'reprovado' && '❌ Reprovado'}
                          {item.status === 'duplicado' && '🔄 Duplicado'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2 text-sm text-[#6B7280]">
                        <p>📞 {item.telefone || 'N/A'}</p>
                        <p>📧 {item.email || 'N/A'}</p>
                        <p>📍 {item.cidade || 'N/A'} {item.estado || ''}</p>
                        <p>📅 {formatDateBR(item.dataCadastro)}</p>
                        {item.responsavel && (
                          <p className="md:col-span-2">👤 Responsável: {item.responsavel}</p>
                        )}
                        {item.observacoes && (
                          <p className="md:col-span-2 text-xs text-[#6B7280]">
                            📝 {item.observacoes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  {item.status === 'pendente' && modoAprovacao === 'individual' && (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleAprovar(item.id)}
                        disabled={processando === item.id}
                      >
                        {processando === item.id ? '⏳...' : '✅ Aprovar'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReprovar(item.id)}
                        disabled={processando === item.id}
                      >
                        ❌ Reprovar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
