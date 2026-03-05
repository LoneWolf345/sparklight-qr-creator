import QRCodeStyling from "qr-code-styling";
import QRBorderPlugin from "qr-border-plugin";
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
  startRow: number;
  startCol: number;
  logoDataUrl?: string;
  // qr-code-styling options
  qrDotType?: string;
  qrDotColor?: string;
  qrCornerSquareType?: string;
  qrCornerSquareColor?: string;
  qrCornerDotType?: string;
  qrCornerDotColor?: string;
  qrBackgroundColor?: string;
  qrImageUrl?: string | null;
  qrImageSize?: number;
  qrImageMargin?: number;
  // border plugin options
  qrBorderEnabled?: boolean;
  qrBorderRound?: number;
  qrBorderThickness?: number;
  qrBorderColor?: string;
  qrBorderDasharray?: string | null;
  qrBorderInnerThickness?: number;
  qrBorderInnerColor?: string;
  qrBorderOuterThickness?: number;
  qrBorderOuterColor?: string;
  qrBorderTopText?: string | null;
  qrBorderTopStyle?: string;
  qrBorderBottomText?: string | null;
  qrBorderBottomStyle?: string;
  qrBorderLicenseKey?: string | null;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

async function renderQrToDataUrl(url: string, options: PdfOptions): Promise<string> {
  const sizePx = Math.round(options.qrSizeInches * 300);
  
  const qrOptions: any = {
    width: sizePx,
    height: sizePx,
    data: url,
    type: "canvas",
    dotsOptions: {
      type: options.qrDotType || "square",
      color: options.qrDotColor || options.primaryColor,
    },
    cornersSquareOptions: {
      type: options.qrCornerSquareType || "square",
      color: options.qrCornerSquareColor || options.primaryColor,
    },
    cornersDotOptions: {
      type: options.qrCornerDotType || "square",
      color: options.qrCornerDotColor || options.primaryColor,
    },
    backgroundOptions: {
      color: options.qrBackgroundColor || "#FFFFFF",
    },
    qrOptions: {
      errorCorrectionLevel: options.errorCorrection,
    },
    margin: 0,
  };

  if (options.qrImageUrl) {
    qrOptions.image = options.qrImageUrl;
    qrOptions.imageOptions = {
      crossOrigin: "anonymous",
      margin: options.qrImageMargin ?? 5,
      imageSize: options.qrImageSize ?? 0.4,
    };
  }

  let qrCode: QRCodeStyling;
  try {
    qrCode = new QRCodeStyling(qrOptions);
  } catch (err) {
    throw new Error(`Failed to instantiate QRCodeStyling: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Apply border plugin if enabled
  if (options.qrBorderEnabled) {
    if (options.qrBorderLicenseKey) {
      QRBorderPlugin.setKey(options.qrBorderLicenseKey);
    }
    const extOpts: any = {
      round: options.qrBorderRound ?? 0,
      thickness: options.qrBorderThickness ?? 40,
      color: options.qrBorderColor ?? "#000000",
      borderInner: {
        color: options.qrBorderInnerColor ?? "#000000",
        thickness: options.qrBorderInnerThickness ?? 5,
      },
      borderOuter: {
        color: options.qrBorderOuterColor ?? "#000000",
        thickness: options.qrBorderOuterThickness ?? 5,
      },
      decorations: {},
    };
    if (options.qrBorderDasharray) {
      extOpts.dasharray = options.qrBorderDasharray;
    }
    if (options.qrBorderTopText) {
      extOpts.decorations.top = {
        type: "text",
        value: options.qrBorderTopText,
        style: options.qrBorderTopStyle || "font: 20px sans-serif; fill: #FFFFFF;",
      };
    }
    if (options.qrBorderBottomText) {
      extOpts.decorations.bottom = {
        type: "text",
        value: options.qrBorderBottomText,
        style: options.qrBorderBottomStyle || "font: 20px sans-serif; fill: #FFFFFF;",
      };
    }
    qrCode.applyExtension(QRBorderPlugin(extOpts));
  }

  const rawData = await qrCode.getRawData("png");
  if (!rawData) throw new Error("QRCodeStyling.getRawData('png') returned null — canvas context may be unavailable");
  
  // Handle both Blob and Buffer returns
  const blob: Blob = (rawData as any).arrayBuffer 
    ? (rawData as Blob) 
    : new Blob([new Uint8Array(rawData as any)], { type: "image/png" });
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generatePdf(
  records: MappedRecord[],
  options: PdfOptions
): Promise<Blob> {
  const {
    baseUrl,
    qrSizeInches,
    primaryColor,
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

    // Generate QR code using qr-code-styling
    const qrUrl = `${baseUrl}/HH/${record.homesPassedId}`;
    const qrDataUrl = await renderQrToDataUrl(qrUrl, options);

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

    const address = record.address;
    const maxTextWidth = layout.labelWidth - 0.16;
    const addressLines = doc.splitTextToSize(address, maxTextWidth) as string[];
    const displayLines = addressLines.slice(0, 2);
    const textCenterX = labelX + layout.labelWidth / 2;

    displayLines.forEach((line: string, idx: number) => {
      doc.text(line, textCenterX, textStartY + idx * 0.1, { align: "center" });
    });

    const hpIdY = textStartY + displayLines.length * 0.1 + 0.04;
    doc.setFontSize(5);
    doc.setTextColor(120, 120, 120);
    doc.text(`ID: ${record.homesPassedId}`, textCenterX, hpIdY, { align: "center" });

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
  const previewRecords = records.slice(0, AVERY_94107.labelsPerPage - (options.startRow * AVERY_94107.cols + options.startCol));
  const blob = await generatePdf(previewRecords, options);
  return URL.createObjectURL(blob);
}
