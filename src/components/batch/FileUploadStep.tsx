import { useCallback, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, FileSpreadsheet, AlertCircle, ChevronsUpDown, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isCityInState, getCitiesForState } from "@/data/us-cities";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
  "DC","PR","VI","GU","AS","MP",
];

interface FileUploadStepProps {
  batchName: string;
  onBatchNameChange: (name: string) => void;
  city: string;
  onCityChange: (city: string) => void;
  state: string;
  onStateChange: (state: string) => void;
  market: string;
  onMarketChange: (market: string) => void;
  onFileLoaded: (file: File) => void;
  error: string | null;
}

export function FileUploadStep({
  batchName, onBatchNameChange,
  city, onCityChange,
  state, onStateChange,
  market, onMarketChange,
  onFileLoaded, error,
}: FileUploadStepProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [cityOpen, setCityOpen] = useState(false);

  const cityWarning = useMemo(() => {
    if (!city || !state) return null;
    if (!isCityInState(city, state)) {
      return `"${city}" not found in ${state}. Please double-check the spelling.`;
    }
    return null;
  }, [city, state]);

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
        <Label htmlFor="batch-name">Community Name</Label>
        <Input
          id="batch-name"
          value={batchName}
          onChange={(e) => onBatchNameChange(e.target.value)}
          placeholder="e.g., Shady Pines Retirement Village"
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_1fr] gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between font-normal", !state && "text-muted-foreground")}
              >
                {state || "ST"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[140px] p-0">
              <Command>
                <CommandInput placeholder="Search…" />
                <CommandList>
                  <CommandEmpty>No state found.</CommandEmpty>
                  <CommandGroup>
                    {US_STATES.map((s) => (
                      <CommandItem
                        key={s}
                        value={s}
                        onSelect={(val) => onStateChange(val.toUpperCase())}
                      >
                        <Check className={cn("mr-2 h-4 w-4", state === s ? "opacity-100" : "opacity-0")} />
                        {s}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn("w-full justify-between font-normal", !city && "text-muted-foreground")}
              >
                {city || "Select or type city…"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search cities…"
                  onValueChange={(val) => {
                    onCityChange(val);
                  }}
                />
                <CommandList>
                  <CommandEmpty>
                    {state ? "No matching city found." : "Select a state first."}
                  </CommandEmpty>
                  {state && (
                    <CommandGroup>
                      {getCitiesForState(state, city).slice(0, 50).map((c) => (
                        <CommandItem
                          key={c}
                          value={c}
                          onSelect={(val) => {
                            onCityChange(val);
                            setCityOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", city?.toLowerCase() === c.toLowerCase() ? "opacity-100" : "opacity-0")} />
                          {c}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {cityWarning && (
            <div className="flex items-center gap-1.5 text-amber-600 text-xs mt-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {cityWarning}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="market">Market <span className="text-destructive">*</span></Label>
          <Input
            id="market"
            value={market}
            onChange={(e) => onMarketChange(e.target.value)}
            placeholder="e.g., Southwest"
          />
        </div>
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

      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        onClick={(e) => {
          e.stopPropagation();
          const csv = "HomesPassedID,Address\n1001,123 Main St\n1002,456 Oak Ave\n1003,789 Pine Rd\n";
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "qr_import_template.csv";
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Download CSV template
      </button>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
