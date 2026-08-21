import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Truck, Container, Bike, Caravan, ArrowRight } from 'lucide-react';
import jeep from '../../assets/vehicle-jeep.jpg';
import toyota from '../../assets/vehicle-toyota.jpg';
import ford from '../../assets/vehicle-ford.jpg';
import acura from '../../assets/vehicle-acura.jpg';

const categories = [
  { icon: Car, title: 'Automobile', desc: 'Inspection pré-achat complète pour voitures et VUS.' },
  { icon: Truck, title: 'Véhicule Lourd', desc: 'Camions lourds, semi-remorques et machinerie.' },
  { icon: Container, title: 'Remorque', desc: 'Vérification structurelle et sécurité des remorques.' },
  { icon: Bike, title: 'Moto', desc: 'Inspection mécanique et sécurité pour motos.' },
  { icon: Caravan, title: 'VR', desc: 'Véhicules récréatifs, roulottes et motorisés.' },
];

const gallery = [jeep, toyota, ford, acura];

const Services = () => {
  const navigate = useNavigate();
  return (
    <>
      <section id="services" className="bg-[#08080a] py-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-gold font-heading text-sm tracking-[0.25em]">NOTRE EXPERTISE</span>
            <h2 className="font-display text-4xl md:text-5xl text-white mt-3">INSPECTION MOBILE</h2>
            <p className="text-white/60 mt-5 leading-relaxed">Inspection pré-achat, PEP et SAAQ, rapports d'assurance complets — directement à votre emplacement, pour tous types de véhicules.</p>
          </div>
          <div id="vehicules" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((c, i) => (
              <div key={i} className="group bg-[#141416] border border-white/8 rounded-lg p-6 text-center hover:border-gold/50 transition-colors duration-300">
                <div className="w-14 h-14 mx-auto rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                  <c.icon className="text-gold" size={26} />
                </div>
                <h3 className="font-heading text-lg text-white mt-4">{c.title}</h3>
                <p className="text-white/50 text-sm mt-2 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button onClick={() => navigate('/reserver')} className="inline-flex items-center gap-2 gold-gradient text-white font-heading font-600 px-8 py-4 rounded-sm hover:brightness-110 transition">
              Réserver mon inspection <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section id="galerie" className="bg-[#0e0e10] py-24 px-5 lg:px-8 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-gold font-heading text-sm tracking-[0.25em]">SUR LE TERRAIN</span>
            <h2 className="font-display text-4xl md:text-5xl text-white mt-3">NOS INSPECTIONS EN ACTION</h2>
            <p className="text-white/60 mt-5">Quelques véhicules inspectés récemment par notre équipe mobile.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="group relative overflow-hidden rounded-lg border border-white/8 aspect-square">
                <img src={src} alt={`Inspection ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;
