import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, UtensilsCrossed, Leaf, Fish, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Menu = () => {
  const { language, getLocalizedField } = useLanguage();
  const [menuItems, setMenuItems] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

  const content = {
    fr: {
      title: 'Notre Carte',
      subtitle: 'Menu Complet',
      weekly_title: 'Menu',
      weekly_title_midi: 'midi',
      weekly_title_end: 'de la Semaine',
      weekly_subtitle: 'Nos créations de la semaine',
      reserve_cta: 'Réserver une Table',
      price_note: 'Les prix sont en euros, service compris.',
      click_to_expand: 'Cliquez pour voir les détails',
      categories: {
        starters: 'Entrées',
        mains: 'Plats Principaux',
        seafood: 'Poissons & Fruits de Mer',
        desserts: 'Desserts',
        drinks: 'Boissons'
      },
      dishCategories: {
        meat: 'Viande',
        vegetarian: 'Végétarien',
        seafood: 'Poisson / Fruits de Mer',
        dessert: 'Dessert'
      },
      formulas: 'Nos Formules',
      formula_full: 'Entrée + Plat + Dessert',
      formula_entree_plat: 'Entrée + Plat',
      formula_plat_dessert: 'Plat + Dessert',
      formula_plat_only: 'Plat Seul'
    },
    en: {
      title: 'Our Menu',
      subtitle: 'Full Menu',
      weekly_title: 'Menu',
      weekly_title_midi: 'midi',
      weekly_title_end: 'of the Week',
      weekly_subtitle: 'Our creations of the week',
      reserve_cta: 'Book a Table',
      price_note: 'Prices are in euros, service included.',
      click_to_expand: 'Click to see details',
      categories: {
        starters: 'Starters',
        mains: 'Main Courses',
        seafood: 'Fish & Seafood',
        desserts: 'Desserts',
        drinks: 'Drinks'
      },
      dishCategories: {
        meat: 'Meat',
        vegetarian: 'Vegetarian',
        seafood: 'Fish / Seafood',
        dessert: 'Dessert'
      },
      formulas: 'Our Formulas',
      formula_full: 'Starter + Main + Dessert',
      formula_entree_plat: 'Starter + Main',
      formula_plat_dessert: 'Main + Dessert',
      formula_plat_only: 'Main Only'
    },
    pt: {
      title: 'Nosso Cardápio',
      subtitle: 'Menu Completo',
      weekly_title: 'Menu',
      weekly_title_midi: 'midi',
      weekly_title_end: 'da Semana',
      weekly_subtitle: 'Nossas criações da semana',
      reserve_cta: 'Reservar uma Mesa',
      price_note: 'Preços em euros, serviço incluído.',
      click_to_expand: 'Clique para ver detalhes',
      categories: {
        starters: 'Entradas',
        mains: 'Pratos Principais',
        seafood: 'Peixes & Frutos do Mar',
        desserts: 'Sobremesas',
        drinks: 'Bebidas'
      },
      dishCategories: {
        meat: 'Carne',
        vegetarian: 'Vegetariano',
        seafood: 'Peixe / Frutos do Mar',
        dessert: 'Sobremesa'
      },
      formulas: 'Nossas Fórmulas',
      formula_full: 'Entrada + Prato + Sobremesa',
      formula_entree_plat: 'Entrada + Prato',
      formula_plat_dessert: 'Prato + Sobremesa',
      formula_plat_only: 'Prato Apenas'
    }
  };

  const c = content[language];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuItemsRes, weeklyMenuRes] = await Promise.all([
          axios.get(`${API}/menu-items`),
          axios.get(`${API}/weekly-menu`)
        ]);
        setMenuItems(menuItemsRes.data || []);
        setWeeklyMenu(weeklyMenuRes.data);
      } catch (error) {
        console.log('Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meat': return <UtensilsCrossed className="w-5 h-5" />;
      case 'vegetarian': return <Leaf className="w-5 h-5" />;
      case 'seafood': return <Fish className="w-5 h-5" />;
      default: return null;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'long' });
  };

  const toggleExpand = (itemId) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const categoryOrder = ['starters', 'mains', 'seafood', 'desserts', 'drinks'];

  const mainDishes = weeklyMenu?.dishes?.filter(d => ['meat', 'vegetarian', 'seafood'].includes(d.category)) || [];
  const desserts = weeklyMenu?.dishes?.filter(d => d.category === 'dessert') || [];

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="menu-page">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
            alt="BÉNI Menu"
            className="w-full h-full object-cover opacity-30"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-4">
              {c.subtitle}
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-white" data-testid="menu-title">
              {c.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Weekly Menu Section */}
      {weeklyMenu && (mainDishes.length > 0 || desserts.length > 0) && (
        <section className="py-16 px-6 md:px-12 bg-[#121212]" data-testid="weekly-menu-section">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-4">
                {c.weekly_subtitle}
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-4">
                {c.weekly_title} <span className="font-accent italic text-[#d4af37]">{c.weekly_title_midi}</span> {c.weekly_title_end}
              </h2>
              <div className="flex items-center justify-center gap-2 text-white/60">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {formatDate(weeklyMenu.week_start)} - {formatDate(weeklyMenu.week_end)}
                </span>
              </div>
            </motion.div>

            {/* Main Dishes */}
            {mainDishes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {mainDishes.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="group cursor-pointer"
                    onClick={() => dish.image_url && toggleExpand(`weekly-${dish.id}`)}
                    data-testid={`weekly-dish-${dish.category}`}
                  >
                    <div className="bg-[#0a0a0a] border border-white/10 overflow-hidden hover:border-[#d4af37]/50 transition-all duration-500">
                      {/* Only show image container if there's an image */}
                      {dish.image_url && (
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={dish.image_url}
                            alt={getLocalizedField(dish, 'name')}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                          <div className="absolute bottom-4 right-4 text-white/50 text-xs flex items-center gap-1">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[#d4af37]">{getCategoryIcon(dish.category)}</span>
                          <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                            {c.dishCategories[dish.category]}
                          </p>
                        </div>
                        <h3 className="font-display text-xl text-white mb-2">
                          {getLocalizedField(dish, 'name')}
                        </h3>
                        {getLocalizedField(dish, 'description') && (
                          <p className="text-white/50 text-sm line-clamp-2">
                            {getLocalizedField(dish, 'description')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expanded View */}
                    <AnimatePresence>
                      {expandedItem === `weekly-${dish.id}` && dish.image_url && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[#0a0a0a] border border-[#d4af37]/30 border-t-0 overflow-hidden"
                        >
                          <div className="p-6">
                            <img
                              src={dish.image_url}
                              alt={getLocalizedField(dish, 'name')}
                              className="w-full h-64 object-cover mb-4"
                            />
                            <p className="text-white/70 text-sm leading-relaxed">
                              {getLocalizedField(dish, 'description')}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Desserts */}
            {desserts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
                {desserts.map((dish, index) => (
                  <motion.div
                    key={dish.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-[#0a0a0a] border border-white/10 p-6 hover:border-[#d4af37]/50 transition-all"
                    data-testid={`weekly-dessert-${index}`}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[#d4af37] mb-2">
                      {c.dishCategories.dessert}
                    </p>
                    <h3 className="font-display text-lg text-white mb-1">
                      {getLocalizedField(dish, 'name')}
                    </h3>
                    {getLocalizedField(dish, 'description') && (
                      <p className="text-white/50 text-sm">
                        {getLocalizedField(dish, 'description')}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-[#0a0a0a] border border-[#d4af37]/30 p-8"
            >
              <h3 className="text-center text-white font-display text-2xl mb-8">{c.formulas}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-[#d4af37]/10 border border-[#d4af37]">
                  <p className="text-[#d4af37] font-display text-3xl mb-1">
                    {weeklyMenu.price_full?.toFixed(2).replace('.', ',')}€
                  </p>
                  <p className="text-white/70 text-xs uppercase tracking-wider">{c.formula_full}</p>
                </div>
                <div className="text-center p-4 border border-white/10">
                  <p className="text-white font-display text-2xl mb-1">
                    {weeklyMenu.price_entree_plat?.toFixed(2).replace('.', ',')}€
                  </p>
                  <p className="text-white/50 text-xs uppercase tracking-wider">{c.formula_entree_plat}</p>
                </div>
                <div className="text-center p-4 border border-white/10">
                  <p className="text-white font-display text-2xl mb-1">
                    {weeklyMenu.price_plat_dessert?.toFixed(2).replace('.', ',')}€
                  </p>
                  <p className="text-white/50 text-xs uppercase tracking-wider">{c.formula_plat_dessert}</p>
                </div>
                <div className="text-center p-4 border border-white/10">
                  <p className="text-white font-display text-2xl mb-1">
                    {weeklyMenu.price_plat_only?.toFixed(2).replace('.', ',')}€
                  </p>
                  <p className="text-white/50 text-xs uppercase tracking-wider">{c.formula_plat_only}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Divider */}
      <div className="py-8 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
        </div>
      </div>

      {/* Full Menu Sections */}
      {loading ? (
        <div className="py-24 text-center">
          <p className="text-white/50">Chargement...</p>
        </div>
      ) : (
        categoryOrder.map((category, categoryIndex) => {
          const items = menuItems.filter(item => item.category === category && item.is_available !== false);
          if (items.length === 0) return null;

          return (
            <section 
              key={category}
              className={`py-16 px-6 md:px-12 ${categoryIndex % 2 === 1 ? 'bg-[#121212]' : ''}`}
              data-testid={`menu-section-${category}`}
            >
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="font-display text-3xl text-[#d4af37] text-center mb-12">
                    {c.categories[category]}
                  </h2>

                  <div className="space-y-4">
                    {items.map((item, index) => {
                      const isExpanded = expandedItem === item.id;
                      const hasImage = !!item.image_url;
                      
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="group"
                          data-testid={`menu-item-${category}-${index}`}
                        >
                          {/* Item Row */}
                          <div 
                            className={`flex justify-between items-center p-4 border border-white/10 transition-all duration-300 ${
                              hasImage ? 'cursor-pointer hover:border-[#d4af37]/50' : ''
                            } ${isExpanded ? 'border-[#d4af37]/50 bg-white/5' : ''}`}
                            onClick={() => hasImage && toggleExpand(item.id)}
                          >
                            <div className="flex-1 pr-4">
                              <div className="flex items-center gap-3">
                                <h3 className="font-display text-xl text-white group-hover:text-[#d4af37] transition-colors">
                                  {getLocalizedField(item, 'name')}
                                </h3>
                                {hasImage && (
                                  <ChevronDown className={`w-4 h-4 text-[#d4af37] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                )}
                              </div>
                              {!isExpanded && getLocalizedField(item, 'description') && (
                                <p className="text-white/50 text-sm mt-1 line-clamp-1">
                                  {getLocalizedField(item, 'description')}
                                </p>
                              )}
                            </div>
                            <div className="text-[#d4af37] font-display text-xl whitespace-nowrap">
                              {typeof item.price === 'number' ? item.price.toFixed(2).replace('.', ',') : item.price}€
                            </div>
                          </div>

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 bg-[#0a0a0a] border border-t-0 border-[#d4af37]/30">
                                  <div className="flex flex-col md:flex-row gap-6">
                                    {/* Image with zoom transition */}
                                    {item.image_url && (
                                      <motion.div 
                                        className="md:w-1/2 overflow-hidden"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                      >
                        <motion.img
                                          src={item.image_url}
                                          alt={getLocalizedField(item, 'name')}
                                          className="w-full h-64 object-cover"
                                          loading="lazy"
                                          initial={{ scale: 1.2 }}
                                          animate={{ scale: 1 }}
                                          transition={{ duration: 0.7, ease: "easeOut" }}
                                        />
                                      </motion.div>
                                    )}
                                    {/* Description */}
                                    <motion.div 
                                      className={item.image_url ? 'md:w-1/2' : 'w-full'}
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.4, delay: 0.2 }}
                                    >
                                      <h4 className="font-display text-2xl text-white mb-4">
                                        {getLocalizedField(item, 'name')}
                                      </h4>
                                      {getLocalizedField(item, 'description') && (
                                        <p className="text-white/70 leading-relaxed">
                                          {getLocalizedField(item, 'description')}
                                        </p>
                                      )}
                                      <p className="text-[#d4af37] font-display text-3xl mt-6">
                                        {typeof item.price === 'number' ? item.price.toFixed(2).replace('.', ',') : item.price}€
                                      </p>
                                    </motion.div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })
      )}

      {/* Show message if no menu items */}
      {!loading && menuItems.length === 0 && (
        <section className="py-16 px-6 md:px-12 text-center">
          <p className="text-white/50">
            {language === 'fr' ? 'Le menu sera bientôt disponible.' : 
             language === 'en' ? 'Menu coming soon.' : 
             'Menu em breve disponível.'}
          </p>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="py-20 px-6 md:px-12 text-center">
        <p className="text-white/50 text-sm mb-6">
          {c.price_note}
        </p>
        <Link
          to="/reservations"
          className="inline-flex items-center gap-3 bg-[#d4af37] text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300"
          data-testid="menu-reserve-cta"
        >
          {c.reserve_cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </main>
  );
};

export default Menu;
