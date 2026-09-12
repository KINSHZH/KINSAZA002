import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { service_request_id } = await req.json();
    if (!service_request_id) {
      return new Response(
        JSON.stringify({ error: "service_request_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: request, error: reqError } = await supabase
      .from("service_requests")
      .select("*")
      .eq("id", service_request_id)
      .maybeSingle();

    if (reqError || !request) {
      return new Response(
        JSON.stringify({ error: "Service request not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: images } = await supabase
      .from("service_request_images")
      .select("image_path")
      .eq("service_request_id", service_request_id);

    const photoLinks: string[] = [];
    for (const img of (images || []) as { image_path: string }[]) {
      const { data, error: signedErr } = await supabase.storage
        .from("service-request-images")
        .createSignedUrl(img.image_path, 3600);
      if (!signedErr && data?.signedUrl) {
        photoLinks.push(data.signedUrl);
      }
    }

    const photoHtml =
      photoLinks.length > 0
        ? `<h3 style="margin-top:24px;color:#333;">Attached Photos (${photoLinks.length})</h3>
         <div>${photoLinks
           .map(
             (url: string, i: number) =>
               `<div style="margin-bottom:12px;">
              <a href="${url}" target="_blank">Photo ${i + 1}</a><br/>
              <img src="${url}" alt="Photo ${i + 1}" style="max-width:400px;max-height:300px;border:1px solid #ddd;margin-top:4px;" />
            </div>`
           )
           .join("")}</div>`
        : `<p style="color:#888;">No photos attached.</p>`;

    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#1a1a1a;color:#fff;padding:16px 24px;">
          <h1 style="margin:0;font-size:20px;">New Service Request</h1>
        </div>
        <div style="padding:24px;background:#f9f9f9;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #ddd;width:140px;">Name</td>
              <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${request.name}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #ddd;">Phone</td>
              <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${request.phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #ddd;">Email</td>
              <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${request.email || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #ddd;">Service</td>
              <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${request.service_needed}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #ddd;">Preferred Contact</td>
              <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${request.preferred_contact}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #ddd;">Preferred Date</td>
              <td style="padding:8px 12px;border-bottom:1px solid #ddd;">${request.preferred_date || "No preference"}</td>
            </tr>
          </table>

          <h3 style="margin-top:24px;color:#333;">Description</h3>
          <div style="background:#fff;padding:12px;border:1px solid #ddd;white-space:pre-wrap;">${request.description}</div>

          ${request.notes ? `<h3 style="margin-top:24px;color:#333;">Additional Notes</h3><div style="background:#fff;padding:12px;border:1px solid #ddd;white-space:pre-wrap;">${request.notes}</div>` : ""}

          ${photoHtml}

          <p style="margin-top:24px;color:#666;font-size:13px;">
            Submitted: ${new Date(request.created_at).toLocaleString("en-US", { timeZone: "America/New_York" })}
          </p>
        </div>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kinsaza Service Requests <onboarding@resend.dev>",
        to: ["kinshzh@gmail.com"],
        subject: `New Service Request: ${request.service_needed} - ${request.name}`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      console.error("Resend API error:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to send email notification" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-service-request error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
