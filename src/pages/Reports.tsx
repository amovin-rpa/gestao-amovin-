import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { Printer, Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Reports() {
  const { beneficiaries, volunteers, professionals, consultations } = useStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'completo' | 'personalizado'>('completo');
  const [sections, setSections] = useState({ beneficiaries: true, attendance: true, professionals: true, volunteers: true });

  const isVisible = (key: keyof typeof sections) => mode === 'completo' || sections[key];
  
  const handlePrint = () => {
    if (reportRef.current) {
      const printContent = reportRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatórios</title>
              <style>
                @page { size: A4 portrait; margin: 16mm; }
                body { font-family: sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h2 { margin-top: 30px; color: #333; }
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
    }
  };

  const handlePDF = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage('a4', 'portrait');
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      const url = URL.createObjectURL(pdf.output('blob'));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Relatorios_FRB.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
        <div className="flex gap-2">
          <button onClick={() => window.location.reload()} className="bg-white border text-gray-700 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50">
            <RefreshCw size={18} /> Atualizar
          </button>
          <button onClick={handlePrint} className="bg-white border text-gray-700 px-3 py-2 rounded-md flex items-center gap-2 hover:bg-gray-50">
            <Printer size={18} /> Imprimir
          </button>
          <button onClick={handlePDF} className="bg-blue-600 text-white px-3 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700">
            <Download size={18} /> PDF
          </button>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-yellow-100 bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-gray-800">Tipo de relatório</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as 'completo' | 'personalizado')} className="mt-2 rounded-md border border-gray-300 p-2">
          <option value="completo">Completo</option>
          <option value="personalizado">Escolher quais relatorios gerar</option>
        </select>
        {mode === 'personalizado' && (
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700">
            {[
              ['beneficiaries', 'Beneficiários'],
              ['attendance', 'Presenças e faltas'],
              ['professionals', 'Profissionais'],
              ['volunteers', 'Voluntários'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input type="checkbox" checked={sections[key as keyof typeof sections]} onChange={() => setSections(prev => ({ ...prev, [key]: !prev[key as keyof typeof sections] }))} />
                {label}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 shadow rounded-lg overflow-x-auto" ref={reportRef}>
        {isVisible('beneficiaries') && <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Beneficiários</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nasc.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inclusão</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condição/CID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {beneficiaries.map(b => (
                <tr key={b.id}>
                  <td className="px-4 py-2 text-sm text-gray-900">{b.fullName}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(b.birthDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{new Date(b.inclusionDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{b.diagnosis} / {b.cid}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{b.respName}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{b.respPhone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}

        {isVisible('attendance') && <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Presenças e Faltas (Consultas/Atividades)</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paciente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profissional/Ativ.</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {consultations.map(c => {
                const ben = beneficiaries.find(b => b.id === c.beneficiaryId);
                const prof = professionals.find(p => p.id === c.professionalId || p.name === c.professionalId);
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{new Date(c.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{ben?.fullName || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{prof?.name || 'N/A'} ({prof?.specialty})</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.attendance === 'presente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.attendance === 'presente' ? 'Presente' : 'Falta'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isVisible('professionals') && <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Profissionais</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidade</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {professionals.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{p.specialty}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{p.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
          {isVisible('volunteers') && <div>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Voluntários</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteers.map(v => (
                  <tr key={v.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{v.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{v.function}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{v.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}
        </div>
      </div>
    </div>
  );
}