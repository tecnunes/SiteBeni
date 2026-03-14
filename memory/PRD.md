# BÉNI Restaurant Website - PRD

## Original Problem Statement
Site para Restaurante BÉNI com conteúdo de https://www.restaurantbeni.com/ mas com aparência elegante do https://www.restaurantazur.lu/

### Features Requested:
- Menu da Semana (Entrée + Plat + Dessert = 28,90€ | Entrée + Plat = 24,90€ | Plat + Dessert = 23,90€ | Plat = 17,90€)
- Toda semana: 1 prato de carne, 1 vegetariano, 1 peixe/frutos do mar, 2 sobremesas
- Admin panel para editar fotos e menu da semana
- Sistema de reservas com calendário
- Multi-idioma: Francês (padrão), Inglês, Português
- Páginas: About, Cardápio completo, Galeria de fotos

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + Framer Motion
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT with bcrypt password hashing
- **Design**: Dark luxury theme (#0a0a0a bg, #d4af37 gold accents)
- **Fonts**: Playfair Display (headings), Manrope (body), Cormorant Garamond (accent)

## User Personas
1. **Restaurant Guest**: Browse menu, make reservations, view gallery
2. **Admin**: Manage weekly menu, view/manage reservations, update site content

## Core Requirements (Static)
- Multi-language support (FR/EN/PT)
- Elegant dark theme matching restaurantazur.lu aesthetic
- Mobile responsive design
- Weekly menu management system
- Reservation system with calendar

## What's Been Implemented (March 2026)

### Pages
- [x] Home - Hero, About teaser, Weekly Menu preview, Reservation CTA
- [x] About (Notre Histoire) - History, Chef info, Philosophy
- [x] Menu (Carte) - Full restaurant menu with prices
- [x] Weekly Menu (Menu Semaine) - Current week dishes and pricing formulas
- [x] Gallery (Galerie) - Photo gallery with filters (Ambiance/Plats/Équipe) and lightbox
- [x] Reservations - Calendar date picker, time slots, guest count, form submission
- [x] Admin Login - JWT authentication with bcrypt
- [x] Admin Dashboard - Weekly menu editor, Reservations management

### Backend API
- [x] Auth: /api/auth/register, /api/auth/login, /api/auth/me
- [x] Weekly Menu: /api/weekly-menu (GET active), /api/weekly-menu/all (admin), CRUD
- [x] Reservations: /api/reservations (POST public, GET admin), status update, delete
- [x] Settings: /api/settings (GET/PUT)

### Features
- [x] Language switcher (FR/EN/PT) in navbar
- [x] Responsive mobile navigation
- [x] Gallery lightbox with prev/next navigation
- [x] Calendar-based reservation system
- [x] Admin menu editor with dish categories
- [x] Reservation status management (pending/confirmed/cancelled)

## Prioritized Backlog

### P0 (Critical) - DONE
- ✅ Core pages and navigation
- ✅ Weekly menu system
- ✅ Reservation system
- ✅ Admin authentication
- ✅ Multi-language support

### P1 (High Priority) - NEXT
- [ ] Email notifications for reservations (integrate Resend/SendGrid)
- [ ] WhatsApp integration for reservations
- [ ] Image upload for admin (currently URL-based)
- [ ] Site settings editor in admin (hours, address, phone)

### P2 (Medium Priority)
- [ ] Reservation confirmation emails
- [ ] Newsletter subscription
- [ ] Google Maps integration
- [ ] SEO optimization (meta tags, sitemap)

### P3 (Nice to Have)
- [ ] PDF menu download
- [ ] Social media links
- [ ] Customer reviews section
- [ ] Online payment for reservations

## Next Tasks
1. Integrate email service for reservation notifications
2. Add WhatsApp button for direct reservations
3. Implement image upload system for admin
4. Add site settings editor in admin dashboard
