import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const About = () => {
  const { t, language } = useLanguage();

  const content = {
    fr: {
      title: 'Notre Histoire',
      subtitle: 'Découvrez BÉNI',
      intro: 'Nous sommes un restaurant créé pour les vrais amateurs de bonne cuisine !',
      history_title: 'L\'Histoire de BÉNI',
      history_p1: 'BÉNI est né de la passion de créer des expériences gastronomiques uniques. Situé au cœur du Luxembourg, notre restaurant est devenu un lieu de rencontre pour ceux qui apprécient la vraie cuisine.',
      history_p2: 'Nous avons préparé un menu spécial pour ceux qui, comme nous, sont passionnés par la vraie cuisine ! Nous apportons les saveurs de nombreux voyages et expériences pour idéaliser notre menu international.',
      chef_title: 'Derrière la Gastronomie',
      chef_intro: 'Plus de 11 ans de cuisine professionnelle de haut niveau et une passion pour la cuisine et la pêche,',
      chef_name: 'Stephano Crupi',
      chef_text: 'a le défi de ravir les palais avec légèreté, qualité et amour. Une gastronomie axée sur le plaisir, mais aussi sur le réconfort de votre appétit.',
      quote: '"Cuisiner, c\'est comme tisser un délicat manteau d\'arômes, de couleurs, de saveurs, de textures. Un manteau divin qui reposera sur le palais de quelqu\'un de toujours spécial."',
      philosophy_title: 'Notre Philosophie',
      philosophy_text: 'Chez BÉNI, chaque plat raconte une histoire. Nous croyons que la cuisine est un art qui connecte les gens, les cultures et les traditions. Notre engagement est de vous offrir une expérience culinaire authentique et mémorable.',
      cta: 'Voir Notre Menu'
    },
    en: {
      title: 'Our History',
      subtitle: 'Discover BÉNI',
      intro: 'We are a restaurant created for real food lovers!',
      history_title: 'The Story of BÉNI',
      history_p1: 'BÉNI was born from the passion to create unique gastronomic experiences. Located in the heart of Luxembourg, our restaurant has become a meeting place for those who appreciate real cuisine.',
      history_p2: 'We have prepared a special menu for those who, like us, are passionate about real food! We bring the flavors of many trips and experiences to idealize our international menu.',
      chef_title: 'Behind the Gastronomy',
      chef_intro: 'Over 11 years of high-level professional cuisine and a passion for cooking and fishing,',
      chef_name: 'Stephano Crupi',
      chef_text: 'has the challenge of delighting palates with lightness, quality and love. A gastronomy focused on pleasing, but also on embracing your appetite.',
      quote: '"Cooking is like weaving a delicate cloak of aromas, colors, flavors, textures. A divine cloak that will lie on the palate of someone always special."',
      philosophy_title: 'Our Philosophy',
      philosophy_text: 'At BÉNI, every dish tells a story. We believe that cuisine is an art that connects people, cultures and traditions. Our commitment is to offer you an authentic and memorable culinary experience.',
      cta: 'See Our Menu'
    },
    pt: {
      title: 'Nossa História',
      subtitle: 'Conheça o BÉNI',
      intro: 'Somos um restaurante criado para verdadeiros amantes da boa comida!',
      history_title: 'A História do BÉNI',
      history_p1: 'O BÉNI nasceu da paixão de criar experiências gastronômicas únicas. Localizado no coração de Luxemburgo, nosso restaurante se tornou um ponto de encontro para quem aprecia a verdadeira cozinha.',
      history_p2: 'Preparamos um cardápio especial para quem, como nós, é apaixonado por comida de verdade! Trazemos os sabores de muitas viagens e experiências para idealizar nosso cardápio internacional.',
      chef_title: 'Por Trás da Gastronomia',
      chef_intro: 'Mais de 11 anos de cozinha profissional de alto nível e paixão por cozinhar e pescar,',
      chef_name: 'Stephano Crupi',
      chef_text: 'tem o desafio de encantar paladares com leveza, qualidade e amor. Uma gastronomia focada em agradar, mas também em abraçar seu apetite.',
      quote: '"Cozinhar é como tecer um delicado manto de aromas, cores, sabores, texturas. Um manto divino que repousará no paladar de alguém sempre especial."',
      philosophy_title: 'Nossa Filosofia',
      philosophy_text: 'No BÉNI, cada prato conta uma história. Acreditamos que a cozinha é uma arte que conecta pessoas, culturas e tradições. Nosso compromisso é oferecer uma experiência culinária autêntica e memorável.',
      cta: 'Ver Nosso Menu'
    }
  };

  const c = content[language];

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-20" data-testid="about-page">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 px-6 md:px-12">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80"
            alt="BÉNI Restaurant"
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
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6" data-testid="about-title">
              {c.title}
            </h1>
            <p className="font-accent text-xl text-white/70 italic">
              {c.intro}
            </p>
          </motion.div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 px-6 md:px-12" data-testid="history-section">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl md:text-4xl text-white">
                {c.history_title}
              </h2>
              <p className="text-white/70 leading-relaxed">
                {c.history_p1}
              </p>
              <p className="text-white/70 leading-relaxed">
                {c.history_p2}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"
                alt="BÉNI Interior"
                className="w-full h-[400px] object-cover"
                data-testid="history-image"
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-[#d4af37]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section className="py-20 px-6 md:px-12 bg-[#121212]" data-testid="chef-section">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=80"
                alt="Chef Stephano Crupi"
                className="w-full h-[500px] object-cover"
                data-testid="chef-image"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">
                {c.chef_title}
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-white">
                {c.chef_name}
              </h2>
              <p className="text-white/70 leading-relaxed">
                {c.chef_intro} <span className="text-[#d4af37] font-medium">{c.chef_name}</span> {c.chef_text}
              </p>
              
              <blockquote className="border-l-2 border-[#d4af37] pl-6 py-4 my-8">
                <Quote className="w-8 h-8 text-[#d4af37]/30 mb-4" />
                <p className="font-accent text-lg italic text-white/60">
                  {c.quote}
                </p>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-6 md:px-12" data-testid="philosophy-section">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              {c.philosophy_title}
            </p>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl mx-auto">
              {c.philosophy_text}
            </p>
            
            <Link
              to="/menu"
              className="inline-flex items-center gap-3 bg-[#d4af37] text-black px-10 py-4 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all duration-300 mt-8"
              data-testid="about-menu-cta"
            >
              {c.cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Image Grid */}
      <section className="py-20 px-6 md:px-12 bg-[#121212]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
              'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80',
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
              'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80'
            ].map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <img
                  src={src}
                  alt={`BÉNI dish ${index + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                  data-testid={`about-gallery-${index}`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
