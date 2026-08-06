import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function PDFButton() {
  const handleExportPDF = async () => {
    const element = document.querySelector('body');
    if (!element) return;
    const canvas = await html2canvas(element, { backgroundColor: '#0B0B0B', scale: 2 });
    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.addImage(imageData, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    pdf.save('LED_Screen_Experience_Proposal.pdf');
  };

  return (
    <button
      type="button"
      onClick={handleExportPDF}
      className="inline-flex items-center justify-center rounded-3xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-orange-500"
    >
      Teklif PDF'i Oluştur
    </button>
  );
}
