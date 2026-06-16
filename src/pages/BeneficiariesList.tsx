import React, { useState, useMemo } from 'react';
import { useStore, Beneficiary } from '../store';
import FRBForm from '../components/FRBForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function BeneficiariesList() {
  const { beneficiaries, deleteBeneficiary } = useStore();
  const [editingBen, setEditingBen] = useState<Beneficiary | undefined | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ✅ ORDENAÇÃO ALFABÉTICA (A-Z) COM useMemo
  const sortedBeneficiaries = useMemo(() => {
    const list = beneficiaries || [];
    return [...list].sort((a, b) => {
      const nameA = a.fullName || '';
      const nameB = b.fullName || '';
      return nameA.localeCompare(nameB, 'pt-BR'); // Respeita acentos: Á, Ã, Ç
    });
  }, [beneficiaries]);

  const handleOpenForm = (ben?: Beneficiary) => {
    setEditingBen(ben);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este beneficiário?')) {
      deleteBeneficiary(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficiários (FRB)</h1>
          <p className="text-sm text-gray-500 mt-1">Total de {sortedBeneficiaries.length} cadastrados</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Novo Beneficiário
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {sortedBeneficiaries.length === 0 ? (
          <div className="p-16 text-center">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-gray-400" />
             </div>
             <p className="text-lg font-medium text-gray-900">Nenhum beneficiário cadastrado</p>
             <p className="text-gray-500 text-sm mt-1">Clique no botão acima para adicionar o primeiro.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sortedBeneficiaries.map((ben) => (
              <li key={ben.id} className="hover:bg-gray-50 transition-colors duration-200">
                <div className="px-6 py-5 flex items-center sm:px-8 justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm">
                      {ben.photoUrl ? (
                        <img 
                          className="h-14 w-14 object-cover" 
                          src={ben.photoUrl} 
                          alt={ben.fullName} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`h-14 w-14 flex items-center justify-center text-gray-400 ${ben.photoUrl ? 'hidden' : ''}`}>
                        <span className="text-xs font-medium">Sem foto</span>
                      </div>
                    </div>
                    
                    <div className="ml-5">
                      <p className="text-base font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                        {ben.fullName}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <span className="truncate max-w-[200px]">Resp: {ben.respName || '-'}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0"></span>
                        <span>CID: {ben.cid || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenForm(ben)}
                      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all"
                      title="Editar / Visualizar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ben.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isFormOpen && (
        <FRBForm
          initialData={editingBen || undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBen(null);
          }}
        />
      )}
    </div>
  );
}
