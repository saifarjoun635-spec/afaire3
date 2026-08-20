import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown } from 'lucide-react';

const HERO = 'https://images.pexels.com/photos/7019365/pexels-photo-7019365.jpeg';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img src={HERO} alt="Garage mécanique" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 text-center px-5 max-w-4xl mx-auto animate-fade-up">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/80 font-heading border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E11D2E]" /> SERVICE MOBILE D'ÉLITE
        </span>
        <h1 className="font-display text-6xl md:text-8xl leading-none">
          <span className="text-gold">TORQUE</span> <span className="text-white">ÉLITE</span>
        </h1>
        <h2 className="font-heading text-lg md:text-2xl tracking-[0.15em] text-white mt-4">
          MÉCANIQUE INC. <span className="text-[#E11D2E]">•</span> INSPECTION MOBILE
        </h2>
        <div className="w-20 h-0.5 bg-[#E11D2E] mx-auto my-6" />
        <p className="text-white/70 md:text-lg max-w-2xl mx-auto leading-relaxed">
          Votre inspection professionnelle et mécanique mobile haut de gamme, directement sur place.
          Nous desservons Montréal, le grand Montréal et toutes les zones environnantes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button onClick={() => navigate('/reserver')} className="gold-gradient text-[#141414] font-heading font-600 tracking-wide px-8 py-4 rounded-sm hover:brightness-105 transition w-full sm:w-auto">
            DEMANDER UNE SOUMISSION
          </button>
          <a href="tel:5148201136" className="flex items-center justify-center gap-2 border border-white/25 text-white font-heading px-8 py-4 rounded-sm hover:border-gold hover:text-gold transition w-full sm:w-auto">
            <Phone size={16} /> APPELER : 514 820 1136
          </a>
        </div>
      </div>
      <ChevronDown className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce" />
    </section>
  );
};

export default Hero;
