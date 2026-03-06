import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Globe, Palette, Printer } from "lucide-react";

interface AppSettings {
  id: string;
  default_destination_url: string;
  primary_color: string;
  secondary_color: string;
  qr_error_correction: string;
  qr_size_inches: number;
  quiet_zone_modules: number;
  logo_url: string | null;
  x_offset_mm: number;
  y_offset_mm: number;
}

export function GlobalSettingsTab() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .limit(1)
      .single();

    if (error && error.code === "PGRST116") {
      // No settings row, create one
      const { data: newData } = await supabase
        .from("app_settings")
        .insert({})
        .select()
        .single();
      setSettings(newData as AppSettings);
    } else {
      setSettings(data as AppSettings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({
        base_url: settings.base_url,
        default_destination_url: settings.default_destination_url,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        qr_error_correction: settings.qr_error_correction,
        qr_size_inches: settings.qr_size_inches,
        quiet_zone_modules: settings.quiet_zone_modules,
        x_offset_mm: settings.x_offset_mm,
        y_offset_mm: settings.y_offset_mm,
      })
      .eq("id", settings.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save settings: " + error.message);
    } else {
      toast.success("Settings saved successfully");
    }
  };

  const updateField = (field: keyof AppSettings, value: string | number) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading settings…</p>;
  if (!settings) return <p className="text-destructive text-sm">Failed to load settings.</p>;

  return (
    <div className="space-y-6">
      {/* URL Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">URL Configuration</CardTitle>
          </div>
          <CardDescription>Base URL and default destination for QR codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="base_url">Base URL (QR Payload Prefix)</Label>
            <Input
              id="base_url"
              value={settings.base_url}
              onChange={(e) => updateField("base_url", e.target.value)}
              placeholder="https://go.sparklight.internal"
            />
            <p className="text-xs text-muted-foreground">
              QR codes will encode: {settings.base_url}/HH/&#123;HomesPassedID&#125;
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest_url">Default Destination URL</Label>
            <Input
              id="dest_url"
              value={settings.default_destination_url}
              onChange={(e) => updateField("default_destination_url", e.target.value)}
              placeholder="https://www.sparklight.com/signup"
            />
          </div>
        </CardContent>
      </Card>

      {/* Brand Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Brand Colors</CardTitle>
          </div>
          <CardDescription>Primary and secondary colors for labels</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="primary_color">Primary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.primary_color}
                onChange={(e) => updateField("primary_color", e.target.value)}
                className="h-10 w-10 rounded border border-input cursor-pointer"
              />
              <Input
                id="primary_color"
                value={settings.primary_color}
                onChange={(e) => updateField("primary_color", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary_color">Secondary Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.secondary_color}
                onChange={(e) => updateField("secondary_color", e.target.value)}
                className="h-10 w-10 rounded border border-input cursor-pointer"
              />
              <Input
                id="secondary_color"
                value={settings.secondary_color}
                onChange={(e) => updateField("secondary_color", e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Rendering settings moved to QR Style tab */}

      {/* Print Calibration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Print Calibration</CardTitle>
          </div>
          <CardDescription>X/Y offsets in millimeters for alignment adjustment</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="x_offset">X Offset (mm)</Label>
            <Input
              id="x_offset"
              type="number"
              step="0.1"
              value={settings.x_offset_mm}
              onChange={(e) => updateField("x_offset_mm", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="y_offset">Y Offset (mm)</Label>
            <Input
              id="y_offset"
              type="number"
              step="0.1"
              value={settings.y_offset_mm}
              onChange={(e) => updateField("y_offset_mm", parseFloat(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
