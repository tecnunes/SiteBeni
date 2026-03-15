import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Menu = () => {
  const { language, getLocalizedField } = useLanguage();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const content = {
    fr: {
      title: 'Notre Carte',
      subtitle: 'Menu Complet',
      weekly_cta: 'Voir le Menu de la Semaine',
      reserve_cta: 'Réserver une Table',
      price_note: 'Les prix sont en euros, service compris.',
      categories: {
        starters: 'Entrées',
        mains: 'Plats Principaux',
        seafood: 'Poissons & Fruits de Mer',
        desserts: 'Desserts',
        drinks: 'Boissons'
      }
    },
    en: {
      title: 'Our Menu',
      subtitle: 'Full Menu',
      weekly_cta: 'See Weekly Menu',
      reserve_cta: 'Book a Table',
      price_note: 'Prices are in euros, service included.',
      categories: {
        starters: 'Starters',
        mains: 'Main Courses',
        seafood: 'Fish & Seafood',
        desserts: 'Desserts',
        drinks: 'Drinks'
      }
    },
    pt: {
      title: 'Nosso Cardápio',
      subtitle: 'Menu Completo',
      weekly_cta: 'Ver Menu da Semana',
      reserve_cta: 'Reservar uma Mesa',
      price_note: 'Preços em euros, serviço incluído.',
      categories: {
        starters: 'Entradas',
        mains: 'Pratos Principais',
        seafood: 'Peixes & Frutos do Mar',
        desserts: 'Sobremesas',
        drinks: 'Bebidas'
      }
    }
  };

  const c = content[language];

  // Default menu items (fallback)
  const defaultMenuItems = {
    starters: [
      { name_fr: 'Carpaccio de Bœuf', name_en: 'Beef Carpaccio', name_pt: 'Carpaccio de Carne', price: 16.00, description_fr: 'Roquette, parmesan, câpres', description_en: 'Arugula, parmesan, capers', description_pt: 'Rúcula, parmesão, alcaparras' },
      { name_fr: 'Tartare de Saumon', name_en: 'Salmon Tartare', name_pt: 'Tartare de Salmão', price: 18.00, description_fr: 'Avocat, sésame, wasabi', description_en: 'Avocado, sesame, wasabi', description_pt: 'Abacate, gergelim, wasabi' },
      { name_fr: 'Soupe du Jour', name_en: 'Soup of the Day', name_pt: 'Sopa do Dia', price: 9.00, description_fr: 'Préparation maison', description_en: 'Homemade preparation', description_pt: 'Preparo caseiro' },
      { name_fr: 'Burrata Crémeuse', name_en: 'Creamy Burrata', name_pt: 'Burrata Cremosa', price: 15.00, description_fr: 'Tomates cerises, basilic, pesto', description_en: 'Cherry tomatoes, basil, pesto', description_pt: 'Tomates cereja, manjericão, pesto' },
    ],
    mains: [
      { name_fr: 'Filet de Bœuf', name_en: 'Beef Fillet', name_pt: 'Filé Mignon', price: 32.00, description_fr: 'Sauce au poivre, légumes de saison', description_en: 'Pepper sauce, seasonal vegetables', description_pt: 'Molho de pimenta, legumes da estação' },
      { name_fr: 'Magret de Canard', name_en: 'Duck Breast', name_pt: 'Magret de Pato', price: 28.00, description_fr: 'Sauce aux fruits rouges, purée', description_en: 'Red fruit sauce, mash', description_pt: 'Molho de frutas vermelhas, purê' },
      { name_fr: 'Risotto aux Champignons', name_en: 'Mushroom Risotto', name_pt: 'Risoto de Cogumelos', price: 22.00, description_fr: 'Champignons forestiers, parmesan', description_en: 'Forest mushrooms, parmesan', description_pt: 'Cogumelos da floresta, parmesão' },
    ],
    seafood: [
      { name_fr: 'Filet de Bar', name_en: 'Sea Bass Fillet', name_pt: 'Filé de Robalo', price: 28.00, description_fr: 'Beurre blanc, légumes grillés', description_en: 'White butter, grilled vegetables', description_pt: 'Manteiga branca, legumes grelhados' },
      { name_fr: 'Gambas à l\'Ail', name_en: 'Garlic Prawns', name_pt: 'Camarões ao Alho', price: 24.00, description_fr: 'Ail, persil, huile d\'olive', description_en: 'Garlic, parsley, olive oil', description_pt: 'Alho, salsa, azeite' },
    ],
    desserts: [
      { name_fr: 'Tiramisu Maison', name_en: 'Homemade Tiramisu', name_pt: 'Tiramisu Caseiro', price: 10.00, description_fr: 'Recette traditionnelle', description_en: 'Traditional recipe', description_pt: 'Receita tradicional' },
      { name_fr: 'Fondant au Chocolat', name_en: 'Chocolate Fondant', name_pt: 'Fondant de Chocolate', price: 11.00, description_fr: 'Cœur coulant, glace vanille', description_en: 'Molten center, vanilla ice cream', description_pt: 'Centro derretido, sorvete de baunilha' },
    ],
    drinks: [
      { name_fr: 'Vin Rouge (verre)', name_en: 'Red Wine (glass)', name_pt: 'Vinho Tinto (copo)', price: 7.00, description_fr: 'Sélection du sommelier', description_en: 'Sommelier selection', description_pt: 'Seleção do sommelier' },
      { name_fr: 'Champagne (coupe)', name_en: 'Champagne (glass)', name_pt: 'Champagne (taça)', price: 12.00, description_fr: 'Brut, Reims', description_en: 'Brut, Reims', description_pt: 'Brut, Reims' },
    ]
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${API}/menu-items`);
        if (response.data && response.data.length > 0) {
          setMenuItems(response.data);
        }
      } catch (error) {
        console.log('Using default menu items');
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, []);

  const categoryOrder = ['starters', 'mains', 'seafood', 'desserts', 'drinks'];

  // Get items for a category - from DB or default
  const getItemsForCategory = (category) => {
    const dbItems = menuItems.filter(item => item.category === category && item.is_available !== false);
    if (dbItems.length > 0) {
      return dbItems;
    }
    return defaultMenuItems[category] || [];
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="menu-page">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=80"
            alt="BÉNI Menu"
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37] mb-4">
              {c.subtitle}
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-8" data-testid="menu-title">
              {c.title}
            </h1>
            <Link
              to="/weekly-menu"
              className="inline-flex items-center gap-3 border border-[#d4af37] text-[#d4af37] px-8 py-3 text-xs uppercase tracking-[0.2em] hover:bg-[#d4af37] hover:text-black transition-all duration-300"
              data-testid="weekly-menu-link"
            >
              {c.weekly_cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Menu Sections */}
      {loading ? (
        <div className="py-24 text-center">
          <p className="text-white/50">Chargement...</p>
        </div>
      ) : (
        categoryOrder.map((category, categoryIndex) => {
          const items = getItemsForCategory(category);
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

                  <div className="space-y-8">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className="flex justify-between items-start border-b border-white/10 pb-6 group"
                        data-testid={`menu-item-${category}-${index}`}
                      >
                        <div className="flex-1 pr-4 flex gap-4">
                          {item.image_url && (
                            <img 
                              src={item.image_url} 
                              alt={getLocalizedField(item, 'name')} 
                              className="w-16 h-16 object-cover flex-shrink-0"
                            />
                          )}
                          <div>
                            <h3 className="font-display text-xl text-white group-hover:text-[#d4af37] transition-colors">
                              {getLocalizedField(item, 'name')}
                            </h3>
                            <p className="text-white/50 text-sm mt-1">
                              {getLocalizedField(item, 'description')}
                            </p>
                          </div>
                        </div>
                        <div className="text-[#d4af37] font-display text-xl whitespace-nowrap">
                          {typeof item.price === 'number' ? item.price.toFixed(2).replace('.', ',') : item.price}€
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })
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
