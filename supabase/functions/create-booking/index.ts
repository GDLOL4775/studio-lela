import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  service_id: z.string().uuid(),
  service_name: z.string().trim().min(1).max(200),
  starts_at: z.string().datetime(),
  duration_minutes: z.number().int().min(15).max(480),
});

const MAX_PER_HOUR = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
  const data = parsed.data;

  // Reject obviously past dates
  const startsAt = new Date(data.starts_at);
  if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now() - 60 * 60 * 1000) {
    return new Response(JSON.stringify({ error: "starts_at must be in the future" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Rate limit: max N inserts per IP in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recentCount, error: rlError } = await supabase
    .from("booking_rate_limit")
    .select("*", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", oneHourAgo);

  if (rlError) {
    console.error("rate-limit lookup failed", rlError);
  } else if ((recentCount ?? 0) >= MAX_PER_HOUR) {
    return new Response(
      JSON.stringify({ error: "Muitas tentativas. Tente novamente em alguns minutos." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Log attempt before insert (best effort)
  await supabase.from("booking_rate_limit").insert({ ip });

  // Upsert client (best effort)
  await supabase.from("clients").insert({ name: data.name, phone: data.phone });

  const { error: insertError, data: inserted } = await supabase
    .from("appointments")
    .insert({
      service_id: data.service_id,
      service_name: data.service_name,
      client_name: data.name,
      client_phone: data.phone,
      starts_at: data.starts_at,
      duration_minutes: data.duration_minutes,
      status: "pendente",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("appointment insert failed", insertError);
    return new Response(JSON.stringify({ error: "Não conseguimos salvar seu agendamento." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});