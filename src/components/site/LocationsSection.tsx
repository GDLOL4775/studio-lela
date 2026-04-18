import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Home, MessageCircle } from "lucide-react";
import { STUDIO, buildWhatsAppLink } from "@/lib/studio";

export function LocationsSection() {
  return (
    <section id="localizacao" className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <p className="text-sm uppercase tracking-[0.2em] text-accent font-medium mb-3">Onde atendo</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Atendimento <span className="italic text-accent">no salão ou em casa</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Salão fixo */}
          <Card className="p-6 md:p-8 rounded-2xl shadow-card border-border/60 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">Salão fixo</h3>
            </div>

            <p className="text-muted-foreground mb-4">{STUDIO.address}</p>

            <div className="flex items-start gap-2 text-sm mb-4">
              <Clock className="w-4 h-4 mt-0.5 text-accent shrink-0" />
              <div>
                <p className="font-medium text-foreground">Segunda a Sábado</p>
                <p className="text-muted-foreground">09:00 às 18:00</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden aspect-video bg-muted mb-4 flex items-center justify-center">
              <iframe
                title="Mapa de Praia Grande"
                src="https://www.google.com/maps?q=Praia+Grande+SP&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </Card>

          {/* Atendimento a domicílio */}
          <Card className="p-6 md:p-8 rounded-2xl shadow-card border-border/60 bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-serif text-2xl font-semibold">Atendimento a domicílio</h3>
            </div>

            <p className="text-muted-foreground mb-4">
              Atendo em toda a região de <strong className="text-foreground">Praia Grande – SP</strong> e
              cidades vizinhas. Leve a experiência do Studio Lela para o conforto da sua casa.
            </p>

            <ul className="space-y-2 mb-6 text-sm text-muted-foreground">
              <li>✨ Conforto e comodidade</li>
              <li>✨ Mesma qualidade do salão</li>
              <li>✨ Horário flexível</li>
            </ul>

            <Button
              asChild
              size="lg"
              className="w-full gradient-primary text-primary-foreground border-0 shadow-soft"
            >
              <a
                href={buildWhatsAppLink(
                  "Olá Lela! Gostaria de saber mais sobre o atendimento a domicílio."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4" />
                Falar no WhatsApp
              </a>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
