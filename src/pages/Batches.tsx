import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logAudit } from "@/lib/audit";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, LogIn, Building2, MapPin, Map, Flag } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Batches() {
  const { user, role } = useAuth();
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

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from("qr_batches").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete community: " + error.message);
    } else {
      setBatches((prev) => prev.filter((b) => b.id !== id));
      toast.success(`"${name}" deleted`);
      if (user) {
        logAudit({ action: "delete", entityType: "community", entityId: id, entityName: name, userId: user.id });
      }
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Communities</h1>
        {role && (
          <Button asChild>
            <Link to="/batches/new">
              <Plus className="mr-2 h-4 w-4" /> New Community
            </Link>
          </Button>
        )}
      </div>

      {!loading && batches.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Communities */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Communities</p>
                <p className="text-2xl font-bold text-foreground">{batches.length}</p>
              </div>
            </CardContent>
          </Card>
          {/* Total Addresses */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-md bg-primary/10 p-2">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Addresses</p>
                <p className="text-2xl font-bold text-foreground">{batches.reduce((sum, b) => sum + (b.row_count || 0), 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          {/* Markets Breakdown */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <Map className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Markets</p>
              </div>
              <div className="space-y-1">
                {Object.entries(
                  batches.reduce<Record<string, number>>((acc, b) => {
                    const m = b.market || "Unknown";
                    acc[m] = (acc[m] || 0) + (b.row_count || 0);
                    return acc;
                  }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .map(([market, count]) => (
                    <div key={market} className="flex justify-between text-sm">
                      <span className="text-foreground truncate">{market}</span>
                      <span className="text-muted-foreground font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          {/* Top States */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="rounded-md bg-primary/10 p-1.5">
                  <Flag className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Top States</p>
              </div>
              <div className="space-y-1">
                {Object.entries(
                  batches.reduce<Record<string, number>>((acc, b) => {
                    const s = b.state || "Unknown";
                    acc[s] = (acc[s] || 0) + (b.row_count || 0);
                    return acc;
                  }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([state, count]) => (
                    <div key={state} className="flex justify-between text-sm">
                      <span className="text-foreground truncate">{state}</span>
                      <span className="text-muted-foreground font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!user && (
        <Alert className="mb-6">
          <LogIn className="h-4 w-4" />
          <AlertDescription>
            To create new communities or manage QR batches,{" "}
            <Link to="/login" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
              sign in
            </Link>{" "}
            with your team account.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Communities</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading…</p>
          ) : batches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {role
                  ? "No communities yet. Create your first community to get started."
                  : "No communities yet. Sign in with your team account to create one."}
              </p>
              {role ? (
                <Button asChild variant="outline">
                  <Link to="/batches/new">Create Community</Link>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link to="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Sign In
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                 <TableRow>
                   <TableHead>Name</TableHead>
                   <TableHead>City</TableHead>
                   <TableHead>State</TableHead>
                   <TableHead>Market</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Rows</TableHead>
                   <TableHead>Created</TableHead>
                   {role === "admin" && <TableHead className="text-right">Actions</TableHead>}
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
                     <TableCell className="text-sm">{b.city || "—"}</TableCell>
                     <TableCell className="text-sm">{b.state || "—"}</TableCell>
                     <TableCell className="text-sm">{b.market || "—"}</TableCell>
                     <TableCell>
                       <Badge variant={b.status === "completed" ? "default" : "secondary"}>
                         {b.status}
                       </Badge>
                     </TableCell>
                     <TableCell>{b.row_count}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(b.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    {role === "admin" && (
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete "{b.name}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the community and all its QR codes. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(b.id, b.name)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
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
