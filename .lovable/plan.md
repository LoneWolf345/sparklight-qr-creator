

# Integrate `qr-code-styling` for Customizable QR Codes

## Overview
Replace the current basic `qrcode` library with `qr-code-styling`, which supports dot shapes, corner styles, gradients, embedded images, and background options. Add a new "QR Style" admin tab with a live preview and persist style settings to the database.

## Database Changes
Add new columns to `app_settings` to store QR style configuration as a JSON blob:

```sql
ALTER TABLE app_settings
  ADD COLUMN qr_dot_type text NOT NULL DEFAULT 'square',
  ADD COLUMN qr_dot_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_corner_square_type text NOT NULL DEFAULT 'square',
  ADD COLUMN qr_corner_square_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_corner_dot_type text NOT NULL DEFAULT 'square',
  ADD COLUMN qr_corner_dot_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_background_color text NOT NULL DEFAULT '#FFFFFF',
  ADD COLUMN qr_image_url text DEFAULT NULL,
  ADD COLUMN qr_image_size numeric NOT NULL DEFAULT 0.4,
  ADD COLUMN qr_image_margin integer NOT NULL DEFAULT 5;
```

## New Package
Install `qr-code-styling` (the main package by kozakdenys, ~500k weekly downloads).

## Implementation

### 1. Admin QR Style Tab (`src/components/admin/QrStyleTab.tsx`)
A new card-based settings panel with:
- **Dot style**: type dropdown (square, dots, rounded, classy, classy-rounded, extra-rounded) + color picker
- **Corner squares**: type dropdown (square, dot, extra-rounded) + color picker  
- **Corner dots**: type dropdown (square, dot) + color picker
- **Background color**: color picker
- **Embedded image**: URL input (for center logo in QR) + size slider (0.1-0.5) + margin
- **Live preview**: renders a sample QR code using `qr-code-styling` in real-time as settings change, using a ref-based canvas/SVG element

### 2. Update `Admin.tsx`
Add a 5th tab "QR Style" with a `QrCode` icon between the existing "Global Settings" and "User Management" tabs.

### 3. Update `GlobalSettingsTab.tsx`
Remove the existing QR Rendering card (error correction, size, quiet zone) — those controls move to the new QR Style tab along with the new styling options. Keep URL config, brand colors, and print calibration in Global Settings.

### 4. Update PDF Generator (`src/lib/pdf-generator.ts`)
- Replace `import QRCode from "qrcode"` with `import QRCodeStyling from "qr-code-styling"`
- For each label, create a `QRCodeStyling` instance with the stored style settings, render to a canvas/blob, convert to data URL, and embed in the jsPDF page using `doc.addImage()`
- The `PdfOptions` interface gains new fields matching the DB columns

### 5. Update Batch Wizard
The review step and preview generation will automatically pick up the new styling since they read from `app_settings`.

## File Changes Summary
| File | Action |
|---|---|
| `app_settings` table | Migration: add 6 new columns |
| `package.json` | Add `qr-code-styling` |
| `src/components/admin/QrStyleTab.tsx` | Create: full style editor with live preview |
| `src/pages/Admin.tsx` | Edit: add QR Style tab |
| `src/components/admin/GlobalSettingsTab.tsx` | Edit: remove QR Rendering card (moved) |
| `src/lib/pdf-generator.ts` | Edit: swap to `qr-code-styling` for rendering |

