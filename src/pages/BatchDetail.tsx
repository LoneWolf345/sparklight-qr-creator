import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Download, Search, Trash2, Printer } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { ReprintDialog } from "@/components/batch/ReprintDialog";

interface QrCode {
  id: string;
  homes_passed_id: string;
  address: string;
  status: string;
  created_at: string;
}

interface Batch {
  id: string;
  name: string;
  status: string;
  row_count: number;
  template: string;
  created_at: string;
  created_by: string;
  destination_url_override: string | null;
  city: string | null;
  state: string | null;
  market: string | null;
}

export default function BatchDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { role } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [codes, setCodes] = useState<QrCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [settings, setSettings] = useState({ default_destination_url: "" });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reprint dialog state
  const [reprintOpen, setReprintOpen] = useState(false);
  const [reprintCodes, setReprintCodes] = useState<QrCode[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("qr_batches").select("*").eq("id", id).single(),
      supabase.from("qr_codes").select("*").eq("batch_id", id).order("created_at"),
      supabase.from("app_settings").select("default_destination_url").limit(1).single(),
    ]).then(([batchRes, codesRes, settingsRes]) => {
      setBatch(batchRes.data as Batch);
      setCodes((codesRes.data as QrCode[]) ?? []);
      if (settingsRes.data) setSettings({ default_destination_url: settingsRes.data.default_destination_url });
      setLoading(false);
    });
  }, [id]);

  const activeCodes = codes.filter((c) => c.status === "active");

  const filteredCodes = codes.filter(
    (c) =>
      c.homes_passed_id.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  const allFilteredSelected = filteredCodes.length > 0 && filteredCodes.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedIds);
      filteredCodes.forEach((c) => next.delete(c.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredCodes.forEach((c) => next.add(c.id));
      setSelectedIds(next);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleReprintAll = () => {
    setReprintCodes(activeCodes);
    setReprintOpen(true);
  };

  const handleReprintSelected = () => {
    const selected = codes.filter((c) => selectedIds.has(c.id));
    setReprintCodes(selected);
    setReprintOpen(true);
  };

  const handleDownloadCsv = () => {
    if (!batch) return;
    const destUrl = batch.destination_url_override || settings.default_destination_url || "https://www.sparklight.com";
    const rows = [
      ["HomesPassedID", "Address", "QR_URL", "Status"],
      ...codes.map((c) => {
        const u = new URL(destUrl);
        u.searchParams.set("hpid", c.homes_passed_id);
        return [c.homes_passed_id, c.address, u.toString(), c.status];
      }),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${batch.name.replace(/[^a-zA-Z0-9]/g, "_")}_codes.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRevokeCode = async (codeId: string) => {
    const { error } = await supabase
      .from("qr_codes")
      .update({ status: "revoked" })
      .eq("id", codeId);
    if (!error) {
      setCodes(codes.map((c) => (c.id === codeId ? { ...c, status: "revoked" } : c)));
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!batch) {
    return (
      <AppLayout>
        <p className="text-destructive">Batch not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/batches"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{batch.name}</h1>
          <p className="text-sm text-muted-foreground">
            {[batch.city, batch.state, batch.market].filter(Boolean).join(" · ") || ""}{" "}
            Created {format(new Date(batch.created_at), "MMM d, yyyy h:mm a")} · {batch.row_count} codes
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant={batch.status === "completed" ? "default" : "secondary"} className="mt-1">
              {batch.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Template</p>
            <p className="font-medium text-foreground mt-1">Avery 94107</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Codes</p>
            <p className="font-medium text-foreground mt-1">{codes.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="font-medium text-foreground mt-1">
              {activeCodes.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Button variant="outline" onClick={handleDownloadCsv}>
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
        <Button onClick={handleReprintAll} disabled={activeCodes.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Reprint All
        </Button>
        <Button
          variant="secondary"
          onClick={handleReprintSelected}
          disabled={selectedIds.size === 0}
        >
          <Printer className="mr-2 h-4 w-4" /> Reprint Selected ({selectedIds.size})
        </Button>
        {role === "admin" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Community
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{batch.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the community and all its QR codes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    const { error } = await supabase.from("qr_batches").delete().eq("id", batch.id);
                    if (error) {
                      toast.error("Failed to delete: " + error.message);
                    } else {
                      toast.success(`"${batch.name}" deleted`);
                      navigate("/batches");
                    }
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Codes Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">QR Codes</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>HomesPassedID</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>QR URL</TableHead>
                  <TableHead>Status</TableHead>
                  {role === "admin" && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(code.id)}
                        onCheckedChange={() => toggleSelect(code.id)}
                        aria-label={`Select ${code.address}`}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{code.homes_passed_id}</TableCell>
                    <TableCell className="text-sm">{code.address}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {(() => { const u = new URL(batch.destination_url_override || settings.default_destination_url || "https://www.sparklight.com"); u.searchParams.set("hpid", code.homes_passed_id); return u.toString(); })()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={code.status === "active" ? "default" : "destructive"}
                      >
                        {code.status}
                      </Badge>
                    </TableCell>
                    {role === "admin" && (
                      <TableCell className="text-right">
                        {code.status === "active" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleRevokeCode(code.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {filteredCodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={role === "admin" ? 6 : 5} className="text-center text-muted-foreground py-8">
                      {search ? "No matching codes found." : "No codes in this batch."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReprintDialog
        open={reprintOpen}
        onOpenChange={setReprintOpen}
        codes={reprintCodes}
        batchName={batch.name}
      />
    </AppLayout>
  );
}
