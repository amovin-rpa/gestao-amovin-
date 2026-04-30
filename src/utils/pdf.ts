import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadElementAsPdf(element: HTMLElement, fileName: string, styles: string, confirmMessage: string) {
  if (!window.confirm(confirmMessage)) return;

  const container = document.createElement('div');
  try {
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '794px';
    container.style.background = '#ffffff';
    container.innerHTML = `<style data-pdf-style>${styles}</style>${element.innerHTML}`;
    document.body.appendChild(container);

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      onclone: (doc) => {
        doc.querySelectorAll('style:not([data-pdf-style]), link[rel="stylesheet"]').forEach((node) => node.remove());
      },
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const height = (canvas.height * width) / canvas.width;
    const image = canvas.toDataURL('image/png');
    let left = height;
    let position = 0;

    pdf.addImage(image, 'PNG', 0, position, width, height);
    left -= pageHeight;

    while (left > 0) {
      position = left - height;
      pdf.addPage('a4', 'portrait');
      pdf.addImage(image, 'PNG', 0, position, width, height);
      left -= pageHeight;
    }

    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    alert('Não foi possível gerar o PDF. Tente imprimir e salvar como PDF pelo navegador.');
  } finally {
    if (container.parentNode) document.body.removeChild(container);
  }
}