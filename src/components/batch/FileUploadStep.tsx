import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";

interface FileUploadStepProps {
  batchName: string;
  onBatchNameChange: (name: string) => void;
  onFileLoaded: (file: File) => void;
  error: string | null;
}

export function FileUploadStep({ batchName, onBatchNameChange, onFileLoaded, error }: FileUploadStepProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["csv", "xlsx", "xls", "txt"].includes(ext ?? "")) {
        return;
      }
      setFileName(file.name);
      onFileLoaded(file);
    },
    [onFileLoaded]
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="batch-name">Batch Name</Label>
        <Input
          id="batch-name"
          value={batchName}
          onChange={(e) => onBatchNameChange(e.target.value)}
          placeholder="e.g., March 2026 Campaign – Phoenix"
          className="max-w-md"
        />
      </div>

      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragOver ? "border-primary bg-accent/30" : "border-border hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) handleFile(f);
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".csv,.xlsx,.xls";
          input.onchange = () => {
            const f = input.files?.[0];
            if (f) handleFile(f);
          };
          input.click();
        }}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          {fileName ? (
            <>
              <FileSpreadsheet className="h-12 w-12 text-primary mb-3" />
              <p className="text-sm font-medium text-foreground">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">Click or drop to replace</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">
                Drop your CSV or XLSX file here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                or click to browse
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
