/** Shared type for the settings object from app_settings */
export interface QrSettings {
  default_destination_url: string;
  qr_size_inches: number;
  primary_color: string;
  secondary_color: string;
  qr_error_correction: string;
  quiet_zone_modules: number;
  x_offset_mm: number;
  y_offset_mm: number;
  qr_dot_type: string;
  qr_dot_color: string;
  qr_corner_square_type: string;
  qr_corner_square_color: string;
  qr_corner_dot_type: string;
  qr_corner_dot_color: string;
  qr_background_color: string;
  qr_image_url: string | null;
  qr_image_size: number;
  qr_image_margin: number;
  qr_border_enabled: boolean;
  qr_border_round: number;
  qr_border_thickness: number;
  qr_border_color: string;
  qr_border_dasharray: string | null;
  qr_border_inner_thickness: number;
  qr_border_inner_color: string;
  qr_border_outer_thickness: number;
  qr_border_outer_color: string;
  qr_border_top_text: string | null;
  qr_border_top_style: string;
  qr_border_bottom_text: string | null;
  qr_border_bottom_style: string;
  qr_border_license_key: string | null;
}

/** Build the PdfOptions object used by generatePdf / generatePreviewCanvas */
export function buildPdfOptions(
  s: QrSettings,
  startRow: number,
  startCol: number,
  logoDataUrl?: string,
) {
  return {
    destinationUrl: s.default_destination_url,
    qrSizeInches: s.qr_size_inches,
    primaryColor: s.primary_color,
    secondaryColor: s.secondary_color,
    errorCorrection: s.qr_error_correction as "L" | "M" | "Q" | "H",
    quietZone: s.quiet_zone_modules,
    xOffsetMm: s.x_offset_mm,
    yOffsetMm: s.y_offset_mm,
    startRow,
    startCol,
    logoDataUrl,
    qrDotType: s.qr_dot_type,
    qrDotColor: s.qr_dot_color,
    qrCornerSquareType: s.qr_corner_square_type,
    qrCornerSquareColor: s.qr_corner_square_color,
    qrCornerDotType: s.qr_corner_dot_type,
    qrCornerDotColor: s.qr_corner_dot_color,
    qrBackgroundColor: s.qr_background_color,
    qrImageUrl: s.qr_image_url,
    qrImageSize: s.qr_image_size,
    qrImageMargin: s.qr_image_margin,
    qrBorderEnabled: s.qr_border_enabled,
    qrBorderRound: s.qr_border_round,
    qrBorderThickness: s.qr_border_thickness,
    qrBorderColor: s.qr_border_color,
    qrBorderDasharray: s.qr_border_dasharray,
    qrBorderInnerThickness: s.qr_border_inner_thickness,
    qrBorderInnerColor: s.qr_border_inner_color,
    qrBorderOuterThickness: s.qr_border_outer_thickness,
    qrBorderOuterColor: s.qr_border_outer_color,
    qrBorderTopText: s.qr_border_top_text,
    qrBorderTopStyle: s.qr_border_top_style,
    qrBorderBottomText: s.qr_border_bottom_text,
    qrBorderBottomStyle: s.qr_border_bottom_style,
    qrBorderLicenseKey: s.qr_border_license_key,
  };
}
