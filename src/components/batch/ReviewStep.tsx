import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileText } from "lucide-react";
import type { MappedRecord, ValidationWarning } from "@/lib/batch-types";
import { generatePreviewCanvas } from "@/lib/pdf-generator";

interface ReviewStepProps {
  records: MappedRecord[];
  warnings: ValidationWarning[];
  baseUrl: string;
  qrSizeInches: number;
  primaryColor: string;
  errorCorrection: string;
  quietZone: number;
  xOffsetMm: number;
  yOffsetMm: number;
  startRow: number;
  startCol: number;
  logoDataUrl?: string;
}

export function ReviewStep({
  records,
  warnings,
  baseUrl,
  qrSizeInches,
  primaryColor,
  errorCorrection,
  quietZone,
  xOffsetMm,
  yOffsetMm,
  startRow,
  startCol,
  logoDataUrl,
}: ReviewStepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const validRecords = records.filter((r) => r.homesPassedId);
  const errorWarnings = warnings.filter((w) => w.type === "missing_id");
  const otherWarnings = warnings.filter((w) => w.type !== "missing_id");

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      setLoadingPreview(true);
      try {
        const url = await generatePreviewCanvas(validRecords, {
          baseUrl,
          qrSizeInches,
          primaryColor,
          secondaryColor: "#54585A",
          errorCorrection: errorCorrection as "L" | "M" | "Q" | "H",
          quietZone,
          xOffsetMm,
          yOffsetMm,
          startRow,
          startCol,
          logoDataUrl,
        }, 600);
        if (!cancelled) setPreviewUrl(url);
      } catch {
        // preview failed silently
      }
      if (!cancelled) setLoadingPreview(false);
    };

    if (validRecords.length > 0) generate();
    return () => { cancelled = true; };
  }, [validRecords.length, baseUrl, qrSizeInches, primaryColor, startRow, startCol]);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{records.length}</p>
            <p className="text-sm text-muted-foreground">Total Rows</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-foreground">{validRecords.length}</p>
            <p className="text-sm text-muted-foreground">Valid Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{warnings.length}</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Validation Warnings
            </CardTitle>
            <CardDescription>
              {errorWarnings.length} errors, {otherWarnings.length} warnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {warnings.slice(0, 50).map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Badge
                    variant={w.type === "missing_id" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {w.type === "missing_id" ? "Error" : "Warning"}
                  </Badge>
                  <span className="text-muted-foreground">{w.message}</span>
                </div>
              ))}
              {warnings.length > 50 && (
                <p className="text-xs text-muted-foreground mt-2">
                  …and {warnings.length - 50} more warnings
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">First Page Preview</CardTitle>
          <CardDescription>Approximate rendering of the first page of labels</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPreview ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <span className="ml-3 text-sm text-muted-foreground">Generating preview…</span>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full border border-border rounded-lg"
              style={{ height: "600px" }}
              title="Label Preview"
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Preview unavailable. Proceed to generate the full PDF.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
