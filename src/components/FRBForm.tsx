import React, { useState, useRef } from 'react';
import { useStore, Beneficiary } from '../store';
import { differenceInYears, parseISO } from 'date-fns';
import { Printer, Save, X, ClipboardList, FileSignature } from 'lucide-react';
import MedicalRecordModal from './MedicalRecordModal';
import TermModal from './TermModal';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

interface Props {
  initialData?: Beneficiary;
  onClose: () => void;
  readOnly?: boolean;
}

export default function FRBForm({ initialData, onClose, readOnly = false }: Props) {
  const { addBeneficiary, updateBeneficiary, currentUser, addAuditLog } = useStore();
  const _readOnly = readOnly;
  const [formData, setFormData] = useState<Partial<Beneficiary>>(initialData || {
    activities: [],
    supportLevel: 'Não',
    isStudent: 'Não',
    hasAllergies: 'Não',
    continuousMedication: 'Não',
  });
  const printRef = useRef<HTMLDivElement>(null);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [showTerm, setShowTerm] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return differenceInYears(new Date(), parseISO(dateString)) + ' anos';
    } catch {
      return '';
    }
  };

  const handleCheckboxChange = (value: string) => {
    const current = formData.activities || [];
    if (current.includes(value)) {
      setFormData(prev => ({ ...prev, activities: current.filter(a => a !== value) }));
    } else {
      setFormData(prev => ({ ...prev, activities: [...current, value] }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (_readOnly) return;
    if (initialData?.id) {
      updateBeneficiary(initialData.id, formData);
      addAuditLog('Editar beneficiário', formData.fullName || '');
    } else {
      addBeneficiary(formData as Omit<Beneficiary, 'id' | 'inclusionDate'>);
      addAuditLog('Cadastrar beneficiário', formData.fullName || '');
    }
    onClose();
  };

  const handlePrint = () => {
    // Open a new window with the print content and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow && printRef.current) {
      // Temporarily show the print ref content to copy its HTML
      printRef.current.style.display = 'block';
      const printContent = printRef.current.innerHTML;
      printRef.current.style.display = 'none';

      printWindow.document.write(`
        <html>
          <head>
            <title>Impressão FRB</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              @page { size: A4 portrait; margin: 16mm; }
              .print-container { max-width: 800px; margin: 0 auto; }
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
              .brand-logo { width: 220px; height: 70px; object-fit: contain; }
              .photo-box { width: 3cm; height: 4cm; border: 1px solid #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
              .photo-box img { width: 100%; height: 100%; object-fit: cover; }
              .title-box { text-align: center; flex-grow: 1; }
              .section-title { font-weight: bold; background-color: #f0f0f0; padding: 5px; margin-top: 20px; border: 1px solid #ddd; }
              .row { display: flex; gap: 20px; margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 5px; }
              .field { flex: 1; }
              .label { font-weight: bold; font-size: 12px; color: #555; }
              .value { font-size: 14px; margin-top: 2px; }
              .signature-area { margin-top: 50px; text-align: center; }
              .signature-line { width: 300px; border-top: 1px solid #000; margin: 0 auto 5px auto; }
              .signature-name { font-weight: bold; }
              .signature-date { font-size: 12px; color: #555; }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Ficha de Registro do Beneficiário (FRB)</h2>
          <div className="flex space-x-2">
            {formData.id && (
              <button onClick={() => setShowMedicalRecord(true)} className="p-2 text-amber-700 hover:bg-amber-50 rounded flex items-center gap-1 border border-amber-200" title="Prontuário">
                <ClipboardList size={20} /> Prontuário
              </button>
            )}
            <button onClick={() => setShowTerm(true)} className="p-2 text-gray-800 hover:bg-yellow-50 rounded flex items-center gap-1 border border-yellow-300 bg-yellow-50" title="Termo de Adesão e Compromisso">
              <FileSignature size={20} /> Termo de Adesão
            </button>
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title="Imprimir">
              <Printer size={20} /> Imprimir
            </button>
            {!_readOnly && (
              <button onClick={handleSave} className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1" title="Salvar">
                <Save size={20} /> Salvar
              </button>
            )}
            <button onClick={onClose} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Fechar">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Form Content */}
          <div className="space-y-6">
            
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Foto 3x4" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center">Foto 3x4<br/>Retangular</span>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <span className="text-xs text-blue-600 mt-1 cursor-pointer">Alterar Foto</span>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold border-b pb-2">DADOS DO BENEFICIÁRIO</h3>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                  <div className="flex items-center gap-2">
                    <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                    <span className="text-sm font-medium text-gray-600 mt-1 whitespace-nowrap">{calculateAge(formData.birthDate)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gênero</label>
                  <select name="gender" value={formData.gender || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                    <option value="">Selecione...</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Não-Binário">Não-Binário</option>
                    <option value="Prefiro não responder">Prefiro não responder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">RG</label>
                  <input type="text" name="rg" value={formData.rg || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">CPF</label>
                  <input type="text" name="cpf" value={formData.cpf || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnóstico/Condição</label>
                  <input type="text" name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">CID (Código Internacional de Doença)</label>
                  <input type="text" name="cid" value={formData.cid || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nível de Suporte</label>
                  <select name="supportLevel" value={formData.supportLevel || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>

                {formData.supportLevel === 'Sim' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Qual nível de suporte?</label>
                    <input type="text" name="supportLevelDetails" value={formData.supportLevelDetails || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Comorbidades
                    <span className="block text-xs font-normal text-gray-500">(Outras condições associadas Ex. Epilepsia, distúrbios do sono, seletividade alimentar e etc)</span>
                  </label>
                  <select name="hasComorbidities" value={formData.hasComorbidities || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                    <option value="">Selecione...</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>

                {formData.hasComorbidities === 'Sim' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Quais comorbidades?</label>
                    <textarea name="comorbidities" value={formData.comorbidities || ''} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Estudante?</label>
                  <select name="isStudent" value={formData.isStudent || 'Não'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>

                {formData.isStudent === 'Sim' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Escola</label>
                      <input type="text" name="schoolName" value={formData.schoolName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Série</label>
                      <input type="text" name="schoolGrade" value={formData.schoolGrade || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold border-b pb-2 mt-4">PERFIL E NECESSIDADES</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Possui alergia ou restrição alimentar?</label>
                <select name="hasAllergies" value={formData.hasAllergies || 'Não'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {formData.hasAllergies === 'Sim' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qual alergia?</label>
                  <input type="text" name="allergiesDetails" value={formData.allergiesDetails || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Faz uso de medicação contínua?</label>
                <select name="continuousMedication" value={formData.continuousMedication || 'Não'} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </div>

              {formData.continuousMedication === 'Sim' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qual medicação?</label>
                  <input type="text" name="medicationDetails" value={formData.medicationDetails || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quais atendimentos ou atividades você mais busca na associação hoje:</label>
                <div className="flex flex-wrap gap-4">
                  {['Apoio Informativo Jurídico/Direitos', 'Oficinas Pedagógicas', 'Terapias', 'Lazer/Socialização', 'Acolhimento Familiar'].map(activity => (
                    <label key={activity} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={formData.activities?.includes(activity) || false}
                        onChange={() => handleCheckboxChange(activity)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="text-sm text-gray-700">{activity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold border-b pb-2 mt-4">DADOS DO RESPONSÁVEL</h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Nome completo do responsável</label>
                <input type="text" name="respName" value={formData.respName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone/Whatsapp</label>
                <input type="text" name="respPhone" value={formData.respPhone || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vínculo com Beneficiário</label>
                <select name="respRelationship" value={formData.respRelationship || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="">Selecione...</option>
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Avó">Avó</option>
                  <option value="Avô">Avô</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {formData.respRelationship === 'Outros' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qual vínculo?</label>
                  <input type="text" name="respRelationshipOther" value={formData.respRelationshipOther || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">RG</label>
                <input type="text" name="respRg" value={formData.respRg || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">CPF</label>
                <input type="text" name="respCpf" value={formData.respCpf || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Endereço completo</label>
                <input type="text" name="respAddress" value={formData.respAddress || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Renda familiar</label>
                <select name="familyIncome" value={formData.familyIncome || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="">Selecione...</option>
                  <option value="Até 2.000">Até 2.000</option>
                  <option value="2.001 a 5.000">2.001 a 5.000</option>
                  <option value="5.001 a 10.000">5.001 a 10.000</option>
                  <option value="Acima de 10.001">Acima de 10.001</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Criança incluída como dependente no IRPF?</label>
                <select name="irpfDependent" value={formData.irpfDependent || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2">
                  <option value="">Selecione...</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                  <option value="Não tenho certeza">Não tenho certeza</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print/PDF Template */}
      <div style={{ display: 'none' }} ref={printRef} className="print-container bg-white p-8 w-[800px]">
        <div className="header">
          <img src={AMOVIN_LOGO_SRC} alt="Logo Amovin" className="brand-logo" />
          <div className="title-box">
            <h1 style={{ margin: 0, fontSize: '24px' }}>Gestao Amovin Integrado</h1>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'normal' }}>Ficha de Registro do Beneficiário</h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div className="photo-box">
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="Foto" />
            ) : (
              <span style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>Foto 3x4</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div className="section-title" style={{ marginTop: 0 }}>DADOS DO BENEFICIÁRIO</div>
            <div className="row">
              <div className="field" style={{ flex: 2 }}><div className="label">Nome Completo</div><div className="value">{formData.fullName || '-'}</div></div>
              <div className="field"><div className="label">Data de Nasc. / Idade</div><div className="value">{formData.birthDate ? `${new Date(formData.birthDate).toLocaleDateString()} (${calculateAge(formData.birthDate)})` : '-'}</div></div>
            </div>
            <div className="row">
              <div className="field"><div className="label">Gênero</div><div className="value">{formData.gender || '-'}</div></div>
              <div className="field"><div className="label">RG</div><div className="value">{formData.rg || '-'}</div></div>
              <div className="field"><div className="label">CPF</div><div className="value">{formData.cpf || '-'}</div></div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="field"><div className="label">Diagnóstico/Condição</div><div className="value">{formData.diagnosis || '-'}</div></div>
          <div className="field"><div className="label">CID</div><div className="value">{formData.cid || '-'}</div></div>
        </div>
        <div className="row">
          <div className="field"><div className="label">Nível de Suporte</div><div className="value">{formData.supportLevel === 'Sim' ? `Sim - ${formData.supportLevelDetails}` : 'Não'}</div></div>
          <div className="field"><div className="label">Estudante</div><div className="value">{formData.isStudent === 'Sim' ? `Sim - Escola: ${formData.schoolName} (Série: ${formData.schoolGrade})` : 'Não'}</div></div>
        </div>
        <div className="row">
          <div className="field"><div className="label">Comorbidades</div><div className="value">{formData.comorbidities || '-'}</div></div>
        </div>

        <div className="section-title">PERFIL E NECESSIDADES</div>
        <div className="row">
          <div className="field"><div className="label">Alergia/Restrição</div><div className="value">{formData.hasAllergies === 'Sim' ? `Sim - ${formData.allergiesDetails}` : 'Não'}</div></div>
          <div className="field"><div className="label">Medicação Contínua</div><div className="value">{formData.continuousMedication === 'Sim' ? `Sim - ${formData.medicationDetails}` : 'Não'}</div></div>
        </div>
        <div className="row">
          <div className="field">
            <div className="label">Atividades Buscadas</div>
            <div className="value">{formData.activities?.length ? formData.activities.join(', ') : '-'}</div>
          </div>
        </div>

        <div className="section-title">DADOS DO RESPONSÁVEL</div>
        <div className="row">
          <div className="field" style={{ flex: 2 }}><div className="label">Nome Completo</div><div className="value">{formData.respName || '-'}</div></div>
          <div className="field"><div className="label">Vínculo</div><div className="value">{formData.respRelationship === 'Outros' ? formData.respRelationshipOther : formData.respRelationship || '-'}</div></div>
        </div>
        <div className="row">
          <div className="field"><div className="label">Telefone/Whatsapp</div><div className="value">{formData.respPhone || '-'}</div></div>
          <div className="field"><div className="label">RG</div><div className="value">{formData.respRg || '-'}</div></div>
          <div className="field"><div className="label">CPF</div><div className="value">{formData.respCpf || '-'}</div></div>
        </div>
        <div className="row">
          <div className="field"><div className="label">Endereço</div><div className="value">{formData.respAddress || '-'}</div></div>
        </div>
        <div className="row">
          <div className="field"><div className="label">Renda Familiar</div><div className="value">{formData.familyIncome || '-'}</div></div>
          <div className="field"><div className="label">Dependente IRPF</div><div className="value">{formData.irpfDependent || '-'}</div></div>
        </div>

        <div className="signature-area">
          <div className="signature-line"></div>
          <div className="signature-name">{currentUser?.name}</div>
          <div className="signature-date">Assinado digitalmente em: {new Date().toLocaleDateString()}</div>
        </div>

      </div>
      {showMedicalRecord && formData.id && (
        <MedicalRecordModal beneficiary={formData as Beneficiary} onClose={() => setShowMedicalRecord(false)} />
      )}
      {showTerm && (
        <TermModal beneficiary={formData as Beneficiary} onClose={() => setShowTerm(false)} />
      )}
    </div>
  );
}