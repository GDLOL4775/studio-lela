import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Switch } from "@/components/ui/switch";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon: string | null;
  active: boolean;
  sort_order: number;
};

export default function AdminServices() {
  const [items, setItems] = useState<Service[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setItems(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function update(id: string, patch: Partial<Service>) {
    const { error } = await supabase.from("services").update(patch).eq("id", id);
    if (error) toast.error("Erro ao salvar"); else toast.success("Salvo");
  }

  async function add() {
    const { error } = await supabase.from("services").insert({
      name: "Novo serviço",
      description: "",
      price: 0,
      icon: "Sparkles",
      sort_order: items.length + 1,
    });
    if (error) toast.error("Erro ao criar"); else { toast.success("Serviço criado"); load(); }
  }

  async function doDelete() {
    if (!pendingDelete) return;
    const { error } = await supabase.from("services").delete().eq("id", pendingDelete.id);
    if (error) toast.error("Erro ao excluir"); else { toast.success("Excluído"); load(); }
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Serviços & Valores</h2>
          <p className="text-muted-foreground text-sm">Gerencie os serviços oferecidos.</p>
        </div>
        <Button onClick={add} className="gradient-primary text-primary-foreground border-0">
          <Plus className="w-4 h-4" /> Novo serviço
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {items.map((s) => (
            <Card key={s.id} className="p-5 rounded-2xl shadow-soft border-border/60">
              <div className="grid md:grid-cols-[1fr_1fr_140px_100px_auto] gap-3 items-end">
                <div>
                  <Label className="text-xs">Nome</Label>
                  <Input
                    defaultValue={s.name}
                    onBlur={(e) => e.target.value !== s.name && update(s.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Descrição</Label>
                  <Textarea
                    defaultValue={s.description || ""}
                    rows={1}
                    onBlur={(e) => e.target.value !== s.description && update(s.id, { description: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Preço (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={Number(s.price)}
                    onBlur={(e) => Number(e.target.value) !== Number(s.price) && update(s.id, { price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Ativo</Label>
                  <div className="h-10 flex items-center">
                    <Switch defaultChecked={s.active} onCheckedChange={(v) => update(s.id, { active: v })} />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(s)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir serviço?"
        description={`O serviço "${pendingDelete?.name}" será removido permanentemente.`}
        confirmText="Excluir"
        onConfirm={doDelete}
      />
    </div>
  );
}
