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
- [x] Menu (Carte) - Full restaurant menu with prices + Weekly Menu section
- [x] Gallery (Galerie) - Photo gallery with filters (Ambiance/Plats/Équipe) and lightbox - **Dynamic from API**
- [x] Reservations - Calendar date picker, time slots, guest count, form submission
- [x] Admin Login - JWT authentication with bcrypt (single default admin)
- [x] Admin Dashboard - Weekly menu, Full menu (Cardápio), Gallery management, Site texts, Site images, Settings, Reservations, Users

### Backend API
- [x] Auth: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/admins
- [x] Weekly Menu: /api/weekly-menu (GET active), /api/weekly-menu/all (admin), CRUD
- [x] Menu Items: /api/menu-items (CRUD for full restaurant menu)
- [x] Reservations: /api/reservations (POST public, GET admin), status update, delete
- [x] Settings: /api/settings (GET/PUT)
- [x] Content: /api/content (GET/PUT for site texts and images)
- [x] Gallery: /api/gallery (GET/POST), /api/gallery/{id} (PUT/DELETE)
- [x] Upload: /api/upload (POST for image uploads)

### Features
- [x] Language switcher (FR/EN/PT) in navbar
- [x] Responsive mobile navigation
- [x] Gallery lightbox with prev/next navigation - **Dynamic content from database**
- [x] Calendar-based reservation system
- [x] Admin menu editor with dish categories
- [x] Admin full menu (Cardápio) management with image upload
- [x] Admin gallery management - Add/edit/delete images by category
- [x] Admin site content editor (texts + images)
- [x] Admin user management (create/delete admins)
- [x] Image upload functionality with drag & drop
- [x] Reservation status management (pending/confirmed/cancelled)

## Prioritized Backlog

### P0 (Critical) - DONE
- ✅ Core pages and navigation
- ✅ Weekly menu system
- ✅ Reservation system
- ✅ Admin authentication (single default admin)
- ✅ Multi-language support
- ✅ Full menu (Cardápio) CRUD in admin
- ✅ Site content editor (texts + images)
- ✅ Gallery management in admin (add/edit/delete images by category)
- ✅ Image upload system for admin
- ✅ User management in admin
- ✅ Deployment package (beni-restaurant.zip)

### P1 (High Priority) - NEXT
- [ ] Complete Reservation System with full calendar view
- [ ] Email notifications for reservations (integrate Resend/SendGrid)
- [ ] WhatsApp integration for reservations

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
1. Implement full reservation system with calendar view
2. Integrate email service for reservation notifications
3. Add WhatsApp button for direct reservations
