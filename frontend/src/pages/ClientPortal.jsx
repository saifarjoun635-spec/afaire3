import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Car, MapPin, Clock, Plus, ChevronRight, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export const STATUS = {
  paid: { label: 'Payé • En attente d\'assignation', color: 'bg-blue-500/15 text-blue-300' },
  assigned: { label: 'Assigné à un inspecteur', color: 'bg-yellow-500/15 text-yellow-300' },
  scheduled: { label: 'Planifié', color: 'bg-purple-500/15 text-purple-300' },
  in_progress: { label: 'En cours', color: 'bg-orange-500/15 text-orange-300' },
  completed: { label: 'Complété', color: 'bg-green-500/15 text-green-300' },
};

const ClientPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const { data } = await api.get('/inspections');
    setItems(data);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <header className="bg-[#141416] border-b border-white/10 px-5 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3"><img src={logo} alt="Torque Inspection Mobile" className="h-9 w-auto" /> <span className="text-white/40 text-sm font-heading">Portail Client</span></div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden sm:block">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-1.5 text-white/60 hover:text-gold text-sm"><LogOut size={16} /> Déconnexion</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl text-white">Mes inspections</h1>
          <button onClick={() => navigate('/reserver')} className="flex items-center gap-1.5 gold-gradient text-white font-heading font-600 px-4 py-2.5 rounded-sm text-sm"><Plus size={16} /> Nouvelle inspection</button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Car size={40} className="mx-auto mb-3 opacity-50" />
            <p>Aucune inspection pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((it) => (
              <button key={it.id} onClick={() => setSelected(it)} className="w-full text-left bg-[#141416] border border-white/10 hover:border-gold/40 rounded-xl p-5 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/40 text-xs font-heading">#{it.ref}</span>
                  <span className={`text-xs font-heading px-2.5 py-1 rounded-full ${STATUS[it.status]?.color || 'bg-white/10 text-white/60'}`}>{STATUS[it.status]?.label || it.status}</span>
                </div>
                <div className="flex items-center gap-2 text-white"><Car size={16} className="text-gold" /> {it.vehicle.year} {it.vehicle.make} {it.vehicle.model}</div>
                <div className="flex items-center gap-2 text-white/55 text-sm mt-1.5"><MapPin size={14} className="text-gold/70" /> {it.location.address}</div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-white/40 text-xs">{it.assigned_employee_name ? `Inspecteur : ${it.assigned_employee_name}` : 'En attente d\'assignation'}</span>
                  <ChevronRight size={16} className="text-gold" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-0 sm:p-5" onClick={() => setSelected(null)}>
          <div className="bg-[#141416] border border-white/10 rounded-t-2xl sm:rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-heading px-2.5 py-1 rounded-full ${STATUS[selected.status]?.color}`}>{STATUS[selected.status]?.label}</span>
                <span className="text-white/40 text-xs">#{selected.ref}</span>
              </div>
              <h3 className="font-heading text-xl text-white">{selected.vehicle.year} {selected.vehicle.make} {selected.vehicle.model}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Service" value={selected.service_type} />
                <Info label="NIV" value={selected.vehicle.vin || '—'} />
                <Info label="Adresse" value={selected.location.address} full />
                <Info label="Inspecteur" value={selected.assigned_employee_name || 'Non assigné'} />
                <Info label="Paiement" value={`${selected.price} $ (SIMULÉ)`} />
              </div>
              {selected.components?.length > 0 && (
                <div>
                  <p className="text-gold text-sm font-heading mb-2">Composants à inspecter</p>
                  {selected.components.map((c, i) => <p key={i} className="text-white/60 text-sm">• {c.description}</p>)}
                </div>
              )}
              {selected.photos?.length > 0 && (
                <div>
                  <p className="text-gold text-sm font-heading mb-2 flex items-center gap-1.5"><ImageIcon size={14} /> Photos de l'inspection</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.photos.map((p) => <img key={p.id} src={p.data} alt="" className="w-full h-24 object-cover rounded-md" />)}
                  </div>
                </div>
              )}
              {selected.detailed_report && (
                <div className="bg-[#0e0e10] border border-gold/30 rounded-lg p-4 space-y-3">
                  <p className="text-gold font-heading text-sm flex items-center gap-1.5"><CheckCircle2 size={14} /> Rapport d'inspection détaillé</p>
                  {selected.detailed_report.grade && (
                    <p className="text-white/80 text-sm">Évaluation générale : <span className="font-heading text-white">Note {selected.detailed_report.grade}</span> • {selected.detailed_report.report_type}</p>
                  )}
                  {selected.detailed_report.summary?.strengths && (<div><p className="text-white/40 text-xs">Points forts</p><p className="text-white/70 text-sm">{selected.detailed_report.summary.strengths}</p></div>)}
                  {selected.detailed_report.summary?.defects && (<div><p className="text-white/40 text-xs">Défauts prioritaires</p><p className="text-white/70 text-sm">{selected.detailed_report.summary.defects}</p></div>)}
                  {selected.detailed_report.summary?.recommendation && (<div><p className="text-white/40 text-xs">Recommandation finale</p><p className="text-white/70 text-sm">{selected.detailed_report.summary.recommendation}</p></div>)}
                </div>
              )}
              {selected.report && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-300 font-heading text-sm flex items-center gap-1.5 mb-1"><CheckCircle2 size={14} /> Notes de l'inspecteur</p>
                  <p className="text-white/70 text-sm whitespace-pre-wrap">{selected.report.notes}</p>
                </div>
              )}
              <button onClick={() => setSelected(null)} className="w-full border border-white/15 text-white font-heading py-3 rounded-sm mt-2">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value, full }) => (
  <div className={full ? 'col-span-2' : ''}>
    <p className="text-white/40 text-xs font-heading">{label}</p>
    <p className="text-white/80">{value}</p>
  </div>
);

export default ClientPortal;
