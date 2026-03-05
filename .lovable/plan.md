

## Problem

The QR border frame encroaches on the registration points (corner squares) in the PDF output but not in the Admin preview. 

**Root cause**: Both use `margin: 40`, but the Admin preview renders at 360x360px while the PDF renderer uses `qrSizeInches * 300` DPI (e.g., 1.35" = 405px). A fixed 40px margin is ~11% of the canvas at 360px but only ~10% at 405px. More critically, the border plugin's thickness and inner/outer strokes consume space that eats into QR modules at different canvas sizes.

The real fix is to make the margin proportional to the canvas size so it matches the Admin preview's proportions regardless of output resolution.

## Plan

**File: `src/lib/pdf-generator.ts`** — one change in `renderQrToDataUrl`:

1. Scale the margin proportionally based on canvas size relative to the Admin preview's 360px baseline:
   - Replace `margin: options.qrBorderEnabled ? 40 : 0` with `margin: options.qrBorderEnabled ? Math.round(40 * (sizePx / 360)) : 0`
   - This ensures the margin-to-canvas ratio stays constant, matching the Admin preview proportions exactly

This single change ensures the border frame maintains the same proportional distance from the QR modules at any output resolution.

