import { useRef, useState } from 'react';
import { Edit2, Eye, EyeOff, Plus, Printer, Trash2, X } from 'lucide-react';
import { Professional, useStore } from '../store';
import ProfessionalTermModal from '../components/ProfessionalTermModal';
import { S } from '../utils/strings';
import { AMOVIN_LOGO_SRC } from '../assets/logo';

type ProfessionalForm = Omit<Professional, 'id'>;

const specialties = [
  'Administrador', 'Advogado', 'Assistente Administrativo', 'Assistente Social', 'Educador Físico',
  'Fisioterapeuta', 'Fonoaudiólogo', 'Musicoterapeuta', 'Neuropediatra', 'Neuropsicólogo',
  'Nutricionista', 'Pediatra', 'Psicólogo', 'Psicomotricista', 'Psicopedagogo',
  'Psiquiatria Infantil', 'Terapeuta Ocupacional'
].sort((a, b) => a.localeCompare(b, 'pt-BR'));

const emptyForm: ProfessionalForm = { photoUrl: '', name: '', specialty: '', hasRegistration: 'Não', registration: '', cpf: '', phone: '', bondType: '', login: '', password: '', accessRole: 'consulta' };
const printStyles = `@page{size:A4 portrait;margin:16mm}body{font-family:Arial,sans-serif;color:#222}.sheet{max-width:760px;margin:0 auto}.header{display:flex;align-items:center;gap:24px;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:20px}.brand-logo{width:220px;height:70px;object-fit:contain}.photo-box{width:3cm;height:4cm;border:1px solid #111;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:12px;color:#777}.photo-box img{width:100%;height:100%;object-fit:cover}.row{display:flex;gap:16px;border-bottom:1px dashed #ddd;padding:8px 0}.field{flex:1}.label{font-size:12px;font-weight:bold;color:#555;text-transform:uppercase}.value{margin-top:3px;font-size:15px}`;

