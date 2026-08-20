import React from 'react';
import { Phone, MapPin, Wrench, ShieldCheck } from 'lucide-react';

const Card = ({ title, icon: Icon, services }) => (
  <div className="relative bg-gradient-to-br from-[#1a1a1d] to-[#0e0e10] border border-gold/25 rounded-xl p-7 shadow-2xl overflow-hidden">
    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gold/5" />
    <div className="flex items-center justify-between">
      <div className="font-display text-2xl"><span className="text-gold">TORQUE</span> <span className="text-white">ÉLITE</span></div>
      <Icon className="text-gold" size={26} />
    </div>
    <div className="w-16 h-0.5 bg-[#E11D2E] my-3" />
    <p className="text-white/80 font-heading tracking-wide">{title}</p>
    <ul className="mt-4 space-y-1.5">
      {services.map((s, i) => (
        <li key={i} className="text-white/55 text-sm flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-gold" /> {s}</li>
      ))}
    </ul>
    <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
      <p className="flex items-center gap-2 text-white/80 text-sm"><Phone size={14} className="text-gold" /> 514 820 1136</p>
      <p className="flex items-center gap-2 text-white/80 text-sm"><MapPin size={14} className="text-gold" /> Montréal & Grand Montréal</p>
    </div>
  </div>
);

const BusinessCards = () => (
  <section className="bg-[#0e0e10] py-24 px-5 lg:px-8 border-y border-white/5">
    <div className="max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-gold font-heading text-sm tracking-[0.25em]">GAGE D'AUTHENTICITÉ</span>
        <h2 className="font-display text-4xl md:text-5xl text-white mt-3">NOS CARTES D'AFFAIRES</h2>
        <p className="text-white/60 mt-5">Retrouvez nos informations de contact officielles telles que présentées sur nos cartes de service Torque Élite et Inspection Mobile.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Card title="SERVICE INSPECTION MOBILE" icon={ShieldCheck} services={['Inspection Auto', 'Inspection Camion', 'Véhicule Lourd & Remorque', 'PEP / SAAQ / Pré-achat']} />
        <Card title="SERVICE MÉCANIQUE MOBILE" icon={Wrench} services={['Mécanique Mobile', 'Maintenance Flotte', 'Véhicules Lourds', 'Diagnostic & Entretien']} />
      </div>
    </div>
  </section>
);

export default BusinessCards;
