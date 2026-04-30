import React, { useState } from 'react';
import { useStore, Beneficiary } from '../store';
import FRBForm from '../components/FRBForm';
import { FileText } from 'lucide-react';

export default function PatientsList() {
  const { beneficiaries } = useStore();
  const [viewingBen, setViewingBen] = useState<Beneficiary | null>(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pacientes (Consulta)</h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {beneficiaries.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">Nenhum paciente cadastrado no sistema.</li>
          ) : (
            beneficiaries.map((ben) => (
              <li key={ben.id}>
                <div className="px-4 py-4 flex items-center sm:px-6 justify-between hover:bg-gray-50 transition-colors">
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
                        {ben.diagnosis || 'Sem diagnóstico'} | CID: {ben.cid || '-'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => setViewingBen(ben)}
                      className="text-gray-500 hover:text-blue-600 p-2 border rounded flex items-center gap-1 text-sm bg-white shadow-sm"
                      title="Ver Prontuário / FRB"
                    >
                      <FileText size={16} /> FRB Completo
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {viewingBen && (
        <FRBForm
          initialData={viewingBen}
          onClose={() => setViewingBen(null)}
        />
      )}
    </div>
  );
}