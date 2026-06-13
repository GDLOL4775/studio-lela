import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CalendarCheck, Users, DollarSign, CalendarDays } from "lucide-react";
import { formatBRL, formatDateTimeBR } from "@/lib/studio";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [clients, setClients] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [upcoming, setUpcoming] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const tStart = startOfDay(now).toISOString();
      const tEnd = endOfDay(now).toISOString();
      const wStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const wEnd = endOfWeek(now, { weekStartsOn: 1 }).toISOString();
      const mStart = startOfMonth(now).toISOString().slice(0, 10);
      const mEnd = endOfMonth(now).toISOString().slice(0, 10);

      const [{ count: c1 }, { count: c2 }, { count: c3 }, { data: fin }, { data: up }] = await Promise.all([
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .gte("starts_at", tStart).lte("starts_at", tEnd).neq("status", "cancelado"),
        supabase.from("appointments").select("id", { count: "exact", head: true })
          .gte("starts_at", wStart).lte("starts_at", wEnd).neq("status", "cancelado"),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("financial_entries").select("value,type").gte("entry_date", mStart).lte("entry_date", mEnd),
        supabase.from("appointments").select("id,client_name,service_name,starts_at,status")
          .gte("starts_at", new Date().toISOString()).order("starts_at").limit(8),
      ]);

      setToday(c1 ?? 0);
      setWeek(c2 ?? 0);
      setClients(c3 ?? 0);
      const rev = (fin || []).reduce((sum, e: any) => sum + (e.type === "entrada" ? Number(e.value) : -Number(e.value)), 0);
      setRevenue(rev);
      setUpcoming(up || []);
    })();
  }, []);

  const cards = [
    { label: "Hoje", value: today, icon: CalendarCheck, sub: "agendamentos" },
    { label: "Esta semana", value: week, icon: CalendarDays, sub: "agendamentos" },
    { label: "Clientes", value: clients, icon: Users, sub: "no total" },
    { label: "Mês atual", value: formatBRL(revenue), icon: DollarSign, sub: "saldo" },
  ];

  const statusVariant: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    confirmado: "bg-blue-100 text-blue-800",
    concluido: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Visão Geral</h2>
        <p className="text-muted-foreground text-sm">Resumo da semana no LS Nails Studio.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5 rounded-2xl shadow-soft border-border/60">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="font-serif text-2xl md:text-3xl font-semibold mt-1">{c.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <c.icon className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 rounded-2xl shadow-soft border-border/60">
        <h3 className="font-serif text-lg font-semibold mb-4">Próximos compromissos</h3>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nenhum compromisso agendado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.client_name}</p>
                  <p className="text-sm text-muted-foreground truncate">{a.service_name} · {formatDateTimeBR(a.starts_at)}</p>
                </div>
                <Badge className={statusVariant[a.status] || ""} variant="outline">{a.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
