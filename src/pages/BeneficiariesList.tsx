import React, { useState, useEffect } from 'react';
import { useStore, Beneficiary } from '../store';
import FRBForm from '../components/FRBForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function BeneficiariesList() {
  const { beneficiaries, deleteBeneficiary } = useStore();
  const [editingBen, setEditingBen] = useState<Beneficiary | undefined | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sortedList, setSortedList] = useState<Beneficiary[]>([]);

  // ✅ ORDENAÇÃO ALFABÉTICA FORÇADA
  useEffect(() => {
    console.log('📋 Beneficiários brutos:', beneficiaries?.length);
    
    if (!beneficiaries || beneficiaries.length === 0) {
      setSortedList([]);
      return;
    }

    const sorted = [...beneficiaries].sort((a, b) => {
      const nameA = (a.fullName || '').toUpperCase().trim();
      const nameB = (b.fullName || '').toUpperCase().trim();
      
      // Remove acentos
      const normalize = (str: string) => 
        str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      const result = normalize(nameA).localeCompare(normalize(nameB));
      return result;
    });

    console.log('✅ Lista ORDENADA:', sorted.map(b => b.fullName));
    setSortedList(sorted);
  }, [beneficiaries]);

  const handleOpenForm = (ben?: Beneficiary) => {
    setEditingBen(ben);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir?')) {
      deleteBeneficiary(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beneficiários (FRB)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {sortedList.length} | Ordem: A-Z
          </p>
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
        {sortedList.length === 0 ? (
          <div className="p-16 text-center">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-gray-400" />
             </div>
             <p className="text-lg font-medium text-gray-900">Nenhum beneficiário cadastrado</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sortedList.map((ben) => (
              <li key={ben.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white">
                      {ben.photoUrl ? (
                        <img 
                          className="h-14 w-14 object-cover" 
                          src={ben.photoUrl} 
                          alt={ben.fullName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="h-14 w-14 flex items-center justify-center text-gray-400 text-xs">Sem foto</span>
                      )}
                    </div>
                    <div className="ml-5">
                      <p className="text-base font-semibold text-gray-900">{ben.fullName}</p>
                      <p className="text-sm text-gray-500">
                        Resp: {ben.respName} | CID: {ben.cid}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenForm(ben)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(ben.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
          onClose={() => { setIsFormOpen(false); setEditingBen(null); }}
        />
      )}
    </div>
  );
}
