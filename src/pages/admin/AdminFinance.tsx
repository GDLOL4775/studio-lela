import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatBRL, formatDateBR } from "@/lib/studio";

type Entry = { id: string; entry_date: string; description: string; category: string | null; value: number; type: "entrada" | "saida" };

export default function AdminFinance() {
  const [items, setItems] = useState<Entry[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);
  const [form, setForm] = useState({
    entry_date: new Date().toISOString().slice(0, 10),
    description: "",
    category: "",
    value: 0,
    type: "entrada" as "entrada" | "saida",
  });

  async function load() {
    const { data } = await supabase.from("financial_entries").select("*").order("entry_date", { ascending: false });
    setItems((data || []) as Entry[]);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.description || !form.value) { toast.error("Descrição e valor obrigatórios"); return; }
    await supabase.from("financial_entries").insert(form);
    setForm({ ...form, description: "", value: 0 });
    toast.success("Lançamento criado");
    load();
  }
  async function doDelete() {
    if (!pendingDelete) return;
    await supabase.from("financial_entries").delete().eq("id", pendingDelete.id);
    setPendingDelete(null); toast.success("Removido"); load();
  }

  const totalIn = items.filter((i) => i.type === "entrada").reduce((s, i) => s + Number(i.value), 0);
  const totalOut = items.filter((i) => i.type === "saida").reduce((s, i) => s + Number(i.value), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Financeiro</h2>
        <p className="text-muted-foreground text-sm">Controle de entradas e saídas.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl shadow-soft"><p className="text-sm text-muted-foreground">Entradas</p><p className="font-serif text-2xl font-semibold text-green-700">{formatBRL(totalIn)}</p></Card>
        <Card className="p-5 rounded-2xl shadow-soft"><p className="text-sm text-muted-foreground">Saídas</p><p className="font-serif text-2xl font-semibold text-red-700">{formatBRL(totalOut)}</p></Card>
        <Card className="p-5 rounded-2xl shadow-soft"><p className="text-sm text-muted-foreground">Saldo</p><p className="font-serif text-2xl font-semibold text-accent">{formatBRL(totalIn - totalOut)}</p></Card>
      </div>

      <Card className="p-5 rounded-2xl shadow-soft border-border/60">
        <h3 className="font-serif text-lg font-semibold mb-3">Novo lançamento</h3>
        <div className="grid md:grid-cols-[120px_1fr_120px_120px_120px_auto] gap-3 items-end">
          <div><Label className="text-xs">Data</Label><Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} /></div>
          <div><Label className="text-xs">Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label className="text-xs">Categoria</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
          <div><Label className="text-xs">Valor</Label><Input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} /></div>
          <div><Label className="text-xs">Tipo</Label>
            <Select value={form.type} onValueChange={(v: string) => setForm({ ...form, type: v as "entrada" | "saida" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="entrada">Entrada</SelectItem><SelectItem value="saida">Saída</SelectItem></SelectContent>
            </Select>
          </div>
          <Button onClick={add} className="gradient-primary text-primary-foreground border-0"><Plus className="w-4 h-4" /></Button>
        </div>
      </Card>

      <Card className="rounded-2xl shadow-soft border-border/60 overflow-hidden">
        {items.length === 0 ? <p className="p-8 text-center text-muted-foreground">Nenhum lançamento.</p> : (
          <div className="divide-y divide-border">
            {items.map((e) => (
              <div key={e.id} className="p-4 flex items-center gap-3">
                {e.type === "entrada" ? <ArrowDownCircle className="w-5 h-5 text-green-600" /> : <ArrowUpCircle className="w-5 h-5 text-red-600" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{e.description}</p>
                  <p className="text-sm text-muted-foreground">{formatDateBR(e.entry_date)} {e.category && `· ${e.category}`}</p>
                </div>
                <p className={`font-semibold ${e.type === "entrada" ? "text-green-700" : "text-red-700"}`}>
                  {e.type === "saida" ? "-" : "+"} {formatBRL(Number(e.value))}
                </p>
                <Button variant="ghost" size="icon" onClick={() => setPendingDelete(e)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir lançamento?" onConfirm={doDelete} />
    </div>
  );
}
