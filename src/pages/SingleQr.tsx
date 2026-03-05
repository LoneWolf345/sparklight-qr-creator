import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LabelStartPicker } from "@/components/batch/LabelStartPicker";
import { toast } from "sonner";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import QRBorderPlugin from "qr-border-plugin";
import { jsPDF } from "jspdf";
import { renderQrToDataUrl } from "@/lib/pdf-generator";
import { buildPdfOptions, type QrSettings } from "@/lib/pdf-options";
import { AVERY_94107 } from "@/lib/batch-types";

export default function SingleQr() {
  const [settings, setSettings] = useState<QrSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [initDone, setInitDone] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  // PDF dialog state
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfStartRow, setPdfStartRow] = useState(0);
  const [pdfStartCol, setPdfStartCol] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("app_settings").select("*").limit(1).single();
      if (data) {
        setSettings(data as unknown as QrSettings);
        setTopText(data.qr_border_top_text ?? "");
        setBottomText(data.qr_border_bottom_text ?? "");
      }
      setLoading(false);
      setInitDone(true);
    })();
  }, []);

  // Live preview
  useEffect(() => {
    if (!settings || !previewRef.current || !initDone) return;

    const previewData = url || "https://example.com";

    const options: any = {
      width: 360,
      height: 360,
      type: "svg",
      data: previewData,
      dotsOptions: { type: settings.qr_dot_type, color: settings.qr_dot_color },
      cornersSquareOptions: { type: settings.qr_corner_square_type, color: settings.qr_corner_square_color },
      cornersDotOptions: { type: settings.qr_corner_dot_type, color: settings.qr_corner_dot_color },
      backgroundOptions: { color: settings.qr_background_color },
      qrOptions: { errorCorrectionLevel: settings.qr_error_correction },
      margin: settings.qr_border_enabled ? 40 : settings.quiet_zone_modules,
    };

    if (settings.qr_image_url) {
      options.image = settings.qr_image_url;
      options.imageOptions = { crossOrigin: "anonymous", margin: settings.qr_image_margin, imageSize: settings.qr_image_size };
    }

    previewRef.current.innerHTML = "";
    const qr = new QRCodeStyling(options);

    if (settings.qr_border_enabled) {
      if (settings.qr_border_license_key) QRBorderPlugin.setKey(settings.qr_border_license_key);
      const extOpts: any = {
        round: settings.qr_border_round,
        thickness: settings.qr_border_thickness,
        color: settings.qr_border_color,
        borderInner: { color: settings.qr_border_inner_color, thickness: settings.qr_border_inner_thickness },
        borderOuter: { color: settings.qr_border_outer_color, thickness: settings.qr_border_outer_thickness },
        decorations: {},
      };
      if (settings.qr_border_dasharray) extOpts.dasharray = settings.qr_border_dasharray;
      if (topText) extOpts.decorations.top = { type: "text", value: topText, style: settings.qr_border_top_style };
      if (bottomText) extOpts.decorations.bottom = { type: "text", value: bottomText, style: settings.qr_border_bottom_style };
      qr.applyExtension(QRBorderPlugin(extOpts));
    }

    qr.append(previewRef.current);
    qrRef.current = qr;
  }, [settings, url, topText, bottomText, initDone]);

  const handleDownload = async (type: "png" | "svg") => {
    if (!qrRef.current) return;
    try {
      await qrRef.current.download({ extension: type, name: "qr-code" } as any);
    } catch {
      toast.error("Download failed");
    }
  };

  const handlePdfGenerate = async () => {
    if (!settings || !url) return;
    setGenerating(true);
    try {
      // Fetch logo if needed
      let logoDataUrl: string | undefined;
      if (settings.qr_image_url) {
        try {
          const resp = await fetch(settings.qr_image_url);
          const blob = await resp.blob();
          logoDataUrl = await new Promise<string>((res, rej) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.onerror = rej;
            r.readAsDataURL(blob);
          });
        } catch { /* proceed without logo */ }
      }

      const pdfOpts = buildPdfOptions(settings, pdfStartRow, pdfStartCol, logoDataUrl);
      // Override top/bottom text with user input
      pdfOpts.qrBorderTopText = topText || null;
      pdfOpts.qrBorderBottomText = bottomText || null;

      const layout = AVERY_94107;
      const doc = new jsPDF({ unit: "in", format: "letter" });
      const xOffsetIn = pdfOpts.xOffsetMm / 25.4;
      const yOffsetIn = pdfOpts.yOffsetMm / 25.4;

      const labelIndex = pdfStartRow * layout.cols + pdfStartCol;
      const col = labelIndex % layout.cols;
      const row = Math.floor(labelIndex / layout.cols);

      const labelX = layout.marginLeft + col * (layout.labelWidth + layout.colGap) + xOffsetIn;
      const labelY = layout.marginTop + row * (layout.labelHeight + layout.rowGap) + yOffsetIn;

      const qrDataUrl = await renderQrToDataUrl(url, pdfOpts, bottomText || undefined);

      const qrX = labelX + (layout.labelWidth - pdfOpts.qrSizeInches) / 2;
      const qrY = labelY + (layout.labelHeight - pdfOpts.qrSizeInches) / 2;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, pdfOpts.qrSizeInches, pdfOpts.qrSizeInches);

      const blob = doc.output("blob");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "qr-label.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
      setPdfOpen(false);
      toast.success("PDF downloaded");
    } catch (err: any) {
      toast.error("PDF generation failed: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Single QR Code</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate a one-off QR code with custom text</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">QR Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            {settings?.qr_border_enabled && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Top Text</Label>
                  <Input value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="e.g. Activate WiFi" />
                </div>
                <div className="space-y-2">
                  <Label>Bottom Text</Label>
                  <Input value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="e.g. 123 Main St" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              ref={previewRef}
              className="border rounded-lg bg-background p-4 [&_svg_.qr-border-plugin-trial]:hidden"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleDownload("png")} disabled={!url}>
                <FileImage className="mr-2 h-4 w-4" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownload("svg")} disabled={!url}>
                <Download className="mr-2 h-4 w-4" />
                SVG
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPdfOpen(true)} disabled={!url}>
                <FileText className="mr-2 h-4 w-4" />
                PDF (Avery 94107)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PDF cell picker dialog */}
      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Label Position</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Pick the cell on the Avery 94107 sheet where the label should print.</p>
          <LabelStartPicker
            startRow={pdfStartRow}
            startCol={pdfStartCol}
            onSelect={(r, c) => { setPdfStartRow(r); setPdfStartCol(c); }}
          />
          <DialogFooter>
            <Button onClick={handlePdfGenerate} disabled={generating}>
              {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
