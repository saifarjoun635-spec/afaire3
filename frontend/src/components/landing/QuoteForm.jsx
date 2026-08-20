import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';

const vehicleTypes = ['Auto', 'Camion', 'Véhicule Lourd', 'Remorque', 'Autre'];
const serviceTypes = ['Mécanique Mobile', 'Maintenance de Flotte', 'Véhicules Lourds & Remorques', 'Inspection PEP / SAAQ / Pré-achat', 'Diagnostic & Entretien', 'Autre'];

const QuoteForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', vehicle_type: 'Auto', service: 'Inspection PEP / SAAQ / Pré-achat', details: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    try {
      await api.post('/quotes', form);
      setSent(true);
    } catch (e) { /* ignore */ } finally { setLoading(false); }
  };

  return (
    <section id="soumission" className="bg-[#0a0a0b] py-24 px-5 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-gold font-heading text-sm tracking-[0.25em]">PAS DE PAPERASSE, PAS DE TRACAS</span>
          <h2 className="font-display text-4xl md:text-5xl text-white mt-3">DEMANDER UNE SOUMISSION</h2>
          <p className="text-white/60 mt-4">Remplissez ce formulaire et notre équipe vous recontacte rapidement. Pour réserver et payer directement une inspection, utilisez le bouton dédié.</p>
        </div>

        {sent ? (
          <div className="bg-[#141416] border border-gold/40 rounded-xl p-10 text-center">
            <CheckCircle2 className="text-gold mx-auto mb-4" size={44} />
            <h3 className="font-heading text-2xl text-white">Demande envoyée !</h3>
            <p className="text-white/60 mt-2">Merci {form.name}. Nous vous contacterons au {form.phone} sous peu.</p>
            <button onClick={() => navigate('/reserver')} className="mt-6 gold-gradient text-[#141414] font-heading font-600 px-8 py-3 rounded-sm">Réserver & payer une inspection</button>
          </div>
        ) : (
        <div className="bg-[#141416] border border-white/10 rounded-xl p-7 md:p-9 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-white/70 text-sm mb-1.5 font-heading">Votre Nom *</label>
              <input value={form.name} onChange={set('name')} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5 font-heading">Numéro de Téléphone *</label>
              <input value={form.phone} onChange={set('phone')} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition" />
            </div>
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1.5 font-heading">Courriel</label>
            <input value={form.email} onChange={set('email')} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition" />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-white/70 text-sm mb-1.5 font-heading">Type de Véhicule</label>
              <select value={form.vehicle_type} onChange={set('vehicle_type')} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition">
                {vehicleTypes.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5 font-heading">Service Requis</label>
              <select value={form.service} onChange={set('service')} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition">
                {serviceTypes.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-white/70 text-sm mb-1.5 font-heading">Détails / Symptômes / Problème</label>
            <textarea value={form.details} onChange={set('details')} rows={4} className="w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition resize-none" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={submit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 gold-gradient text-[#141414] font-heading font-600 px-6 py-3.5 rounded-sm hover:brightness-105 transition disabled:opacity-60">
              <Mail size={17} /> {loading ? 'Envoi...' : 'Soumettre la demande'}
            </button>
            <button onClick={() => navigate('/reserver')} className="flex-1 flex items-center justify-center gap-2 border border-gold/40 text-gold font-heading px-6 py-3.5 rounded-sm hover:bg-gold/10 transition">
              <MessageSquare size={17} /> Réserver & Payer
            </button>
          </div>
          <p className="text-white/40 text-xs text-center">* Champs requis.</p>
        </div>
        )}
      </div>
    </section>
  );
};

export default QuoteForm;
