import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Gallery = () => {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const content = {
    fr: {
      title: 'Galerie',
      subtitle: 'Nos Moments',
      categories: { all: 'Tout', ambiance: 'Ambiance', dishes: 'Plats', team: 'Équipe' }
    },
    en: {
      title: 'Gallery',
      subtitle: 'Our Moments',
      categories: { all: 'All', ambiance: 'Ambiance', dishes: 'Dishes', team: 'Team' }
    },
    pt: {
      title: 'Galeria',
      subtitle: 'Nossos Momentos',
      categories: { all: 'Tudo', ambiance: 'Ambiente', dishes: 'Pratos', team: 'Equipe' }
    }
  };

  const c = content[language];

  const images = [
    // Ambiance
    { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', category: 'ambiance', alt: 'Restaurant interior' },
    { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80', category: 'ambiance', alt: 'Dining area' },
    { src: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80', category: 'ambiance', alt: 'Bar area' },
    { src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80', category: 'ambiance', alt: 'Evening ambiance' },
    { src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', category: 'ambiance', alt: 'Restaurant terrace' },
    { src: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80', category: 'ambiance', alt: 'Wine cellar' },
    
    // Dishes
    { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80', category: 'dishes', alt: 'Gourmet dish' },
    { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', category: 'dishes', alt: 'Plated meal' },
    { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', category: 'dishes', alt: 'BBQ ribs' },
    { src: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80', category: 'dishes', alt: 'Pasta dish' },
    { src: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80', category: 'dishes', alt: 'Salad bowl' },
    { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80', category: 'dishes', alt: 'Pizza' },
    { src: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80', category: 'dishes', alt: 'Pancakes' },
    { src: 'https://images.unsplash.com/photo-1482049016gy6-74ac62b6f2c7?w=800&q=80', category: 'dishes', alt: 'Seafood' },
    { src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', category: 'dishes', alt: 'Healthy bowl' },
    { src: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80', category: 'dishes', alt: 'Cake dessert' },
    
    // Team
    { src: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80', category: 'team', alt: 'Chef cooking' },
    { src: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=80', category: 'team', alt: 'Kitchen team' },
    { src: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800&q=80', category: 'team', alt: 'Chef portrait' },
    { src: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80', category: 'team', alt: 'Cooking process' },
  ];

  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const currentIndex = selectedImage ? filteredImages.findIndex(img => img.src === selectedImage.src) : -1;

  const navigateImage = (direction) => {
    if (currentIndex === -1) return;
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredImages.length
      : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[newIndex]);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="gallery-page">
      {/* Hero */}
      <section className="relative py-24 md:py-32 px-6 md:px-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80"
            alt="Gallery"
            className="w-full h-full object-cover opacity-20"
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
            <h1 className="font-display text-5xl md:text-7xl text-white" data-testid="gallery-title">
              {c.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 md:px-12 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4" data-testid="gallery-filters">
            {Object.entries(c.categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-6 py-2 text-xs uppercase tracking-[0.15em] transition-all duration-300 ${
                  activeCategory === key
                    ? 'bg-[#d4af37] text-black'
                    : 'border border-white/20 text-white/70 hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
                data-testid={`filter-${key}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.src}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className={`cursor-pointer overflow-hidden ${
                    index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                  data-testid={`gallery-image-${index}`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className={`w-full object-cover hover:scale-110 transition-transform duration-700 ${
                      index % 5 === 0 ? 'h-full min-h-[300px] md:min-h-[400px]' : 'h-48 md:h-56'
                    }`}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
            data-testid="gallery-lightbox"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-10"
              data-testid="lightbox-close"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
              className="absolute left-6 text-white/70 hover:text-white p-2"
              data-testid="lightbox-prev"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
              className="absolute right-6 text-white/70 hover:text-white p-2"
              data-testid="lightbox-next"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Image */}
            <motion.img
              key={selectedImage.src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm">
              {currentIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Gallery;
