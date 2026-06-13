export const STUDIO = {
  name: "LS Nails Studio",
  founder: "Letícia Santana Pereira",
  tagline: "Unhas impecáveis, cuidado que você merece.",
  city: "Praia Grande – SP",
  phone: "+55 13 97820-1793",
  phoneRaw: "5513978201793",
  instagram: "https://instagram.com/",
  address: "Praia Grande – SP (endereço a confirmar)",
};

export const WHATSAPP_BASE = `https://wa.me/${STUDIO.phoneRaw}`;

export function buildWhatsAppLink(message: string) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function formatDateBR(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

export function formatTimeBR(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date);
}

export function formatDateTimeBR(d: Date | string) {
  return `${formatDateBR(d)} às ${formatTimeBR(d)}`;
}
