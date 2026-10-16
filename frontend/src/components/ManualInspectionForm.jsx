import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import api from '../lib/api';

const services = ['Inspection Pré-achat', 'Inspection PEP', "Rapport d'assurance"];
const vehicleTypes = ['Automobile', 'Véhicule Lourd', 'Remorque', 'Moto', 'VR'];
const empty = { client_name: '', client_phone: '', client_email: '', service_type: services[0], vehicle_type: vehicleTypes[0], vehicle_make: '', vehicle_model: '', vehicle_year: '', vehicle_vin: '', location_address: '', notes: '', price: '', employee_id: '' };

export const ManualInspectionForm = ({ employees, onCreated }) => {
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState('');
  const [created, setCreated] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const field = 'w-full bg-[#0e0e10] border border-white/12 rounded-md px-3 py-2.5 text-white text-sm focus:border-gold outline-none';

  const submit = async () => {
    setMsg(''); setCreated(null);
    if (!f.client_name || !f.vehicle_make || !f.vehicle_model) { setMsg('Nom du client, marque et modèle requis'); return; }
    try {
      const { data } = await api.post('/inspections/manual', { ...f, price: Number(f.price) || 0, employee_id: f.employee_id || null });
      setCreated(data); setF(empty); onCreated();
    } catch (e) { setMsg(e?.response?.data?.detail || 'Erreur'); }
  };

  const inp = (k, ph) => <input data-testid={`manual-${k}`} placeholder={ph} value={f[k]} onChange={set(k)} className={field} />;

  return (
    <div className="bg-[#141416] border border-white/10 rounded-xl p-6" data-testid="manual-inspection-form">
      <h3 className="flex items-center gap-2 font-heading text-lg text-white mb-4"><PlusCircle size={18} className="text-gold" /> Ajouter une inspection manuellement</h3>
      <div className="grid md:grid-cols-3 gap-3">
        {inp('client_name', 'Nom du client *')}
        {inp('client_phone', 'Téléphone')}
        {inp('client_email', 'Email')}
        <select data-testid="manual-service_type" value={f.service_type} onChange={set('service_type')} className={field}>{services.map((s) => <option key={s}>{s}</option>)}</select>
        <select data-testid="manual-vehicle_type" value={f.vehicle_type} onChange={set('vehicle_type')} className={field}>{vehicleTypes.map((s) => <option key={s}>{s}</option>)}</select>
        {inp('price', 'Prix ($)')}
        {inp('vehicle_make', 'Marque *')}
        {inp('vehicle_model', 'Modèle *')}
        {inp('vehicle_year', 'Année')}
        {inp('vehicle_vin', 'NIV / VIN')}
        {inp('location_address', 'Adresse')}
        <select data-testid="manual-employee_id" value={f.employee_id} onChange={set('employee_id')} className={field}>
          <option value="">— Inspecteur (optionnel) —</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>
      <textarea data-testid="manual-notes" placeholder="Notes" value={f.notes} onChange={set('notes')} rows={2} className={`${field} mt-3 resize-none`} />
      {msg && <p className="text-red-400 text-sm mt-3" data-testid="manual-error">{msg}</p>}
      {created && <p className="text-green-300 text-sm mt-3" data-testid="manual-success">Inspection créée — code de référence : <span className="font-mono text-white text-base">{created.ref}</span></p>}
      <button data-testid="manual-submit" onClick={submit} className="mt-4 gold-gradient text-white font-heading font-600 px-6 py-2.5 rounded-sm text-sm">Créer l'inspection</button>
    </div>
  );
};

export default ManualInspectionForm;
