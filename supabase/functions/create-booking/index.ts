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

const MAX_PER_HOUR = 30;

async function sendTelegramNotification(appointment: {
  name: string;
  phone: string;
  service_name: string;
  starts_at: string;
  duration_minutes: number;
  id: string;
}) {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    console.warn("Telegram env vars not set, skipping notification");
    return;
  }

  const startsAt = new Date(appointment.starts_at);
  const formattedDate = startsAt.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = startsAt.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });

  const message =
    `💅 *Novo agendamento — Studio Lela*\n\n` +
    `👤 *Cliente:* ${appointment.name}\n` +
    `📞 *WhatsApp:* ${appointment.phone}\n` +
    `✨ *Serviço:* ${appointment.service_name}\n` +
    `📅 *Data:* ${formattedDate}\n` +
    `🕐 *Horário:* ${formattedTime}\n` +
    `⏱️ *Duração:* ${appointment.duration_minutes} min\n` +
    `🆔 *ID:* \`${appointment.id}\``;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Telegram API error:", err);
    }
  } catch (e) {
    console.error("Failed to send Telegram notification:", e);
  }
}

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

  // Check slot conflict: any appointment overlapping this time window blocks the booking
  const slotEnd = new Date(startsAt.getTime() + data.duration_minutes * 60 * 1000).toISOString();
  const { data: conflicts, error: conflictError } = await supabase
    .from("appointments")
    .select("id,starts_at,duration_minutes,status")
    .neq("status", "cancelado")
    .lt("starts_at", slotEnd)
    .gte("starts_at", new Date(startsAt.getTime() - 8 * 60 * 60 * 1000).toISOString());

  if (conflictError) {
    console.error("conflict lookup failed", conflictError);
  } else if (conflicts && conflicts.length > 0) {
    const overlaps = conflicts.some((a) => {
      const aStart = new Date(a.starts_at).getTime();
      const aEnd = aStart + (a.duration_minutes ?? 60) * 60 * 1000;
      return aStart < new Date(slotEnd).getTime() && aEnd > startsAt.getTime();
    });
    if (overlaps) {
      return new Response(
        JSON.stringify({ error: "Este horário já foi reservado por outro cliente. Por favor, escolha outro horário disponível." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  }

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

  // Send Telegram notification (best effort — não bloqueia a resposta)
  await sendTelegramNotification({
    name: data.name,
    phone: data.phone,
    service_name: data.service_name,
    starts_at: data.starts_at,
    duration_minutes: data.duration_minutes,
    id: inserted.id,
  });

  return new Response(JSON.stringify({ ok: true, id: inserted.id }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});