

## KPI Suggestions for the Communities Page

Based on the data available in `qr_batches` and `qr_codes` tables, here are KPI cards that would fit naturally above the communities table:

1. **Total Communities** -- Count of all `qr_batches` rows.
2. **Total Addresses** -- Sum of `row_count` across all batches (already available without a join).
3. **Markets Covered** -- Count of distinct non-null `market` values from `qr_batches`.
4. **States Covered** -- Count of distinct non-null `state` values from `qr_batches`.

### Implementation

- Add a row of 4 compact `Card` components between the page header and the table card in `src/pages/Batches.tsx`.
- Derive all values from the already-fetched `batches` array (no extra queries needed).
- Each card: icon + label + number, styled consistently with the existing design.

