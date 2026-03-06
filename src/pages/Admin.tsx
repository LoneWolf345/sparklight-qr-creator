import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalSettingsTab } from "@/components/admin/GlobalSettingsTab";
import { QrStyleTab } from "@/components/admin/QrStyleTab";
import { UserManagementTab } from "@/components/admin/UserManagementTab";
import { AuditLogTab } from "@/components/admin/AuditLogTab";
import { Settings, Users, FileText, QrCode } from "lucide-react";

export default function Admin() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Admin Settings</h1>
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" /> Global Settings
          </TabsTrigger>
          <TabsTrigger value="qr-style" className="gap-2">
            <QrCode className="h-4 w-4" /> QR Style
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" /> User Management
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="h-4 w-4" /> Audit Log
          </TabsTrigger>
        </TabsList>
        <TabsContent value="settings">
          <GlobalSettingsTab />
        </TabsContent>
        <TabsContent value="qr-style">
          <QrStyleTab />
        </TabsContent>
        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>
        <TabsContent value="audit">
          <AuditLogTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
