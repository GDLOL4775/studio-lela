import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "#sobre", label: "Sobre" },
  { href: "#servicos", label: "Serviços" },
  { href: "#galeria", label: "Galeria" },
  { href: "#localizacao", label: "Onde atendo" },
  { href: "#agendamento", label: "Agendar" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-smooth ${
        scrolled ? "bg-background/85 backdrop-blur-md shadow-soft" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-3">
        <a href="#hero" aria-label="LS Nails Studio início">
          <Logo />
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-foreground/80 hover:text-accent transition-smooth"
            >
              {l.label}
            </a>
          ))}
          <Button asChild size="sm" className="gradient-primary text-primary-foreground border-0 shadow-soft">
            <a href="#agendamento">Agendar agora</a>
          </Button>
        </nav>

        <button
          className="md:hidden p-2 rounded-md hover:bg-secondary transition-smooth"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border animate-fade-in">
          <nav className="container mx-auto py-4 flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2 text-base font-medium text-foreground/80"
              >
                {l.label}
              </a>
            ))}
            <Button asChild size="sm" className="gradient-primary text-primary-foreground border-0">
              <a href="#agendamento" onClick={() => setOpen(false)}>
                Agendar agora
              </a>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
