import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const { t } = useLanguage();
  const [siteContent, setSiteContent] = useState(null);

  useEffect(() => {
    fetchSiteContent();
  }, []);

  const fetchSiteContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setSiteContent(response.data);
    } catch (error) {
      console.error('Error fetching site content:', error);
    }
  };

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  // Default images as fallback
  const heroImage = siteContent?.hero_image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80';
  const aboutImage1 = siteContent?.about_image_1 || 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&q=80';
  const aboutImage2 = siteContent?.about_image_2 || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80';
  const aboutImage3 = siteContent?.about_image_3 || 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80';
  const reservationBgImage = siteContent?.reservation_bg_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80';
  const bgHome = siteContent?.bg_home || '';

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative" data-testid="home-page">
      {/* Optional Page Background */}
      {bgHome && (
        <div className="fixed inset-0 z-0">
          <img src={bgHome} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#0a0a0a]/80" />
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="BÉNI Restaurant Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/40 to-[#0a0a0a]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-6" data-testid="hero-label">
              Restaurant · Luxembourg
            </p>
            <h1 
              className="font-display text-6xl md:text-8xl lg:text-9xl font-medium tracking-tight text-white mb-6"
              data-testid="hero-title"
            >
              BÉNI
            </h1>
            <p className="font-accent text-xl md:text-2xl italic text-white/80 mb-12" data-testid="hero-tagline">
              {t('hero_tagline')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/menu"
              className="bg-[#d4af37] text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300"
              data-testid="hero-discover-btn"
            >
              {t('hero_discover')}
            </Link>
            <Link
              to="/reservations"
              className="border border-white/30 text-white px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:border-[#d4af37] hover:text-[#d4af37] transition-all duration-300"
              data-testid="hero-reserve-btn"
            >
              {t('hero_reserve')}
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/50 hover:text-[#d4af37] transition-colors"
          data-testid="scroll-indicator"
        >
          <ChevronDown className="w-8 h-8 animate-bounce" />
        </motion.button>
      </section>

      {/* About Section */}
      <section className="py-24 md:py-32 px-6 md:px-12" data-testid="about-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                  {t('about_subtitle')}
                </p>
                <h2 className="font-display text-4xl md:text-5xl text-white leading-tight" data-testid="about-title">
                  {t('about_title')}
                </h2>
              </div>
              
              <p className="text-white/70 text-lg leading-relaxed">
                {t('about_chef_intro')} <span className="text-[#d4af37] font-medium">{t('about_chef_name')}</span> {t('about_chef_text')}
              </p>

              <blockquote className="border-l-2 border-[#d4af37] pl-6 py-2">
                <p className="font-accent text-xl italic text-white/60" data-testid="about-quote">
                  {t('about_quote')}
                </p>
              </blockquote>

              <Link
                to="/about"
                className="inline-flex items-center gap-3 text-[#d4af37] text-sm uppercase tracking-[0.15em] hover:gap-5 transition-all duration-300"
                data-testid="about-cta"
              >
                {t('about_cta')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-4">
                <img
                  src={aboutImage1}
                  alt="Chef cooking"
                  className="w-full h-48 object-cover"
                  data-testid="about-image-1"
                />
                <img
                  src={aboutImage2}
                  alt="Gourmet dish"
                  className="w-full h-64 object-cover"
                  data-testid="about-image-2"
                />
              </div>
              <div className="pt-8">
                <img
                  src={aboutImage3}
                  alt="Restaurant ambiance"
                  className="w-full h-80 object-cover"
                  data-testid="about-image-3"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reservation CTA Section */}
      <section className="relative py-32 px-6 md:px-12" data-testid="reservation-cta-section">
        <div className="absolute inset-0">
          <img
            src={reservationBgImage}
            alt="Restaurant atmosphere"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0a0a0a]/80" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-4">
            {t('reservations_subtitle')}
          </p>
          <h2 className="font-display text-4xl md:text-6xl text-white mb-8" data-testid="reservation-cta-title">
            {t('reservations_title')}
          </h2>
          <Link
            to="/reservations"
            className="inline-flex items-center gap-3 bg-[#d4af37] text-black px-12 py-5 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300"
            data-testid="reservation-cta-btn"
          >
            {t('hero_reserve')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </main>
  );
};

export default Home;
