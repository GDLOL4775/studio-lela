import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  computeAvailableSlots,
  formatSlot,
  WeeklyScheduleRow,
  ScheduleBlock,
  BookedAppointment,
} from "@/lib/availability";
import { addMinutes, startOfDay, endOfDay, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarCheck, Loader2, MessageCircle } from "lucide-react";
import { buildWhatsAppLink, formatBRL, formatDateTimeBR, STUDIO } from "@/lib/studio";

type Service = { id: string; name: string; price: number };

const bookingSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  phone: z.string().trim().min(8, "Telefone inválido").max(30),
  serviceId: z.string().uuid("Selecione um serviço"),
  starts_at: z.date({ message: "Selecione data e horário" }),
});

export function BookingSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [schedule, setSchedule] = useState<WeeklyScheduleRow[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [booked, setBooked] = useState<BookedAppointment[]>([]);

  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState<Date | null>(null);
  const [serviceId, setServiceId] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load reference data
  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: w }] = await Promise.all([
        supabase.from("services").select("id,name,price").eq("active", true).order("sort_order"),
        supabase.from("weekly_schedule").select("weekday,start_time,end_time,slot_minutes,active"),
      ]);
      setServices(s || []);
      setSchedule(w || []);
    })();
  }, []);

  // Load blocks/booked when date changes
  useEffect(() => {
    if (!date) return;
    (async () => {
      const dStart = startOfDay(date).toISOString();
      const dEnd = endOfDay(date).toISOString();
      const [{ data: b }, { data: a }] = await Promise.all([
        (supabase as any)
          .from("public_schedule_blocks")
          .select("starts_at,ends_at")
          .lte("starts_at", dEnd)
          .gte("ends_at", dStart),
        (supabase as any)
          .from("public_appointment_slots")
          .select("starts_at,duration_minutes")
          .gte("starts_at", dStart)
          .lte("starts_at", dEnd),
      ]);
      setBlocks(b || []);
      setBooked(a || []);
      setSlot(null);
    })();
  }, [date]);

  const slots = useMemo(() => {
    if (!date) return [];
    return computeAvailableSlots(date, schedule, blocks, booked);
  }, [date, schedule, blocks, booked]);

  const allowedDays = useMemo(() => new Set(schedule.filter((s) => s.active).map((s) => s.weekday)), [schedule]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const parsed = bookingSchema.safeParse({
      name,
      phone,
      serviceId,
      starts_at: slot ?? undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Dados inválidos");
      setSubmitting(false);
      return;
    }

    const service = services.find((s) => s.id === serviceId)!;
    const slotRow = schedule.find((r) => r.weekday === parsed.data.starts_at.getDay());
    const duration = slotRow?.slot_minutes ?? 60;

    // Upsert client (best-effort) — INSERT only allowed publicly
    await supabase.from("clients").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
    }).select().maybeSingle();

    const { error } = await supabase.from("appointments").insert({
      service_id: service.id,
      service_name: service.name,
      client_name: parsed.data.name,
      client_phone: parsed.data.phone,
      starts_at: parsed.data.starts_at.toISOString(),
      duration_minutes: duration,
      status: "pendente",
    });

    if (error) {
      console.error(error);
      toast.error("Não conseguimos salvar seu agendamento. Tente novamente.");
      setSubmitting(false);
      return;
    }

    toast.success("Agendamento enviado! Abrindo WhatsApp...");

    const message = `Olá Lela! Acabei de agendar pelo site:%0A%0A👤 *Nome:* ${parsed.data.name}%0A📞 *Telefone:* ${parsed.data.phone}%0A💅 *Serviço:* ${service.name}${service.price ? ` (${formatBRL(Number(service.price))})` : ""}%0A📅 *Data:* ${formatDateTimeBR(parsed.data.starts_at)}%0A%0AAguardo sua confirmação!`;
    const link = `https://wa.me/${STUDIO.phoneRaw}?text=${message}`;
    window.open(link, "_blank");

    // Reset
    setName("");
    setPhone("");
    setServiceId("");
    setSlot(null);
    setDate(undefined);
    setSubmitting(false);
  }

  return (
    <section id="agendamento" className="py-20 md:py-28 gradient-soft">
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-3">Agendamento</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Reserve seu <span className="italic text-accent">horário</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Escolha o serviço, a data e o horário. Confirmamos pelo WhatsApp.
          </p>
        </div>

        <Card className="p-6 md:p-8 max-w-5xl mx-auto rounded-2xl shadow-elegant border-border/50 bg-card">
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
            <div>
              <Label className="text-sm font-medium mb-2 block">1. Escolha a data</Label>
              <div className="rounded-2xl border border-border bg-background p-2">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => {
                    const today = startOfDay(new Date());
                    return d < today || !allowedDays.has(d.getDay());
                  }}
                  className="rounded-md pointer-events-auto"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">2. Escolha o serviço</Label>
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.price > 0 ? `— ${formatBRL(Number(s.price))}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">3. Escolha o horário</Label>
                {!date ? (
                  <p className="text-sm text-muted-foreground italic">Selecione uma data primeiro.</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">Nenhum horário disponível neste dia.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((s) => {
                      const active = slot && s.getTime() === slot.getTime();
                      return (
                        <button
                          type="button"
                          key={s.toISOString()}
                          onClick={() => setSlot(s)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-smooth ${
                            active
                              ? "gradient-primary text-primary-foreground border-transparent shadow-soft"
                              : "border-border bg-background hover:bg-secondary"
                          }`}
                        >
                          {formatSlot(s)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-2 block">Seu nome</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium mb-2 block">WhatsApp</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="(13) 9 9999-9999" maxLength={30} />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting || !slot || !serviceId}
                className="w-full gradient-primary text-primary-foreground border-0 shadow-card"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CalendarCheck className="w-4 h-4" />
                    Confirmar agendamento
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <MessageCircle className="w-3 h-3" /> Após confirmar, abriremos o WhatsApp para finalizar.
              </p>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
