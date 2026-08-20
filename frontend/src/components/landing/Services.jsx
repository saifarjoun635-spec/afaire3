import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const services = [
  { tag: 'Rapide', sub: 'Diagnostic & Entretien', title: 'Mécanique Mobile', desc: "Entretien et diagnostic mécanique d'élite complet directement à votre emplacement. Analyse complète et précise pour tous types de véhicules.", img: 'https://images.unsplash.com/photo-1763377278900-0ce8242c5005' },
  { tag: 'Professionnel', sub: 'Gestion de parcs', title: 'Maintenance de Flotte', desc: "Services d'entretien réguliers et structurés pour les flottes commerciales. Minimisez le temps d'arrêt de vos camions et remorques.", img: 'https://images.unsplash.com/photo-1587813369290-091c9d432daf' },
  { tag: 'Robuste', sub: 'Soutien mécanique lourd', title: 'Véhicules Lourds & Remorques', desc: 'Spécialisation dans les réparations et la maintenance de camions lourds, semi-remorques et machinerie. Force et fiabilité.', img: 'https://images.pexels.com/photos/7564874/pexels-photo-7564874.jpeg' },
  { tag: 'Conformité', sub: 'Conformité & Préachat', title: 'Inspection Mobile & PEP', desc: "Inspection SAAQ, PEP, inspections préachats rigoureuses et dossiers d'assurance complets pour vos réclamations et sérénité d'esprit.", img: 'https://images.unsplash.com/photo-1615906655593-ad0386982a0f' },
];

const Services = () => {
  const navigate = useNavigate();
  return (
    <section id="services" className="bg-[#0a0a0b] py-24 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold font-heading text-sm tracking-[0.25em]">NOS DOMAINES D'EXPERTISE</span>
          <h2 className="font-display text-4xl md:text-5xl text-white mt-3">SERVICES MÉCANIQUES ÉLITE</h2>
          <p className="text-white/60 mt-5 leading-relaxed">Nous combinons équipement de diagnostic de pointe et savoir-faire rigoureux pour offrir un service d'entretien inégalé directement à votre porte.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div key={i} className="group bg-[#141416] border border-white/8 rounded-lg overflow-hidden hover:border-gold/50 transition-colors duration-300">
              <div className="relative h-48 overflow-hidden">
                <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141416] to-transparent" />
                <span className="absolute top-3 left-3 bg-gold text-[#141414] text-[11px] font-heading font-600 px-2.5 py-1 rounded-sm">{s.tag}</span>
              </div>
              <div className="p-6">
                <span className="text-gold/80 text-xs font-heading tracking-wide">{s.sub}</span>
                <h3 className="font-heading text-xl text-white mt-1 mb-3">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-5">{s.desc}</p>
                <button onClick={() => navigate('/reserver')} className="flex items-center gap-2 text-gold font-heading text-sm group-hover:gap-3 transition-all">
                  Découvrir le service <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
