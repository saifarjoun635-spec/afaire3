import React, { useEffect, useState } from 'react';
import { Bell, Smartphone, Send } from 'lucide-react';
import api from '../lib/api';

export const AlertsPanel = () => {
  const [cfg, setCfg] = useState(null);
  const [sent, setSent] = useState(false);
  useEffect(() => { api.get('/alerts/config').then((r) => setCfg(r.data)); }, []);
  const test = async () => { setSent(false); await api.post('/alerts/test'); setSent(true); };

  return (
    <div className="bg-[#141416] border border-white/10 rounded-xl p-6 space-y-4" data-testid="alerts-panel">
      <h3 className="flex items-center gap-2 font-heading text-lg text-white"><Bell size={18} className="text-gold" /> Alertes de nouvelles inspections</h3>
      <p className="text-white/60 text-sm">À chaque nouvelle réservation, vous recevez une notification « Vous recevez une nouvelle inspection » sur votre cellulaire (gratuit, via l'app ntfy).</p>
      <ol className="text-white/70 text-sm space-y-2 list-decimal pl-5">
        <li className="flex-wrap"><Smartphone size={14} className="inline text-gold mr-1" />Installez l'app <b>ntfy</b> (App Store / Google Play).</li>
        <li>Appuyez sur « + » (S'abonner à un sujet) et entrez ce sujet :</li>
      </ol>
      {cfg && <p className="font-mono text-white text-lg bg-[#0e0e10] border border-gold/30 rounded-md px-4 py-3 select-all" data-testid="alerts-topic">{cfg.topic}</p>}
      <button data-testid="alerts-test-btn" onClick={test} className="flex items-center gap-2 gold-gradient text-white font-heading px-5 py-2.5 rounded-sm text-sm"><Send size={15} /> Envoyer une alerte test</button>
      {sent && <p className="text-green-300 text-sm" data-testid="alerts-test-sent">Alerte test envoyée — vérifiez votre cellulaire.</p>}
    </div>
  );
};

export default AlertsPanel;
