
Goal: make the generated PDF output match the Admin QR preview style exactly, with no extra elements outside the QR frame.

Implementation plan

1) Remove all non-frame content from batch output
- File: `src/lib/pdf-generator.ts`
- In both `generatePdf` and `generatePreviewCanvas`:
  - Remove the external Sparklight wordmark drawn above the QR (`logoDataUrl` block).
  - Remove all text currently drawn below the QR (`address`, `ID`, `Scan to get started`).
- Result: only the framed QR art is rendered on each label.

2) Fix frame overlap and proportion mismatch
- File: `src/lib/pdf-generator.ts`
- In `renderQrToDataUrl`, change QR margin behavior to mirror Admin preview logic:
  - use `margin: options.qrBorderEnabled ? 40 : options.quietZone`
  - (currently margin is `0`, which causes the frame to encroach on QR modules)
- Keep `qr-code-styling` + `qr-border-plugin` as the single renderer for both preview and PDF so visual geometry stays consistent.

3) Set border decorations to the required content per record
- File: `src/lib/pdf-generator.ts`
- Add per-record decoration overrides when rendering each QR:
  - Top decoration text: `"Activate WiFi"` (or use saved top text if desired, with fallback to `"Activate WiFi"`).
  - Bottom decoration text: current record street address.
- Apply these overrides in both `generatePdf` and `generatePreviewCanvas` so wizard preview and final PDF match exactly.

4) Keep shared options flow intact, but stop using external logo in batch output
- Files: `src/components/batch/ReviewStep.tsx`, `src/pages/BatchNew.tsx`, `src/lib/pdf-options.ts`
- Continue using `buildPdfOptions(...)` for consistency.
- Pass style settings as today, but batch rendering will ignore `logoDataUrl` for external placement (center logo remains from `qr_image_url` in QR settings).

5) Validation checklist after implementation
- In wizard Review:
  - QR shows center logo only.
  - Top frame text is “Activate WiFi”.
  - Bottom frame text equals each row’s street address.
  - No text outside QR frame.
  - Frame no longer overlaps QR modules.
- In generated PDF:
  - Matches Review preview for the same record (WYSIWYG).
  - Matches Admin style proportions (dot density, corners, border spacing).

Technical notes
- No backend/database migration needed.
- The uploaded image is treated as visual reference only, not embedded as an asset.
- Main root cause of overlap is the margin mismatch (`0` in batch renderer vs `40` in Admin preview when border is enabled).
