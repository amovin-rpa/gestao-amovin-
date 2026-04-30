import React, { useState } from 'react';
import { useStore, Beneficiary } from '../store';
import FRBForm from '../components/FRBForm';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function BeneficiariesList() {
  const { beneficiaries, deleteBeneficiary } = useStore();
  const [editingBen, setEditingBen] = useState<Beneficiary | undefined | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Beneficiários (FRB)</h1>
        <button
          onClick={() => handleOpenForm()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Beneficiário
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {beneficiaries.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">Nenhum beneficiário cadastrado.</li>
          ) : (
            beneficiaries.map((ben) => (
              <li key={ben.id}>
                <div className="px-4 py-4 flex items-center sm:px-6 justify-between">
                  <div className="flex items-center min-w-0">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gray-100 border">
                      {ben.photoUrl ? (
                        <img className="h-12 w-12 object-cover" src={ben.photoUrl} alt="" />
                      ) : (
                        <span className="h-12 w-12 flex items-center justify-center text-gray-400 text-xs">Sem foto</span>
                      )}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600 truncate">{ben.fullName}</p>
                      <p className="text-sm text-gray-500">
                        Resp: {ben.respName} | CID: {ben.cid || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenForm(ben)}
                      className="text-gray-500 hover:text-blue-600 p-2 border rounded"
                      title="Editar / Ver"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ben.id)}
                      className="text-gray-500 hover:text-red-600 p-2 border rounded"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
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