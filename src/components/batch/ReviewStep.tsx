import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, FileText } from "lucide-react";
import type { MappedRecord, ValidationWarning } from "@/lib/batch-types";
import { generatePreviewCanvas } from "@/lib/pdf-generator";
import type { QrSettings } from "@/lib/pdf-options";
import { buildPdfOptions } from "@/lib/pdf-options";

interface ReviewStepProps {
  records: MappedRecord[];
  warnings: ValidationWarning[];
  qrSettings: QrSettings;
  startRow: number;
  startCol: number;
  logoDataUrl?: string;
}

export function ReviewStep({
  records,
  warnings,
  qrSettings,
  startRow,
  startCol,
  logoDataUrl,
}: ReviewStepProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const validRecords = useMemo(() => records.filter((r) => r.homesPassedId), [records]);
  const errorWarnings = warnings.filter((w) => w.type === "missing_id");
  const otherWarnings = warnings.filter((w) => w.type !== "missing_id");

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      setLoadingPreview(true);
      setPreviewError(null);
      try {
        const pdfOptions = buildPdfOptions(qrSettings, startRow, startCol, logoDataUrl);
        const url = await generatePreviewCanvas(validRecords, pdfOptions, 600);
        if (!cancelled) setPreviewUrl(url);
      } catch (err) {
        console.error("Preview generation failed:", err);
        if (!cancelled) setPreviewError(err instanceof Error ? err.message : String(err));
      }
      if (!cancelled) setLoadingPreview(false);
    };

    if (validRecords.length > 0) {
      generate();
    } else {
      setPreviewUrl(null);
      setPreviewError(null);
      setLoadingPreview(false);
    }

    return () => { cancelled = true; };
  }, [validRecords, qrSettings, startRow, startCol, logoDataUrl]);

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
            <img
              src={previewUrl}
              className="w-full border border-border rounded-lg"
              style={{ height: "600px", objectFit: "contain", background: "hsl(var(--background))" }}
              alt="Label preview of the first page"
              loading="lazy"
            />
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-muted-foreground">
                Preview unavailable. Proceed to generate the full PDF.
              </p>
              {previewError && (
                <p className="text-xs text-destructive">Error: {previewError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
