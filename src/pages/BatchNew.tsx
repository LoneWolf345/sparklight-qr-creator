import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BatchNew() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Create New Batch</h1>
      <Card>
        <CardHeader>
          <CardTitle>Batch Creation Wizard</CardTitle>
          <CardDescription>Upload a CSV/XLSX file, map columns, and generate QR codes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming in Phase 3 — batch creation workflow will be built here.</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
