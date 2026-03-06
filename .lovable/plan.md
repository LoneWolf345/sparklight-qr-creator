

## Plan: Replace Markets & States KPIs with detailed breakdowns

Replace the current "Markets Covered" and "States Covered" single-number cards with:

1. **Markets card** -- List each market name with its address count (e.g. "Phoenix: 1,240"). Computed by grouping batches by `market` and summing `row_count`.

2. **Top States card** -- Show the top 3 states by address count with counts (e.g. "AZ: 2,100"). Computed by grouping batches by `state`, summing `row_count`, sorting descending, taking top 3.

Keep "Total Communities" and "Total Addresses" cards as-is.

### Layout
- Same 4-column grid
- Cards 3 and 4 will show a small list inside instead of a single large number
- Each list item: name on left, count on right, compact text size

### File changes
- **`src/pages/Batches.tsx`**: Replace the KPI grid section (lines 59-79) with 4 cards where the last two render computed lists instead of single values.

