import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatBRL } from "@/lib/studio";
import * as Icons from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon: string | null;
};

export function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("services")
      .select("id,name,description,price,icon")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setServices(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="servicos" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-3">Serviços</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Cuidados feitos <span className="italic text-accent">com amor</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Escolha o serviço perfeito para você. Todos com produtos de alta qualidade.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))
              : services.map((s) => {
                const iconKey = (s.icon || "Sparkles") as keyof typeof Icons;
                const Icon = (Icons[iconKey] as typeof Icons.Sparkles) || Icons.Sparkles;
                return (
                  <Card
                    key={s.id}
                    className="p-6 rounded-2xl border-border/60 bg-card shadow-soft hover:shadow-card hover:-translate-y-1 transition-bounce"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-soft">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1">{s.name}</h3>
                    {s.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{s.description}</p>
                    )}
                    <p className="font-serif text-xl text-accent font-semibold">
                      {s.price > 0 ? formatBRL(Number(s.price)) : <span className="italic text-muted-foreground text-base">A definir</span>}
                    </p>
                  </Card>
                );
              })}
        </div>

        <div className="text-center mt-10">
          <Button asChild size="lg" className="gradient-primary text-primary-foreground border-0 shadow-card">
            <a href="#agendamento">Agendar serviço</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
