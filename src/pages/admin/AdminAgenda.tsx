import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDateTimeBR } from "@/lib/studio";

type Appt = { id: string; client_name: string; client_phone: string; service_name: string; starts_at: string; status: string; duration_minutes: number };

const STATUS = ["pendente", "confirmado", "concluido", "cancelado"] as const;
const statusBg: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

export default function AdminAgenda() {
  const [items, setItems] = useState<Appt[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Appt | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ client_name: "", client_phone: "", service_name: "", starts_at: "", duration_minutes: 60 });

  async function load() {
    const { data } = await supabase.from("appointments").select("*").order("starts_at", { ascending: false }).limit(100);
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status: status as "pendente" | "confirmado" | "cancelado" | "concluido" }).eq("id", id);
    toast.success("Status atualizado");
    load();
  }

  async function doDelete() {
    if (!pendingDelete) return;
    await supabase.from("appointments").delete().eq("id", pendingDelete.id);
    setPendingDelete(null);
    toast.success("Excluído");
    load();
  }

  async function add() {
    if (!form.client_name || !form.client_phone || !form.service_name || !form.starts_at) {
      toast.error("Preencha todos os campos");
      return;
    }
    const { error } = await supabase.from("appointments").insert({
      client_name: form.client_name,
      client_phone: form.client_phone,
      service_name: form.service_name,
      starts_at: new Date(form.starts_at).toISOString(),
      duration_minutes: form.duration_minutes,
      status: "confirmado",
    });
    if (error) toast.error("Erro ao criar"); else { toast.success("Agendamento criado"); setOpen(false); load(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Agenda</h2>
          <p className="text-muted-foreground text-sm">Gerencie todos os agendamentos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground border-0"><Plus className="w-4 h-4" /> Novo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo agendamento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></div>
              <div><Label>Telefone</Label><Input value={form.client_phone} onChange={(e) => setForm({ ...form, client_phone: e.target.value })} /></div>
              <div><Label>Serviço</Label><Input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} /></div>
              <div><Label>Data e hora</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
              <div><Label>Duração (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} /></div>
              <Button onClick={add} className="w-full gradient-primary text-primary-foreground border-0">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl shadow-soft border-border/60 overflow-hidden">
        {items.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">Nenhum agendamento ainda.</p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((a) => (
              <div key={a.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{a.client_name} <span className="text-muted-foreground text-sm">· {a.client_phone}</span></p>
                  <p className="text-sm text-muted-foreground">{a.service_name} · {formatDateTimeBR(a.starts_at)}</p>
                </div>
                <Select defaultValue={a.status} onValueChange={(v) => updateStatus(a.id, v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Badge className={statusBg[a.status]} variant="outline">{a.status}</Badge>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(a)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir agendamento?"
        description={`O agendamento de "${pendingDelete?.client_name}" será removido.`}
        onConfirm={doDelete}
      />
    </div>
  );
}
