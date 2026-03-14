import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Menu = () => {
  const { language } = useLanguage();

  const content = {
    fr: {
      title: 'Notre Carte',
      subtitle: 'Menu Complet',
      weekly_cta: 'Voir le Menu de la Semaine',
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

  const menuItems = {
    starters: [
      { name: { fr: 'Carpaccio de Bœuf', en: 'Beef Carpaccio', pt: 'Carpaccio de Carne' }, price: '16,00', desc: { fr: 'Roquette, parmesan, câpres', en: 'Arugula, parmesan, capers', pt: 'Rúcula, parmesão, alcaparras' } },
      { name: { fr: 'Tartare de Saumon', en: 'Salmon Tartare', pt: 'Tartare de Salmão' }, price: '18,00', desc: { fr: 'Avocat, sésame, wasabi', en: 'Avocado, sesame, wasabi', pt: 'Abacate, gergelim, wasabi' } },
      { name: { fr: 'Soupe du Jour', en: 'Soup of the Day', pt: 'Sopa do Dia' }, price: '9,00', desc: { fr: 'Préparation maison', en: 'Homemade preparation', pt: 'Preparo caseiro' } },
      { name: { fr: 'Burrata Crémeuse', en: 'Creamy Burrata', pt: 'Burrata Cremosa' }, price: '15,00', desc: { fr: 'Tomates cerises, basilic, pesto', en: 'Cherry tomatoes, basil, pesto', pt: 'Tomates cereja, manjericão, pesto' } },
      { name: { fr: 'Salade César', en: 'Caesar Salad', pt: 'Salada César' }, price: '14,00', desc: { fr: 'Poulet grillé, croûtons, parmesan', en: 'Grilled chicken, croutons, parmesan', pt: 'Frango grelhado, croutons, parmesão' } },
    ],
    mains: [
      { name: { fr: 'Filet de Bœuf', en: 'Beef Fillet', pt: 'Filé Mignon' }, price: '32,00', desc: { fr: 'Sauce au poivre, légumes de saison', en: 'Pepper sauce, seasonal vegetables', pt: 'Molho de pimenta, legumes da estação' } },
      { name: { fr: 'Magret de Canard', en: 'Duck Breast', pt: 'Magret de Pato' }, price: '28,00', desc: { fr: 'Sauce aux fruits rouges, purée', en: 'Red fruit sauce, mash', pt: 'Molho de frutas vermelhas, purê' } },
      { name: { fr: 'Risotto aux Champignons', en: 'Mushroom Risotto', pt: 'Risoto de Cogumelos' }, price: '22,00', desc: { fr: 'Champignons forestiers, parmesan', en: 'Forest mushrooms, parmesan', pt: 'Cogumelos da floresta, parmesão' } },
      { name: { fr: 'Côtelettes d\'Agneau', en: 'Lamb Chops', pt: 'Costelas de Cordeiro' }, price: '30,00', desc: { fr: 'Herbes de Provence, ratatouille', en: 'Provence herbs, ratatouille', pt: 'Ervas de Provence, ratatouille' } },
      { name: { fr: 'Pasta Truffe', en: 'Truffle Pasta', pt: 'Massa com Trufa' }, price: '26,00', desc: { fr: 'Tagliatelles, crème de truffe noire', en: 'Tagliatelle, black truffle cream', pt: 'Tagliatelle, creme de trufa negra' } },
    ],
    seafood: [
      { name: { fr: 'Filet de Bar', en: 'Sea Bass Fillet', pt: 'Filé de Robalo' }, price: '28,00', desc: { fr: 'Beurre blanc, légumes grillés', en: 'White butter, grilled vegetables', pt: 'Manteiga branca, legumes grelhados' } },
      { name: { fr: 'Gambas à l\'Ail', en: 'Garlic Prawns', pt: 'Camarões ao Alho' }, price: '24,00', desc: { fr: 'Ail, persil, huile d\'olive', en: 'Garlic, parsley, olive oil', pt: 'Alho, salsa, azeite' } },
      { name: { fr: 'Moules Marinières', en: 'Mussels Marinière', pt: 'Mexilhões Marinière' }, price: '20,00', desc: { fr: 'Vin blanc, échalotes, crème', en: 'White wine, shallots, cream', pt: 'Vinho branco, chalotas, creme' } },
      { name: { fr: 'Saumon Grillé', en: 'Grilled Salmon', pt: 'Salmão Grelhado' }, price: '26,00', desc: { fr: 'Sauce teriyaki, riz japonais', en: 'Teriyaki sauce, Japanese rice', pt: 'Molho teriyaki, arroz japonês' } },
    ],
    desserts: [
      { name: { fr: 'Tiramisu Maison', en: 'Homemade Tiramisu', pt: 'Tiramisu Caseiro' }, price: '10,00', desc: { fr: 'Recette traditionnelle', en: 'Traditional recipe', pt: 'Receita tradicional' } },
      { name: { fr: 'Fondant au Chocolat', en: 'Chocolate Fondant', pt: 'Fondant de Chocolate' }, price: '11,00', desc: { fr: 'Cœur coulant, glace vanille', en: 'Molten center, vanilla ice cream', pt: 'Centro derretido, sorvete de baunilha' } },
      { name: { fr: 'Crème Brûlée', en: 'Crème Brûlée', pt: 'Crème Brûlée' }, price: '9,00', desc: { fr: 'Vanille de Madagascar', en: 'Madagascar vanilla', pt: 'Baunilha de Madagascar' } },
      { name: { fr: 'Tarte aux Fruits', en: 'Fruit Tart', pt: 'Torta de Frutas' }, price: '10,00', desc: { fr: 'Fruits de saison, crème pâtissière', en: 'Seasonal fruits, pastry cream', pt: 'Frutas da estação, creme de confeiteiro' } },
    ],
    drinks: [
      { name: { fr: 'Vin Rouge (verre)', en: 'Red Wine (glass)', pt: 'Vinho Tinto (copo)' }, price: '7,00', desc: { fr: 'Sélection du sommelier', en: 'Sommelier selection', pt: 'Seleção do sommelier' } },
      { name: { fr: 'Vin Blanc (verre)', en: 'White Wine (glass)', pt: 'Vinho Branco (copo)' }, price: '7,00', desc: { fr: 'Sélection du sommelier', en: 'Sommelier selection', pt: 'Seleção do sommelier' } },
      { name: { fr: 'Champagne (coupe)', en: 'Champagne (glass)', pt: 'Champagne (taça)' }, price: '12,00', desc: { fr: 'Brut, Reims', en: 'Brut, Reims', pt: 'Brut, Reims' } },
      { name: { fr: 'Cocktail Signature', en: 'Signature Cocktail', pt: 'Coquetel Signature' }, price: '14,00', desc: { fr: 'Création du barman', en: 'Bartender creation', pt: 'Criação do barman' } },
    ]
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
      {Object.entries(menuItems).map(([category, items], categoryIndex) => (
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
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="flex justify-between items-start border-b border-white/10 pb-6 group"
                    data-testid={`menu-item-${category}-${index}`}
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-display text-xl text-white group-hover:text-[#d4af37] transition-colors">
                        {item.name[language]}
                      </h3>
                      <p className="text-white/50 text-sm mt-1">
                        {item.desc[language]}
                      </p>
                    </div>
                    <div className="text-[#d4af37] font-display text-xl whitespace-nowrap">
                      {item.price}€
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Bottom CTA */}
      <section className="py-20 px-6 md:px-12 text-center">
        <p className="text-white/50 text-sm mb-6">
          {language === 'fr' ? 'Les prix sont en euros, service compris.' : 
           language === 'en' ? 'Prices are in euros, service included.' : 
           'Preços em euros, serviço incluído.'}
        </p>
        <Link
          to="/reservations"
          className="inline-flex items-center gap-3 bg-[#d4af37] text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300"
          data-testid="menu-reserve-cta"
        >
          {language === 'fr' ? 'Réserver une Table' : language === 'en' ? 'Book a Table' : 'Reservar uma Mesa'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </main>
  );
};

export default Menu;
