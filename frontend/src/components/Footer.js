import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-[#0a0a0a] border-t border-white/5" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="font-display text-3xl tracking-wider text-white" data-testid="footer-logo">
              BÉNI
            </Link>
            <p className="font-accent text-lg italic text-[#d4af37]">
              Food is Life
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              {t('about_quote').slice(1, 100)}...
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">{t('contact_title')}</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                <span className="text-white/70 text-sm" data-testid="footer-address">
                  22 Rue de l'industrie<br />
                  L 8399 Windhof
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <a 
                  href="tel:+352661250004" 
                  className="text-white/70 text-sm hover:text-[#d4af37] transition-colors"
                  data-testid="footer-phone"
                >
                  +352 661 250 004
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d4af37] flex-shrink-0" />
                <a 
                  href="mailto:beniluxembourg@gmail.com" 
                  className="text-white/70 text-sm hover:text-[#d4af37] transition-colors"
                  data-testid="footer-email"
                >
                  beniluxembourg@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">{t('contact_hours')}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" />
                <div className="text-white/70 text-sm space-y-2" data-testid="footer-hours">
                  <p><span className="text-white">Lun - Sam:</span> 11h30 - 14h30</p>
                  <p><span className="text-white">Jeu - Sam:</span> 17h00 - 22h00</p>
                  <p><span className="text-white/50">Dimanche:</span> Fermé</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">Navigation</h4>
            <div className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="text-white/70 text-sm hover:text-[#d4af37] transition-colors"
                data-testid="footer-link-home"
              >
                {t('nav_home')}
              </Link>
              <Link 
                to="/weekly-menu" 
                className="text-white/70 text-sm hover:text-[#d4af37] transition-colors"
                data-testid="footer-link-weekly-menu"
              >
                {t('nav_weekly_menu')}
              </Link>
              <Link 
                to="/reservations" 
                className="text-white/70 text-sm hover:text-[#d4af37] transition-colors"
                data-testid="footer-link-reservations"
              >
                {t('nav_reservations')}
              </Link>
              <Link 
                to="/admin/login" 
                className="text-white/50 text-sm hover:text-[#d4af37] transition-colors"
                data-testid="footer-link-admin"
              >
                {t('nav_admin')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-xs uppercase tracking-widest" data-testid="footer-copyright">
            © {currentYear} BÉNI. {t('footer_rights')}.
          </p>
          <p className="text-white/30 text-xs">
            {t('footer_created')} ♥
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
