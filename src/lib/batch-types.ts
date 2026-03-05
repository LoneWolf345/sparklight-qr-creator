// Shared types for the batch wizard
export interface ParsedRow {
  [key: string]: string;
}

export interface ColumnMapping {
  homesPassedId: string;
  address: string;
}

export interface MappedRecord {
  homesPassedId: string;
  address: string;
  rowIndex: number;
}

export interface ValidationWarning {
  type: "missing_id" | "missing_address" | "duplicate_id";
  rowIndex: number;
  message: string;
}

export interface BatchWizardState {
  step: number;
  batchName: string;
  file: File | null;
  rawHeaders: string[];
  rawData: ParsedRow[];
  mapping: ColumnMapping;
  mappedRecords: MappedRecord[];
  warnings: ValidationWarning[];
  startRow: number;
  startCol: number;
  destinationOverride: string;
}

// Avery 94107 constants
export const AVERY_94107 = {
  pageWidth: 8.5,    // inches
  pageHeight: 11,    // inches
  cols: 3,
  rows: 4,
  labelWidth: 2,     // inches
  labelHeight: 2,    // inches
  marginLeft: 0.625, // inches
  marginTop: 0.625,  // inches
  colGap: 0.625,     // inches
  rowGap: 0.583333,  // inches
  labelsPerPage: 12,
};
