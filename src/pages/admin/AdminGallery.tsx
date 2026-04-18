import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Input } from "@/components/ui/input";

type GImage = { id: string; storage_path: string; caption: string | null; service_tag: string | null; sort_order: number };

export default function AdminGallery() {
  const [items, setItems] = useState<GImage[]>([]);
  const [pendingDelete, setPendingDelete] = useState<GImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase.from("gallery_images").select("*").order("sort_order");
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  function publicUrl(path: string) {
    if (path.startsWith("http")) return path;
    return supabase.storage.from("gallery").getPublicUrl(path).data.publicUrl;
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
      if (upErr) { toast.error("Erro no upload: " + upErr.message); continue; }
      await supabase.from("gallery_images").insert({
        storage_path: path,
        sort_order: items.length + 1,
      });
    }
    setUploading(false);
    toast.success("Upload concluído");
    load();
  }

  async function doDelete() {
    if (!pendingDelete) return;
    if (!pendingDelete.storage_path.startsWith("http")) {
      await supabase.storage.from("gallery").remove([pendingDelete.storage_path]);
    }
    await supabase.from("gallery_images").delete().eq("id", pendingDelete.id);
    setPendingDelete(null);
    toast.success("Imagem removida");
    load();
  }

  async function updateCaption(id: string, caption: string) {
    await supabase.from("gallery_images").update({ caption }).eq("id", id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Galeria</h2>
          <p className="text-muted-foreground text-sm">Faça upload e gerencie as fotos exibidas no site.</p>
        </div>
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gradient-primary text-primary-foreground border-0">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Enviando..." : "Adicionar fotos"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground rounded-2xl">
          Nenhuma imagem ainda. Clique em <strong>Adicionar fotos</strong> para começar.
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((img) => (
            <Card key={img.id} className="rounded-2xl overflow-hidden shadow-soft border-border/60">
              <div className="aspect-square bg-muted">
                <img src={publicUrl(img.storage_path)} alt={img.caption || ""} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 space-y-2">
                <Input
                  defaultValue={img.caption || ""}
                  placeholder="Legenda"
                  onBlur={(e) => updateCaption(img.id, e.target.value)}
                />
                <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => setPendingDelete(img)}>
                  <Trash2 className="w-4 h-4" /> Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(o) => !o && setPendingDelete(null)}
        title="Excluir imagem?"
        description="A imagem será removida permanentemente da galeria."
        confirmText="Excluir"
        onConfirm={doDelete}
      />
    </div>
  );
}
