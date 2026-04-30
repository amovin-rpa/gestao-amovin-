import React, { useState } from 'react';
import { useStore, Consultation } from '../store';
import { Plus } from 'lucide-react';

export default function ConsultationsList() {
  const { currentUser, consultations, beneficiaries, addConsultation } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Consultation>>({
    date: new Date().toISOString().split('T')[0],
    attendance: 'presente',
    anamnesis: '',
    record: '',
    beneficiaryId: '',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beneficiaryId) return alert('Selecione um paciente');
    
    addConsultation({
      ...formData as Omit<Consultation, 'id'>,
      professionalId: currentUser?.professionalId || currentUser?.name || 'Unknown',
    });
    setIsFormOpen(false);
  };

  const myConsultations = consultations.filter(
    c => c.professionalId === currentUser?.professionalId || c.professionalId === currentUser?.name
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meus Atendimentos</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus size={20} /> Novo Atendimento
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {myConsultations.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">Nenhum atendimento registrado.</li>
          ) : (
            myConsultations.map((c) => {
              const ben = beneficiaries.find(b => b.id === c.beneficiaryId);
              return (
                <li key={c.id} className="px-6 py-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{ben?.fullName || 'Paciente Excluído'}</p>
                      <p className="text-sm text-gray-500">{new Date(c.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.attendance === 'presente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.attendance === 'presente' ? 'Presente' : 'Falta'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p><strong>Anamnese:</strong> {c.anamnesis || 'Não registrada'}</p>
                    <p><strong>Prontuário:</strong> {c.record || 'Não registrado'}</p>
                  </div>
                </li>
              )
            })
          )}
        </ul>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Registro de Atendimento</h2>
            <form onSubmit={handleSave} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium">Paciente</label>
                <select required value={formData.beneficiaryId} onChange={e => setFormData({...formData, beneficiaryId: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  <option value="">Selecione o paciente...</option>
                  {beneficiaries.map(b => (
                    <option key={b.id} value={b.id}>{b.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Data</label>
                <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium">Presença</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="attendance" value="presente" checked={formData.attendance === 'presente'} onChange={e => setFormData({...formData, attendance: e.target.value as 'presente'|'falta'})} />
                    Presente
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="attendance" value="falta" checked={formData.attendance === 'falta'} onChange={e => setFormData({...formData, attendance: e.target.value as 'presente'|'falta'})} />
                    Falta
                  </label>
                </div>
              </div>

              {formData.attendance === 'presente' && (
                <>
                  <div>
                    <label className="block text-sm font-medium">Anamnese / Observações Iniciais</label>
                    <textarea rows={3} value={formData.anamnesis} onChange={e => setFormData({...formData, anamnesis: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Prontuário (Registro do Atendimento)</label>
                    <textarea required rows={5} value={formData.record} onChange={e => setFormData({...formData, record: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}