// utils/pdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function buildReportPdf(
  results: any[],
  inputs: { radiusMiles: number; weights: Record<string, number> }
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4 portrait (pts)
  const { width, height } = page.getSize();

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;

  // Title
  page.drawText('Firestore – Location Analysis', {
    x: 50,
    y,
    size: 20,
    font: bold,
    color: rgb(0.09, 0.47, 0.29), // green-600ish
  });

  y -= 40;

  // Inputs
  page.drawText(`Radius: ${inputs.radiusMiles} miles`, { x: 50, y, size: 12, font });
  y -= 16;
  page.drawText('Weights:', { x: 50, y, size: 12, font: bold });
  y -= 14;

  Object.entries(inputs.weights).forEach(([k, v]) => {
    page.drawText(`• ${k}: ${v}`, { x: 70, y, size: 11, font });
    y -= 14;
  });

  y -= 10;
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 0.5 });

  // Results table (top 5)
  y -= 30;
  page.drawText('Top Zones', { x: 50, y, size: 14, font: bold });
  y -= 20;

  results.slice(0, 5).forEach((z: any, i: number) => {
    page.drawText(`${i + 1}. ZIP ${z.zip} – Score: ${z.score.toFixed(2)}`, {
      x: 60,
      y,
      size: 11,
      font,
    });
    y -= 14;
  });

  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
