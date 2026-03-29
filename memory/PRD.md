# BÉNI Restaurant Website - PRD

## Original Problem Statement
Site para Restaurante BÉNI com conteúdo de https://www.restaurantbeni.com/ mas com aparência elegante do https://www.restaurantazur.lu/

### Features Requested:
- Menu da Semana (Entrée + Plat + Dessert = 28,90€ | Entrée + Plat = 24,90€ | Plat + Dessert = 23,90€ | Plat = 17,90€)
- Toda semana: pratos ilimitados por categoria (carne, vegetariano, peixe/frutos do mar, sobremesas)
- Admin panel para editar fotos e menu da semana
- Sistema de reservas com calendário
- Multi-idioma: Francês (padrão), Inglês, Português
- Páginas: About, Cardápio completo, Galeria de fotos
- Categorias do cardápio dinâmicas (criar, editar, excluir, reordenar)
- Imagens de fundo personalizáveis por página
- Sistema de Reservas de Grupo para Eventos (página oculta via link)

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Framer Motion + jsPDF
- **Backend**: FastAPI + MongoDB (Motor async driver) + bcrypt
- **Auth**: JWT with bcrypt password hashing
- **Design**: Dark luxury theme (#0a0a0a bg, #d4af37 gold accents)
- **Fonts**: Playfair Display (headings), Manrope (body), Cormorant Garamond (accent)
- **Deployment**: ZIP packages with bash scripts for Ubuntu server

## What's Been Implemented

### Pages
- [x] Home - Hero, About teaser, Reservation CTA (with optional page background)
- [x] About (Notre Histoire) - History, Chef info, Philosophy
- [x] Menu (Carte) - Full restaurant menu with dynamic categories + Weekly Menu section
- [x] Gallery (Galerie) - Photo gallery with filters (dynamic from API)
- [x] Reservations - Calendar date picker, time slots, guest count
- [x] Admin Login - JWT authentication with bcrypt
- [x] Admin Dashboard - Complete management system
- [x] Event Page (/evento/:linkCode) - Group event reservations **IN FRENCH**

### Backend API
- [x] Auth: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/admins
- [x] Weekly Menu: /api/weekly-menu (GET active), CRUD
- [x] Menu Items: /api/menu-items (CRUD)
- [x] Menu Categories: /api/menu-categories (CRUD + reorder)
- [x] Reservations: /api/reservations (POST public, GET admin), status update, delete
- [x] Settings: /api/settings (GET/PUT)
- [x] Content: /api/content (GET/PUT)
- [x] Gallery: /api/gallery (GET/POST), /api/gallery/{id} (PUT/DELETE)
- [x] Upload: /api/upload (POST)
- [x] Events: /api/events (CRUD), /api/events/{link_code}/orders, /api/events/{link_code}/send

### Features Implemented
- [x] Language switcher (FR/EN/PT)
- [x] Responsive mobile navigation
- [x] Scroll to top on page navigation
- [x] Gallery lightbox
- [x] Calendar-based reservation system
- [x] Admin menu editor - unlimited dishes per category
- [x] Admin dynamic menu categories - CRUD with drag & drop reorder
- [x] Admin gallery management
- [x] Admin site content editor (texts + images + page backgrounds)
- [x] Admin user management
- [x] Image upload with drag & drop
- [x] Group Event Reservations (admin creates, guests order, organizer manages, PDFs generated)
- [x] **Event Page & PDFs translated to French** (March 29, 2026)
- [x] **Deployment ZIPs updated** (beni-restaurant.zip + event_update.zip) (March 29, 2026)

## Prioritized Backlog

### P1 (High Priority) - NEXT
- [ ] Integração de email (Resend/SendGrid) para enviar PDFs automaticamente
- [ ] Integração WhatsApp para notificações de reservas
- [ ] Sistema completo de reservas com calendário visual

### P2 (Medium Priority)
- [ ] Secções customizáveis na Home
- [ ] Email de confirmação de reservas
- [ ] Newsletter subscription
- [ ] Google Maps integration
- [ ] SEO (meta tags, sitemap)

### P3 (Nice to Have)
- [ ] PDF menu download
- [ ] Social media links
- [ ] Customer reviews section
- [ ] Online payment for reservations

## Refactoring Needed
- `server.py` (~1000 lines) → Split into `/app/backend/routes/` modules
- `AdminDashboard.js` (~1400 lines) → Split into separate tab components

## Admin Credentials
- **Email:** admin
- **Password:** #Sti93qn06301616

## Deployment Files
- `/app/beni-restaurant.zip` - Full package for fresh Ubuntu installation
- `/app/event_update.zip` - Update package for event feature only
- `/app/install.sh` - Main installation script
- `/app/populate_menu.sh` - Database seed script
