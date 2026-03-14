import React, { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  fr: {
    // Navigation
    nav_home: 'Accueil',
    nav_weekly_menu: 'Menu de la Semaine',
    nav_reservations: 'Réservations',
    nav_contact: 'Contact',
    nav_admin: 'Admin',
    
    // Hero
    hero_tagline: 'Food is Life',
    hero_discover: 'Découvrir',
    hero_reserve: 'Réserver',
    
    // About
    about_title: 'Notre Histoire',
    about_subtitle: 'Derrière la Gastronomie',
    about_chef_intro: 'Plus de 11 ans de cuisine professionnelle de haut niveau et une passion pour la cuisine et la pêche,',
    about_chef_name: 'Stephano Crupi',
    about_chef_text: 'a le défi de ravir les palais avec légèreté, qualité et amour. Une gastronomie axée sur le plaisir, mais aussi sur le réconfort de votre appétit.',
    about_quote: '"Cuisiner, c\'est comme tisser un délicat manteau d\'arômes, de couleurs, de saveurs, de textures. Un manteau divin qui reposera sur le palais de quelqu\'un de toujours spécial."',
    about_cta: 'En Savoir Plus',
    
    // Weekly Menu
    weekly_menu_title: 'Menu de la Semaine',
    weekly_menu_subtitle: 'Nos créations de la semaine',
    weekly_menu_entree: 'Entrée',
    weekly_menu_plat: 'Plat',
    weekly_menu_dessert: 'Dessert',
    weekly_menu_meat: 'Viande',
    weekly_menu_vegetarian: 'Végétarien',
    weekly_menu_seafood: 'Poisson / Fruits de Mer',
    weekly_menu_formulas: 'Nos Formules',
    weekly_menu_full: 'Entrée + Plat + Dessert',
    weekly_menu_entree_plat: 'Entrée + Plat',
    weekly_menu_plat_dessert: 'Plat + Dessert',
    weekly_menu_plat_only: 'Plat Seul',
    
    // Reservations
    reservations_title: 'Réservations',
    reservations_subtitle: 'Réservez votre table',
    reservations_name: 'Nom complet',
    reservations_email: 'Email',
    reservations_phone: 'Téléphone',
    reservations_date: 'Date',
    reservations_time: 'Heure',
    reservations_guests: 'Nombre de personnes',
    reservations_notes: 'Notes spéciales',
    reservations_submit: 'Réserver',
    reservations_success: 'Réservation envoyée avec succès!',
    reservations_error: 'Erreur lors de la réservation',
    
    // Contact
    contact_title: 'Contact',
    contact_address: 'Adresse',
    contact_phone: 'Téléphone',
    contact_email: 'Email',
    contact_hours: 'Horaires',
    
    // Footer
    footer_rights: 'Tous droits réservés',
    footer_created: 'Créé avec passion',
    
    // Admin
    admin_login: 'Connexion Admin',
    admin_email: 'Email',
    admin_password: 'Mot de passe',
    admin_signin: 'Se Connecter',
    admin_register: 'Créer un compte',
    admin_dashboard: 'Tableau de Bord',
    admin_weekly_menu: 'Menu de la Semaine',
    admin_reservations: 'Réservations',
    admin_settings: 'Paramètres',
    admin_logout: 'Déconnexion',
    admin_save: 'Enregistrer',
    admin_cancel: 'Annuler',
    admin_edit: 'Modifier',
    admin_delete: 'Supprimer',
    admin_add: 'Ajouter',
    admin_name: 'Nom',
    
    // General
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
  },
  en: {
    // Navigation
    nav_home: 'Home',
    nav_weekly_menu: 'Weekly Menu',
    nav_reservations: 'Reservations',
    nav_contact: 'Contact',
    nav_admin: 'Admin',
    
    // Hero
    hero_tagline: 'Food is Life',
    hero_discover: 'Discover',
    hero_reserve: 'Reserve',
    
    // About
    about_title: 'Our History',
    about_subtitle: 'Behind the Gastronomy',
    about_chef_intro: 'Over 11 years of high-level professional cuisine and a passion for cooking and fishing,',
    about_chef_name: 'Stephano Crupi',
    about_chef_text: 'has the challenge of delighting palates with lightness, quality and love. A gastronomy focused on pleasing, but also on embracing your appetite.',
    about_quote: '"Cooking is like weaving a delicate cloak of aromas, colors, flavors, textures. A divine cloak that will lie on the palate of someone always special."',
    about_cta: 'Know More',
    
    // Weekly Menu
    weekly_menu_title: 'Weekly Menu',
    weekly_menu_subtitle: 'Our creations of the week',
    weekly_menu_entree: 'Starter',
    weekly_menu_plat: 'Main',
    weekly_menu_dessert: 'Dessert',
    weekly_menu_meat: 'Meat',
    weekly_menu_vegetarian: 'Vegetarian',
    weekly_menu_seafood: 'Fish / Seafood',
    weekly_menu_formulas: 'Our Formulas',
    weekly_menu_full: 'Starter + Main + Dessert',
    weekly_menu_entree_plat: 'Starter + Main',
    weekly_menu_plat_dessert: 'Main + Dessert',
    weekly_menu_plat_only: 'Main Only',
    
    // Reservations
    reservations_title: 'Reservations',
    reservations_subtitle: 'Book your table',
    reservations_name: 'Full name',
    reservations_email: 'Email',
    reservations_phone: 'Phone',
    reservations_date: 'Date',
    reservations_time: 'Time',
    reservations_guests: 'Number of guests',
    reservations_notes: 'Special notes',
    reservations_submit: 'Reserve',
    reservations_success: 'Reservation submitted successfully!',
    reservations_error: 'Error submitting reservation',
    
    // Contact
    contact_title: 'Contact',
    contact_address: 'Address',
    contact_phone: 'Phone',
    contact_email: 'Email',
    contact_hours: 'Hours',
    
    // Footer
    footer_rights: 'All rights reserved',
    footer_created: 'Created with passion',
    
    // Admin
    admin_login: 'Admin Login',
    admin_email: 'Email',
    admin_password: 'Password',
    admin_signin: 'Sign In',
    admin_register: 'Create Account',
    admin_dashboard: 'Dashboard',
    admin_weekly_menu: 'Weekly Menu',
    admin_reservations: 'Reservations',
    admin_settings: 'Settings',
    admin_logout: 'Logout',
    admin_save: 'Save',
    admin_cancel: 'Cancel',
    admin_edit: 'Edit',
    admin_delete: 'Delete',
    admin_add: 'Add',
    admin_name: 'Name',
    
    // General
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  pt: {
    // Navigation
    nav_home: 'Início',
    nav_weekly_menu: 'Menu da Semana',
    nav_reservations: 'Reservas',
    nav_contact: 'Contato',
    nav_admin: 'Admin',
    
    // Hero
    hero_tagline: 'Comida é Vida',
    hero_discover: 'Descobrir',
    hero_reserve: 'Reservar',
    
    // About
    about_title: 'Nossa História',
    about_subtitle: 'Por Trás da Gastronomia',
    about_chef_intro: 'Mais de 11 anos de cozinha profissional de alto nível e paixão por cozinhar e pescar,',
    about_chef_name: 'Stephano Crupi',
    about_chef_text: 'tem o desafio de encantar paladares com leveza, qualidade e amor. Uma gastronomia focada em agradar, mas também em abraçar seu apetite.',
    about_quote: '"Cozinhar é como tecer um delicado manto de aromas, cores, sabores, texturas. Um manto divino que repousará no paladar de alguém sempre especial."',
    about_cta: 'Saiba Mais',
    
    // Weekly Menu
    weekly_menu_title: 'Menu da Semana',
    weekly_menu_subtitle: 'Nossas criações da semana',
    weekly_menu_entree: 'Entrada',
    weekly_menu_plat: 'Prato',
    weekly_menu_dessert: 'Sobremesa',
    weekly_menu_meat: 'Carne',
    weekly_menu_vegetarian: 'Vegetariano',
    weekly_menu_seafood: 'Peixe / Frutos do Mar',
    weekly_menu_formulas: 'Nossas Fórmulas',
    weekly_menu_full: 'Entrada + Prato + Sobremesa',
    weekly_menu_entree_plat: 'Entrada + Prato',
    weekly_menu_plat_dessert: 'Prato + Sobremesa',
    weekly_menu_plat_only: 'Prato Apenas',
    
    // Reservations
    reservations_title: 'Reservas',
    reservations_subtitle: 'Reserve sua mesa',
    reservations_name: 'Nome completo',
    reservations_email: 'Email',
    reservations_phone: 'Telefone',
    reservations_date: 'Data',
    reservations_time: 'Hora',
    reservations_guests: 'Número de pessoas',
    reservations_notes: 'Notas especiais',
    reservations_submit: 'Reservar',
    reservations_success: 'Reserva enviada com sucesso!',
    reservations_error: 'Erro ao enviar reserva',
    
    // Contact
    contact_title: 'Contato',
    contact_address: 'Endereço',
    contact_phone: 'Telefone',
    contact_email: 'Email',
    contact_hours: 'Horários',
    
    // Footer
    footer_rights: 'Todos os direitos reservados',
    footer_created: 'Criado com paixão',
    
    // Admin
    admin_login: 'Login Admin',
    admin_email: 'Email',
    admin_password: 'Senha',
    admin_signin: 'Entrar',
    admin_register: 'Criar Conta',
    admin_dashboard: 'Painel',
    admin_weekly_menu: 'Menu da Semana',
    admin_reservations: 'Reservas',
    admin_settings: 'Configurações',
    admin_logout: 'Sair',
    admin_save: 'Salvar',
    admin_cancel: 'Cancelar',
    admin_edit: 'Editar',
    admin_delete: 'Excluir',
    admin_add: 'Adicionar',
    admin_name: 'Nome',
    
    // General
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');

  const t = useCallback((key) => {
    return translations[language][key] || key;
  }, [language]);

  const getLocalizedField = useCallback((obj, field) => {
    if (!obj) return '';
    const localizedField = `${field}_${language}`;
    return obj[localizedField] || obj[`${field}_fr`] || obj[field] || '';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, getLocalizedField }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
