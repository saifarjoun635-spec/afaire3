import React from 'react';
import { Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { STATUS } from '../pages/ClientPortal';

const Info = ({ label, value, full }) => (
  <div className={full ? 'col-span-2' : ''}>
    <p className="text-white/40 text-xs font-heading">{label}</p>
    <p className="text-white/80">{value}</p>
  </div>
);

export const InspectionDetails = ({ inspection: s, showPrivate = true }) => {
  const r = s.detailed_report;
  return (
    <div className="space-y-4" data-testid="inspection-details">
      <div className="flex items-center justify-between">
        <span data-testid="inspection-status" className={`text-xs font-heading px-2.5 py-1 rounded-full ${STATUS[s.status]?.color || 'bg-white/10 text-white/60'}`}>{STATUS[s.status]?.label || s.status}</span>
        <span className="text-white/40 text-xs" data-testid="inspection-ref">#{s.ref}</span>
      </div>
      <h3 className="font-heading text-xl text-white">{s.vehicle.year} {s.vehicle.make} {s.vehicle.model}</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="Service" value={s.service_type} />
        <Info label="NIV" value={s.vehicle.vin || '—'} />
        {showPrivate && <Info label="Adresse" value={s.location?.address || '—'} full />}
        <Info label="Inspecteur" value={s.assigned_employee_name || 'Non assigné'} />
        {showPrivate && <Info label="Paiement" value={`${s.price} $ (SIMULÉ)`} />}
      </div>
      {s.components?.length > 0 && (
        <div>
          <p className="text-gold text-sm font-heading mb-2">Composants à inspecter</p>
          {s.components.map((c, i) => <p key={i} className="text-white/60 text-sm">• {c.description}</p>)}
        </div>
      )}
      {s.photos?.length > 0 && (
        <div>
          <p className="text-gold text-sm font-heading mb-2 flex items-center gap-1.5"><ImageIcon size={14} /> Photos de l'inspection</p>
          <div className="grid grid-cols-3 gap-2">
            {s.photos.map((p) => <a key={p.id} href={p.data} target="_blank" rel="noreferrer"><img src={p.data} alt="" className="w-full h-24 object-cover rounded-md" /></a>)}
          </div>
        </div>
      )}
      {r && (
        <div className="bg-[#0e0e10] border border-gold/30 rounded-lg p-4 space-y-3" data-testid="inspection-detailed-report">
          <p className="text-gold font-heading text-sm flex items-center gap-1.5"><CheckCircle2 size={14} /> Rapport d'inspection détaillé</p>
          {r.grade && <p className="text-white/80 text-sm">Évaluation générale : <span className="font-heading text-white">Note {r.grade}</span> • {r.report_type}</p>}
          {r.summary?.strengths && (<div><p className="text-white/40 text-xs">Points forts</p><p className="text-white/70 text-sm">{r.summary.strengths}</p></div>)}
          {r.summary?.defects && (<div><p className="text-white/40 text-xs">Défauts prioritaires</p><p className="text-white/70 text-sm">{r.summary.defects}</p></div>)}
          {r.summary?.recommendation && (<div><p className="text-white/40 text-xs">Recommandation finale</p><p className="text-white/70 text-sm">{r.summary.recommendation}</p></div>)}
        </div>
      )}
      {s.report && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-green-300 font-heading text-sm flex items-center gap-1.5 mb-1"><CheckCircle2 size={14} /> Notes de l'inspecteur</p>
          <p className="text-white/70 text-sm whitespace-pre-wrap">{s.report.notes}</p>
        </div>
      )}
      {!r && !s.report && s.status !== 'completed' && (
        <p className="text-white/50 text-sm bg-white/5 rounded-md px-4 py-3">Le rapport sera disponible ici dès que l'inspecteur l'aura complété.</p>
      )}
    </div>
  );
};

export default InspectionDetails;
