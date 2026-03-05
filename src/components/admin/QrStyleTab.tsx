import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, QrCode, Image, Paintbrush, Upload, X, Frame, KeyRound } from "lucide-react";
import QRCodeStyling from "qr-code-styling";
import QRBorderPlugin from "qr-border-plugin";

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
  qr_border_enabled: boolean;
  qr_border_round: number;
  qr_border_thickness: number;
  qr_border_color: string;
  qr_border_dasharray: string | null;
  qr_border_inner_thickness: number;
  qr_border_inner_color: string;
  qr_border_outer_thickness: number;
  qr_border_outer_color: string;
  qr_border_top_text: string | null;
  qr_border_top_style: string;
  qr_border_bottom_text: string | null;
  qr_border_bottom_style: string;
  qr_border_license_key: string | null;
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
      .select("id, qr_error_correction, qr_size_inches, quiet_zone_modules, qr_dot_type, qr_dot_color, qr_corner_square_type, qr_corner_square_color, qr_corner_dot_type, qr_corner_dot_color, qr_background_color, qr_image_url, qr_image_size, qr_image_margin, qr_border_enabled, qr_border_round, qr_border_thickness, qr_border_color, qr_border_dasharray, qr_border_inner_thickness, qr_border_inner_color, qr_border_outer_thickness, qr_border_outer_color, qr_border_top_text, qr_border_top_style, qr_border_bottom_text, qr_border_bottom_style, qr_border_license_key")
      .limit(1)
      .single();

    if (!error && data) {
      setSettings(data as unknown as QrStyleSettings);
    }
    setLoading(false);
  };

  // Live preview — must recreate instance when border is used since applyExtension mutates
  useEffect(() => {
    if (!settings || !previewRef.current) return;

    const options: any = {
      width: 360,
      height: 360,
      type: "svg",
      data: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
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
      margin: settings.qr_border_enabled ? 40 : settings.quiet_zone_modules,
    };

    if (settings.qr_image_url) {
      options.image = settings.qr_image_url;
      options.imageOptions = {
        crossOrigin: "anonymous",
        margin: settings.qr_image_margin,
        imageSize: settings.qr_image_size,
      };
    }

    // Always recreate when border settings could change
    previewRef.current.innerHTML = "";
    const qr = new QRCodeStyling(options);

    if (settings.qr_border_enabled) {
      if (settings.qr_border_license_key) {
        QRBorderPlugin.setKey(settings.qr_border_license_key);
      }

      const extOpts: any = {
        round: settings.qr_border_round,
        thickness: settings.qr_border_thickness,
        color: settings.qr_border_color,
        borderInner: {
          color: settings.qr_border_inner_color,
          thickness: settings.qr_border_inner_thickness,
        },
        borderOuter: {
          color: settings.qr_border_outer_color,
          thickness: settings.qr_border_outer_thickness,
        },
        decorations: {},
      };

      if (settings.qr_border_dasharray) {
        extOpts.dasharray = settings.qr_border_dasharray;
      }

      if (settings.qr_border_top_text) {
        extOpts.decorations.top = {
          type: "text",
          value: settings.qr_border_top_text,
          style: settings.qr_border_top_style,
        };
      }
      if (settings.qr_border_bottom_text) {
        extOpts.decorations.bottom = {
          type: "text",
          value: settings.qr_border_bottom_text,
          style: settings.qr_border_bottom_style,
        };
      }

      qr.applyExtension(QRBorderPlugin(extOpts));
    }

    qr.append(previewRef.current);
    qrInstanceRef.current = qr;
  }, [settings]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { id, ...rest } = settings;
    const { error } = await supabase
      .from("app_settings")
      .update(rest as any)
      .eq("id", id);

    setSaving(false);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("QR style settings saved");
    }
  };

  const update = (field: keyof QrStyleSettings, value: string | number | boolean | null) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('qr-logos').upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('qr-logos').getPublicUrl(path);
    update("qr_image_url", urlData.publicUrl);
    setUploading(false);
    toast.success("Logo uploaded");
    if (fileInputRef.current) fileInputRef.current.value = '';
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
              <Label>Embedded Logo</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {settings.qr_image_url ? (
                  <div className="flex items-center gap-2 flex-1">
                    <img src={settings.qr_image_url} alt="QR logo" className="h-10 w-10 rounded border border-input object-contain bg-background" />
                    <span className="text-sm text-muted-foreground truncate flex-1">{settings.qr_image_url.split('/').pop()}</span>
                    <Button variant="ghost" size="icon" onClick={() => update("qr_image_url", null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {uploading ? "Uploading…" : "Upload Logo"}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Optional logo displayed in the center of the QR code</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Image Size ({Math.round(settings.qr_image_size * 100)}%)</Label>
                <Slider value={[settings.qr_image_size]} onValueChange={([v]) => update("qr_image_size", v)} min={0.1} max={0.8} step={0.05} />
              </div>
              <div className="space-y-2">
                <Label>Image Margin (px)</Label>
                <Input type="number" min="0" max="20" value={settings.qr_image_margin} onChange={(e) => update("qr_image_margin", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Border & Decorations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Frame className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Border & Decorations</CardTitle>
            </div>
            <CardDescription>Add customizable borders and text decorations around the QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Border</Label>
              <Switch checked={settings.qr_border_enabled} onCheckedChange={(v) => update("qr_border_enabled", v)} />
            </div>

            {settings.qr_border_enabled && (
              <>
                {/* Main border */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Border Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.qr_border_color} onChange={(e) => update("qr_border_color", e.target.value)} className="h-10 w-10 rounded border border-input cursor-pointer" />
                      <Input value={settings.qr_border_color} onChange={(e) => update("qr_border_color", e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Thickness ({settings.qr_border_thickness}px)</Label>
                    <Slider value={[settings.qr_border_thickness]} onValueChange={([v]) => update("qr_border_thickness", v)} min={10} max={100} step={5} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Roundness ({Math.round(settings.qr_border_round * 100)}%)</Label>
                    <Slider value={[settings.qr_border_round]} onValueChange={([v]) => update("qr_border_round", v)} min={0} max={1} step={0.05} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dash Array</Label>
                    <Input value={settings.qr_border_dasharray || ""} placeholder="e.g. 4 1" onChange={(e) => update("qr_border_dasharray", e.target.value || null)} />
                  </div>
                </div>

                {/* Inner / Outer border */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Inner Border Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.qr_border_inner_color} onChange={(e) => update("qr_border_inner_color", e.target.value)} className="h-10 w-10 rounded border border-input cursor-pointer" />
                      <Input value={settings.qr_border_inner_color} onChange={(e) => update("qr_border_inner_color", e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Inner Thickness ({settings.qr_border_inner_thickness}px)</Label>
                    <Slider value={[settings.qr_border_inner_thickness]} onValueChange={([v]) => update("qr_border_inner_thickness", v)} min={0} max={20} step={1} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Outer Border Color</Label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={settings.qr_border_outer_color} onChange={(e) => update("qr_border_outer_color", e.target.value)} className="h-10 w-10 rounded border border-input cursor-pointer" />
                      <Input value={settings.qr_border_outer_color} onChange={(e) => update("qr_border_outer_color", e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Outer Thickness ({settings.qr_border_outer_thickness}px)</Label>
                    <Slider value={[settings.qr_border_outer_thickness]} onValueChange={([v]) => update("qr_border_outer_thickness", v)} min={0} max={20} step={1} />
                  </div>
                </div>

                {/* Text decorations */}
                <div className="space-y-2">
                  <Label>Top Text</Label>
                  <Input value={settings.qr_border_top_text || ""} placeholder="e.g. SCAN ME" onChange={(e) => update("qr_border_top_text", e.target.value || null)} />
                </div>
                <div className="space-y-2">
                  <Label>Top Text Style (CSS)</Label>
                  <Input value={settings.qr_border_top_style} onChange={(e) => update("qr_border_top_style", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Bottom Text</Label>
                  <Input value={settings.qr_border_bottom_text || ""} placeholder="e.g. GET STARTED" onChange={(e) => update("qr_border_bottom_text", e.target.value || null)} />
                </div>
                <div className="space-y-2">
                  <Label>Bottom Text Style (CSS)</Label>
                  <Input value={settings.qr_border_bottom_style} onChange={(e) => update("qr_border_bottom_style", e.target.value)} />
                </div>

                {/* License key */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <Label>License Key</Label>
                  </div>
                  <Input type="password" value={settings.qr_border_license_key || ""} placeholder="Enter license key to remove watermark" onChange={(e) => update("qr_border_license_key", e.target.value || null)} />
                  <p className="text-xs text-muted-foreground">
                    A license key from <a href="https://www.lefe.dev/marketplace/qr-border-plugin" target="_blank" rel="noopener noreferrer" className="underline text-primary">lefe.dev</a> is required for production use without watermark.
                  </p>
                </div>
              </>
            )}
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
            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
              <div ref={previewRef} className="w-full max-w-[360px] rounded-lg overflow-hidden border border-border [&>svg]:w-full [&>svg]:h-auto cursor-pointer [&_text[font-size='6']]:hidden [&_text[font-size='5']]:hidden" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
