import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, ClipboardList, UserPlus, Trash2, Eye, EyeOff, Mail, Inbox, ClipboardCheck, TrendingUp, ImagePlus, Images, FileText, Bell } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { STATUS } from './ClientPortal';
import logo from '../assets/logo.png';
import ImageCropperModal from '../components/ImageCropperModal';
import InspectionReportForm from '../components/InspectionReportForm';
import ManualInspectionForm from '../components/ManualInspectionForm';
import AlertsPanel from '../components/AlertsPanel';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('inspections');
  const [stats, setStats] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [showPw, setShowPw] = useState({});
  const [newEmp, setNewEmp] = useState({ name: '', email: '', password: '', phone: '' });
  const [msg, setMsg] = useState('');
  const [album, setAlbum] = useState([]);
  const [cropSrc, setCropSrc] = useState(null);
  const [caption, setCaption] = useState('');
  const [reportInspection, setReportInspection] = useState(null);

  const loadAlbum = async () => { const { data } = await api.get('/album'); setAlbum(data); };

  const loadAll = async () => {
    const [s, i, e, u, q] = await Promise.all([
      api.get('/stats'), api.get('/inspections'), api.get('/users?role=employee'), api.get('/users'), api.get('/quotes'),
    ]);
    setStats(s.data); setInspections(i.data); setEmployees(e.data); setAllUsers(u.data); setQuotes(q.data);
  };
  useEffect(() => { loadAll(); loadAlbum(); }, []);

  const assign = async (id, employee_id) => {
    if (!employee_id) return;
    await api.patch(`/inspections/${id}/assign`, { employee_id });
    loadAll();
  };

  const addEmployee = async () => {
    setMsg('');
    if (!newEmp.name || !newEmp.email || !newEmp.password) { setMsg('Nom, email et mot de passe requis'); return; }
    try {
      await api.post('/users', { ...newEmp, role: 'employee' });
      setNewEmp({ name: '', email: '', password: '', phone: '' });
      loadAll();
    } catch (e) { setMsg(e?.response?.data?.detail || 'Erreur'); }
  };

  const delUser = async (id) => { await api.delete(`/users/${id}`); loadAll(); };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const saveCropped = async (dataUrl) => {
    await api.post('/album', { image: dataUrl, caption });
    setCropSrc(null); setCaption('');
    loadAlbum();
  };

  const delAlbum = async (id) => { await api.delete(`/album/${id}`); loadAlbum(); };

  const tabs = [
    { k: 'inspections', label: 'Inspections', icon: ClipboardList },
    { k: 'employees', label: 'Employés', icon: Users },
    { k: 'credentials', label: 'Identifiants', icon: EyeOff },
    { k: 'quotes', label: 'Soumissions', icon: Inbox },
    { k: 'album', label: 'Album', icon: Images },
    { k: 'alerts', label: 'Alertes', icon: Bell },
  ];

  const field = 'w-full bg-[#0e0e10] border border-white/12 rounded-md px-3 py-2.5 text-white text-sm focus:border-gold outline-none';

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <header className="bg-[#141416] border-b border-white/10 px-5 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3"><img src={logo} alt="Torque Inspection Mobile" className="h-9 w-auto" /> <span className="text-white/40 text-sm font-heading">Admin • Patron</span></div>
        <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-1.5 text-white/60 hover:text-gold text-sm"><LogOut size={16} /> Déconnexion</button>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Stat icon={ClipboardList} label="Inspections" value={stats.total_inspections} />
            <Stat icon={Inbox} label="À assigner" value={stats.unassigned} accent />
            <Stat icon={ClipboardCheck} label="Complétées" value={stats.completed} />
            <Stat icon={Users} label="Employés" value={stats.employees} />
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.k} data-testid={`admin-tab-${t.k}`} onClick={() => setTab(t.k)} className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-heading text-sm whitespace-nowrap ${tab === t.k ? 'bg-gold text-white' : 'bg-[#141416] text-white/60 hover:text-white'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'inspections' && (
          <div className="space-y-4">
            <ManualInspectionForm employees={employees} onCreated={loadAll} />
            {inspections.length === 0 && <p className="text-white/40 text-center py-10">Aucune inspection.</p>}
            {inspections.map((it) => (
              <div key={it.id} className="bg-[#141416] border border-white/10 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-mono text-sm bg-white/5 px-2 py-0.5 rounded" data-testid={`admin-ref-${it.ref}`}>#{it.ref}</span>
                    {it.manual && <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">Manuel</span>}
                    <span className={`text-xs font-heading px-2.5 py-1 rounded-full ${STATUS[it.status]?.color}`}>{STATUS[it.status]?.label}</span>
                  </div>
                  <span className="text-gold text-sm font-heading">{it.price} $ • {it.manual ? 'ajout manuel' : 'payé'}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <p className="text-white">{it.vehicle.year} {it.vehicle.make} {it.vehicle.model}</p>
                  <p className="text-white/60">{it.service_type}</p>
                  <p className="text-white/60">Client : {it.client.name} • {it.client.phone}</p>
                  <p className="text-white/60">{it.location.address}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-white/8">
                  <span className="text-white/50 text-sm">Inspecteur :</span>
                  <select defaultValue={it.assigned_employee_id || ''} onChange={(e) => assign(it.id, e.target.value)} className="bg-[#0e0e10] border border-white/12 rounded-md px-3 py-2 text-white text-sm focus:border-gold outline-none">
                    <option value="">— Sélectionner —</option>
                    {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  {it.assigned_employee_name && <span className="text-green-300 text-sm">→ {it.assigned_employee_name}</span>}
                  <button onClick={() => setReportInspection(it)} className="ml-auto flex items-center gap-1.5 bg-gold text-white font-heading text-sm px-4 py-2 rounded-md hover:brightness-110">
                    <FileText size={15} /> {it.detailed_report ? 'Voir / modifier rapport' : 'Remplir le rapport'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-[#141416] border border-white/10 rounded-xl p-6">
              <h3 className="flex items-center gap-2 font-heading text-lg text-white mb-4"><UserPlus size={18} className="text-gold" /> Créer un compte employé</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Nom complet" value={newEmp.name} onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })} className={field} />
                <input placeholder="Téléphone" value={newEmp.phone} onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })} className={field} />
                <input placeholder="Email" value={newEmp.email} onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })} className={field} />
                <input placeholder="Mot de passe" value={newEmp.password} onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })} className={field} />
              </div>
              {msg && <p className="text-red-400 text-sm mt-3">{msg}</p>}
              <button onClick={addEmployee} className="mt-4 gold-gradient text-white font-heading font-600 px-6 py-2.5 rounded-sm text-sm">Créer l'employé</button>
            </div>
            <div className="space-y-3">
              {employees.map((e) => (
                <div key={e.id} className="bg-[#141416] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-heading">{e.name}</p>
                    <p className="text-white/50 text-sm">{e.email} • {e.phone || 'pas de tél.'}</p>
                  </div>
                  <button onClick={() => delUser(e.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18} /></button>
                </div>
              ))}
              {employees.length === 0 && <p className="text-white/40 text-center py-6">Aucun employé.</p>}
            </div>
          </div>
        )}

        {tab === 'credentials' && (
          <div className="bg-[#141416] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-300/90 text-xs">Vue patron : emails et mots de passe de tous les comptes (employés + clients).</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-white/40 text-left border-b border-white/8"><th className="px-5 py-3 font-heading">Nom</th><th className="px-5 py-3 font-heading">Rôle</th><th className="px-5 py-3 font-heading">Email</th><th className="px-5 py-3 font-heading">Mot de passe</th><th className="px-5 py-3"></th></tr></thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b border-white/5">
                      <td className="px-5 py-3 text-white">{u.name}</td>
                      <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-gold/20 text-gold' : u.role === 'employee' ? 'bg-blue-500/15 text-blue-300' : 'bg-white/10 text-white/60'}`}>{u.role}</span></td>
                      <td className="px-5 py-3 text-white/70">{u.email}</td>
                      <td className="px-5 py-3 text-white/70 font-mono">{showPw[u.id] ? u.password : '••••••••'}</td>
                      <td className="px-5 py-3"><button onClick={() => setShowPw({ ...showPw, [u.id]: !showPw[u.id] })} className="text-white/50 hover:text-gold">{showPw[u.id] ? <EyeOff size={16} /> : <Eye size={16} />}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'quotes' && (
          <div className="space-y-3">
            {quotes.length === 0 && <p className="text-white/40 text-center py-10">Aucune demande de soumission.</p>}
            {quotes.map((q) => (
              <div key={q.id} className="bg-[#141416] border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-heading">{q.name}</p>
                  <span className="text-white/40 text-xs">{q.service}</span>
                </div>
                <p className="text-white/50 text-sm mt-1 flex items-center gap-2"><Mail size={13} /> {q.email || '—'} • {q.phone}</p>
                {q.details && <p className="text-white/60 text-sm mt-2">{q.details}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'alerts' && <AlertsPanel />}

        {tab === 'album' && (
          <div className="space-y-6">
            <div className="bg-[#141416] border border-white/10 rounded-xl p-6">
              <h3 className="flex items-center gap-2 font-heading text-lg text-white mb-4"><ImagePlus size={18} className="text-gold" /> Ajouter une image à l'album</h3>
              <p className="text-white/50 text-sm mb-4">Choisissez une photo, recadrez-la pour qu'elle ressorte bien, puis publiez-la sur la page Album.</p>
              <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Légende (optionnel)" className={field + ' mb-3'} />
              <label className="inline-flex items-center gap-2 gold-gradient text-white font-heading font-600 px-6 py-2.5 rounded-sm text-sm cursor-pointer">
                <ImagePlus size={16} /> Choisir une image
                <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              </label>
            </div>
            {album.length === 0 ? (
              <p className="text-white/40 text-center py-10">Aucune image dans l'album.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {album.map((it) => (
                  <div key={it.id} className="relative group rounded-lg overflow-hidden border border-white/8">
                    <img src={it.data} alt={it.caption} className="w-full h-40 object-cover" />
                    {it.caption && <div className="bg-[#0e0e10] px-2 py-1.5 text-white/70 text-xs truncate">{it.caption}</div>}
                    <button onClick={() => delAlbum(it.id)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {cropSrc && <ImageCropperModal src={cropSrc} onCancel={() => setCropSrc(null)} onDone={saveCropped} />}
      {reportInspection && <InspectionReportForm inspection={reportInspection} onClose={() => setReportInspection(null)} onSaved={() => { loadAll(); }} />}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value, accent }) => (
  <div className={`bg-[#141416] border rounded-xl p-4 ${accent ? 'border-gold/40' : 'border-white/10'}`}>
    <div className="flex items-center justify-between">
      <span className="text-white/50 text-sm font-heading">{label}</span>
      <Icon size={18} className={accent ? 'text-gold' : 'text-white/40'} />
    </div>
    <p className="font-display text-3xl text-white mt-2">{value}</p>
  </div>
);

export default AdminDashboard;
