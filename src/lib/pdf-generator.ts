import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import type { MappedRecord } from "./batch-types";
import { AVERY_94107 } from "./batch-types";

interface PdfOptions {
  baseUrl: string;
  qrSizeInches: number;
  primaryColor: string;
  secondaryColor: string;
  errorCorrection: "L" | "M" | "Q" | "H";
  quietZone: number;
  xOffsetMm: number;
  yOffsetMm: number;
  startRow: number; // 0-indexed
  startCol: number; // 0-indexed
  logoDataUrl?: string;
}

const IN_TO_PT = 72;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

export async function generatePdf(
  records: MappedRecord[],
  options: PdfOptions
): Promise<Blob> {
  const {
    baseUrl,
    qrSizeInches,
    primaryColor,
    errorCorrection,
    xOffsetMm,
    yOffsetMm,
    startRow,
    startCol,
    logoDataUrl,
  } = options;

  const layout = AVERY_94107;
  const doc = new jsPDF({ unit: "in", format: "letter" });

  const xOffsetIn = xOffsetMm / 25.4;
  const yOffsetIn = yOffsetMm / 25.4;

  let labelIndex = startRow * layout.cols + startCol;
  let pageCreated = true;

  for (let r = 0; r < records.length; r++) {
    const record = records[r];

    if (labelIndex >= layout.labelsPerPage) {
      labelIndex = 0;
      doc.addPage();
      pageCreated = true;
    } else if (r > 0 && labelIndex === 0) {
      doc.addPage();
      pageCreated = true;
    }

    if (r === 0 && !pageCreated) {
      // first page already exists
    }

    const col = labelIndex % layout.cols;
    const row = Math.floor(labelIndex / layout.cols);

    const labelX = layout.marginLeft + col * (layout.labelWidth + layout.colGap) + xOffsetIn;
    const labelY = layout.marginTop + row * (layout.labelHeight + layout.rowGap) + yOffsetIn;

    // Generate QR code
    const qrUrl = `${baseUrl}/HH/${record.homesPassedId}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: errorCorrection,
      margin: 0,
      width: Math.round(qrSizeInches * 300),
      color: { dark: primaryColor, light: "#FFFFFF" },
    });

    // Center QR within label
    const qrX = labelX + (layout.labelWidth - qrSizeInches) / 2;
    const qrTopMargin = 0.12;
    const qrY = labelY + qrTopMargin;

    // Draw QR
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSizeInches, qrSizeInches);

    // Logo / Sparklight wordmark above QR (if provided)
    if (logoDataUrl) {
      const logoWidth = 0.9;
      const logoHeight = 0.18;
      const logoX = labelX + (layout.labelWidth - logoWidth) / 2;
      const logoY = qrY - logoHeight - 0.02;
      try {
        doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoWidth, logoHeight);
      } catch {
        // skip logo if invalid
      }
    }

    // Address text below QR
    const textStartY = qrY + qrSizeInches + 0.08;
    const [pr, pg, pb] = hexToRgb(primaryColor);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(6.5);

    // Address (up to 2 lines, centered)
    const address = record.address;
    const maxTextWidth = layout.labelWidth - 0.16;
    const addressLines = doc.splitTextToSize(address, maxTextWidth) as string[];
    const displayLines = addressLines.slice(0, 2);
    const textCenterX = labelX + layout.labelWidth / 2;

    displayLines.forEach((line: string, idx: number) => {
      doc.text(line, textCenterX, textStartY + idx * 0.1, { align: "center" });
    });

    // HomesPassedID (small, below address)
    const hpIdY = textStartY + displayLines.length * 0.1 + 0.04;
    doc.setFontSize(5);
    doc.setTextColor(120, 120, 120);
    doc.text(`ID: ${record.homesPassedId}`, textCenterX, hpIdY, { align: "center" });

    // "Scan to start" text
    const scanY = hpIdY + 0.09;
    doc.setFontSize(5.5);
    doc.setTextColor(pr, pg, pb);
    doc.text("Scan to get started", textCenterX, scanY, { align: "center" });

    labelIndex++;
  }

  return doc.output("blob");
}

export async function generatePreviewCanvas(
  records: MappedRecord[],
  options: PdfOptions,
  canvasWidth: number
): Promise<string> {
  // Generate a single-page PDF and convert first page to data URL
  const previewRecords = records.slice(0, AVERY_94107.labelsPerPage - (options.startRow * AVERY_94107.cols + options.startCol));
  const blob = await generatePdf(previewRecords, options);

  // Return blob URL for iframe preview
  return URL.createObjectURL(blob);
}
