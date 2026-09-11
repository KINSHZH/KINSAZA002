import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.text();
    const event = JSON.parse(body);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const paymentId = session.metadata?.payment_id;

        if (paymentId) {
          await supabase
            .from("payments")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent || null,
            })
            .eq("id", paymentId);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        const paymentId = session.metadata?.payment_id;

        if (paymentId) {
          await supabase
            .from("payments")
            .update({ status: "expired" })
            .eq("id", paymentId);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object;
        const { data: payments } = await supabase
          .from("payments")
          .select("*")
          .eq("stripe_payment_intent_id", charge.payment_intent);

        if (payments && payments.length > 0) {
          for (const p of payments) {
            await supabase
              .from("payments")
              .update({ status: "refunded" })
              .eq("id", p.id);
          }
        }
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
