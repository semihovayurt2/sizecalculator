import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface PDFButtonProps {
  compact?: boolean;
}

export function PDFButton({ compact = false }: PDFButtonProps) {
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
      className={`inline-flex items-center justify-center font-semibold text-[#052d2a] transition hover:bg-[#34e0cc] ${
        compact
          ? 'rounded-md border border-white/45 ring-1 ring-orange-400/65 bg-transparent px-2 py-1 text-xs uppercase tracking-[0.2em] text-accent/60 whitespace-nowrap hover:bg-transparent hover:text-accent/90'
          : 'rounded-3xl bg-[#2dd4bf] px-5 py-3 text-sm'
      }`}
    >
      Teklif PDF'i Oluştur
    </button>
  );
}
