import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-nails.jpg";
import { Sparkles, ArrowRight } from "lucide-react";
import { STUDIO } from "@/lib/studio";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex items-center pt-24 pb-12 gradient-hero overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl" aria-hidden />
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-accent/20 blur-3xl" aria-hidden />

      <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center relative z-10">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-sm text-accent-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{STUDIO.city}</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.1]">
            {STUDIO.tagline.split(",")[0]},
            <br />
            <span className="text-accent italic">cuidado que você merece.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-md">
            Manicure, pedicure, nail art e atendimento a domicílio. Agende com Letícia e desfrute de uma experiência única para suas unhas.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" className="gradient-primary text-primary-foreground border-0 shadow-card hover:shadow-elegant transition-smooth group">
              <a href="#agendamento">
                Agendar agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-smooth" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-accent/40 hover:bg-accent/10">
              <a href="#servicos">Ver serviços</a>
            </Button>
          </div>
        </div>

        <div className="relative animate-scale-in">
          <div className="relative rounded-[2rem] overflow-hidden shadow-elegant">
            <img
              src={heroImg}
              alt="Unhas elegantes com decoração floral no Studio Lela"
              width={1536}
              height={1024}
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-card animate-float">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">+5 anos</p>
                <p className="font-semibold text-sm">de experiência</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
