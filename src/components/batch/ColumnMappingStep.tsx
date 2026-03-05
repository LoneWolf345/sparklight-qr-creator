import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ColumnMapping, ParsedRow } from "@/lib/batch-types";

interface ColumnMappingStepProps {
  headers: string[];
  sampleData: ParsedRow[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  startRow: number;
  startCol: number;
  onStartRowChange: (v: number) => void;
  onStartColChange: (v: number) => void;
  destinationOverride: string;
  onDestinationOverrideChange: (v: string) => void;
}

export function ColumnMappingStep({
  headers,
  sampleData,
  mapping,
  onMappingChange,
  startRow,
  startCol,
  onStartRowChange,
  onStartColChange,
  destinationOverride,
  onDestinationOverrideChange,
}: ColumnMappingStepProps) {
  const preview = sampleData.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Column Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Column Mapping</CardTitle>
          <CardDescription>Map your file columns to the required fields</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>HomesPassedID Column</Label>
            <Select
              value={mapping.homesPassedId}
              onValueChange={(v) => onMappingChange({ ...mapping, homesPassedId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Address Column</Label>
            <Select
              value={mapping.address}
              onValueChange={(v) => onMappingChange({ ...mapping, address: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Label Start Position */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Print Options</CardTitle>
          <CardDescription>
            Start position for partially used label sheets (Avery 94107: 3 cols × 4 rows)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Start Row (1–4)</Label>
            <Input
              type="number"
              min={1}
              max={4}
              value={startRow + 1}
              onChange={(e) => onStartRowChange(Math.max(0, Math.min(3, parseInt(e.target.value) - 1 || 0)))}
            />
          </div>
          <div className="space-y-2">
            <Label>Start Column (1–3)</Label>
            <Input
              type="number"
              min={1}
              max={3}
              value={startCol + 1}
              onChange={(e) => onStartColChange(Math.max(0, Math.min(2, parseInt(e.target.value) - 1 || 0)))}
            />
          </div>
          <div className="space-y-2">
            <Label>Destination URL Override</Label>
            <Input
              value={destinationOverride}
              onChange={(e) => onDestinationOverrideChange(e.target.value)}
              placeholder="Leave blank to use global default"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Preview</CardTitle>
          <CardDescription>First 5 rows of your file (mapped columns highlighted)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  {headers.map((h) => (
                    <TableHead
                      key={h}
                      className={
                        h === mapping.homesPassedId || h === mapping.address
                          ? "bg-accent text-accent-foreground font-semibold"
                          : ""
                      }
                    >
                      {h}
                      {h === mapping.homesPassedId && " ✦ ID"}
                      {h === mapping.address && " ✦ Addr"}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    {headers.map((h) => (
                      <TableCell
                        key={h}
                        className={
                          h === mapping.homesPassedId || h === mapping.address
                            ? "bg-accent/30 font-medium"
                            : ""
                        }
                      >
                        {row[h] ?? ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