export default function ProfessionalsList() {
  const { professionals, addProfessional, updateProfessional, deleteProfessional } = useStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfessionalForm>(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [termProfessional, setTermProfessional] = useState<Professional | null>(null);
  const [termType, setTermType] = useState<'parceria' | 'voluntario'>('parceria');
  const printRef = useRef<HTMLDivElement>(null);

  const closeForm = () => { setIsFormOpen(false); setEditingId(null); setFormData(emptyForm); setShowPassword(false); };
  const openNew = () => { setEditingId(null); setFormData(emptyForm); setIsFormOpen(true); };
  const openEdit = (p: Professional) => { setEditingId(p.id); setFormData({ photoUrl: p.photoUrl || '', name: p.name, specialty: p.specialty, hasRegistration: p.hasRegistration || 'Não', registration: p.registration || '', cpf: p.cpf || '', phone: p.phone, bondType: p.bondType || '', login: p.login, password: p.password, accessRole: p.accessRole }); setIsFormOpen(true); };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          setFormData((prev) => ({ ...prev, photoUrl: reader.result as string }));
        } catch (err) {
          console.error('Error setting photo:', err);
        }
      };
      reader.onerror = () => console.error('Error reading file');
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Photo upload error:', err);
    }
    // Reset the input so same file can be selected again
    event.target.value = '';
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (editingId) updateProfessional(editingId, formData);
    else addProfessional(formData);
    closeForm();
  };

  const preparePrint = (p: Professional) => { setSelectedProfessional(p); return new Promise<void>((r) => setTimeout(r, 50)); };
  const handlePrint = async (p: Professional) => { await preparePrint(p); if (!printRef.current) return; const win = window.open('', '_blank'); if (!win) return; win.document.write(`<html><head><title>Cadastro Profissional</title><style>${printStyles}</style></head><body>${printRef.current.innerHTML}<script>window.onload=function(){window.print();window.onafterprint=function(){window.close()}}</script></body></html>`); win.document.close(); };
  const _handlePDF = handlePrint; // kept for compatibility

  const openTerm = (p: Professional, type: 'parceria' | 'voluntario') => { setTermProfessional(p); setTermType(type); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6"><h1 className="text-2xl font-semibold text-gray-900">{S.profissionais}</h1><button onClick={openNew} className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-4 py-2 rounded-md flex items-center gap-2 font-semibold"><Plus size={20} /> {S.adicionar}</button></div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md"><ul className="divide-y divide-gray-200">
        {professionals.length === 0 ? <li className="px-6 py-4 text-center text-gray-500">Nenhum profissional cadastrado.</li> : [...professionals].sort((a,b) => a.name.localeCompare(b.name,'pt-BR')).map((prof) => (
          <li key={prof.id} className="px-6 py-4 flex justify-between items-center gap-4">
            <div className="flex items-center gap-4"><div className="h-16 w-12 border bg-gray-50 overflow-hidden flex items-center justify-center text-[10px] text-gray-400">{prof.photoUrl ? <img src={prof.photoUrl} alt="" className="h-full w-full object-cover" /> : '3x4'}</div><div><p className="font-medium text-gray-900">{prof.name}</p><p className="text-sm text-gray-500">{prof.specialty} {prof.hasRegistration === 'Sim' && prof.registration ? `| Reg: ${prof.registration}` : ''} | {prof.bondType || '-'} | {prof.phone}</p></div></div>
            <div className="flex flex-wrap gap-1 justify-end">
              <button onClick={() => openEdit(prof)} className="text-blue-700 p-2 border rounded" title="Editar"><Edit2 size={16}/></button>
              <button onClick={() => handlePrint(prof)} className="text-gray-600 p-2 border rounded" title="Imprimir"><Printer size={16}/></button>
              <button onClick={() => window.confirm('Excluir?') && deleteProfessional(prof.id)} className="text-red-600 p-2 border rounded" title="Excluir"><Trash2 size={16}/></button>
            </div>
          </li>
        ))}
      </ul></div>

      {isFormOpen && <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4"><div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{editingId ? 'Editar Profissional' : 'Novo Profissional'}</h2><button type="button" onClick={closeForm} className="text-gray-600"><X size={20}/></button></div>
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="font-bold text-gray-800 border-b pb-2">Dados do Profissional</h3>
          <div className="flex gap-5 items-start">
            <label className="h-32 w-24 border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-500 text-center overflow-hidden cursor-pointer shrink-0">{formData.photoUrl ? <img src={formData.photoUrl} alt="" className="h-full w-full object-cover" /> : 'Foto 3x4'}<input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" /></label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="md:col-span-2"><label className="block text-sm font-medium">Nome Completo</label><input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
              <div><label className="block text-sm font-medium">Profissão</label><select required value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="">Selecione...</option>{specialties.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="block text-sm font-medium">Tem registro profissional?</label><select value={formData.hasRegistration || 'Não'} onChange={e => setFormData({...formData, hasRegistration: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="Não">Não</option><option value="Sim">Sim</option></select></div>
              {formData.hasRegistration === 'Sim' && <div><label className="block text-sm font-medium">Número do registro</label><input type="text" value={formData.registration || ''} onChange={e => setFormData({...formData, registration: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>}
              <div><label className="block text-sm font-medium">CPF</label><input type="text" value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
              <div><label className="block text-sm font-medium">Telefone</label><input required type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
              <div><label className="block text-sm font-medium">Tipo de vínculo</label><select required value={formData.bondType || ''} onChange={e => setFormData({...formData, bondType: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="">Selecione...</option><option value="Contratado">Contratado</option><option value="Parceiro Social">Parceiro Social</option><option value="Voluntario">Voluntario</option><option value="Diretoria">Diretoria</option></select></div>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 border-b pb-2 pt-4">Credenciais de Acesso</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium">Ambiente de Acesso</label><select required value={formData.accessRole} onChange={e => setFormData({...formData, accessRole: e.target.value as ProfessionalForm['accessRole']})} className="mt-1 block w-full border border-gray-300 rounded-md p-2"><option value="consulta">Consulta</option><option value="recepcao">Recepção</option><option value="admin">Administrador</option></select></div>
            <div><label className="block text-sm font-medium">Usuário</label><input required type="text" value={formData.login} onChange={e => setFormData({...formData, login: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /></div>
            <div><label className="block text-sm font-medium">Senha</label><div className="flex gap-2"><input required type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="mt-1 px-3 border rounded-md">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
          </div>

          <h3 className="font-bold text-gray-800 border-b pb-2 pt-4">Gerar Termos</h3>
          <div className="flex gap-3 flex-wrap">
            <button type="button" onClick={() => { handleSave({ preventDefault: () => {} } as React.FormEvent); }} className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-md">{editingId ? 'Atualizar' : 'Salvar'}</button>
            <button type="button" onClick={() => { if (!formData.name) return alert('Preencha o nome primeiro'); openTerm({ ...formData, id: editingId || 'temp' } as Professional, 'parceria'); }} className="px-4 py-2 border border-amber-400 text-amber-800 rounded-md text-sm">Termo de Parceria</button>
            <button type="button" onClick={() => { if (!formData.name) return alert('Preencha o nome primeiro'); openTerm({ ...formData, id: editingId || 'temp' } as Professional, 'voluntario'); }} className="px-4 py-2 border border-amber-400 text-amber-800 rounded-md text-sm">Termo de Voluntário</button>
            <button type="button" onClick={closeForm} className="px-4 py-2 border rounded-md">Cancelar</button>
          </div>
        </form>
      </div></div>}

      {termProfessional && <ProfessionalTermModal professional={termProfessional} termType={termType} onClose={() => setTermProfessional(null)} />}

      <div style={{ display: 'none' }} ref={printRef}>{selectedProfessional && <div className="sheet"><div className="header"><img src={AMOVIN_LOGO_SRC} alt="Amovin" className="brand-logo" /><div><h1>Gestao Amovin Integrado</h1><p>Cadastro Profissional</p></div></div><div style={{display:'flex', gap:'20px'}}><div className="photo-box">{selectedProfessional.photoUrl ? <img src={selectedProfessional.photoUrl} alt="" /> : 'Foto 3x4'}</div><div style={{flex:1}}><Fld label="Nome" value={selectedProfessional.name}/><Fld label="Profissao" value={selectedProfessional.specialty}/><Fld label="CPF" value={selectedProfessional.cpf}/><Fld label="Registro" value={selectedProfessional.hasRegistration === 'Sim' ? selectedProfessional.registration : 'Nao possui'}/><Fld label="Telefone" value={selectedProfessional.phone}/><Fld label="Vinculo" value={selectedProfessional.bondType}/></div></div></div>}</div>
    </div>
  );
}

function Fld({ label, value }: { label: string; value?: string }) { return <div className="row"><div className="field"><div className="label">{label}</div><div className="value">{value || '-'}</div></div></div>; }
