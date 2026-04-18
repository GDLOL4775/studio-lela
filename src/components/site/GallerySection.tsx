import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import g5 from "@/assets/gallery-5.jpg";
import g6 from "@/assets/gallery-6.jpg";
import g7 from "@/assets/gallery-7.jpg";
import g8 from "@/assets/gallery-8.jpg";
import g9 from "@/assets/gallery-9.jpg";

const FALLBACK = [g1, g2, g3, g4, g5, g6, g7, g8, g9];

type Img = { id: string; url: string; caption: string | null };

export function GallerySection() {
  const [images, setImages] = useState<Img[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState<Img | null>(null);

  useEffect(() => {
    supabase
      .from("gallery_images")
      .select("id, storage_path, caption")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setImages(
            data.map((d) => {
              const isUrl = d.storage_path.startsWith("http");
              const url = isUrl
                ? d.storage_path
                : supabase.storage.from("gallery").getPublicUrl(d.storage_path).data.publicUrl;
              return { id: d.id, url, caption: d.caption };
            })
          );
        } else {
          // Fallback to bundled placeholders
          setImages(FALLBACK.map((url, i) => ({ id: `f-${i}`, url, caption: null })));
        }
      });
  }, []);

  const visible = showAll ? images : images.slice(0, 6);

  return (
    <section id="galeria" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-3">Galeria</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Nossos trabalhos <span className="italic text-accent">recentes</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {visible.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(img)}
              className={`group relative overflow-hidden rounded-2xl shadow-soft hover:shadow-card transition-bounce ${
                i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
              }`}
            >
              <img
                src={img.url}
                alt={img.caption || `Trabalho do Studio Lela ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-bounce"
              />
              <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/20 transition-smooth" />
            </button>
          ))}
        </div>

        {images.length > 6 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Ver menos" : "Ver mais"}
            </Button>
          </div>
        )}

        <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <DialogContent className="max-w-4xl p-0 bg-transparent border-0 shadow-none">
            {active && (
              <img src={active.url} alt={active.caption || ""} className="w-full h-auto rounded-2xl" />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
