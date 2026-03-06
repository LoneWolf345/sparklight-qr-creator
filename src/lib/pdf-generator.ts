import QRCodeStyling from "qr-code-styling";
import QRBorderPlugin from "qr-border-plugin";
import QRCode from "qrcode";
import { jsPDF } from "jspdf";
import type { MappedRecord } from "./batch-types";
import { AVERY_94107 } from "./batch-types";

interface PdfOptions {
  destinationUrl: string;
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

export async function renderQrToDataUrl(
  url: string,
  options: PdfOptions,
  bottomTextOverride?: string,
): Promise<string> {
  const sizePx = Math.round(options.qrSizeInches * 300);

  const renderFallbackQr = async () => {
    return QRCode.toDataURL(url, {
      width: sizePx,
      margin: 0,
      errorCorrectionLevel: options.errorCorrection,
      color: {
        dark: options.qrDotColor || options.primaryColor,
        light: options.qrBackgroundColor || "#FFFFFF",
      },
    });
  };
  
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
    // Add margin when border is enabled so the frame doesn't overlap QR modules
    margin: options.qrBorderEnabled ? Math.round(40 * (sizePx / 360)) : 0,
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
    console.warn("QRCodeStyling init failed; falling back to basic QR renderer", err);
    return renderFallbackQr();
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
    // Top text: use saved setting (fallback "Activate WiFi")
    const topText = options.qrBorderTopText || "Activate WiFi";
    extOpts.decorations.top = {
      type: "text",
      value: topText,
      style: options.qrBorderTopStyle || "font: 20px sans-serif; fill: #FFFFFF;",
    };
    // Bottom text: use per-record override (address), fall back to saved setting
    const bottomText = bottomTextOverride || options.qrBorderBottomText || "";
    if (bottomText) {
      extOpts.decorations.bottom = {
        type: "text",
        value: bottomText,
        style: options.qrBorderBottomStyle || "font: 20px sans-serif; fill: #FFFFFF;",
      };
    }
    qrCode.applyExtension(QRBorderPlugin(extOpts));
  }

  let rawData: Blob | Buffer | null;
  try {
    rawData = await qrCode.getRawData("png");
  } catch (err) {
    console.warn("QRCodeStyling render failed; falling back to basic QR renderer", err);
    return renderFallbackQr();
  }

  if (!rawData) {
    console.warn("QRCodeStyling returned null data; falling back to basic QR renderer");
    return renderFallbackQr();
  }
  
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
    xOffsetMm,
    yOffsetMm,
    startRow,
    startCol,
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

    // Generate QR code with per-record address as bottom border text
    const qrUrl = `${baseUrl}/HH/${record.homesPassedId}`;
    const qrDataUrl = await renderQrToDataUrl(qrUrl, options, record.address);

    // Center QR within label
    const qrX = labelX + (layout.labelWidth - qrSizeInches) / 2;
    const qrY = labelY + (layout.labelHeight - qrSizeInches) / 2;

    // Draw QR – this is the only element on the label
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSizeInches, qrSizeInches);

    labelIndex++;
  }

  return doc.output("blob");
}

export async function generatePreviewCanvas(
  records: MappedRecord[],
  options: PdfOptions,
  canvasWidth: number
): Promise<string> {
  const layout = AVERY_94107;
  const startIndex = options.startRow * layout.cols + options.startCol;
  const previewRecords = records.slice(0, layout.labelsPerPage - startIndex);

  const canvas = document.createElement("canvas");
  const pageWidthPx = Math.max(400, Math.round(canvasWidth));
  const pxPerIn = pageWidthPx / layout.pageWidth;
  const pageHeightPx = Math.round(layout.pageHeight * pxPerIn);

  canvas.width = pageWidthPx;
  canvas.height = pageHeightPx;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to create preview canvas context");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const xOffsetIn = options.xOffsetMm / 25.4;
  const yOffsetIn = options.yOffsetMm / 25.4;
  let labelIndex = startIndex;

  for (let i = 0; i < previewRecords.length && labelIndex < layout.labelsPerPage; i++) {
    const record = previewRecords[i];
    const col = labelIndex % layout.cols;
    const row = Math.floor(labelIndex / layout.cols);

    const labelXIn = layout.marginLeft + col * (layout.labelWidth + layout.colGap) + xOffsetIn;
    const labelYIn = layout.marginTop + row * (layout.labelHeight + layout.rowGap) + yOffsetIn;

    // Generate QR with per-record address as bottom border text
    const qrUrl = `${options.baseUrl}/HH/${record.homesPassedId}`;
    const qrDataUrl = await renderQrToDataUrl(qrUrl, options, record.address);

    // Center QR within label
    const qrXIn = labelXIn + (layout.labelWidth - options.qrSizeInches) / 2;
    const qrYIn = labelYIn + (layout.labelHeight - options.qrSizeInches) / 2;

    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise<void>((resolve, reject) => {
      qrImg.onload = () => resolve();
      qrImg.onerror = () => reject(new Error("Failed to load generated QR image"));
    });

    // Draw QR – only element on the label
    ctx.drawImage(
      qrImg,
      Math.round(qrXIn * pxPerIn),
      Math.round(qrYIn * pxPerIn),
      Math.round(options.qrSizeInches * pxPerIn),
      Math.round(options.qrSizeInches * pxPerIn)
    );

    labelIndex++;
  }

  return canvas.toDataURL("image/png");
}
