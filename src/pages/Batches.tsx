import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { format } from "date-fns";

export default function Batches() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("qr_batches")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setBatches(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Communities</h1>
        <Button asChild>
          <Link to="/batches/new">
            <Plus className="mr-2 h-4 w-4" /> New Community
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Communities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : batches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No batches yet. Create your first batch to get started.</p>
              <Button asChild variant="outline">
                <Link to="/batches/new">Create Batch</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <Link to={`/batches/${b.id}`} className="text-primary hover:underline font-medium">
                        {b.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.status === "completed" ? "default" : "secondary"}>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{b.row_count}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(b.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
