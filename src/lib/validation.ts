import type { ParsedRow, ColumnMapping, MappedRecord, ValidationWarning } from "./batch-types";

export function mapAndValidate(
  rawData: ParsedRow[],
  mapping: ColumnMapping
): { records: MappedRecord[]; warnings: ValidationWarning[] } {
  const records: MappedRecord[] = [];
  const warnings: ValidationWarning[] = [];
  const seenIds = new Map<string, number>();

  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    const homesPassedId = (row[mapping.homesPassedId] ?? "").toString().trim();
    const address = (row[mapping.address] ?? "").toString().trim();

    if (!homesPassedId) {
      warnings.push({
        type: "missing_id",
        rowIndex: i + 2, // 1-indexed + header row
        message: `Row ${i + 2}: Missing HomesPassedID`,
      });
    }

    if (!address) {
      warnings.push({
        type: "missing_address",
        rowIndex: i + 2,
        message: `Row ${i + 2}: Missing Address`,
      });
    }

    if (homesPassedId && seenIds.has(homesPassedId)) {
      warnings.push({
        type: "duplicate_id",
        rowIndex: i + 2,
        message: `Row ${i + 2}: Duplicate HomesPassedID "${homesPassedId}" (first seen at row ${seenIds.get(homesPassedId)})`,
      });
    }

    if (homesPassedId) {
      seenIds.set(homesPassedId, i + 2);
    }

    records.push({ homesPassedId, address, rowIndex: i + 2 });
  }

  return { records, warnings };
}
