

## Problem Analysis

The **ReviewStep preview** does not match the **Admin QR Style settings preview** because ReviewStep only passes basic options (baseUrl, qrSizeInches, primaryColor, errorCorrection, quietZone, offsets) to `generatePreviewCanvas` — it completely omits all QR styling options (dot type/color, corner styles, border settings, embedded image, etc.).

Meanwhile, the PDF generation in `BatchNew.handleGenerate` correctly passes all styling options. This creates a mismatch between preview and PDF, and neither matches the Admin settings preview.

Looking at the uploaded screenshot, the user's Admin settings produce styled QR codes with purple borders, rounded corners, "Activate WiFi" top text, embedded Sparklight logo, and a bottom address line — none of which appear in the ReviewStep preview.

## Plan

### 1. Pass all QR styling settings from BatchNew to ReviewStep

Update `ReviewStep` props to accept the full settings object (or all individual QR style fields). The simplest approach: pass the entire `settings` object as a single prop rather than dozens of individual props.

**Files changed:** `src/components/batch/ReviewStep.tsx`, `src/pages/BatchNew.tsx`

### 2. Forward all styling options to generatePreviewCanvas

In `ReviewStep`, pass the complete set of QR styling options (dot type, dot color, corner square type/color, corner dot type/color, background color, image URL/size/margin, all border options) to the `generatePreviewCanvas` call — exactly mirroring what `BatchNew.handleGenerate` passes to `generatePdf`.

### 3. Ensure PDF and preview use identical option construction

Extract a shared helper function (e.g., `buildPdfOptions`) in `BatchNew.tsx` that constructs the `PdfOptions` object from settings. Use it in both `ReviewStep`'s preview call and the `handleGenerate` PDF call to guarantee they stay in sync.

### Technical Details

- `ReviewStep` will accept a new `qrSettings` prop containing all `qr_*` and `qr_border_*` fields from `app_settings`
- The `useEffect` in ReviewStep will map these to the `PdfOptions` interface fields (e.g., `qrDotType`, `qrBorderEnabled`, etc.)
- The dependency array will include the settings object
- No database or migration changes needed

