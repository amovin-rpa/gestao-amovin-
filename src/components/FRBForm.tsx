import React, { useState, useRef } from 'react';
import { useStore, Beneficiary } from '../store';
import { differenceInYears, parseISO } from 'date-fns';
import { Printer, Save, X, ClipboardList, FileSignature, Loader2 } from 'lucide-react';
import MedicalRecordModal from './MedicalRecordModal';
import TermModal from './TermModal';
import { AMOVIN_LOGO_SRC } from '../assets/logo';
import { S } from '../utils/strings';
import { uploadToImgur } from '../services/imgur'; // Importando seu serviço Imgur

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
  
  const [isSaving, setIsSaving] = useState(false); // Estado para o botão "Salvando..."
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Guardar o arquivo da foto
  const printRef = useRef<HTMLDivElement>(null);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [showTerm, setShowTerm] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Guarda o arquivo para subir ao salvar
      
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

  const handleSave = async () => {
    if (_readOnly) return;
    setIsSaving(true); // Ativa o carregamento

    try {
      let finalPhotoUrl = formData.photoUrl;

      // Se houver uma foto nova, sobe para o Imgur
      if (selectedFile) {
        const imgurLink = await uploadToImgur(selectedFile);
        if (imgurLink) {
          finalPhotoUrl = imgurLink;
        }
      }

      const dataToSave = { 
        ...formData, 
        photoUrl: finalPhotoUrl,
        matricula: formData.cpf ? formData.cpf.replace(/\D/g,'').substring(0,6) : '' 
      };

      if (initialData?.id) {
        await updateBeneficiary(initialData.id, dataToSave);
        addAuditLog('Editar beneficiario', formData.fullName || '');
      } else {
        await addBeneficiary(dataToSave as Omit<Beneficiary, 'id' | 'inclusionDate'>);
        addAuditLog('Cadastrar beneficiario', formData.fullName || '');
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar beneficiário:', err);
      alert('Houve um erro ao salvar os dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && printRef.current) {
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
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{S.fichaRegistro}</h2>
          <div className="flex space-x-2">
            {formData.id && (
              <button onClick={() => setShowMedicalRecord(true)} className="p-2 text-amber-700 hover:bg-amber-50 rounded flex items-center gap-1 border border-amber-200" title={S.prontuario}>
                <ClipboardList size={20} /> {S.prontuario}
              </button>
            )}
            <button onClick={() => setShowTerm(true)} className="p-2 text-gray-800 hover:bg-yellow-50 rounded flex items-center gap-1 border border-yellow-300 bg-yellow-50" title={S.termoAdesao}>
              <FileSignature size={20} /> {S.termoAdesao}
            </button>
            <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded" title={S.imprimir}>
              <Printer size={20} />
            </button>
            {!_readOnly && (
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded flex items-center gap-1 font-bold disabled:text-gray-400"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {isSaving ? 'Salvando...' : S.salvar}
              </button>
            )}
            <button onClick={onClose} className="p-2 text-red-600 hover:bg-red-50 rounded" title={S.fechar}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Foto 3x4" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-gray-400 text-center">Clique para Foto 3x4</span>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <span className="text-xs text-blue-600 mt-1 cursor-pointer">Alterar Foto</span>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><h3 className="text-lg font-semibold border-b pb-2 uppercase">DADOS DO BENEFICIÁRIO</h3></div>
                <div><label className="block text-sm font-medium">Nome Completo</label><input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 border p-2" /></div>
                <div><label className="block text-sm font-medium">Data de Nascimento</label><div className="flex items-center gap-2"><input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /><span className="text-sm font-bold mt-1 whitespace-nowrap">{calculateAge(formData.birthDate)}</span></div></div>
                <div><label className="block text-sm font-medium">CPF</label><input type="text" name="cpf" value={formData.cpf || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /></div>
                <div><label className="block text-sm font-medium">RG</label><input type="text" name="rg" value={formData.rg || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium">Diagnóstico/Condição</label><input type="text" name="diagnosis" value={formData.diagnosis || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><h3 className="text-lg font-semibold border-b pb-2 uppercase mt-4">DADOS DO RESPONSÁVEL</h3></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium">Nome completo do responsável</label><input type="text" name="respName" value={formData.respName || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /></div>
              <div><label className="block text-sm font-medium">Telefone/Whatsapp</label><input type="text" name="respPhone" value={formData.respPhone || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /></div>
              <div><label className="block text-sm font-medium">Vínculo</label><input type="text" name="respRelationship" value={formData.respRelationship || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'none' }} ref={printRef} className="print-container">
        <div className="header">
          <img src={AMOVIN_LOGO_SRC} alt="Amovin" className="brand-logo" />
          <div className="title-box"><h1>Gestao Amovin</h1><p>Ficha de Registro</p></div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div className="photo-box">{formData.photoUrl ? <img src={formData.photoUrl} alt="Foto" /> : 'Foto 3x4'}</div>
          <div style={{ flex: 1 }}>
            <div className="section-title">DADOS DO BENEFICIÁRIO</div>
            <p><strong>Nome:</strong> {formData.fullName}</p>
            <p><strong>Nasc:</strong> {formData.birthDate}</p>
            <p><strong>Diagnóstico:</strong> {formData.diagnosis}</p>
          </div>
        </div>
      </div>

      {showMedicalRecord && formData.id && <MedicalRecordModal beneficiary={formData as Beneficiary} onClose={() => setShowMedicalRecord(false)} />}
      {showTerm && <TermModal beneficiary={formData as Beneficiary} onClose={() => setShowTerm(false)} />}
    </div>
  );
}
