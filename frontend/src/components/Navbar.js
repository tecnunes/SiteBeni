import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: t('nav_home') },
    { to: '/about', label: t('nav_about') },
    { to: '/menu', label: t('nav_menu') },
    { to: '/weekly-menu', label: t('nav_weekly_menu') },
    { to: '/gallery', label: t('nav_gallery') },
    { to: '/reservations', label: t('nav_reservations') },
  ];

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'pt', label: 'Português' },
  ];

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-lg border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-display text-2xl md:text-3xl tracking-wider text-white hover:text-[#d4af37] transition-colors"
            data-testid="navbar-logo"
          >
            BÉNI
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                data-testid={`nav-link-${link.to.replace(/[/#]/g, '') || 'home'}`}
                className={`text-xs uppercase tracking-[0.2em] transition-colors duration-300 ${
                  location.pathname === link.to
                    ? 'text-[#d4af37]'
                    : 'text-white/70 hover:text-[#d4af37]'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:text-[#d4af37] transition-colors"
                data-testid="language-selector-trigger"
              >
                <Globe className="w-4 h-4" />
                {language.toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#121212] border-white/10">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    data-testid={`language-option-${lang.code}`}
                    className={`cursor-pointer ${
                      language === lang.code ? 'text-[#d4af37]' : 'text-white/70'
                    } hover:text-[#d4af37] hover:bg-white/5`}
                  >
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2"
            data-testid="mobile-menu-toggle"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a]/98 backdrop-blur-lg border-t border-white/5"
            data-testid="mobile-menu"
          >
            <div className="px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-testid={`mobile-nav-link-${link.to.replace(/[/#]/g, '') || 'home'}`}
                  className={`text-sm uppercase tracking-[0.15em] transition-colors ${
                    location.pathname === link.to
                      ? 'text-[#d4af37]'
                      : 'text-white/70 hover:text-[#d4af37]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Mobile Language Selector */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    data-testid={`mobile-language-${lang.code}`}
                    className={`text-xs uppercase tracking-[0.15em] transition-colors ${
                      language === lang.code ? 'text-[#d4af37]' : 'text-white/50 hover:text-[#d4af37]'
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
