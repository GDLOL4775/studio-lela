
# Studio Lela — Landing Page + Admin Dashboard

A complete, lilac-themed nail studio site for Letícia Santana Pereira (Praia Grande – SP) with a public landing page, online booking, and a full admin dashboard powered by Lovable Cloud.

## 🎨 Design System

- **Palette**: Primary `#C8A8E9`, Accent `#A076C9`, Background `#FAF5FF`, Dark text `#2D1B4E` (all tokenized as HSL in `index.css`)
- **Fonts**: Playfair Display (headings) + Inter (body)
- **Style**: Soft shadows, rounded corners, smooth hover/scroll transitions, subtle floral/nail SVG accents
- **Mobile-first responsive** across all breakpoints

## 🌐 Public Landing Page (single page, smooth-scroll sections)

1. **Header / Hero** — Logo placeholder (top-left), nav links, full-width hero with tagline *"Unhas impecáveis, cuidado que você merece."*, CTA "Agendar agora" → scrolls to booking, soft lilac gradient + decorative nail/floral SVG.
2. **Sobre** — Photo placeholder of Letícia, bio, three editable highlight stats (years of experience, clients served, satisfaction %).
3. **Serviços & Valores** — Card grid pulled live from DB, with icon, name, description, price (R$).
4. **Galeria** — Masonry grid of nail-art stock placeholders, lightbox on click, "Ver mais" expand.
5. **Onde atendo** — Two side-by-side cards: *Salão fixo* (address + Maps embed placeholder + horários) and *Atendimento a domicílio* (Praia Grande – SP e região, CTA WhatsApp).
6. **Agendamento** — Booking flow:
   - Client picks service → date (calendar) → available time slot
   - Fills name + phone
   - On submit: saves appointment to DB **and** opens WhatsApp to **+55 13 97820-1793** with a pre-filled message summarizing the booking
7. **Depoimentos** — Carousel/grid pulled from DB (3 seeded placeholders), star ratings + avatars.
8. **Footer** — Logo, phone, WhatsApp button, Instagram placeholder, "Desenvolvido com 💜".

## 📅 Booking Availability Logic

- Admin defines a **weekly schedule** (e.g. Mon–Sat 09:00–18:00, lunch break, slot duration in minutes)
- Admin can **block specific dates or time ranges** (vacation, days off)
- Public calendar shows only valid open slots, hiding ones already booked or blocked

## 🔐 Admin Dashboard (`/admin/*`, protected)

- **Auth**: Google OAuth via Lovable Cloud. A `user_roles` table gates access — only users with the `admin` role see admin pages; others get an "Acesso pendente" screen. Letícia's email can be promoted via SQL after her first sign-in.
- **Layout**: Collapsible sidebar (shadcn) with sections below + topbar with user menu.

### Modules

1. **Visão Geral** — Cards: agendamentos hoje / esta semana, total de clientes, receita do mês (somada das entradas financeiras). Lista dos próximos compromissos.
2. **Serviços & Valores** — Inline edit name/description/price, add, delete (with confirm dialog).
3. **Galeria** — Drag & drop upload to Storage, drag-to-reorder, tag por serviço, delete (with confirm).
4. **Agenda** — Calendário mensal/semanal/diário, criar manual, editar, mudar status (Pendente / Confirmado / Concluído / Cancelado), delete (with confirm). Configuração de horário semanal + bloqueios.
5. **Clientes** — Lista (nome, telefone, último atendimento, total de visitas), busca, filtro, histórico por cliente, delete (with confirm). Clientes criados automaticamente a partir de agendamentos.
6. **Funcionários** — CRUD (nome, função, foto, ativo).
7. **Financeiro (Caixa)** — Registrar entradas/saídas (data, descrição, categoria, valor, tipo), filtros por período, totais e saldo, delete (with confirm).
8. **Depoimentos** — CRUD (nome, foto, nota 1–5, texto, publicado sim/não).

All destructive actions go through a confirmation `AlertDialog`.

## 🗄️ Backend (Lovable Cloud)

**Tables** (all with RLS enabled):
- `profiles` (linked to auth.users)
- `user_roles` + `app_role` enum + `has_role()` security-definer function
- `services` (name, description, price, icon, sort_order, active)
- `gallery_images` (storage_path, caption, service_tag, sort_order)
- `weekly_schedule` (weekday, start_time, end_time, slot_minutes)
- `schedule_blocks` (date/range, reason)
- `clients` (name, phone unique, notes, total_visits)
- `appointments` (client_id, service_id, starts_at, status, notes)
- `team_members` (name, role, photo_url, active)
- `financial_entries` (date, description, category, value, type)
- `testimonials` (name, avatar_url, rating, text, published)

**RLS**:
- Public can SELECT: services (active), gallery, published testimonials, weekly_schedule, schedule_blocks
- Public can INSERT: appointments + clients (booking form)
- Admin role required for all writes elsewhere and for sensitive reads (clients, financial_entries, full appointments list)

**Storage**: public bucket `gallery` for gallery images, `team` for team photos, `testimonials` for avatars.

## 📦 Initial Seed Content

- 8 services from the brief with prices (editable ones default to R$ 0 with "a definir" hint until updated)
- ~9 tasteful nail-art stock placeholder images in the gallery
- 3 realistic Portuguese testimonials with avatar placeholders
- Default weekly schedule: Mon–Sat 09:00–18:00, 60-min slots

## ✅ Acceptance Highlights

- Landing page looks polished and complete on first load (no empty sections)
- Client can book end-to-end → record in DB + WhatsApp opens with pre-filled summary
- Letícia can edit every price, photo, testimonial, and appointment without code changes
- `/admin` is fully protected by Google OAuth + role check
- Fully responsive, accessible, with smooth lilac aesthetic
