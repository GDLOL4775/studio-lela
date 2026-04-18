import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type T = { id: string; name: string; avatar_url: string | null; rating: number; text: string };

export function TestimonialsSection() {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id,name,avatar_url,rating,text")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setItems(data || []));
  }, []);

  if (items.length === 0) return null;

  return (
    <section id="depoimentos" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-3">Depoimentos</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            O que dizem <span className="italic text-accent">nossas clientes</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((t) => (
            <Card
              key={t.id}
              className="p-6 rounded-2xl shadow-soft hover:shadow-card transition-smooth border-border/60 bg-card"
            >
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.rating ? "fill-accent text-accent" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground italic mb-5 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <Avatar>
                  {t.avatar_url && <AvatarImage src={t.avatar_url} alt={t.name} />}
                  <AvatarFallback className="gradient-primary text-primary-foreground font-medium">
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium text-foreground">{t.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
