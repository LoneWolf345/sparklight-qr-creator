import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Activity } from "lucide-react";
import { format } from "date-fns";

interface ScanRecord {
  id: string;
  homes_passed_id: string;
  scanned_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

export function ScanLogTab() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("qr_scans")
      .select("*")
      .order("scanned_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setScans((data as ScanRecord[]) ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = scans.filter((s) =>
    s.homes_passed_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">QR Scan Log</CardTitle>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by HomesPassedID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <CardDescription>
          Recent QR code scans (last 500). Scans are logged when someone visits a QR code URL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading scan log…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {search ? "No matching scans." : "No scans recorded yet."}
          </p>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HomesPassedID</TableHead>
                  <TableHead>Scanned At</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.homes_passed_id}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(s.scanned_at), "MMM d, yyyy h:mm:ss a")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {s.user_agent ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm font-mono">{s.ip_address ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
