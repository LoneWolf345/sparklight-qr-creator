import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Extract HomesPassedID from the path: /qr-redirect/HH/{id} or just pass as query param
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Edge function path: /qr-redirect/{HomesPassedID}
    const homesPassedId = pathParts[pathParts.length - 1] || url.searchParams.get("id");

    if (!homesPassedId || homesPassedId === "qr-redirect") {
      return new Response("Missing HomesPassedID", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up the QR code
    const { data: qrCode } = await supabase
      .from("qr_codes")
      .select("id, batch_id, status, homes_passed_id")
      .eq("homes_passed_id", homesPassedId)
      .eq("status", "active")
      .limit(1)
      .single();

    if (!qrCode) {
      return new Response(
        `<html><body><h1>QR Code Not Found</h1><p>This QR code is invalid or has been revoked.</p></body></html>`,
        { status: 404, headers: { ...corsHeaders, "Content-Type": "text/html" } }
      );
    }

    // Log the scan
    const userAgent = req.headers.get("user-agent") ?? "";
    const referer = req.headers.get("referer") ?? "";
    const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "";

    await supabase.from("qr_scans").insert({
      homes_passed_id: homesPassedId,
      user_agent: userAgent,
      ip_address: forwarded,
      referer: referer,
    });

    // Get destination URL
    // First check batch-level override, then fall back to global default
    const { data: batch } = await supabase
      .from("qr_batches")
      .select("destination_url_override")
      .eq("id", qrCode.batch_id)
      .single();

    let destinationUrl = batch?.destination_url_override;

    if (!destinationUrl) {
      const { data: settings } = await supabase
        .from("app_settings")
        .select("default_destination_url")
        .limit(1)
        .single();
      destinationUrl = settings?.default_destination_url;
    }

    if (!destinationUrl) {
      destinationUrl = "https://www.sparklight.com";
    }

    // Append HomesPassedID as query param to destination
    const destUrl = new URL(destinationUrl);
    destUrl.searchParams.set("hpid", homesPassedId);

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        Location: destUrl.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    return new Response(`Internal error: ${err.message}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
