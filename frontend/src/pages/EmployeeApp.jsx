import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ClipboardList, FolderOpen, Settings, Menu, ArrowLeft, MapPin, Phone, Navigation, Car, Camera, Trash2, CheckCircle2, User, LogOut } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { STATUS } from './ClientPortal';

const EmployeeApp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [nav, setNav] = useState('available');
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    const [a, m] = await Promise.all([api.get('/inspections/available'), api.get('/inspections')]);
    setAvailable(a.data);
    setMine(m.data);
  };
  useEffect(() => { load(); }, []);

  const openDetail = async (id) => {
    const { data } = await api.get(`/inspections/${id}`);
    setDetail(data);
  };

  if (detail) return <Detail inspection={detail} onBack={() => { setDetail(null); load(); }} refresh={openDetail} />;

  const myActive = mine.filter((i) => i.status !== 'completed');
  const history = mine.filter((i) => i.status === 'completed');

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Menu size={20} className="text-gray-500" />
          <span className="font-display text-lg"><span className="text-[#E11D2E]">INSPECTION</span> <span className="text-gray-900">MOBILE</span></span>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="text-gray-400 hover:text-gray-700"><LogOut size={18} /></button>
      </header>

      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-gray-500 font-heading tracking-wide text-sm uppercase">
          {nav === 'available' && 'Inspections disponibles'}
          {nav === 'mine' && 'Mes inspections'}
          {nav === 'history' && 'Historique'}
          {nav === 'settings' && 'Paramètres'}
        </h1>
      </div>

      <main className="p-4">
        {nav === 'available' && (available.length === 0
          ? <EmptyState label="AUCUNE INSPECTION DISPONIBLE" />
          : available.map((i) => <CardEmp key={i.id} i={i} onClick={() => openDetail(i.id)} />))}

        {nav === 'mine' && (myActive.length === 0
          ? <EmptyState label="AUCUNE INSPECTION ASSIGNÉE" />
          : myActive.map((i) => <CardEmp key={i.id} i={i} onClick={() => openDetail(i.id)} />))}

        {nav === 'history' && (history.length === 0
          ? <EmptyState label="AUCUN HISTORIQUE" />
          : history.map((i) => <CardEmp key={i.id} i={i} onClick={() => openDetail(i.id)} />))}

        {nav === 'settings' && (
          <div className="space-y-3">
            <Row label="Nom" value={user?.name} />
            <Row label="Email" value={user?.email} />
            <Row label="Téléphone" value={user?.phone || 'Non défini'} />
            <Row label="Rôle" value="Inspecteur" />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around h-16 z-30">
        {[
          { k: 'available', label: 'Disponibles', icon: Clock },
          { k: 'mine', label: 'Mes inspections', icon: ClipboardList },
          { k: 'history', label: 'Historique', icon: FolderOpen },
          { k: 'settings', label: 'Paramètres', icon: Settings },
        ].map((t) => (
          <button key={t.k} onClick={() => setNav(t.k)} className={`flex flex-col items-center gap-0.5 text-[11px] ${nav === t.k ? 'text-[#E11D2E]' : 'text-gray-400'}`}>
            <t.icon size={20} /> {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

const EmptyState = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-24 text-[#E11D2E]">
    <div className="w-16 h-16 rounded-full border-2 border-blue-300 flex items-center justify-center mb-4"><span className="text-3xl">!</span></div>
    <p className="font-heading tracking-wide text-sm">{label}</p>
  </div>
);

const CardEmp = ({ i, onClick }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-4 overflow-hidden">
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#E11D2E] flex items-center justify-center text-[#E11D2E] font-heading text-sm">1</div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">{i.service_type.split(' ')[0]}</span>
          <span className="bg-yellow-200 text-yellow-800 text-xs font-heading px-2 py-0.5 rounded">{i.status}</span>
        </div>
      </div>
      <div className="text-sm space-y-1 mb-3">
        <p className="text-gray-500">Créé <span className="text-gray-800 font-medium float-right">{(i.created_at || '').slice(0, 10)}</span></p>
        <p className="text-gray-500">Inspection <span className="text-gray-800 font-medium float-right">{i.scheduled_at ? i.scheduled_at.slice(0, 16).replace('T', ' ') : 'À planifier'}</span></p>
      </div>
    </div>
    <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
      <p className="flex items-center gap-2 text-gray-700 text-sm"><Car size={15} className="text-gray-400" /> {i.vehicle.year} {i.vehicle.make} {i.vehicle.model}</p>
      <p className="flex items-center gap-2 text-gray-700 text-sm mt-1"><MapPin size={15} className="text-gray-400" /> {i.location.address}</p>
      <div className="flex justify-end mt-3">
        <button onClick={onClick} className="bg-[#E11D2E] text-white text-sm font-heading px-5 py-2 rounded hover:bg-[#B3121C] transition">DÉTAILS</button>
      </div>
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
    <span className="text-gray-500 text-sm">{label}</span>
    <span className="text-gray-800 font-medium">{value}</span>
  </div>
);

const Detail = ({ inspection, onBack, refresh }) => {
  const [i, setI] = useState(inspection);
  const [uploading, setUploading] = useState(false);
  const [reportNotes, setReportNotes] = useState(i.report?.notes || '');
  const fileRef = useRef(null);

  const reload = async () => { const { data } = await api.get(`/inspections/${i.id}`); setI(data); };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const readers = files.map((f) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); }));
    const photos = await Promise.all(readers);
    await api.post(`/inspections/${i.id}/photos`, { photos });
    await reload();
    setUploading(false);
  };

  const delPhoto = async (pid) => { await api.delete(`/inspections/${i.id}/photos/${pid}`); reload(); };
  const setStatus = async (status) => { await api.patch(`/inspections/${i.id}/status`, { status }); reload(); };
  const finish = async () => { await api.post(`/inspections/${i.id}/report`, { notes: reportNotes }); reload(); };

  const Section = ({ title, children }) => (
    <div className="bg-white border border-gray-200 rounded-lg mb-4">
      <div className="px-4 py-3 border-b border-gray-100"><h3 className="text-gray-700 font-heading">{title}</h3></div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
  const F = ({ label, value }) => (<div><p className="text-green-700 text-sm font-medium">{label}</p><p className="text-gray-600 text-sm">{value || '—'}</p></div>);

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-10">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 sticky top-0 z-30">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 font-heading text-sm"><ArrowLeft size={18} /> RETOUR</button>
        <span className="bg-yellow-200 text-yellow-800 text-xs font-heading px-3 py-1 rounded">{i.status}</span>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <Section title="Localisation & Contact">
          <F label="Emplacement du véhicule" value={i.location.type} />
          <F label="Adresse" value={i.location.address} />
          <a href={`https://maps.google.com/?q=${encodeURIComponent(i.location.address)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-700 text-white font-heading text-sm py-3 rounded hover:bg-green-800 transition"><Navigation size={16} /> Naviguer</a>
          <div className="pt-2 border-t border-gray-100">
            <F label="Nom" value={i.contact.name} />
            <p className="text-green-700 text-sm font-medium mt-2">Téléphone</p>
            <a href={`tel:${i.contact.phone}`} className="text-[#E11D2E] text-sm flex items-center gap-1"><Phone size={13} /> {i.contact.phone}</a>
          </div>
        </Section>

        <Section title="Client"><F label="Nom" value={i.client.name} /><F label="Email" value={i.client.email} /></Section>

        <Section title="Véhicule">
          <div className="grid grid-cols-2 gap-3">
            <F label="Marque" value={i.vehicle.make} /><F label="Modèle" value={i.vehicle.model} />
            <F label="Année" value={i.vehicle.year} /><F label="NIV" value={i.vehicle.vin} />
          </div>
          {i.components?.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-green-700 text-sm font-medium mb-2">Composants à inspecter</p>
              {i.components.map((c, idx) => (
                <div key={idx} className="mb-2"><p className="text-gray-800 text-sm font-medium">{c.name}</p><p className="text-gray-500 text-sm">{c.description}</p></div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Photos de l'inspection">
          <div className="grid grid-cols-3 gap-2">
            {(i.photos || []).map((p) => (
              <div key={p.id} className="relative group">
                <img src={p.data} alt="" className="w-full h-24 object-cover rounded" />
                <button onClick={() => delPhoto(p.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><Trash2 size={12} /></button>
              </div>
            ))}
            <button onClick={() => fileRef.current?.click()} className="h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-[#E11D2E] hover:text-[#E11D2E] transition">
              <Camera size={20} /><span className="text-xs mt-1">{uploading ? '...' : 'Ajouter'}</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={onFiles} />
        </Section>

        <Section title="Rapport & Statut">
          <div className="flex flex-wrap gap-2">
            {['scheduled', 'in_progress'].map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={`text-sm font-heading px-3 py-2 rounded border ${i.status === s ? 'bg-[#E11D2E] text-white border-blue-600' : 'border-gray-300 text-gray-600'}`}>{STATUS[s]?.label || s}</button>
            ))}
          </div>
          <textarea value={reportNotes} onChange={(e) => setReportNotes(e.target.value)} rows={4} placeholder="Notes du rapport d'inspection..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:border-[#E11D2E] outline-none resize-none" />
          <button onClick={finish} className="w-full flex items-center justify-center gap-2 bg-green-700 text-white font-heading py-3 rounded hover:bg-green-800 transition"><CheckCircle2 size={16} /> Compléter l'inspection</button>
          {i.status === 'completed' && <p className="text-green-700 text-sm text-center flex items-center justify-center gap-1"><CheckCircle2 size={14} /> Inspection complétée</p>}
        </Section>
      </main>
    </div>
  );
};

export default EmployeeApp;
