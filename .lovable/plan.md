

## Plan: Single QR Code Generator Page

### What we're building
A standalone page at `/single-qr` where users can enter any URL, customize top/bottom border text, see a live preview, and download the QR as PNG, SVG, or a positioned Avery 94107 PDF.

### Files to create

**`src/pages/SingleQr.tsx`**
- Fetches `app_settings` on mount for all QR styling config
- Form fields: URL (required), Top Text (defaults from settings), Bottom Text (defaults from settings)
- Live preview: creates a `QRCodeStyling` instance at 360x360 SVG with border plugin, updates on every field change (mirrors Admin QrStyleTab preview logic)
- Download buttons:
  - **PNG** / **SVG**: uses `qrInstance.download()` directly
  - **PDF (Avery 94107)**: opens a dialog with `LabelStartPicker`, generates a single-label PDF using `renderQrToDataUrl` + `jsPDF` at the selected cell position
- Wrapped in `AppLayout` for consistent sidebar

### Files to modify

**`src/lib/pdf-generator.ts`**
- Export `renderQrToDataUrl` (add `export` keyword) so the SingleQr page can reuse it for single-label PDF generation

**`src/components/layout/AppSidebar.tsx`**
- Add `{ title: "Single QR Code", url: "/single-qr", icon: QrCode }` to `navItems`
- Import `QrCode` from lucide-react

**`src/App.tsx`**
- Import `SingleQr` page
- Add route: `/single-qr` wrapped in `ProtectedRoute`

### No database changes needed
Reads existing `app_settings` for styling configuration.

