// Auto-generated from USA_States_and_Cities_json dataset
// Maps 2-letter state codes to arrays of city names (trimmed, title case as-is)
import rawData from "./us-cities-raw.json";

const STATE_NAME_TO_CODE: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
  "Puerto Rico": "PR", "Virgin Islands": "VI", "Guam": "GU",
  "American Samoa": "AS", "Northern Mariana Islands": "MP",
};

const usaData = (rawData as any).countries.USA as Record<string, string[]>;

const US_CITIES_BY_STATE: Record<string, string[]> = {};

for (const [stateName, cities] of Object.entries(usaData)) {
  const code = STATE_NAME_TO_CODE[stateName];
  if (code) {
    US_CITIES_BY_STATE[code] = cities.map((c: string) => c.trim()).filter(Boolean);
  }
}

export { US_CITIES_BY_STATE };

/**
 * Add a city to a state's list (in-memory only, resets on reload).
 * Returns true if added, false if it already exists.
 */
export function addCityToState(city: string, stateCode: string): boolean {
  if (!US_CITIES_BY_STATE[stateCode]) {
    US_CITIES_BY_STATE[stateCode] = [];
  }
  const exists = US_CITIES_BY_STATE[stateCode].some(
    (c) => c.toLowerCase() === city.trim().toLowerCase()
  );
  if (exists) return false;
  US_CITIES_BY_STATE[stateCode].push(city.trim());
  US_CITIES_BY_STATE[stateCode].sort((a, b) => a.localeCompare(b));
  return true;
}

/**
 * Check if a city exists in a given state (case-insensitive).
 * Returns true if the state is not in the dataset (unknown territory).
 */
export function isCityInState(city: string, stateCode: string): boolean {
  const cities = US_CITIES_BY_STATE[stateCode];
  if (!cities) return true;
  return cities.some((c) => c.toLowerCase() === city.trim().toLowerCase());
}

/**
 * Get matching cities for a state, optionally filtered by a search query.
 */
export function getCitiesForState(stateCode: string, query?: string): string[] {
  const cities = US_CITIES_BY_STATE[stateCode] ?? [];
  if (!query) return cities;
  const q = query.trim().toLowerCase();
  return cities.filter((c) => c.toLowerCase().includes(q));
}
