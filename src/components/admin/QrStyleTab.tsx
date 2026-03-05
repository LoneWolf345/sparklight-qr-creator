import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Save, QrCode, Image, Paintbrush, Upload, X } from "lucide-react";
import QRCodeStyling from "qr-code-styling";

const DOT_TYPES = [
  { value: "square", label: "Square" },
  { value: "dots", label: "Dots" },
  { value: "rounded", label: "Rounded" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy Rounded" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_SQUARE_TYPES = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "extra-rounded", label: "Extra Rounded" },
];

const CORNER_DOT_TYPES = [
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
];

const ERROR_CORRECTION_LEVELS = [
  { value: "L", label: "L – Low (7%)" },
  { value: "M", label: "M – Medium (15%)" },
  { value: "Q", label: "Q – Quartile (25%)" },
  { value: "H", label: "H – High (30%)" },
];

interface QrStyleSettings {
  id: string;
  qr_error_correction: string;
  qr_size_inches: number;
  quiet_zone_modules: number;
  qr_dot_type: string;
  qr_dot_color: string;
  qr_corner_square_type: string;
  qr_corner_square_color: string;
  qr_corner_dot_type: string;
  qr_corner_dot_color: string;
  qr_background_color: string;
  qr_image_url: string | null;
  qr_image_size: number;
  qr_image_margin: number;
}

export function QrStyleTab() {
  const [settings, setSettings] = useState<QrStyleSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("id, qr_error_correction, qr_size_inches, quiet_zone_modules, qr_dot_type, qr_dot_color, qr_corner_square_type, qr_corner_square_color, qr_corner_dot_type, qr_corner_dot_color, qr_background_color, qr_image_url, qr_image_size, qr_image_margin")
      .limit(1)
      .single();

    if (!error && data) {
      setSettings(data as QrStyleSettings);
    }
    setLoading(false);
  };

  // Live preview
  useEffect(() => {
    if (!settings || !previewRef.current) return;

    const options: any = {
      width: 220,
      height: 220,
      data: "https://example.com/HH/SAMPLE123",
      dotsOptions: {
        type: settings.qr_dot_type,
        color: settings.qr_dot_color,
      },
      cornersSquareOptions: {
        type: settings.qr_corner_square_type,
        color: settings.qr_corner_square_color,
      },
      cornersDotOptions: {
        type: settings.qr_corner_dot_type,
        color: settings.qr_corner_dot_color,
      },
      backgroundOptions: {
        color: settings.qr_background_color,
      },
      qrOptions: {
        errorCorrectionLevel: settings.qr_error_correction,
      },
      margin: settings.quiet_zone_modules,
    };

    if (settings.qr_image_url) {
      options.image = settings.qr_image_url;
      options.imageOptions = {
        crossOrigin: "anonymous",
        margin: settings.qr_image_margin,
        imageSize: settings.qr_image_size,
      };
    }

    if (qrInstanceRef.current) {
      qrInstanceRef.current.update(options);
    } else {
      qrInstanceRef.current = new QRCodeStyling(options);
      previewRef.current.innerHTML = "";
      qrInstanceRef.current.append(previewRef.current);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { id, ...rest } = settings;
    const { error } = await supabase
      .from("app_settings")
      .update(rest)
      .eq("id", id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("QR style settings saved");
    }
  };

  const update = (field: keyof QrStyleSettings, value: string | number | null) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  if (loading) return <p className="text-muted-foreground text-sm">Loading…</p>;
  if (!settings) return <p className="text-destructive text-sm">Failed to load settings.</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        {/* QR Rendering Basics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">QR Rendering</CardTitle>
            </div>
            <CardDescription>Error correction, size, and quiet zone</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Error Correction</Label>
              <Select value={settings.qr_error_correction} onValueChange={(v) => update("qr_error_correction", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ERROR_CORRECTION_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>QR Size (inches)</Label>
              <Input type="number" step="0.05" min="0.5" max="2" value={settings.qr_size_inches} onChange={(e) => update("qr_size_inches", parseFloat(e.target.value) || 1.35)} />
            </div>
            <div className="space-y-2">
              <Label>Quiet Zone (modules)</Label>
              <Input type="number" min="0" max="10" value={settings.quiet_zone_modules} onChange={(e) => update("quiet_zone_modules", parseInt(e.target.value) || 4)} />
            </div>
          </CardContent>
        </Card>

        {/* Dot Style */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Dot Style</CardTitle>
            </div>
            <CardDescription>Shape and color of the QR code dots</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dot Type</Label>
              <Select value={settings.qr_dot_type} onValueChange={(v) => update("qr_dot_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dot Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.qr_dot_color} onChange={(e) => update("qr_dot_color", e.target.value)} className="h-10 w-10 rounded border border-input cursor-pointer" />
                <Input value={settings.qr_dot_color} onChange={(e) => update("qr_dot_color", e.target.value)} className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corner Styles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Corner Styles</CardTitle>
            </div>
            <CardDescription>Shape and color of corner squares and dots</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Corner Square Type</Label>
              <Select value={settings.qr_corner_square_type} onValueChange={(v) => update("qr_corner_square_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CORNER_SQUARE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Corner Square Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.qr_corner_square_color} onChange={(e) => update("qr_corner_square_color", e.target.value)} className="h-10 w-10 rounded border border-input cursor-pointer" />
                <Input value={settings.qr_corner_square_color} onChange={(e) => update("qr_corner_square_color", e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Corner Dot Type</Label>
              <Select value={settings.qr_corner_dot_type} onValueChange={(v) => update("qr_corner_dot_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CORNER_DOT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Corner Dot Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.qr_corner_dot_color} onChange={(e) => update("qr_corner_dot_color", e.target.value)} className="h-10 w-10 rounded border border-input cursor-pointer" />
                <Input value={settings.qr_corner_dot_color} onChange={(e) => update("qr_corner_dot_color", e.target.value)} className="flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Background & Image */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Background & Embedded Image</CardTitle>
            </div>
            <CardDescription>Background color and optional center logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={settings.qr_background_color} onChange={(e) => update("qr_background_color", e.target.value)} className="h-10 w-10 rounded border border-input cursor-pointer" />
                <Input value={settings.qr_background_color} onChange={(e) => update("qr_background_color", e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Embedded Image URL</Label>
              <Input value={settings.qr_image_url || ""} onChange={(e) => update("qr_image_url", e.target.value || null)} placeholder="https://example.com/logo.png" />
              <p className="text-xs text-muted-foreground">Optional logo displayed in the center of the QR code</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Image Size ({Math.round(settings.qr_image_size * 100)}%)</Label>
                <Slider value={[settings.qr_image_size]} onValueChange={([v]) => update("qr_image_size", v)} min={0.1} max={0.5} step={0.05} />
              </div>
              <div className="space-y-2">
                <Label>Image Margin (px)</Label>
                <Input type="number" min="0" max="20" value={settings.qr_image_margin} onChange={(e) => update("qr_image_margin", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save QR Style"}
          </Button>
        </div>
      </div>

      {/* Live Preview Sidebar */}
      <div className="lg:sticky lg:top-6 self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live Preview</CardTitle>
            <CardDescription>Sample QR code with current settings</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div ref={previewRef} className="rounded-lg overflow-hidden border border-border" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
