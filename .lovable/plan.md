

# Fix: First Page Preview Failure

## Problem
The preview generation in `ReviewStep` has an empty `catch` block that silently swallows errors, making it impossible to diagnose why the preview fails. The most likely root cause is that `generatePreviewCanvas` calls `generatePdf`, which renders QR codes one-by-one using `QRCodeStyling.getRawData("png")` — this can fail if the canvas context isn't available or returns null.

## Changes

### 1. Add error logging to ReviewStep (`src/components/batch/ReviewStep.tsx`)
- Replace the empty `catch {}` block with `catch (err) { console.error("Preview generation failed:", err); }` so the actual error is visible in the console.

### 2. Add defensive handling in `renderQrToDataUrl` (`src/lib/pdf-generator.ts`)
- Add a null check after `getRawData("png")` with a descriptive error message.
- Wrap the QRCodeStyling instantiation in a try/catch with meaningful error output.

### 3. Add error state to ReviewStep UI
- Show the actual error message in the "Preview unavailable" fallback so the user (and developer) can see what went wrong instead of a generic message.

These changes will surface the real error, making it immediately diagnosable. If the underlying issue is a QRCodeStyling rendering failure, the error message will tell us exactly what's happening.

