import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown, ShieldCheck } from 'lucide-react';
import logo from '../../assets/logo.png';

const HERO = 'https://images.pexels.com/photos/7019365/pexels-photo-7019365.jpeg';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <img src={HERO} alt="Inspection de véhicule" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 text-center px-5 max-w-4xl mx-auto animate-fade-up">
        <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/80 font-heading border border-white/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" /> DIVISION DE TORQUE ÉLITE MÉCANIQUE
        </span>
        <img src={logo} alt="Torque Inspection Mobile" className="w-full max-w-2xl mx-auto" />
        <p className="text-white/70 md:text-lg max-w-2xl mx-auto leading-relaxed mt-8">
          Inspection mobile professionnelle directement sur place. Auto, camion, véhicule lourd,
          remorque, moto et VR — Montréal et le grand Montréal.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <button onClick={() => navigate('/reserver')} className="flex items-center justify-center gap-2 gold-gradient text-white font-heading font-600 tracking-wide px-8 py-4 rounded-sm hover:brightness-110 transition w-full sm:w-auto">
            <ShieldCheck size={18} /> RÉSERVER UNE INSPECTION
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
