import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function downloadElementAsPdf(element: HTMLElement, fileName: string, _styles: string, confirmMessage: string) {
  if (!window.confirm(confirmMessage)) return;

  // Make element visible temporarily if hidden
  const wasHidden = element.style.display === 'none';
  if (wasHidden) element.style.display = 'block';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight,
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

    // Force download using blob + link click
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup after a short delay
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 500);
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Erro ao gerar PDF. Tente usar a opção Imprimir e salve como PDF.');
  } finally {
    if (wasHidden) element.style.display = 'none';
  }
}
