import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface BatchLog {
  id: string;
  name: string;
  status: string;
  row_count: number;
  created_at: string;
  created_by: string;
  creator_email?: string;
}

export function AuditLogTab() {
  const [logs, setLogs] = useState<BatchLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    // Get batches
    const { data: batches } = await supabase
      .from("qr_batches")
      .select("*")
      .order("created_at", { ascending: false });

    if (!batches || batches.length === 0) {
      setLogs([]);
      setLoading(false);
      return;
    }

    // Get profiles to map user IDs to emails
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name");

    const enriched = batches.map((b) => {
      const profile = profiles?.find((p) => p.user_id === b.created_by);
      return {
        ...b,
        creator_email: profile?.username ?? "Unknown",
      };
    });

    setLogs(enriched);
    setLoading(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading audit log…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No batch activity yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Row Count</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.name}</TableCell>
                  <TableCell className="text-sm">{log.creator_email}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === "completed" ? "default" : "secondary"}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.row_count}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
