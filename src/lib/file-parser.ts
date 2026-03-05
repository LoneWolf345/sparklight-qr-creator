import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ParsedRow } from "./batch-types";

export async function parseFile(file: File): Promise<{ headers: string[]; data: ParsedRow[] }> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv" || ext === "txt") {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const headers = result.meta.fields ?? [];
          resolve({ headers, data: result.data as ParsedRow[] });
        },
        error: (err) => reject(err),
      });
    });
  }

  if (ext === "xlsx" || ext === "xls") {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<ParsedRow>(sheet, { defval: "" });
    const headers = json.length > 0 ? Object.keys(json[0]) : [];
    return { headers, data: json };
  }

  throw new Error("Unsupported file type. Please upload a CSV or XLSX file.");
}

export function autoDetectMapping(headers: string[]): { homesPassedId: string; address: string } {
  const lower = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  let homesPassedId = "";
  let address = "";

  for (let i = 0; i < headers.length; i++) {
    const l = lower[i];
    if (!homesPassedId && (l.includes("homespassedid") || l.includes("homespassed") || l.includes("hpid") || l === "id")) {
      homesPassedId = headers[i];
    }
    if (!address && (l.includes("address") || l.includes("addr") || l.includes("street") || l.includes("location"))) {
      address = headers[i];
    }
  }

  // Fallback: first two columns
  if (!homesPassedId && headers.length > 0) homesPassedId = headers[0];
  if (!address && headers.length > 1) address = headers[1];

  return { homesPassedId, address };
}
