import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LabelStartPicker } from "./LabelStartPicker";
import { supabase } from "@/integrations/supabase/client";
import { buildPdfOptions, type QrSettings } from "@/lib/pdf-options";
import { generatePdf } from "@/lib/pdf-generator";
import type { MappedRecord } from "@/lib/batch-types";
import { toast } from "sonner";
import { Loader2, Printer } from "lucide-react";

interface QrCode {
  id: string;
  homes_passed_id: string;
  address: string;
  status: string;
}

interface ReprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  codes: QrCode[];
  batchName: string;
  destinationUrlOverride?: string | null;
}

export function ReprintDialog({ open, onOpenChange, codes, batchName, destinationUrlOverride }: ReprintDialogProps) {
  const [startRow, setStartRow] = useState(0);
  const [startCol, setStartCol] = useState(0);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: settings, error } = await supabase
        .from("app_settings")
        .select("*")
        .limit(1)
        .single();

      if (error || !settings) throw new Error("Failed to load settings");

      const s = settings as unknown as QrSettings;

      // Load logo if configured
      let logoDataUrl: string | undefined;
      if (s.qr_image_url) {
        try {
          const res = await fetch(s.qr_image_url);
          const blob = await res.blob();
          logoDataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          // proceed without logo
        }
      }

      const pdfOptions = buildPdfOptions(s, startRow, startCol, logoDataUrl);

      const records: MappedRecord[] = codes.map((c, i) => ({
        homesPassedId: c.homes_passed_id,
        address: c.address,
        rowIndex: i,
      }));

      const blob = await generatePdf(records, pdfOptions);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${batchName.replace(/[^a-zA-Z0-9]/g, "_")}_reprint.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("PDF generated successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error("PDF generation failed: " + (err?.message ?? "Unknown error"));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Reprint {codes.length === 1 ? "1 code" : `${codes.length} codes`}
          </DialogTitle>
          <DialogDescription>
            Select the starting position on the first sticker sheet. Subsequent pages start at row 1, column 1.
          </DialogDescription>
        </DialogHeader>

        <LabelStartPicker
          startRow={startRow}
          startCol={startCol}
          onSelect={(r, c) => { setStartRow(r); setStartCol(c); }}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate PDF"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
