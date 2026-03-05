import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileUploadStep } from "@/components/batch/FileUploadStep";
import { ColumnMappingStep } from "@/components/batch/ColumnMappingStep";
import { ReviewStep } from "@/components/batch/ReviewStep";
import { parseFile, autoDetectMapping } from "@/lib/file-parser";
import { mapAndValidate } from "@/lib/validation";
import { generatePdf } from "@/lib/pdf-generator";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Download } from "lucide-react";
import sparklightLogo from "@/assets/sparklight-logo.png";
import type { ParsedRow, ColumnMapping, MappedRecord, ValidationWarning } from "@/lib/batch-types";

const STEPS = ["Upload", "Map Columns", "Review", "Generate"];

export default function BatchNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  // Step 1: Upload
  const [batchName, setBatchName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<ParsedRow[]>([]);

  // Step 2: Mapping
  const [mapping, setMapping] = useState<ColumnMapping>({ homesPassedId: "", address: "" });
  const [startRow, setStartRow] = useState(0);
  const [startCol, setStartCol] = useState(0);
  const [destinationOverride, setDestinationOverride] = useState("");

  // Step 3: Review
  const [mappedRecords, setMappedRecords] = useState<MappedRecord[]>([]);
  const [warnings, setWarnings] = useState<ValidationWarning[]>([]);

  // Step 4: Generate
  const [generating, setGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<any>({
    base_url: "https://go.sparklight.internal",
    qr_size_inches: 1.35,
    primary_color: "#7B2D8E",
    secondary_color: "#54585A",
    qr_error_correction: "H",
    quiet_zone_modules: 4,
    x_offset_mm: 0,
    y_offset_mm: 0,
    qr_dot_type: "square",
    qr_dot_color: "#000000",
    qr_corner_square_type: "square",
    qr_corner_square_color: "#000000",
    qr_corner_dot_type: "square",
    qr_corner_dot_color: "#000000",
    qr_background_color: "#FFFFFF",
    qr_image_url: null,
    qr_image_size: 0.4,
    qr_image_margin: 5,
    qr_border_enabled: false,
    qr_border_round: 0,
    qr_border_thickness: 40,
    qr_border_color: "#000000",
    qr_border_dasharray: null,
    qr_border_inner_thickness: 5,
    qr_border_inner_color: "#000000",
    qr_border_outer_thickness: 5,
    qr_border_outer_color: "#000000",
    qr_border_top_text: null,
    qr_border_top_style: "font: 20px sans-serif; fill: #FFFFFF;",
    qr_border_bottom_text: null,
    qr_border_bottom_style: "font: 20px sans-serif; fill: #FFFFFF;",
    qr_border_license_key: null,
  });

  // Logo data URL
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>();

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("*")
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setSettings({
            base_url: data.base_url,
            qr_size_inches: Number(data.qr_size_inches),
            primary_color: data.primary_color,
            secondary_color: data.secondary_color,
            qr_error_correction: data.qr_error_correction,
            quiet_zone_modules: Number(data.quiet_zone_modules),
            x_offset_mm: Number(data.x_offset_mm),
            y_offset_mm: Number(data.y_offset_mm),
            qr_dot_type: (data as any).qr_dot_type || "square",
            qr_dot_color: (data as any).qr_dot_color || "#000000",
            qr_corner_square_type: (data as any).qr_corner_square_type || "square",
            qr_corner_square_color: (data as any).qr_corner_square_color || "#000000",
            qr_corner_dot_type: (data as any).qr_corner_dot_type || "square",
            qr_corner_dot_color: (data as any).qr_corner_dot_color || "#000000",
            qr_background_color: (data as any).qr_background_color || "#FFFFFF",
            qr_image_url: (data as any).qr_image_url || null,
            qr_image_size: Number((data as any).qr_image_size) || 0.4,
            qr_image_margin: Number((data as any).qr_image_margin) || 5,
            qr_border_enabled: (data as any).qr_border_enabled ?? false,
            qr_border_round: Number((data as any).qr_border_round) || 0,
            qr_border_thickness: Number((data as any).qr_border_thickness) || 40,
            qr_border_color: (data as any).qr_border_color || "#000000",
            qr_border_dasharray: (data as any).qr_border_dasharray || null,
            qr_border_inner_thickness: Number((data as any).qr_border_inner_thickness) || 5,
            qr_border_inner_color: (data as any).qr_border_inner_color || "#000000",
            qr_border_outer_thickness: Number((data as any).qr_border_outer_thickness) || 5,
            qr_border_outer_color: (data as any).qr_border_outer_color || "#000000",
            qr_border_top_text: (data as any).qr_border_top_text || null,
            qr_border_top_style: (data as any).qr_border_top_style || "font: 20px sans-serif; fill: #FFFFFF;",
            qr_border_bottom_text: (data as any).qr_border_bottom_text || null,
            qr_border_bottom_style: (data as any).qr_border_bottom_style || "font: 20px sans-serif; fill: #FFFFFF;",
            qr_border_license_key: (data as any).qr_border_license_key || null,
          });
        }
      });

    // Convert logo to data URL
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      setLogoDataUrl(canvas.toDataURL("image/png"));
    };
    img.src = sparklightLogo;
  }, []);

  const handleFileLoaded = async (f: File) => {
    setFile(f);
    setFileError(null);
    try {
      const { headers: h, data: d } = await parseFile(f);
      if (d.length === 0) {
        setFileError("File is empty or has no data rows.");
        return;
      }
      setHeaders(h);
      setRawData(d);
      const detected = autoDetectMapping(h);
      setMapping(detected);
    } catch (err: any) {
      setFileError(err.message);
    }
  };

  const handleNextStep = () => {
    if (step === 0) {
      if (!batchName.trim()) {
        setFileError("Please enter a batch name.");
        return;
      }
      if (!file || rawData.length === 0) {
        setFileError("Please upload a file first.");
        return;
      }
      setFileError(null);
      setStep(1);
    } else if (step === 1) {
      if (!mapping.homesPassedId || !mapping.address) {
        toast.error("Please map both HomesPassedID and Address columns.");
        return;
      }
      const { records, warnings: w } = mapAndValidate(rawData, mapping);
      setMappedRecords(records);
      setWarnings(w);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const validRecords = mappedRecords.filter((r) => r.homesPassedId);

      // 1. Create batch in DB
      const { data: batch, error: batchError } = await supabase
        .from("qr_batches")
        .insert({
          name: batchName.trim(),
          created_by: user!.id,
          row_count: validRecords.length,
          status: "generating",
          destination_url_override: destinationOverride || null,
        })
        .select()
        .single();

      if (batchError) throw batchError;
      setBatchId(batch.id);

      // 2. Insert QR codes in batches of 500
      for (let i = 0; i < validRecords.length; i += 500) {
        const chunk = validRecords.slice(i, i + 500).map((r) => ({
          batch_id: batch.id,
          homes_passed_id: r.homesPassedId,
          address: r.address,
          status: "active",
        }));
        const { error: codesError } = await supabase.from("qr_codes").insert(chunk);
        if (codesError) throw codesError;
      }

      // 3. Generate PDF
      const blob = await generatePdf(validRecords, {
        baseUrl: settings.base_url,
        qrSizeInches: settings.qr_size_inches,
        primaryColor: settings.primary_color,
        secondaryColor: settings.secondary_color,
        errorCorrection: settings.qr_error_correction as "L" | "M" | "Q" | "H",
        quietZone: settings.quiet_zone_modules,
        xOffsetMm: settings.x_offset_mm,
        yOffsetMm: settings.y_offset_mm,
        startRow,
        startCol,
        logoDataUrl,
        qrDotType: settings.qr_dot_type,
        qrDotColor: settings.qr_dot_color,
        qrCornerSquareType: settings.qr_corner_square_type,
        qrCornerSquareColor: settings.qr_corner_square_color,
        qrCornerDotType: settings.qr_corner_dot_type,
        qrCornerDotColor: settings.qr_corner_dot_color,
        qrBackgroundColor: settings.qr_background_color,
        qrImageUrl: settings.qr_image_url,
        qrImageSize: settings.qr_image_size,
        qrImageMargin: settings.qr_image_margin,
      });
      setPdfBlob(blob);

      // 4. Update batch status
      await supabase
        .from("qr_batches")
        .update({ status: "completed" })
        .eq("id", batch.id);

      toast.success(`Batch generated: ${validRecords.length} QR codes`);
    } catch (err: any) {
      toast.error("Generation failed: " + err.message);
    }
    setGenerating(false);
  };

  const handleDownloadPdf = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${batchName.replace(/[^a-zA-Z0-9]/g, "_")}_labels.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const validRecords = mappedRecords.filter((r) => r.homesPassedId);
    const rows = [
      ["HomesPassedID", "Address", "QR_URL"],
      ...validRecords.map((r) => [
        r.homesPassedId,
        r.address,
        `${settings.base_url}/HH/${r.homesPassedId}`,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${batchName.replace(/[^a-zA-Z0-9]/g, "_")}_mappings.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create New Batch</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-colors ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i === step ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 0 && (
        <FileUploadStep
          batchName={batchName}
          onBatchNameChange={setBatchName}
          onFileLoaded={handleFileLoaded}
          error={fileError}
        />
      )}

      {step === 1 && (
        <ColumnMappingStep
          headers={headers}
          sampleData={rawData}
          mapping={mapping}
          onMappingChange={setMapping}
          startRow={startRow}
          startCol={startCol}
          onStartRowChange={setStartRow}
          onStartColChange={setStartCol}
          destinationOverride={destinationOverride}
          onDestinationOverrideChange={setDestinationOverride}
        />
      )}

      {step === 2 && (
        <ReviewStep
          records={mappedRecords}
          warnings={warnings}
          baseUrl={settings.base_url}
          qrSizeInches={settings.qr_size_inches}
          primaryColor={settings.primary_color}
          errorCorrection={settings.qr_error_correction}
          quietZone={settings.quiet_zone_modules}
          xOffsetMm={settings.x_offset_mm}
          yOffsetMm={settings.y_offset_mm}
          startRow={startRow}
          startCol={startCol}
          logoDataUrl={logoDataUrl}
        />
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {generating ? "Generating…" : "Batch Complete"}
            </CardTitle>
            <CardDescription>
              {generating
                ? "Creating QR codes and building PDF. This may take a moment for large batches."
                : `Successfully generated ${mappedRecords.filter((r) => r.homesPassedId).length} QR codes.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generating ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Generating PDF…</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownloadPdf} disabled={!pdfBlob}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </Button>
                <Button variant="outline" onClick={handleDownloadCsv}>
                  <Download className="mr-2 h-4 w-4" /> Download CSV Mapping
                </Button>
                {batchId && (
                  <Button variant="outline" onClick={() => navigate(`/batches/${batchId}`)}>
                    View Batch Details
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => step > 0 ? setStep(step - 1) : navigate("/batches")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <Button onClick={handleNextStep}>
            {step === 2 ? "Generate" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </AppLayout>
  );
}
