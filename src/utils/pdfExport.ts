import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  elementId: string;
  filename?: string;
  subject?: string;
  topic?: string;
}

/**
 * Directly converts the lesson plan element into a stylized, multi-page A4 PDF document
 * using jsPDF and html2canvas, ensuring a consistent layout regardless of browser print settings.
 */
export async function exportElementToPdf({
  elementId,
  filename,
  subject = 'Lesson',
  topic = 'Plan',
}: PdfExportOptions): Promise<void> {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  // Create an off-screen clone with exact standard A4 width (794px at 96 DPI)
  // to avoid screen-media 'display: none' restrictions and ensure uniform rendering
  const tempContainer = originalElement.cloneNode(true) as HTMLElement;
  tempContainer.id = 'temp-pdf-render-container';
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '0px';
  tempContainer.style.top = '0px';
  tempContainer.style.width = '794px'; // 210mm at 96 DPI
  tempContainer.style.minHeight = '1123px'; // 297mm at 96 DPI
  tempContainer.style.zIndex = '-99999';
  tempContainer.style.visibility = 'visible';
  tempContainer.style.display = 'block';
  tempContainer.style.backgroundColor = '#ffffff';
  tempContainer.style.color = '#0f172a';
  tempContainer.style.padding = '36px 42px';
  tempContainer.style.boxSizing = 'border-box';
  tempContainer.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

  // Ensure any code blocks or pre tags in the cloned element wrap cleanly without horizontal scroll
  const preElements = tempContainer.querySelectorAll('pre, code');
  preElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.whiteSpace = 'pre-wrap';
    htmlEl.style.wordBreak = 'break-word';
  });

  document.body.appendChild(tempContainer);

  try {
    // Render the off-screen document at 2x scale for crisp print resolution
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    });

    // Initialize standard A4 PDF (210mm x 297mm) in portrait mode
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const marginSide = 12; // 12mm left/right margin
    const marginTop = 12; // 12mm top margin
    const marginBottom = 14; // 14mm bottom margin
    const printableWidth = pageWidth - marginSide * 2;
    const printableHeight = pageHeight - marginTop - marginBottom;

    // Calculate height of one A4 page in canvas pixel units
    const pageCanvasHeight = Math.floor((canvas.width * printableHeight) / printableWidth);
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageCanvasHeight));

    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const sourceY = page * pageCanvasHeight;
      const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

      // Create a dedicated canvas slice for this page to prevent cross-page overlapping
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageCanvasHeight;
      const pageCtx = pageCanvas.getContext('2d');

      if (pageCtx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImgData, 'JPEG', marginSide, marginTop, printableWidth, printableHeight, '', 'FAST');

      // Stylized Page Footer with subtle divider rule and metadata
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.setLineWidth(0.3);
      pdf.line(marginSide, pageHeight - 8, pageWidth - marginSide, pageHeight - 8);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139); // slate-500
      pdf.text(
        `EduPrompt Architect · ${subject}: ${topic.slice(0, 35)}`,
        marginSide,
        pageHeight - 4.5
      );
      pdf.text(
        `Page ${page + 1} of ${totalPages}`,
        pageWidth - marginSide,
        pageHeight - 4.5,
        { align: 'right' }
      );
    }

    // Sanitize filename
    const safeSubject = subject.replace(/[^a-zA-Z0-9\u0400-\u04FF_-]/g, '_').slice(0, 25);
    const safeTopic = topic.replace(/[^a-zA-Z0-9\u0400-\u04FF_-]/g, '_').slice(0, 25);
    const finalFilename = filename || `Lesson_Plan_${safeSubject}_${safeTopic}.pdf`;

    // Download the generated PDF directly to the user's device
    pdf.save(finalFilename);
  } finally {
    // Clean up temporary DOM element
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}
