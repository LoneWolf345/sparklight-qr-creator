import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Users, FileText } from "lucide-react";

export default function Admin() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Settings</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <Settings className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Global Settings</CardTitle>
            <CardDescription>Base URL, destination URL, QR rendering, print calibration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming in Phase 2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">User Management</CardTitle>
            <CardDescription>Create/disable users, assign roles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming in Phase 2</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">Audit Log</CardTitle>
            <CardDescription>View batch creation history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming in Phase 4</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
