import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDateBR } from "@/lib/studio";

type Client = { id: string; name: string; phone: string; total_visits: number; last_appointment_at: string | null };

export default function AdminClients() {
  const [items, setItems] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Client | null>(null);

  async function load() {
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function doDelete() {
    if (!pendingDelete) return;
    await supabase.from("clients").delete().eq("id", pendingDelete.id);
    toast.success("Cliente removido");
    setPendingDelete(null);
    load();
  }

  const filtered = items.filter((c) =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Clientes</h2>
        <p className="text-muted-foreground text-sm">Lista de todas as clientes do LS Nails Studio.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por nome ou telefone..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <Card className="rounded-2xl shadow-soft border-border/60 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">Nenhuma cliente encontrada.</p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c) => (
              <div key={c.id} className="p-4 flex items-center gap-3 justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.phone}</p>
                </div>
                <div className="text-sm text-muted-foreground text-right hidden sm:block">
                  <p>{c.total_visits} visitas</p>
                  {c.last_appointment_at && <p className="text-xs">Última: {formatDateBR(c.last_appointment_at)}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(c)}>
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
        title="Excluir cliente?"
        description={`A cliente "${pendingDelete?.name}" será removida permanentemente.`}
        onConfirm={doDelete}
      />
    </div>
  );
}
