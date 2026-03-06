

## CSV Template Download

Add a "Download Template" link/button near the file upload area so users can grab a sample CSV with the expected column headers and a few example rows.

### Changes

**`src/components/batch/FileUploadStep.tsx`**
- Add a small "Download Template" button (or text link) below the drag-and-drop area.
- On click, generate a CSV blob in-browser with headers `HomesPassedID,Address` and 2-3 example rows, then trigger a download as `qr_import_template.csv`.

No new files or backend changes needed — the template is generated client-side from a hardcoded string.

