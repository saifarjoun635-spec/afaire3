import React from 'react';
import { Phone, MapPin, Mail } from 'lucide-react';
import logo from '../../assets/logo.png';

const BusinessCards = () => (
  <section className="bg-[#08080a] py-24 px-5 lg:px-8">
    <div className="max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-gold font-heading text-sm tracking-[0.25em]">GAGE D'AUTHENTICITÉ</span>
        <h2 className="font-display text-4xl md:text-5xl text-white mt-3">NOTRE CARTE OFFICIELLE</h2>
        <p className="text-white/60 mt-5">Retrouvez nos informations de contact officielles — Torque Inspection Mobile, division de Torque Élite Mécanique.</p>
      </div>
      <div className="relative bg-gradient-to-br from-[#161618] to-[#0c0c0e] border border-gold/25 rounded-2xl p-8 md:p-10 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gold/5" />
        <div className="grid md:grid-cols-2 gap-8 items-center relative">
          <img src={logo} alt="Torque Inspection Mobile" className="w-full max-w-sm mx-auto" />
          <div className="space-y-4">
            <p className="font-heading text-white/80 tracking-wide">SERVICE D'INSPECTION MOBILE</p>
            <div className="w-16 h-0.5 bg-gold" />
            <ul className="space-y-2">
              {['Auto • Camion • Véhicule Lourd', 'Remorque • Moto • VR', 'Inspection Pré-achat / PEP / SAAQ', 'Rapports d\'assurance complets'].map((s, i) => (
                <li key={i} className="text-white/55 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gold" /> {s}</li>
              ))}
            </ul>
            <div className="pt-4 border-t border-white/10 space-y-2">
              <p className="flex items-center gap-2 text-white/80"><Phone size={15} className="text-gold" /> 514 820 1136</p>
              <p className="flex items-center gap-2 text-white/80"><MapPin size={15} className="text-gold" /> Montréal & Grand Montréal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default BusinessCards;
