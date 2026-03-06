

## City/State Validation via Static Dataset

Bundle a JSON file of US cities mapped to their state codes and use it for validation in the FileUploadStep.

### Changes

**1. Create static dataset (`src/data/us-cities.ts`)**
- Export a `Record<string, string[]>` mapping each 2-letter state code to an array of city names (uppercase for case-insensitive matching).
- Source: US Census/USPS city list (~30K entries). The file will be ~200KB gzipped.

**2. Update `FileUploadStep.tsx`**
- Import the city dataset.
- After the user selects a state and enters a city, check if the city exists in that state's list.
- If not found, show a soft yellow warning below the City field: "City not found in [STATE]. Please double-check the spelling."
- Do NOT block submission — treat it as a warning, not an error, since some newer communities may not be in the dataset.

**3. Optional: City autocomplete**
- When a state is selected, filter the city list for that state and offer autocomplete suggestions in the City input using the same `Popover`/`Command` combobox pattern already used for State.
- This makes data entry faster and reduces typos.

### Approach
- Validation is instant (no API calls, no network dependency).
- Warning-based so it never blocks legitimate entries.
- Dataset generated once and committed to the repo.

