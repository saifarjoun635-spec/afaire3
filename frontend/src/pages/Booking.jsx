import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, CreditCard, Lock, CheckCircle2, Car, MapPin, User } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const services = ['Inspection Pré-achat', 'Inspection PEP', "Rapport d'assurance"];
const vehicleTypes = ['Automobile', 'Véhicule Lourd', 'Remorque', 'Moto', 'VR'];

const Booking = () => {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    client_name: '', client_email: '', client_phone: '', client_password: '',
    service_type: services[0], vehicle_type: vehicleTypes[0], vehicle_make: '', vehicle_model: '', vehicle_year: '', vehicle_vin: '',
    location_address: '', location_type: 'RepairShop', contact_name: '', contact_phone: '',
    notes: '', price: 149,
    card_name: '', card_number: '', card_exp: '', card_cvc: '',
  });
  const [refCode, setRefCode] = useState('');
  const [components, setComponents] = useState([{ name: 'Other', description: '' }]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addComp = () => setComponents([...components, { name: `Other #${components.length + 1}`, description: '' }]);
  const rmComp = (i) => setComponents(components.filter((_, idx) => idx !== i));
  const setComp = (i, k) => (e) => setComponents(components.map((c, idx) => idx === i ? { ...c, [k]: e.target.value } : c));

  const next = () => { setError(''); setStep(step + 1); };
  const back = () => setStep(step - 1);

  const pay = async () => {
    setError(''); setLoading(true);
    try {
      const payload = { ...form, price: Number(form.price), components: components.filter((c) => c.description) };
      const { data } = await api.post('/bookings', payload);
      setSession(data.token, data.user);
      setRefCode(data.inspection.ref);
      setStep(4);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Une erreur est survenue');
    } finally { setLoading(false); }
  };

  const field = 'w-full bg-[#0e0e10] border border-white/12 rounded-md px-4 py-3 text-white focus:border-gold outline-none transition';
  const lbl = 'block text-white/70 text-sm mb-1.5 font-heading';

  const StepDot = ({ n, label }) => (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-sm ${step >= n ? 'bg-gold text-white' : 'bg-white/10 text-white/40'}`}>{n}</div>
      <span className={`text-sm font-heading hidden sm:block ${step >= n ? 'text-white' : 'text-white/40'}`}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] py-10 px-5">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-gold text-sm mb-6"><ArrowLeft size={16} /> Retour</Link>
        <img src={logo} alt="Torque Inspection Mobile" className="h-14 mb-1" />
        <p className="text-white/50 mb-8 font-heading tracking-wide text-sm">RÉSERVER UNE INSPECTION</p>

        {step < 4 && (
          <div className="flex items-center justify-between mb-8">
            <StepDot n={1} label="Véhicule" /><div className="flex-1 h-px bg-white/10 mx-2" />
            <StepDot n={2} label="Coordonnées" /><div className="flex-1 h-px bg-white/10 mx-2" />
            <StepDot n={3} label="Paiement" />
          </div>
        )}

        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-2">{error}</p>}

        {step === 1 && (
          <div className="bg-[#141416] border border-white/10 rounded-xl p-7 space-y-5 animate-fade-up">
            <h3 className="flex items-center gap-2 font-heading text-lg text-white"><Car size={18} className="text-gold" /> Véhicule & Service</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Type de véhicule</label>
                <select value={form.vehicle_type} onChange={set('vehicle_type')} className={field}>{vehicleTypes.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div><label className={lbl}>Type d'inspection</label>
                <select value={form.service_type} onChange={set('service_type')} className={field}>{services.map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={lbl}>Marque</label><input value={form.vehicle_make} onChange={set('vehicle_make')} className={field} placeholder="Tesla" /></div>
              <div><label className={lbl}>Modèle</label><input value={form.vehicle_model} onChange={set('vehicle_model')} className={field} placeholder="Model X" /></div>
              <div><label className={lbl}>Année</label><input value={form.vehicle_year} onChange={set('vehicle_year')} className={field} placeholder="2016" /></div>
            </div>
            <div><label className={lbl}>NIV / VIN (optionnel)</label><input value={form.vehicle_vin} onChange={set('vehicle_vin')} className={field} /></div>
            <div>
              <label className={lbl}>Composants à inspecter</label>
              <div className="space-y-2">
                {components.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={c.description} onChange={setComp(i, 'description')} placeholder={`Description du problème #${i + 1}`} className={field} />
                    {components.length > 1 && <button onClick={() => rmComp(i)} className="px-3 text-red-400 hover:text-red-300"><Trash2 size={16} /></button>}
                  </div>
                ))}
              </div>
              <button onClick={addComp} className="flex items-center gap-1.5 text-gold text-sm mt-2 font-heading"><Plus size={15} /> Ajouter un composant</button>
            </div>
            <button onClick={() => { if (form.vehicle_make && form.vehicle_model) next(); else setError('Renseignez la marque et le modèle'); }} className="w-full gold-gradient text-white font-heading font-600 px-6 py-3.5 rounded-sm">Continuer</button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#141416] border border-white/10 rounded-xl p-7 space-y-5 animate-fade-up">
            <h3 className="flex items-center gap-2 font-heading text-lg text-white"><User size={18} className="text-gold" /> Vos coordonnées</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className={lbl}>Nom complet *</label><input value={form.client_name} onChange={set('client_name')} className={field} /></div>
              <div><label className={lbl}>Téléphone *</label><input value={form.client_phone} onChange={set('client_phone')} className={field} /></div>
            </div>
            <div><label className={lbl}>Email * (identifiant de connexion)</label><input type="email" value={form.client_email} onChange={set('client_email')} className={field} /></div>
            <div><label className={lbl}>Mot de passe * (pour le portail client)</label><input type="password" value={form.client_password} onChange={set('client_password')} className={field} /></div>
            <div><label className={`${lbl} flex items-center gap-1.5`}><MapPin size={14} className="text-gold" /> Adresse du véhicule *</label><input value={form.location_address} onChange={set('location_address')} className={field} placeholder="11780 4e Avenue, Montréal, QC" /></div>
            <div><label className={lbl}>Notes (optionnel)</label><textarea value={form.notes} onChange={set('notes')} rows={3} className={`${field} resize-none`} /></div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 border border-white/15 text-white font-heading px-6 py-3.5 rounded-sm">Retour</button>
              <button onClick={() => { if (form.client_name && form.client_email && form.client_phone && form.client_password && form.location_address) next(); else setError('Complétez tous les champs requis'); }} className="flex-[2] gold-gradient text-white font-heading font-600 px-6 py-3.5 rounded-sm">Continuer vers le paiement</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#141416] border border-white/10 rounded-xl p-7 space-y-5 animate-fade-up">
            <h3 className="flex items-center gap-2 font-heading text-lg text-white"><CreditCard size={18} className="text-gold" /> Paiement</h3>
            <div className="bg-[#0e0e10] border border-gold/25 rounded-lg p-4 flex items-center justify-between">
              <span className="text-white/70">{form.service_type}</span>
              <span className="font-display text-2xl text-gold">{Number(form.price).toFixed(2)} $</span>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md px-4 py-2 text-yellow-300/90 text-xs flex items-center gap-2"><Lock size={13} /> Paiement SIMULÉ (démo) — aucune carte réelle n'est débitée.</div>
            <div><label className={lbl}>Nom sur la carte</label><input value={form.card_name} onChange={set('card_name')} className={field} /></div>
            <div><label className={lbl}>Numéro de carte</label><input value={form.card_number} onChange={set('card_number')} className={field} placeholder="4242 4242 4242 4242" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={lbl}>Expiration</label><input value={form.card_exp} onChange={set('card_exp')} className={field} placeholder="12/28" /></div>
              <div><label className={lbl}>CVC</label><input value={form.card_cvc} onChange={set('card_cvc')} className={field} placeholder="123" /></div>
            </div>
            <div className="flex gap-3">
              <button onClick={back} className="flex-1 border border-white/15 text-white font-heading px-6 py-3.5 rounded-sm">Retour</button>
              <button onClick={pay} disabled={loading} className="flex-[2] gold-gradient text-white font-heading font-600 px-6 py-3.5 rounded-sm disabled:opacity-60">{loading ? 'Traitement...' : `Payer ${Number(form.price).toFixed(2)} $`}</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-[#141416] border border-gold/40 rounded-xl p-10 text-center animate-fade-up">
            <CheckCircle2 className="text-gold mx-auto mb-4" size={52} />
            <h3 className="font-heading text-2xl text-white">Paiement confirmé !</h3>
            <p className="text-white/60 mt-2">Votre inspection a été enregistrée. Le patron va l'assigner à un inspecteur. Suivez son avancement dans votre portail.</p>
            <div className="mt-6 bg-[#0e0e10] border border-gold/30 rounded-lg p-5" data-testid="booking-ref-code-box">
              <p className="text-white/50 text-xs font-heading tracking-widest">VOTRE CODE DE RÉFÉRENCE</p>
              <p className="font-mono text-4xl text-white tracking-[0.3em] mt-2" data-testid="booking-ref-code">{refCode}</p>
              <p className="text-white/50 text-xs mt-2">Conservez ce code : entrez-le sur notre site (section « Consultez votre rapport ») pour voir votre rapport sans vous connecter.</p>
            </div>
            <button onClick={() => navigate('/portail')} data-testid="booking-go-portal" className="mt-6 gold-gradient text-white font-heading font-600 px-8 py-3 rounded-sm">Accéder à mon portail</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
