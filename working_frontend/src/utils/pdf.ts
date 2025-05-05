import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import logoSrc from '@/public/images/firestore-text.png';
const logoUrl = '/images/firestore-text.png';


export async function buildReportPdf(
  results: any[],
  inputs: { radiusMiles: number; weights: Record<string, number> }
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageMargin = 50;
  const lineHeight = 14;
  const maxWidth = 495;
  const pageSize: [number, number] = [595.28, 841.89];
  let page = pdf.addPage(pageSize);
  const { width, height } = page.getSize();
  let y = height - pageMargin;

  function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    const sanitizedText = text.replace(/\n/g, ' ');
    const words = sanitizedText.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const width = font.widthOfTextAtSize(currentLine + ' ' + word, size);
      if (width > maxWidth && currentLine !== '') {
        lines.push(currentLine.trim());
        currentLine = word;
      } else {
        currentLine += ' ' + word;
      }
    }

    if (currentLine) lines.push(currentLine.trim());
    return lines;
  }

  const checkY = (lines: number = 1) => {
    if (y - lines * lineHeight < pageMargin) {
      page = pdf.addPage(pageSize);
      y = height - pageMargin;
    }
  };

  // ─── Firestore Logo ───
  try {
    const logoBytes = await fetch('/images/firestore-text.png').then(res => res.arrayBuffer());
    const logoImg = await pdf.embedPng(logoBytes);
    const pngDims = logoImg.scale(0.2);
    page.drawImage(logoImg, {
      x: 50,
      y: y - pngDims.height,
      width: pngDims.width,
      height: pngDims.height,
    });
    y -= pngDims.height + 20;
  } catch {
    page.drawText('Location Analysis', {
      x: 50,
      y,
      size: 20,
      font: bold,
      color: rgb(0.09, 0.47, 0.29),
    });
    y -= 30;
  }
  

  // ─── Title ───
  page.drawText('Firestore - Location Analysis', {
    x: pageMargin,
    y,
    size: 20,
    font: bold,
    color: rgb(0.09, 0.47, 0.29),
  });
  y -= 30;

  // ─── Inputs ───
  page.drawText(`Radius: ${inputs.radiusMiles} miles`, { x: pageMargin, y, size: 12, font });
  y -= 16;
  page.drawText('Weights:', { x: pageMargin, y, size: 12, font: bold });
  y -= 14;

  for (const [k, v] of Object.entries(inputs.weights)) {
    checkY();
    page.drawText(`  ${k}: ${v}`, { x: pageMargin + 10, y, size: 11, font });
    y -= 14;
  }

  y -= 10;
  page.drawLine({
    start: { x: pageMargin, y },
    end: { x: width - pageMargin, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });

  y -= 30;

  // ─── Results ───
  page.drawText('Top Zones', { x: pageMargin, y, size: 14, font: bold });
  y -= 20;

  results.slice(0, 3).forEach((z: any, i: number) => {
    const header = `${i + 1}. ZIP Code: ${z.zip}`;
    const metrics = [
      `Score: ${z.score.toFixed(3)}`,
      `Population: ${z.population} (${z.population_label})`,
      `Median Income: $${z.median_income} (${z.median_income_label})`,
      `Rent Cost: ${z.rent_cost_label}`,
      `Competitors: ${z.competitor_count} (${z.competitor_count_label})`,
      `Traffic Score: ${z.traffic_score} (${z.traffic_score_label})`,
      `Parking Score: ${z.parking_score} (${z.parking_score_label})`,
      `LoopNet URL: ${z.loopnet_url}`,
    ];

    checkY(metrics.length + 2);
    page.drawText(header, { x: pageMargin, y, size: 12, font: bold });
    y -= 16;

    for (const line of metrics) {
      const wrapped = wrapText(line, font, 11, maxWidth);
      wrapped.forEach((wLine) => {
        checkY();
        page.drawText(wLine, { x: pageMargin + 10, y, size: 11, font });
        y -= lineHeight;
      });
    }

    const insight = z.gpt_insight || '';
    const wrappedInsight = wrapText(insight, font, 11, maxWidth);
    checkY(wrappedInsight.length + 1);
    y -= 6;
    wrappedInsight.forEach((line) => {
      checkY();
      page.drawText(line, { x: pageMargin, y, size: 11, font });
      y -= lineHeight;
    });

    y -= 20;
  });

  const bytes = await pdf.save();
  return new Blob([bytes], { type: 'application/pdf' });
}
