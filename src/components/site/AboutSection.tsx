import leticiaImg from "@/assets/leticia.jpg";
import { Heart, Award, Users } from "lucide-react";

export function AboutSection() {
  const stats = [
    { icon: Award, value: "5+", label: "anos de experiência" },
    { icon: Users, value: "300+", label: "clientes atendidas" },
    { icon: Heart, value: "98%", label: "de satisfação" },
  ];

  return (
    <section id="sobre" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative order-2 md:order-1">
          <div className="rounded-[2rem] overflow-hidden shadow-elegant aspect-[4/5] max-w-md mx-auto">
            <img
              src={leticiaImg}
              alt="Letícia Santana Pereira, fundadora do LS Nails Studio"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -top-4 -right-4 md:right-12 bg-card rounded-2xl px-5 py-3 shadow-card">
            <p className="font-serif italic text-accent">"Cuido das suas unhas como se fossem as minhas"</p>
          </div>
        </div>

        <div className="space-y-6 order-1 md:order-2 animate-fade-in">
          <p className="text-sm uppercase tracking-[0.2em] text-accent font-medium">Sobre</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Conheça <span className="text-accent italic">Letícia Santana</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Fundadora do LS Nails Studio e manicure profissional, Letícia transformou sua paixão por nail art em
            arte. Em cada atendimento, oferece dedicação, técnica e o carinho que toda mulher merece.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Atendendo em <strong className="text-foreground">Praia Grande – SP</strong> e região,
            tanto no salão fixo quanto no conforto da sua casa.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center p-4 rounded-2xl bg-secondary/60 shadow-soft">
                <s.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                <p className="font-serif text-2xl md:text-3xl font-semibold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
