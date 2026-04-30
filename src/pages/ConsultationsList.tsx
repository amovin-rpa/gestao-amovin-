import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, Beneficiary, MedicalEvolution, MedicalRecord } from '../store';
import { Edit2, Plus, Printer, Save, X } from 'lucide-react';
import { differenceInYears, parseISO } from 'date-fns';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';

export default function ConsultationsList() {
  const { currentUser, beneficiaries, professionals, medicalRecords, consultations, saveMedicalRecord, addConsultation, addAuditLog } = useStore();
  const profId = currentUser?.professionalId || currentUser?.name || '';
  const currentProf = professionals.find(p => p.id === profId || p.name === currentUser?.name);

  const [selectedBenId, setSelectedBenId] = useState<string>('');
  const selectedBen = beneficiaries.find(b => b.id === selectedBenId) || null;
  const [editing, setEditing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Get this professional's record for selected beneficiary
  const ownRecord = useMemo(() => {
    if (!selectedBenId) return null;
    return medicalRecords.find(r => r.beneficiaryId === selectedBenId && (r.professionalId === profId || r.professionalName === currentUser?.name)) || null;
  }, [selectedBenId, medicalRecords, profId, currentUser?.name]);

  const [record, setRecord] = useState<Partial<MedicalRecord>>({});
  useEffect(() => {
    if (ownRecord) setRecord({ ...ownRecord });
    else if (selectedBen) setRecord({
      beneficiaryId: selectedBen.id, professionalId: profId,
      professionalName: currentUser?.name || '', specialty: currentProf?.specialty || currentUser?.specialty || '',
      registration: currentProf?.registration || '', evaluationDate: new Date().toISOString().split('T')[0],
      supports: [], feeding: [], liquids: [], evolutions: [], clinicalHistory: '',
    });
  }, [ownRecord, selectedBen]);

  const myConsultations = useMemo(() => consultations.filter(c => c.beneficiaryId === selectedBenId && (c.professionalId === profId || c.professionalId === currentUser?.name)), [consultations, selectedBenId, profId, currentUser?.name]);

  const age = selectedBen?.birthDate ? `${differenceInYears(new Date(), parseISO(selectedBen.birthDate))} anos` : '';

  // New evolution form
  const [showEvoForm, setShowEvoForm] = useState(false);
  const [newEvo, setNewEvo] = useState({ dateTime: '', activities: '', performance: '', planning: '' });

  const addEvolution = () => {
    if (!newEvo.dateTime && !newEvo.activities) return;
    const evos = [...(record.evolutions || []), { ...newEvo, id: crypto.randomUUID() }];
    setRecord(prev => ({ ...prev, evolutions: evos }));
    // Auto-save
    saveMedicalRecord({ ...record, evolutions: evos, beneficiaryId: selectedBenId, professionalId: profId, professionalName: currentUser?.name || '', specialty: currentProf?.specialty || currentUser?.specialty || '' } as MedicalRecord & { id?: string });
    // Also add as consultation record
    addConsultation({ beneficiaryId: selectedBenId, professionalId: profId, date: newEvo.dateTime.split('T')[0] || new Date().toISOString().split('T')[0], anamnesis: '', record: `${newEvo.activities} | Desempenho: ${newEvo.performance} | Planejamento: ${newEvo.planning}`, attendance: 'presente' });
    addAuditLog('Nova evolução', `Paciente: ${selectedBen?.fullName}, Prof: ${currentUser?.name}`);
    setNewEvo({ dateTime: '', activities: '', performance: '', planning: '' });
    setShowEvoForm(false);
  };

  const handleSaveRecord = () => {
    saveMedicalRecord({ ...record, beneficiaryId: selectedBenId, professionalId: profId, professionalName: currentUser?.name || '', specialty: currentProf?.specialty || currentUser?.specialty || '', evolutions: record.evolutions || [] } as MedicalRecord & { id?: string });
    addAuditLog('Salvar prontuário', `Paciente: ${selectedBen?.fullName}`);
    setEditing(false);
    alert('Prontuário salvo.');
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Prontuário</title><style>@page{size:A4 portrait;margin:14mm}body{font-family:Arial,sans-serif;color:#111;font-size:13px}h2,h3{margin-top:16px;border-bottom:1px solid #ddd;padding-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:8px}th,td{border:1px solid #ddd;padding:5px;text-align:left;font-size:12px}th{background:#f3f4f6}.header{display:flex;align-items:center;justify-content:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:18px}.brand-logo{width:230px;height:75px;object-fit:contain}.field{margin-bottom:6px}.label{font-weight:bold;color:#555;font-size:11px;text-transform:uppercase}.value{margin-top:2px}.signature{margin-top:46px;text-align:center}.line{width:340px;border-top:1px solid #111;margin:0 auto 5px}</style></head><body>${printRef.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`);
    win.document.close();
  };

  const setField = (field: string, value: string | string[] | MedicalEvolution[]) => setRecord(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">{S.prontuario}</h1>
      </div>

      {/* Beneficiary selector */}
      <div className="bg-white rounded-xl border border-yellow-100 p-5 shadow-sm">
        <label className="block text-sm font-semibold text-gray-800 mb-2">{'Selecione o ' + S.beneficiario}</label>
        <select value={selectedBenId} onChange={(e) => { setSelectedBenId(e.target.value); setEditing(false); }} className="w-full border rounded-md p-2">
          <option value="">{'Escolha um ' + S.beneficiario + '...'}</option>
          {beneficiaries.map(b => <option key={b.id} value={b.id}>{b.fullName} - {b.diagnosis || 'Sem diagnostico'}</option>)}
        </select>
      </div>

      {selectedBen && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between p-4 bg-yellow-50 border-b gap-3">
            <div className="flex items-center gap-3">
              <div className="h-16 w-12 border bg-white overflow-hidden flex items-center justify-center text-[9px] text-gray-400">{selectedBen.photoUrl ? <img src={selectedBen.photoUrl} alt="" className="h-full w-full object-cover" /> : '3x4'}</div>
              <div><p className="font-bold text-gray-900">{selectedBen.fullName}</p><p className="text-xs text-gray-500">{selectedBen.diagnosis} | CID: {selectedBen.cid} | Idade: {age}</p><p className="text-xs text-gray-500">Resp: {selectedBen.respName} | Tel: {selectedBen.respPhone}</p></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!editing && <button onClick={() => setEditing(true)} className="text-blue-700 p-2 border rounded text-sm inline-flex gap-1 items-center"><Edit2 size={16}/> {S.editar}</button>}
              {editing && <button onClick={handleSaveRecord} className="text-green-700 p-2 border rounded text-sm inline-flex gap-1 items-center bg-green-50"><Save size={16}/> {S.salvar}</button>}
              {editing && <button onClick={() => setEditing(false)} className="text-gray-600 p-2 border rounded text-sm inline-flex gap-1 items-center"><X size={16}/> {S.cancelar}</button>}
              <button onClick={() => setShowEvoForm(true)} className="text-amber-800 p-2 border border-amber-300 rounded text-sm inline-flex gap-1 items-center bg-amber-50"><Plus size={16}/> {S.evolucao}</button>
              <button onClick={handlePrint} className="text-gray-600 p-2 border rounded text-sm inline-flex gap-1 items-center"><Printer size={16}/> {S.imprimir}</button>
            </div>
          </div>

          {/* Prontuário content - read only unless editing */}
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Fld label="Peso" value={record.weight} editing={editing} onChange={v => setField('weight', v)} />
              <Fld label="Altura" value={record.height} editing={editing} onChange={v => setField('height', v)} />
              <Fld label="Data avaliação" value={record.evaluationDate} editing={editing} onChange={v => setField('evaluationDate', v)} type="date" />
            </div>
            <Fld label="Medicamentos em uso" value={record.medicationInUse || selectedBen.medicationDetails} editing={editing} onChange={v => setField('medicationInUse', v)} />
            <Fld label="Suportes utilizados" value={(record.supports || []).join(', ')} editing={editing} onChange={v => setField('supportObservations', v)} />

            <h3 className="font-bold text-gray-800 border-b pb-1 pt-2">História Clínica</h3>
            <Fld label="História Clínica" value={record.clinicalHistory} editing={editing} onChange={v => setField('clinicalHistory', v)} multiline />
            <Fld label="Queixa Principal" value={record.mainComplaint} editing={editing} onChange={v => setField('mainComplaint', v)} multiline />
            <Fld label="HMP/HMA" value={record.hmpHma} editing={editing} onChange={v => setField('hmpHma', v)} multiline />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Fld label="Restrição alimentar" value={`${record.foodRestriction || selectedBen.hasAllergies || '-'} ${record.foodRestrictionDetails || selectedBen.allergiesDetails || ''}`} editing={editing} onChange={v => setField('foodRestrictionDetails', v)} />
              <Fld label="Cirurgias" value={`${record.surgeries || '-'} ${record.surgeryDetails || ''}`} editing={editing} onChange={v => setField('surgeryDetails', v)} />
            </div>
            <Fld label="Saúde Geral" value={record.generalHealth} editing={editing} onChange={v => setField('generalHealth', v)} multiline />

            <h3 className="font-bold text-gray-800 border-b pb-1 pt-2">Anamnese e Atendimentos</h3>
            {myConsultations.length === 0 ? <p className="text-sm text-gray-500">Nenhum atendimento registrado.</p> :
              myConsultations.map(c => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-3 text-sm border">
                  <p className="font-medium text-gray-900">{new Date(c.date).toLocaleDateString()} - <span className={c.attendance === 'presente' ? 'text-green-700' : 'text-red-700'}>{c.attendance === 'presente' ? 'Presente' : 'Falta'}</span></p>
                  {c.anamnesis && <p className="mt-1"><strong>Anamnese:</strong> {c.anamnesis}</p>}
                  {c.record && <p className="mt-1"><strong>Evolução:</strong> {c.record}</p>}
                </div>
              ))
            }

            <h3 className="font-bold text-gray-800 border-b pb-1 pt-2">Registro de Evolução de Atendimento</h3>
            {(record.evolutions || []).length === 0 ? <p className="text-sm text-gray-500">Nenhuma evolução registrada.</p> :
              <table className="min-w-full text-sm"><thead><tr className="bg-gray-50"><th className="p-2 text-left">Data/Hora</th><th className="p-2 text-left">Atividades</th><th className="p-2 text-left">Desempenho</th><th className="p-2 text-left">Planejamento</th></tr></thead><tbody>{(record.evolutions || []).map(evo => <tr key={evo.id} className="border-t"><td className="p-2">{evo.dateTime ? new Date(evo.dateTime).toLocaleString() : '-'}</td><td className="p-2">{evo.activities}</td><td className="p-2">{evo.performance}</td><td className="p-2">{evo.planning}</td></tr>)}</tbody></table>
            }
          </div>
        </div>
      )}

      {/* Evolution form modal */}
      {showEvoForm && <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Registro de Evolução de Atendimento</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium">Data e Hora</label><input type="datetime-local" value={newEvo.dateTime} onChange={e => setNewEvo({...newEvo, dateTime: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
          <div><label className="block text-sm font-medium">Atividades Realizadas</label><textarea rows={3} value={newEvo.activities} onChange={e => setNewEvo({...newEvo, activities: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
          <div><label className="block text-sm font-medium">Desempenho do Dia</label><textarea rows={3} value={newEvo.performance} onChange={e => setNewEvo({...newEvo, performance: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
          <div><label className="block text-sm font-medium">Planejamento / Orientação à Família</label><textarea rows={3} value={newEvo.planning} onChange={e => setNewEvo({...newEvo, planning: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
          <div className="flex justify-end gap-2"><button onClick={() => setShowEvoForm(false)} className="px-4 py-2 border rounded-md">Cancelar</button><button onClick={addEvolution} className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-md">Salvar Evolução</button></div>
        </div>
      </div></div>}

      {/* Hidden print template */}
      <div style={{ display: 'none' }} ref={printRef}>{selectedBen && <div style={{ padding: '30px', width: '790px' }}>
        <div className="header"><img src={AMOVIN_LOGO_SRC} className="brand-logo" /></div>
        <h2 style={{ textAlign: 'center', fontSize: '18px', margin: '16px 0' }}>Prontuário - {selectedBen.fullName}</h2>
        <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ width: '3cm', height: '4cm', border: '1px solid #111', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#777', flexShrink: 0 }}>
            {selectedBen.photoUrl ? <img src={selectedBen.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Foto 3x4'}
          </div>
          <div style={{ flex: 1 }}>
            <div className="field"><div className="label">Nome</div><div className="value">{selectedBen.fullName}</div></div>
            <div className="field"><div className="label">Diagnóstico / CID</div><div className="value">{selectedBen.diagnosis} / {selectedBen.cid}</div></div>
            <div className="field"><div className="label">Responsável / Tel</div><div className="value">{selectedBen.respName} / {selectedBen.respPhone}</div></div>
            <div className="field"><div className="label">Peso / Altura</div><div className="value">{record.weight || '-'} / {record.height || '-'}</div></div>
          </div>
        </div>
        <div className="field"><div className="label">História Clínica</div><div className="value">{record.clinicalHistory || '-'}</div></div>
        <div className="field"><div className="label">Queixa Principal</div><div className="value">{record.mainComplaint || '-'}</div></div>
        <div className="field"><div className="label">Saúde Geral</div><div className="value">{record.generalHealth || '-'}</div></div>
        <h3>Atendimentos</h3>
        <table><thead><tr><th>Data</th><th>Status</th><th>Anamnese</th><th>Evolução</th></tr></thead><tbody>{myConsultations.map(c => <tr key={c.id}><td>{new Date(c.date).toLocaleDateString()}</td><td>{c.attendance}</td><td>{c.anamnesis || '-'}</td><td>{c.record || '-'}</td></tr>)}</tbody></table>
        <h3>Evoluções</h3>
        <table><thead><tr><th>Data/Hora</th><th>Atividades</th><th>Desempenho</th><th>Planejamento</th></tr></thead><tbody>{(record.evolutions || []).map(evo => <tr key={evo.id}><td>{evo.dateTime ? new Date(evo.dateTime).toLocaleString() : '-'}</td><td>{evo.activities}</td><td>{evo.performance}</td><td>{evo.planning}</td></tr>)}</tbody></table>
        <div className="signature"><div className="line"></div><strong>{currentUser?.name}</strong><br/>{currentProf?.specialty || currentUser?.specialty || ''}{currentProf?.hasRegistration === 'Sim' && currentProf?.registration ? ` - Reg: ${currentProf.registration}` : ''}<br/>{new Date().toLocaleDateString()}</div>
      </div>}</div>
    </div>
  );
}

function Fld({ label, value, editing, onChange, multiline, type }: { label: string; value?: string; editing: boolean; onChange: (v: string) => void; multiline?: boolean; type?: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase">{label}</p>
      {editing ? (
        multiline ? <textarea rows={3} value={value || ''} onChange={e => onChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
        : <input type={type || 'text'} value={value || ''} onChange={e => onChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm" />
      ) : <p className="text-sm text-gray-900 mt-0.5">{value || '-'}</p>}
    </div>
  );
}
