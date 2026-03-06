import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  details: Record<string, unknown> | null;
  user_id: string;
  created_at: string;
  user_email?: string;
}

export function AuditLogTab() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data: entries } = await supabase
      .from("audit_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!entries || entries.length === 0) {
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name");

    const enriched = (entries as any[]).map((e) => {
      const profile = profiles?.find((p) => p.user_id === e.user_id);
      return { ...e, user_email: profile?.display_name || profile?.username || "Unknown" };
    });

    setLogs(enriched);
    setLoading(false);
  };

  const actionColor = (action: string) => {
    switch (action) {
      case "create": return "default";
      case "delete": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading audit log…</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No audit activity yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant={actionColor(log.action) as any}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize">{log.entity_type}</TableCell>
                  <TableCell className="font-medium text-sm">{log.entity_name || log.entity_id}</TableCell>
                  <TableCell className="text-sm">{log.user_email}</TableCell>
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
