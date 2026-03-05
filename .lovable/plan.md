

# Integrate `qr-border-plugin` for QR Code Borders and Decorations

## Important Note
This plugin requires a **paid license key** for production use -- without one, a watermark appears on QR codes. You can develop and test without a key, but you will need to purchase one from [lefe.dev](https://www.lefe.dev/marketplace/qr-border-plugin) before going live.

## Overview
Add border and decoration controls to the QR Style admin tab. The plugin supports customizable borders (inner/outer), rounded corners, and text/image decorations on each side (top, bottom, left, right).

## Database Changes
Add new columns to `app_settings`:

```sql
ALTER TABLE app_settings
  ADD COLUMN qr_border_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN qr_border_round numeric NOT NULL DEFAULT 0,
  ADD COLUMN qr_border_thickness integer NOT NULL DEFAULT 40,
  ADD COLUMN qr_border_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_border_dasharray text DEFAULT NULL,
  ADD COLUMN qr_border_inner_thickness integer NOT NULL DEFAULT 5,
  ADD COLUMN qr_border_inner_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_border_outer_thickness integer NOT NULL DEFAULT 5,
  ADD COLUMN qr_border_outer_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_border_top_text text DEFAULT NULL,
  ADD COLUMN qr_border_top_style text NOT NULL DEFAULT 'font: 20px sans-serif; fill: #FFFFFF;',
  ADD COLUMN qr_border_bottom_text text DEFAULT NULL,
  ADD COLUMN qr_border_bottom_style text NOT NULL DEFAULT 'font: 20px sans-serif; fill: #FFFFFF;',
  ADD COLUMN qr_border_license_key text DEFAULT NULL;
```

## Implementation

### 1. Install package
Add `qr-border-plugin` to dependencies.

### 2. Update QrStyleTab
Add a new "Border & Decorations" card with:
- **Enable border** toggle
- **Border settings**: thickness slider, color picker, roundness slider (0-1), dasharray input
- **Inner/Outer border**: thickness + color for each
- **Top decoration**: text input + CSS style input
- **Bottom decoration**: text input + CSS style input
- **License key**: text input (stored in DB, applied via `QRBorderPlugin.setKey()`)

The live preview will call `qrCode.applyExtension(QRBorderPlugin(extensionOptions))` when border is enabled. Note: since `applyExtension` modifies the instance, we need to recreate the QR instance on each border settings change rather than using `.update()`.

### 3. Update PDF Generator
When border settings are enabled, apply the border plugin extension to each QR code instance before rendering to canvas/blob for PDF embedding. The margin on the QR code will need to increase to accommodate the border thickness.

### 4. Update batch wizard
The review step settings fetch will also pull the new border columns to pass through to the PDF generator.

## File Changes
| File | Action |
|---|---|
| `app_settings` table | Migration: add border columns |
| `package.json` | Add `qr-border-plugin` |
| `src/components/admin/QrStyleTab.tsx` | Edit: add Border & Decorations card, update preview logic |
| `src/lib/pdf-generator.ts` | Edit: apply border plugin when enabled |
| `src/pages/BatchNew.tsx` | Edit: fetch and pass border settings |

