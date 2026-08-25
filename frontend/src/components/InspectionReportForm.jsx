import React, { useState } from 'react';
import { X, Save, CheckCircle2, Plus, Trash2, FileText } from 'lucide-react';
import api from '../lib/api';
import { GRADES, STATES, STATE_COLORS, REPORT_TYPES, SECTIONS, emptyReport } from '../lib/reportTemplate';

const field = 'w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:border-[#E11D2E] outline-none';
const lbl = 'block text-gray-500 text-xs font-heading mb-1';

const InspectionReportForm = ({ inspection, onClose, onSaved }) => {
  const [r, setR] = useState(inspection.detailed_report || emptyReport(inspection));
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('info');

  const setVehicle = (k) => (e) => setR({ ...r, vehicle: { ...r.vehicle, [k]: e.target.value } });
  const setState = (sec, item, state) => setR({ ...r, checklist: { ...r.checklist, [sec]: { ...r.checklist[sec], [item]: { ...r.checklist[sec][item], state } } } });
  const setComment = (sec, item, comment) => setR({ ...r, checklist: { ...r.checklist, [sec]: { ...r.checklist[sec], [item]: { ...r.checklist[sec][item], comment } } } });
  const setTire = (i, k) => (e) => setR({ ...r, tires: r.tires.map((t, idx) => idx === i ? { ...t, [k]: e.target.value } : t) });
  const setObd = (k) => (e) => setR({ ...r, obd: { ...r.obd, [k]: e.target.value } });
  const setSummary = (k) => (e) => setR({ ...r, summary: { ...r.summary, [k]: e.target.value } });
  const setEst = (i, k) => (e) => setR({ ...r, estimates: r.estimates.map((t, idx) => idx === i ? { ...t, [k]: e.target.value } : t) });
  const addEst = () => setR({ ...r, estimates: [...r.estimates, { repair: '', priority: '', parts: '', labor: '', total: '' }] });
  const rmEst = (i) => setR({ ...r, estimates: r.estimates.filter((_, idx) => idx !== i) });

  const save = async (complete) => {
    setSaving(true);
    try {
      const { data } = await api.post(`/inspections/${inspection.id}/inspection-report`, { report: r, complete });
      onSaved && onSaved(data);
      onClose();
    } catch (e) { /* noop */ } finally { setSaving(false); }
  };

  const tabs = [
    { k: 'info', label: 'Infos & Évaluation' },
    ...SECTIONS.map((s) => ({ k: s.key, label: s.title })),
    { k: 'tires', label: 'Pneus & OBD' },
    { k: 'summary', label: 'Estimation & Résumé' },
  ];

  const section = SECTIONS.find((s) => s.key === tab);

  return (
    <div className="fixed inset-0 z-[55] bg-[#f4f5f7] overflow-y-auto">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 h-14 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-gray-800"><FileText size={18} className="text-[#E11D2E]" /> Rapport d'inspection</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={22} /></button>
        </div>
        <div className="px-2 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} className={`text-xs font-heading px-3 py-1.5 rounded-full whitespace-nowrap ${tab === t.k ? 'bg-[#E11D2E] text-white' : 'bg-gray-100 text-gray-600'}`}>{t.label}</button>
          ))}
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 pb-28">
        {tab === 'info' && (
          <div className="space-y-5">
            <Card title="Type de rapport">
              <div className="flex flex-wrap gap-2">
                {REPORT_TYPES.map((t) => (
                  <button key={t} onClick={() => setR({ ...r, report_type: t })} className={`text-sm font-heading px-3 py-2 rounded border ${r.report_type === t ? 'bg-[#E11D2E] text-white border-[#E11D2E]' : 'border-gray-300 text-gray-600'}`}>{t}</button>
                ))}
              </div>
            </Card>
            <Card title="Informations du véhicule">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[['vin','NIV (VIN)'],['make','Marque'],['model','Modèle'],['year','Année'],['version','Version'],['mileage','Kilométrage'],['plate','Plaque'],['color','Couleur'],['engine','Moteur / Transmission']].map(([k,l]) => (
                  <div key={k}><label className={lbl}>{l}</label><input value={r.vehicle[k]} onChange={setVehicle(k)} className={field} /></div>
                ))}
              </div>
            </Card>
            <Card title="Évaluation générale">
              <div className="grid md:grid-cols-3 gap-3">
                {GRADES.map((g) => (
                  <button key={g.code} onClick={() => setR({ ...r, grade: g.code })} className={`text-left border-2 rounded-lg p-4 transition ${r.grade === g.code ? 'border-[#E11D2E] bg-red-50' : 'border-gray-200'}`}>
                    <p className="font-display text-2xl text-gray-800">{g.code} <span className="text-base font-heading">{g.title}</span></p>
                    <p className="text-gray-500 text-xs mt-1">{g.desc}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {section && (
          <div className="space-y-2">
            {section.items.map((item) => {
              const cell = r.checklist[section.key][item];
              return (
                <div key={item} className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-800 text-sm font-medium mb-2">{item}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {STATES.map((s) => (
                      <button key={s} onClick={() => setState(section.key, item, s)} className={`text-xs font-heading px-2.5 py-1 rounded ${cell.state === s ? STATE_COLORS[s] : 'bg-gray-100 text-gray-500'}`}>{s}</button>
                    ))}
                  </div>
                  <input value={cell.comment} onChange={(e) => setComment(section.key, item, e.target.value)} placeholder="Commentaire..." className={field} />
                </div>
              );
            })}
          </div>
        )}

        {tab === 'tires' && (
          <div className="space-y-5">
            <Card title="Pneus & Roues">
              <div className="space-y-3">
                {r.tires.map((t, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-800 text-sm font-medium mb-2">{t.position}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <input value={t.brand} onChange={setTire(i,'brand')} placeholder="Marque/Modèle" className={field} />
                      <input value={t.year} onChange={setTire(i,'year')} placeholder="Année" className={field} />
                      <input value={t.size} onChange={setTire(i,'size')} placeholder="Dimension" className={field} />
                      <input value={t.season} onChange={setTire(i,'season')} placeholder="Saison" className={field} />
                      <input value={t.depth} onChange={setTire(i,'depth')} placeholder="Profondeur" className={field} />
                      <input value={t.comment} onChange={setTire(i,'comment')} placeholder="Commentaire" className={field} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Scan électronique / OBD-II">
              <div className="space-y-3">
                <div><label className={lbl}>Codes présents</label><input value={r.obd.codes} onChange={setObd('codes')} className={field} /></div>
                <div><label className={lbl}>Modules scannés</label><input value={r.obd.modules} onChange={setObd('modules')} className={field} /></div>
                <div><label className={lbl}>Voyants au tableau de bord</label><input value={r.obd.warnings} onChange={setObd('warnings')} className={field} /></div>
                <div><label className={lbl}>Observations</label><textarea rows={3} value={r.obd.observations} onChange={setObd('observations')} className={`${field} resize-none`} /></div>
              </div>
            </Card>
          </div>
        )}

        {tab === 'summary' && (
          <div className="space-y-5">
            <Card title="Estimation des réparations">
              <div className="space-y-2">
                {r.estimates.map((e, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 flex-1">
                      <input value={e.repair} onChange={setEst(i,'repair')} placeholder="Réparation" className={field} />
                      <input value={e.priority} onChange={setEst(i,'priority')} placeholder="Priorité" className={field} />
                      <input value={e.parts} onChange={setEst(i,'parts')} placeholder="Pièces" className={field} />
                      <input value={e.labor} onChange={setEst(i,'labor')} placeholder="Main-d'œuvre" className={field} />
                      <input value={e.total} onChange={setEst(i,'total')} placeholder="Total estimé" className={field} />
                    </div>
                    {r.estimates.length > 1 && <button onClick={() => rmEst(i)} className="text-red-500 p-2"><Trash2 size={16} /></button>}
                  </div>
                ))}
              </div>
              <button onClick={addEst} className="flex items-center gap-1.5 text-[#E11D2E] text-sm mt-3 font-heading"><Plus size={15} /> Ajouter une ligne</button>
            </Card>
            <Card title="Résumé & recommandation">
              <div className="space-y-3">
                <div><label className={lbl}>Points forts du véhicule</label><textarea rows={3} value={r.summary.strengths} onChange={setSummary('strengths')} className={`${field} resize-none`} /></div>
                <div><label className={lbl}>Défauts / réparations prioritaires</label><textarea rows={3} value={r.summary.defects} onChange={setSummary('defects')} className={`${field} resize-none`} /></div>
                <div><label className={lbl}>Recommandation finale</label><textarea rows={3} value={r.summary.recommendation} onChange={setSummary('recommendation')} className={`${field} resize-none`} /></div>
              </div>
            </Card>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-3 max-w-3xl mx-auto">
        <button onClick={() => save(false)} disabled={saving} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 font-heading py-3 rounded disabled:opacity-60"><Save size={16} /> Enregistrer</button>
        <button onClick={() => save(true)} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white font-heading py-3 rounded hover:bg-green-800 disabled:opacity-60"><CheckCircle2 size={16} /> {saving ? '...' : 'Finaliser'}</button>
      </footer>
    </div>
  );
};

const Card = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-lg">
    <div className="px-4 py-3 border-b border-gray-100"><h3 className="text-gray-700 font-heading">{title}</h3></div>
    <div className="p-4">{children}</div>
  </div>
);

export default InspectionReportForm;
