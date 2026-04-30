import { useRef, useState } from 'react';
import { Download, Edit2, Eye, EyeOff, FileSignature, Plus, Printer, Trash2, X } from 'lucide-react';
import { Professional, useStore } from '../store';
import ProfessionalTermModal from '../components/ProfessionalTermModal';
import { downloadElementAsPdf } from '../utils/pdf';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

type ProfessionalForm = Omit<Professional, 'id'>;

const specialties = [
  'Administrador', 'Advogado', 'Assistente Administrativo', 'Assistente Social', 'Educador Físico',
  'Fisioterapeuta', 'Fonoaudiólogo', 'Musicoterapeuta', 'Neuropediatra', 'Nutricionista',
  'Pediatra', 'Psicólogo / Neuropsicólogo', 'Psicomotricista', 'Psicopedagogo',
  'Psiquiatria Infantil', 'Terapeuta Ocupacional'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

const emptyForm: ProfessionalForm = { photoUrl: '', name: '', specialty: '', registration: '', cpf: '', phone: '', login: '', password: '', accessRole: 'consulta' };
const printStyles = `@page{size:A4 portrait;margin:16mm}body{font-family:Arial,sans-serif;color:#222}.sheet{max-width:760px;margin:0 auto}.header{display:flex;align-items:center;gap:24px;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:20px}.brand-logo{width:220px;height:70px;object-fit:contain}.photo-box{width:3cm;height:4cm;border:1px solid #111;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:12px;color:#777}.photo-box img{width:100%;height:100%;object-fit:cover}.row{display:flex;gap:16px;border-bottom:1px dashed #ddd;padding:8px 0}.field{flex:1}.label{font-size:12px;font-weight:bold;color:#555;text-transform:uppercase}.value{margin-top:3px;font-size:15px}`;

export default function ProfessionalsList() {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfessionalForm>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [termProfessional, setTermProfessional] = useState<Professional | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(emptyForm); setShowPassword(false); };
  const openNew = () => { setEditingId(null); setFormData(emptyForm); setIsFormOpen(true); };
  const openEdit = (professional: Professional) => { setEditingId(professional.id); setFormData({ ...emptyForm, ...professional }); setIsFormOpen(true); };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId) updateProfessional(editingId, formData);
    else addProfessional(formData);
    closeForm();
  };

  const preparePrint = (professional: Professional) => { setSelectedProfessional(professional); return new Promise<void>((resolve) => setTimeout(resolve, 0)); };
  const handlePrint = async (professional: Professional) => {
    await preparePrint(professional);
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Cadastro Profissional</title><style>${printStyles}</style></head><body>${printRef.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`);
    win.document.close();
  };
  const handlePDF = async (professional: Professional) => {
    await preparePrint(professional);
    if (!printRef.current) return;
    downloadElementAsPdf(printRef.current, `Profissional_${professional.name || 'Cadastro'}.pdf`, printStyles, 'Confirma a geração e download do PDF do profissional?');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-semibold text-gray-900">Profissionais</h1><button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-4 py-2 rounded-md flex items-center gap-2 font-semibold"><Plus size={20} /> Adicionar</button></div>
      <div className="bg-white shadow overflow-hidden sm:rounded-md"><ul className="divide-y divide-gray-200">
        {professionals.length === 0 ? <li className="px-6 py-4 text-center text-gray-500">Nenhum profissional cadastrado.</li> : [...professionals].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')).map((prof) => (
          <li key={prof.id} className="px-6 py-4 flex justify-between items-center gap-4"><div className="flex items-center gap-4"><div className="h-16 w-12 border bg-gray-50 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">{prof.photoUrl ? <img src={prof.photoUrl} alt="" className="h-full w-full object-cover" /> : '3x4'}</div><div><p className="font-medium text-gray-900">{prof.name}</p><p className="text-sm text-gray-500">{prof.specialty} {prof.registration ? `| Registro: ${prof.registration}` : ''} {prof.cpf ? `| CPF: ${prof.cpf}` : ''} | {prof.phone}</p><p className="text-xs text-gray-400">Login: {prof.login || 'nao definido'} | Ambiente: {prof.accessRole || 'consulta'}</p></div></div><div className="flex flex-wrap gap-2 justify-end"><button onClick={() => openEdit(prof)} className="text-blue-700 p-2 border rounded" title="Editar"><Edit2 size={18}/></button><button onClick={() => setTermProfessional(prof)} className="text-amber-700 p-2 border rounded" title="Termo de Parceria"><FileSignature size={18}/></button><button onClick={() => handlePDF(prof)} className="text-gray-600 p-2 border rounded" title="PDF"><Download size={18}/></button><button onClick={() => handlePrint(prof)} className="text-gray-600 p-2 border rounded" title="Imprimir"><Printer size={18}/></button><button onClick={() => window.confirm('Excluir profissional?') && deleteProfessional(prof.id)} className="text-red-600 p-2 border rounded" title="Excluir"><Trash2 size={18}/></button></div></li>
        ))}
      </ul></div>
      {isFormOpen && <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{editingId ? 'Editar Profissional' : 'Novo Profissional'}</h2><button type="button" onClick={closeForm} className="text-gray-600"><X size={20}/></button></div><form onSubmit={handleSave} className="space-y-4"><div className="flex gap-5 items-start"><label className="h-32 w-24 border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-500 text-center overflow-hidden cursor-pointer">{formData.photoUrl ? <img src={formData.photoUrl} alt="" className="h-full w-full object-cover" /> : 'Foto 3x4'}<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label><div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1"><Input label="Nome" required value={formData.name} onChange={(value) => setFormData({...formData, name: value})} className="md:col-span-2"/><Select label="Profissão" required value={formData.specialty} options={specialties} onChange={(value) => setFormData({...formData, specialty: value})}/><Input label="Registro profissional" value={formData.registration || ''} onChange={(value) => setFormData({...formData, registration: value})}/><Input label="CPF" value={formData.cpf || ''} onChange={(value) => setFormData({...formData, cpf: value})}/><Input label="Telefone" required value={formData.phone} onChange={(value) => setFormData({...formData, phone: value})}/><Select label="Ambiente de acesso" required value={formData.accessRole} options={['consulta','recepcao','admin']} onChange={(value) => setFormData({...formData, accessRole: value as ProfessionalForm['accessRole']})}/><Input label="Login escolhido" required value={formData.login} onChange={(value) => setFormData({...formData, login: value})}/><label className="block text-sm"><span className="font-medium">Senha</span><div className="flex gap-2"><input required type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="mt-1 px-3 border rounded-md">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></label></div></div><div className="flex justify-end gap-2 mt-4"><button type="button" onClick={closeForm} className="px-4 py-2 border rounded-md">Cancelar</button><button type="submit" className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-md">{editingId ? 'Atualizar' : 'Salvar'}</button></div></form></div></div>}
      {termProfessional && <ProfessionalTermModal professional={termProfessional} onClose={() => setTermProfessional(null)} />}
      <div style={{ display: 'none' }} ref={printRef}>{selectedProfessional && <div className="sheet"><div className="header"><img src={AMOVIN_LOGO_SRC} alt="Amovin" className="brand-logo" /><div><h1>Gestao Amovin Integrado</h1><p>Cadastro Profissional</p></div></div><div style={{display:'flex', gap:'20px'}}><div className="photo-box">{selectedProfessional.photoUrl ? <img src={selectedProfessional.photoUrl} alt="" /> : 'Foto 3x4'}</div><div style={{flex:1}}><Field label="Nome" value={selectedProfessional.name}/><Field label="Profissão" value={selectedProfessional.specialty}/><Field label="CPF" value={selectedProfessional.cpf}/><Field label="Registro" value={selectedProfessional.registration}/><Field label="Telefone" value={selectedProfessional.phone}/><Field label="Ambiente" value={selectedProfessional.accessRole}/></div></div></div>}</div>
    </div>
  );
}

function Input({ label, value, onChange, required, className = '' }: { label: string; value: string; required?: boolean; className?: string; onChange: (value: string) => void }) { return <label className={`block text-sm ${className}`}><span className="font-medium">{label}</span><input required={required} type="text" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></label>; }
function Select({ label, value, options, onChange, required }: { label: string; value: string; options: string[]; required?: boolean; onChange: (value: string) => void }) { return <label className="block text-sm"><span className="font-medium">{label}</span><select required={required} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="">Selecione...</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function Field({ label, value }: { label: string; value?: string }) { return <div className="row"><div className="field"><div className="label">{label}</div><div className="value">{value || '-'}</div></div></div>; }