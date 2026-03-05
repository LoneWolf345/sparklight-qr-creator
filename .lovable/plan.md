

## Plan: Reprint PDF from Community Detail Page

### Overview
Add two reprint actions to the BatchDetail page:
1. **"Reprint All"** -- regenerates the full PDF for every QR code in the community
2. **"Reprint Selected"** -- user selects specific addresses from the table, then generates a PDF containing only those codes

Both flows open a **dialog with a visual 3x4 Avery grid** so the user can click the cell where printing should start on the first sheet. Page 2+ always starts at row 0, col 0. After selecting a start position, clicking "Generate" produces and downloads the PDF.

### Files to create

**`src/components/batch/LabelStartPicker.tsx`** -- New component
- Renders a 3x4 visual grid representing the Avery 94107 sheet
- Each cell is clickable; the selected start cell is highlighted (e.g., primary color)
- Cells before the selected one are shown as "used/unavailable" (greyed out) to communicate that those positions will be skipped
- Props: `startRow`, `startCol`, `onSelect(row, col)`
- Small and compact, designed for use inside a dialog

**`src/components/batch/ReprintDialog.tsx`** -- New component
- A `Dialog` that:
  1. Shows a title ("Reprint All" or "Reprint Selected (N codes)")
  2. Embeds the `LabelStartPicker` grid
  3. Has a "Generate PDF" button
  4. On click: fetches full `app_settings`, builds `PdfOptions` via `buildPdfOptions`, converts QR code records to `MappedRecord[]`, calls `generatePdf`, and triggers a download
  5. Shows a loading spinner during generation
- Props: `open`, `onOpenChange`, `codes: QrCode[]`, `batchName: string`

### Files to modify

**`src/pages/BatchDetail.tsx`**
- Fetch full `app_settings` (all columns, not just `base_url`) so we have styling data for PDF generation
- Add a checkbox column to the QR codes table for row selection
- Add a "Select All" checkbox in the header
- Add two buttons in the action bar:
  - "Reprint All" -- opens ReprintDialog with all active codes
  - "Reprint Selected" -- opens ReprintDialog with only checked codes (disabled when none selected)
- Import and render `ReprintDialog`

### User flow
1. User visits community detail page
2. To reprint everything: clicks "Reprint All" button
3. To reprint specific labels: checks desired rows in the table, clicks "Reprint Selected"
4. Dialog opens showing a visual 3x4 grid of the sticker sheet
5. User clicks the cell where the first label should print (e.g., row 1, col 2 if they already used 5 labels)
6. Clicks "Generate PDF" -- PDF is built and downloaded
7. Only the first page uses the selected offset; subsequent pages start at position 0,0

### Technical notes
- Reuses existing `generatePdf` and `buildPdfOptions` -- no changes to PDF generation logic
- The `startRow`/`startCol` from the picker are passed to `generatePdf` which already handles the offset-only-on-first-page behavior
- No database changes needed

