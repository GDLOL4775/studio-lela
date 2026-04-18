import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

type T = { id: string; name: string; avatar_url: string | null; rating: number; text: string; published: boolean };

export default function AdminTestimonials() {
  const [items, setItems] = useState<T[]>([]);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);

  async function load() {
    const { data } = await supabase.from("testimonials").select("*").order("sort_order");
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    await supabase.from("testimonials").insert({ name: "Nova cliente", rating: 5, text: "Texto do depoimento" });
    load();
  }
  async function update(id: string, patch: Partial<T>) {
    await supabase.from("testimonials").update(patch).eq("id", id);
  }
  async function doDelete() {
    if (!pendingDelete) return;
    await supabase.from("testimonials").delete().eq("id", pendingDelete.id);
    setPendingDelete(null); toast.success("Excluído"); load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Depoimentos</h2>
          <p className="text-muted-foreground text-sm">Gerencie os depoimentos exibidos no site.</p>
        </div>
        <Button onClick={add} className="gradient-primary text-primary-foreground border-0"><Plus className="w-4 h-4" /> Novo</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((t) => (
          <Card key={t.id} className="p-5 rounded-2xl shadow-soft border-border/60 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Nome</Label><Input defaultValue={t.name} onBlur={(e) => update(t.id, { name: e.target.value })} /></div>
              <div><Label className="text-xs">Avatar (URL)</Label><Input defaultValue={t.avatar_url || ""} onBlur={(e) => update(t.id, { avatar_url: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Texto</Label><Textarea defaultValue={t.text} rows={3} onBlur={(e) => update(t.id, { text: e.target.value })} /></div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs">Avaliação</Label>
                <div className="flex gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => update(t.id, { rating: n }).then(load)}>
                      <Star className={`w-5 h-5 ${n <= t.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Publicado</Label>
                <div className="h-10 flex items-center"><Switch defaultChecked={t.published} onCheckedChange={(v) => update(t.id, { published: v })} /></div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setPendingDelete(t)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir depoimento?" onConfirm={doDelete} />
    </div>
  );
}
