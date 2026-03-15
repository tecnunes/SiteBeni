import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, UtensilsCrossed, Leaf, Fish } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WeeklyMenu = () => {
  const { t, getLocalizedField } = useLanguage();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`${API}/weekly-menu`);
        setMenu(response.data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meat':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'vegetarian':
        return <Leaf className="w-5 h-5" />;
      case 'seafood':
        return <Fish className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  const mainDishes = menu?.dishes?.filter(d => ['meat', 'vegetarian', 'seafood'].includes(d.category)) || [];
  const desserts = menu?.dishes?.filter(d => d.category === 'dessert') || [];

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="weekly-menu-page">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&q=80"
            alt="Food preparation"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-4" data-testid="weekly-menu-label">
              {t('weekly_menu_subtitle')}
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6" data-testid="weekly-menu-title">
              {t('weekly_menu_title')}
            </h1>
            {menu && (
              <div className="flex items-center justify-center gap-2 text-white/60">
                <Calendar className="w-4 h-4" />
                <span className="text-sm" data-testid="weekly-menu-dates">
                  {formatDate(menu.week_start)} - {formatDate(menu.week_end)}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {loading ? (
        <div className="py-24 text-center">
          <p className="text-white/50">{t('loading')}</p>
        </div>
      ) : menu ? (
        <>
          {/* Main Dishes Section */}
          <section className="py-16 px-6 md:px-12" data-testid="main-dishes-section">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2 className="font-display text-3xl text-white text-center mb-4">
                  {t('weekly_menu_plat')}
                </h2>
                <p className="text-white/50 text-center mb-12 text-sm">
                  {t('weekly_menu_meat')} · {t('weekly_menu_vegetarian')} · {t('weekly_menu_seafood')}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {mainDishes.map((dish, index) => (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      className="group"
                      data-testid={`main-dish-${dish.category}`}
                    >
                      <div className="bg-[#121212] border border-white/10 overflow-hidden hover:border-[#d4af37]/50 transition-all duration-500">
                        {dish.image_url ? (
                          <div className="relative h-56 overflow-hidden">
                            <img
                              src={dish.image_url}
                              alt={getLocalizedField(dish, 'name')}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                          </div>
                        ) : (
                          <div className="h-56 bg-[#1a1a1a] flex items-center justify-center">
                            {getCategoryIcon(dish.category)}
                          </div>
                        )}
                        
                        <div className="p-8">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[#d4af37]">
                              {getCategoryIcon(dish.category)}
                            </span>
                            <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                              {t(`weekly_menu_${dish.category}`)}
                            </p>
                          </div>
                          
                          <h3 className="font-display text-2xl text-white mb-3">
                            {getLocalizedField(dish, 'name')}
                          </h3>
                          
                          {getLocalizedField(dish, 'description') && (
                            <p className="text-white/50 text-sm leading-relaxed">
                              {getLocalizedField(dish, 'description')}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Desserts Section */}
          {desserts.length > 0 && (
            <section className="py-16 px-6 md:px-12 bg-[#121212]" data-testid="desserts-section">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="font-display text-3xl text-white text-center mb-12">
                    {t('weekly_menu_dessert')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {desserts.map((dish, index) => (
                      <motion.div
                        key={dish.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                        className="group"
                        data-testid={`dessert-${index}`}
                      >
                        <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-[#d4af37]/50 transition-all duration-500">
                          {dish.image_url && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={dish.image_url}
                                alt={getLocalizedField(dish, 'name')}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                            </div>
                          )}
                          
                          <div className="p-6">
                            <h3 className="font-display text-xl text-white mb-2">
                              {getLocalizedField(dish, 'name')}
                            </h3>
                            {getLocalizedField(dish, 'description') && (
                              <p className="text-white/50 text-sm">
                                {getLocalizedField(dish, 'description')}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* Pricing Section */}
          <section className="py-24 px-6 md:px-12" data-testid="pricing-section">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="font-display text-3xl text-white text-center mb-4">
                  {t('weekly_menu_formulas')}
                </h2>
                <p className="text-white/50 text-center mb-12 text-sm">
                  Choisissez votre formule
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Full Formula */}
                  <div 
                    className="bg-[#d4af37]/10 border-2 border-[#d4af37] p-8 text-center"
                    data-testid="formula-full"
                  >
                    <p className="font-display text-4xl text-[#d4af37] mb-2">
                      {menu.price_full?.toFixed(2).replace('.', ',')}€
                    </p>
                    <p className="text-white/80 text-sm uppercase tracking-wider">
                      {t('weekly_menu_full')}
                    </p>
                  </div>

                  {/* Entrée + Plat */}
                  <div 
                    className="bg-white/5 border border-white/10 p-8 text-center hover:border-[#d4af37]/30 transition-colors"
                    data-testid="formula-entree-plat"
                  >
                    <p className="font-display text-3xl text-white mb-2">
                      {menu.price_entree_plat?.toFixed(2).replace('.', ',')}€
                    </p>
                    <p className="text-white/60 text-sm uppercase tracking-wider">
                      {t('weekly_menu_entree_plat')}
                    </p>
                  </div>

                  {/* Plat + Dessert */}
                  <div 
                    className="bg-white/5 border border-white/10 p-8 text-center hover:border-[#d4af37]/30 transition-colors"
                    data-testid="formula-plat-dessert"
                  >
                    <p className="font-display text-3xl text-white mb-2">
                      {menu.price_plat_dessert?.toFixed(2).replace('.', ',')}€
                    </p>
                    <p className="text-white/60 text-sm uppercase tracking-wider">
                      {t('weekly_menu_plat_dessert')}
                    </p>
                  </div>

                  {/* Plat Only */}
                  <div 
                    className="bg-white/5 border border-white/10 p-8 text-center hover:border-[#d4af37]/30 transition-colors"
                    data-testid="formula-plat-only"
                  >
                    <p className="font-display text-3xl text-white mb-2">
                      {menu.price_plat_only?.toFixed(2).replace('.', ',')}€
                    </p>
                    <p className="text-white/60 text-sm uppercase tracking-wider">
                      {t('weekly_menu_plat_only')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      ) : (
        <div className="py-24 text-center" data-testid="no-menu-message">
          <p className="text-white/50 text-lg">Aucun menu disponible cette semaine.</p>
          <p className="text-white/30 text-sm mt-2">Revenez bientôt !</p>
        </div>
      )}
    </main>
  );
};

export default WeeklyMenu;
