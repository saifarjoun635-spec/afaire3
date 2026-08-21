import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import BusinessCards from '../components/landing/BusinessCards';
import QuoteForm from '../components/landing/QuoteForm';
import { Zap, MapPin, FileText, Phone } from 'lucide-react';
import logo from '../assets/logo.png';

const pills = [
  { icon: Zap, title: 'Service Rapide', desc: 'Intervention rapide pour limiter vos temps d\'immobilisation.' },
  { icon: MapPin, title: 'Déplacement Mobile', desc: 'Nous nous déplaçons partout pour vous à Montréal et alentours.' },
  { icon: FileText, title: 'Rapport Détaillé', desc: 'Rapports précis et d\'assurance complets après chaque inspection.' },
];

const Landing = () => (
  <div className="bg-[#0a0a0b]">
    <Navbar />
    <Hero />
    <section className="bg-[#0e0e10] py-14 px-5 lg:px-8 border-b border-white/5">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {pills.map((p, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center"><p.icon className="text-gold" size={22} /></div>
            <div>
              <h3 className="font-heading text-lg text-white">{p.title}</h3>
              <p className="text-white/55 text-sm mt-1">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    <Services />
    <BusinessCards />
    <QuoteForm />
    <footer className="bg-[#0a0a0b] border-t border-white/10 py-12 px-5 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <img src={logo} alt="Torque Inspection Mobile" className="h-12 w-auto" />
        <a href="tel:5148201136" className="flex items-center gap-2 text-white/80 hover:text-gold"><Phone size={16} className="text-[#E11D2E]" /> 514 820 1136</a>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} Torque Élite Mécanique Inc. — Montréal</p>
      </div>
    </footer>
  </div>
);

export default Landing;
