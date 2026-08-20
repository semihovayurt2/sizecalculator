import jsPDF from 'jspdf';
import { FileText } from 'lucide-react';
import { useStore } from '../store/useStore';

interface PDFButtonProps {
  compact?: boolean;
}

export function PDFButton({ compact = false }: PDFButtonProps) {
  const config = useStore((state) => state.config);
  const summary = useStore((state) => state.summary);
  const panels = useStore((state) => state.panels);

  const handleExportPDF = async () => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const leftMargin = 14;
    const rightMargin = 14;
    const topMargin = 14;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    const footerReserve = 12;
    const lineHeight = 6;
    const detailLabelWidth = 62;
    const detailValueWidth = contentWidth - detailLabelWidth;
    const now = new Date();
    const reportDate = now.toLocaleDateString('tr-TR');

    let y = topMargin;

    const ensureSpace = (requiredHeight: number) => {
      if (y + requiredHeight > pageHeight - footerReserve) {
        pdf.addPage();
        y = topMargin;
      }
    };

    const drawSectionTitle = (title: string) => {
      ensureSpace(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(20, 20, 20);
      pdf.text(title, leftMargin, y);
      y += 3;
      pdf.setDrawColor(220, 220, 220);
      pdf.line(leftMargin, y, pageWidth - rightMargin, y);
      y += 6;
    };

    const drawKeyValue = (label: string, value: string) => {
      const wrappedValue = pdf.splitTextToSize(value || '-', detailValueWidth);
      const blockHeight = Math.max(lineHeight, wrappedValue.length * lineHeight);
      ensureSpace(blockHeight + 1);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(55, 55, 55);
      pdf.text(label, leftMargin, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(25, 25, 25);
      pdf.text(wrappedValue, leftMargin + detailLabelWidth, y);

      y += blockHeight;
    };

    const drawSummaryRow = (label: string, value: string, col: 0 | 1) => {
      const rowWidth = contentWidth / 2;
      const x = leftMargin + col * rowWidth;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(70, 70, 70);
      pdf.text(label, x, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 15, 15);
      pdf.text(value, x + rowWidth - 2, y, { align: 'right' });
    };

    const drawTableHeader = (tableY: number, columnX: number[], columnWidths: number[], headers: string[]) => {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(leftMargin, tableY, contentWidth, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(35, 35, 35);

      headers.forEach((header, idx) => {
        pdf.text(header, columnX[idx] + 1.5, tableY + 5.2);
      });

      pdf.setDrawColor(220, 220, 220);
      pdf.rect(leftMargin, tableY, contentWidth, 8);
      for (let i = 1; i < columnX.length; i += 1) {
        pdf.line(columnX[i], tableY, columnX[i], tableY + 8);
      }
    };

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(17);
    pdf.setTextColor(18, 18, 18);
    pdf.text('LED Screen Teklif Raporu', leftMargin, y);
    y += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Olusturma Tarihi: ${reportDate}`, leftMargin, y);
    y += 8;

    drawSectionTitle('Proje Bilgileri');
    drawKeyValue('Proje Adi', config.projectName || '-');
    drawKeyValue('Musteri Adi', config.clientName || '-');
    drawKeyValue('Aciklama', config.description || '-');
    drawKeyValue('Sahne / Ortam', config.environment);
    drawKeyValue('Pixel Pitch', config.pixelPitch);
    drawKeyValue('Panel Tipi', `${Math.round(config.cabinetWidth * 1000)}mm x ${Math.round(config.cabinetHeight * 1000)}mm`);
    drawKeyValue('Duvar Olcusu', `${config.wallWidthCm}cm x ${config.wallHeightCm}cm`);
    drawKeyValue('Ekran Olcusu', `${config.width.toFixed(2)}m x ${config.height.toFixed(2)}m`);

    y += 3;
    drawSectionTitle('Sistem Ozeti');

    const summaryRows: Array<[string, string, string, string]> = [
      ['Toplam Cozunurluk', summary.resolution, 'Toplam Pixel', summary.totalPixels.toLocaleString('tr-TR')],
      ['Toplam Panel', summary.totalCabinets.toString(), 'Toplam Modul', summary.totalModules.toString()],
      ['Max Guc (kW)', summary.maximumPower.toFixed(2), 'Ort. Guc (kW)', summary.averagePower.toFixed(2)],
      ['Toplam Guc (kW)', summary.totalPower.toFixed(2), 'Toplam Agirlik (kg)', summary.totalWeight.toFixed(2)],
      ['Receiving Card', summary.receivingCards.toString(), 'Sending Card', summary.sendingCards.toString()],
    ];

    summaryRows.forEach((row) => {
      ensureSpace(7);
      drawSummaryRow(row[0], row[1], 0);
      drawSummaryRow(row[2], row[3], 1);
      y += 6;
      pdf.setDrawColor(235, 235, 235);
      pdf.line(leftMargin, y - 1.5, pageWidth - rightMargin, y - 1.5);
    });

    const columnWidths = [36, 28, 30, 16, contentWidth - (36 + 28 + 30 + 16)];
    const columnX = [
      leftMargin,
      leftMargin + columnWidths[0],
      leftMargin + columnWidths[0] + columnWidths[1],
      leftMargin + columnWidths[0] + columnWidths[1] + columnWidths[2],
      leftMargin + columnWidths[0] + columnWidths[1] + columnWidths[2] + columnWidths[3],
    ];
    const headers = ['Urun', 'Model', 'Kod', 'Miktar', 'Aciklama'];

    const drawProductsTable = (title: string, products: typeof panels[number]['products']) => {
      y += 3;
      drawSectionTitle(title);
      ensureSpace(12);
      drawTableHeader(y, columnX, columnWidths, headers);
      y += 8;

      products.forEach((product) => {
        const descriptionLines = pdf.splitTextToSize(product.description || '-', columnWidths[4] - 3);
        const rowHeight = Math.max(7, descriptionLines.length * 5 + 2);
        ensureSpace(rowHeight + 1);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(20, 20, 20);

        pdf.text(String(product.product ?? '-'), columnX[0] + 1.5, y + 4.8);
        pdf.text(String(product.model ?? '-'), columnX[1] + 1.5, y + 4.8);
        pdf.text(String(product.code ?? '-'), columnX[2] + 1.5, y + 4.8);
        pdf.text(`${String(product.quantity ?? '-')} ${product.unit ?? 'ADET'}`, columnX[3] + 1.5, y + 4.8);
        pdf.text(descriptionLines, columnX[4] + 1.5, y + 4.8);

        pdf.setDrawColor(230, 230, 230);
        pdf.rect(leftMargin, y, contentWidth, rowHeight);
        for (let i = 1; i < columnX.length; i += 1) {
          pdf.line(columnX[i], y, columnX[i], y + rowHeight);
        }

        y += rowHeight;
      });
    };

    panels.forEach((panel) => drawProductsTable(panel.name, panel.products));

    const combinedProducts = new Map<string, typeof panels[number]['products'][number]>();
    panels.forEach((panel) => panel.products.forEach((product) => {
      const key = `${product.product}|${product.model}|${product.code}`;
      const existing = combinedProducts.get(key);
      combinedProducts.set(key, existing
        ? { ...existing, quantity: existing.quantity + product.quantity }
        : { ...product });
    }));
    drawProductsTable('Birlesik Toplam', Array.from(combinedProducts.values()));

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Bu rapor otomatik olarak LED Screen Experience Studio tarafindan olusturulmustur.', leftMargin, pageHeight - 6);

    pdf.save('LED_Screen_Experience_Proposal.pdf');
  };

  return (
    <button
      type="button"
      onClick={handleExportPDF}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold text-[#052d2a] transition hover:bg-[#34e0cc] ${
        compact
          ? 'rounded-md border border-white/10 ring-1 ring-[#60a5fa]/30 bg-transparent px-2 py-1 text-xs uppercase tracking-[0.2em] text-blue-200/75 whitespace-nowrap hover:bg-transparent hover:text-blue-200/95'
          : 'rounded-3xl bg-[#60a5fa] px-5 py-3 text-sm'
      }`}
    >
      <FileText className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden="true" />
      <span>Teklif Oluştur</span>
    </button>
  );
}
