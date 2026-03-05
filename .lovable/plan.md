

# Rename "Batches" to "Communities" + Add City/State/Market Fields

## Overview
Rename all user-facing references from "Batch" to "Community" across the app, and add three required fields (City, State, Market) to step 1 of the creation wizard.

## Database Change
Add three nullable text columns to `qr_batches` so existing rows are unaffected:

```sql
ALTER TABLE public.qr_batches
  ADD COLUMN city text,
  ADD COLUMN state text,
  ADD COLUMN market text;
```

## File Changes

| File | Changes |
|---|---|
| `src/components/layout/AppSidebar.tsx` | Rename nav items: "Batches" -> "Communities", "New Batch" -> "New Community" |
| `src/pages/Batches.tsx` | Rename all headings/labels from "Batch" to "Community". Display city/state/market columns in the table. |
| `src/pages/BatchNew.tsx` | Rename heading to "Create New Community". Add `city`, `state`, `market` state variables. Validate they are non-empty before advancing past step 1. Pass them into the DB insert. |
| `src/components/batch/FileUploadStep.tsx` | Rename "Batch Name" label to "Community Name". Add City, State, Market input fields below the name. Accept new props for these fields + onChange handlers. |
| `src/pages/BatchDetail.tsx` | Rename heading references. Show city/state/market in summary cards if present. |

## Step 1 Form Design
The FileUploadStep will gain three new inputs in a row below the Community Name field:
- **City** (text input, required)
- **State** (text input, required)
- **Market** (text input, required)

Validation in `handleNextStep` (step 0) will check that all three are non-empty before proceeding.

