import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type T = { id: string; name: string; role: string | null; photo_url: string | null; active: boolean };

export default function AdminTeam() {
  const [items, setItems] = useState<T[]>([]);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);

  async function load() {
    const { data } = await supabase.from("team_members").select("*").order("created_at");
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    await supabase.from("team_members").insert({ name: "Nova pessoa", role: "Manicure" });
    load();
  }
  async function update(id: string, patch: Partial<T>) {
    await supabase.from("team_members").update(patch).eq("id", id);
  }
  async function doDelete() {
    if (!pendingDelete) return;
    await supabase.from("team_members").delete().eq("id", pendingDelete.id);
    setPendingDelete(null);
    toast.success("Removida");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Funcionários</h2>
          <p className="text-muted-foreground text-sm">Sua equipe.</p>
        </div>
        <Button onClick={add} className="gradient-primary text-primary-foreground border-0"><Plus className="w-4 h-4" /> Adicionar</Button>
      </div>

      <div className="grid gap-4">
        {items.map((m) => (
          <Card key={m.id} className="p-5 rounded-2xl shadow-soft border-border/60">
            <div className="grid md:grid-cols-[1fr_1fr_1fr_100px_auto] gap-3 items-end">
              <div><Label className="text-xs">Nome</Label><Input defaultValue={m.name} onBlur={(e) => update(m.id, { name: e.target.value })} /></div>
              <div><Label className="text-xs">Função</Label><Input defaultValue={m.role || ""} onBlur={(e) => update(m.id, { role: e.target.value })} /></div>
              <div><Label className="text-xs">Foto (URL)</Label><Input defaultValue={m.photo_url || ""} onBlur={(e) => update(m.id, { photo_url: e.target.value })} /></div>
              <div><Label className="text-xs">Ativo</Label><div className="h-10 flex items-center"><Switch defaultChecked={m.active} onCheckedChange={(v) => update(m.id, { active: v })} /></div></div>
              <Button variant="ghost" size="icon" onClick={() => setPendingDelete(m)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum funcionário cadastrado.</p>}
      </div>

      <ConfirmDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Remover pessoa?" description={`"${pendingDelete?.name}" será removida.`} onConfirm={doDelete} />
    </div>
  );
}
