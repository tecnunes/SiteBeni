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
- [x] Home - Hero, About teaser, Reservation CTA (with optional page background)
- [x] About (Notre Histoire) - History, Chef info, Philosophy - **Images not cropped**
- [x] Menu (Carte) - Full restaurant menu with dynamic categories + Weekly Menu section
- [x] Gallery (Galerie) - Photo gallery with filters (dynamic from API)
- [x] Reservations - Calendar date picker, time slots, guest count
- [x] Admin Login - JWT authentication with bcrypt (single default admin)
- [x] Admin Dashboard - Complete management system

### Backend API
- [x] Auth: /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/admins
- [x] Weekly Menu: /api/weekly-menu (GET active), CRUD
- [x] Menu Items: /api/menu-items (CRUD for full restaurant menu)
- [x] **Menu Categories: /api/menu-categories (CRUD + reorder)**
- [x] Reservations: /api/reservations (POST public, GET admin), status update, delete
- [x] Settings: /api/settings (GET/PUT)
- [x] Content: /api/content (GET/PUT for site texts, images, and page backgrounds)
- [x] Gallery: /api/gallery (GET/POST), /api/gallery/{id} (PUT/DELETE)
- [x] Upload: /api/upload (POST for image uploads)

### Features Implemented
- [x] Language switcher (FR/EN/PT) in navbar
- [x] Responsive mobile navigation
- [x] **Scroll to top on page navigation**
- [x] Gallery lightbox with prev/next navigation
- [x] Calendar-based reservation system
- [x] **Admin menu editor - NO LIMIT on dishes per category**
- [x] **Admin dynamic menu categories - CRUD with drag & drop reorder**
- [x] Admin full menu (Cardápio) management with image upload
- [x] Admin gallery management - Add/edit/delete images by category
- [x] Admin site content editor (texts + images)
- [x] **Admin page background images - Optional per page**
- [x] Admin user management (create/delete admins)
- [x] Image upload functionality with drag & drop
- [x] Reservation status management (pending/confirmed/cancelled)

## Prioritized Backlog

### P0 (Critical) - DONE ✅
- ✅ Core pages and navigation
- ✅ Weekly menu system (unlimited dishes)
- ✅ Dynamic menu categories (CRUD + reorder)
- ✅ Reservation system
- ✅ Admin authentication (single default admin)
- ✅ Multi-language support
- ✅ Full menu (Cardápio) CRUD in admin
- ✅ Site content editor (texts + images + page backgrounds)
- ✅ Gallery management in admin
- ✅ Image upload system for admin
- ✅ User management in admin
- ✅ Deployment package (beni-restaurant.zip)
- ✅ Scroll to top on navigation
- ✅ Images not cropped in About page

### P1 (High Priority) - NEXT
- [ ] Complete Reservation System with full calendar view
- [ ] Email notifications for reservations (integrate Resend/SendGrid)
- [ ] WhatsApp integration for reservations

### P2 (Medium Priority) - DEFERRED
- [ ] Custom sections on Home page (admin editable)
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
1. Sistema completo de reservas com calendário visual
2. Integração de email para notificações de reservas
3. Integração WhatsApp para reservas

## Admin Credentials
- **Username:** admin
- **Password:** #Sti93qn06301616
