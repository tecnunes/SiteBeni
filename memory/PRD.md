# BÉNI Restaurant Website - PRD

## Original Problem Statement
Site para Restaurante BÉNI com conteúdo de https://www.restaurantbeni.com/ mas com aparência elegante do https://www.restaurantazur.lu/

### Features Requested:
- Menu da Semana, Admin panel, Sistema de reservas, Multi-idioma (FR/EN/PT)
- Categorias dinâmicas, Imagens de fundo personalizáveis, Galeria de fotos
- Sistema de Reservas de Grupo para Eventos (página oculta via link)

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Framer Motion + jsPDF
- **Backend**: FastAPI + MongoDB (Motor) + bcrypt + JWT
- **Design**: Dark luxury theme (#0a0a0a bg, #d4af37 gold accents)

## What's Been Implemented
- [x] All pages (Home, About, Menu, Gallery, Reservations, Admin, EventPage)
- [x] Full CRUD for menu items, categories (with drag-and-drop reorder), gallery, events
- [x] Multi-language (FR/EN/PT), responsive, gallery lightbox
- [x] Event Page & PDFs in French, deployment ZIPs
- [x] **Bug fix: Category reorder route conflict** (March 29, 2026)
- [x] **Category dropdown added to menu item form** (March 29, 2026)
- [x] **Compact admin menu layout** (March 29, 2026)

## Prioritized Backlog
### P1 - NEXT
- [ ] Integração de email (Resend/SendGrid) para enviar PDFs
- [ ] Integração WhatsApp para reservas
- [ ] Sistema completo de reservas com calendário visual

### P2
- [ ] Secções customizáveis na Home, SEO, Google Maps, Newsletter

### P3
- [ ] PDF menu download, Social links, Reviews, Online payment

## Refactoring
- `server.py` (~1000 lines) → Split into route modules
- `AdminDashboard.js` (~1400 lines) → Split into tab components

## Admin Credentials
- **Email:** admin | **Password:** #Sti93qn06301616
