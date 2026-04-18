import { Logo } from "@/components/Logo";
import { Phone, MessageCircle, Instagram, Heart } from "lucide-react";
import { STUDIO, WHATSAPP_BASE } from "@/lib/studio";

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <Logo variant="light" />
          <p className="mt-4 text-sm text-background/70 max-w-xs">
            Unhas impecáveis em Praia Grande – SP. Cuidado e dedicação que você merece.
          </p>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold mb-3">Contato</h4>
          <ul className="space-y-2 text-sm text-background/80">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <a href={`tel:${STUDIO.phoneRaw}`} className="hover:text-primary transition-smooth">
                {STUDIO.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <a href={WHATSAPP_BASE} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              <a href={STUDIO.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-smooth">
                Instagram
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif text-lg font-semibold mb-3">Localização</h4>
          <p className="text-sm text-background/80">{STUDIO.city}</p>
          <p className="text-sm text-background/60 mt-1">Atendimento no salão e a domicílio</p>
        </div>
      </div>

      <div className="container mx-auto mt-10 pt-6 border-t border-background/10 text-center text-xs text-background/60">
        <p className="flex items-center justify-center gap-1">
          Desenvolvido com <Heart className="w-3.5 h-3.5 fill-primary text-primary" /> para {STUDIO.name}
        </p>
      </div>
    </footer>
  );
}
